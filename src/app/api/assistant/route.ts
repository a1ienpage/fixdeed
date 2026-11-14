import { z } from "zod";
import { diagnoseDeterministic } from "@/lib/diagnosticEngine";
import { EMERGENCY_STEPS, highestTier, scanText } from "@/lib/safetyGate";
import { inferObservationContext } from "@/lib/observationContext";
import {
  ImageSchema,
  PartialProfileSchema,
  jsonResponse,
  readBoundedJson,
  requestFailure,
} from "@/lib/api";

export const runtime = "nodejs";
const SafetyTierSchema = z.enum([
  "DIY_SAFE",
  "DIY_CAUTION",
  "PRO_REQUIRED",
  "EMERGENCY",
]);
const RequestSchema = z
  .object({
    safetyFloor: SafetyTierSchema.optional(),
    message: z.string().max(1500).optional(),
    image: ImageSchema.optional(),
    profile: PartialProfileSchema.optional(),
    history: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          text: z.string().max(1500),
          safetyTier: SafetyTierSchema.optional(),
        }),
      )
      .max(10)
      .optional(),
  })
  .refine((v) => Boolean(v.image) || Boolean(v.message?.trim()), {
    message: "Describe the symptom.",
  });

function assistantFacts(text: string): string {
  // Generic conditional safety warnings are not reports of a new incident.
  // User reports remain authoritative and are always scanned in full.
  return text
    .split(/[.!?\n]+/)
    .filter((sentence) => !/^\s*(if|in case|should you)\b/i.test(sentence))
    .join(". ");
}
export async function POST(req: Request): Promise<Response> {
  try {
    const body = RequestSchema.parse(await readBoundedJson(req));
    const message = body.message?.trim() ?? "";
    const priorUser = (body.history ?? [])
      .filter((item) => item.role === "user")
      .map((item) => item.text);
    const relevantText = [...priorUser, message].join("\n");
    const observations = inferObservationContext(relevantText);
    const safetyText = [
      ...(body.history ?? []).map((item) =>
        item.role === "assistant" ? assistantFacts(item.text) : item.text,
      ),
      message,
    ].join("\n");
    const safety = scanText(safetyText);
    const canonicalEmergency = (body.history ?? []).some(
      (item) =>
        item.role === "assistant" && item.text.includes(EMERGENCY_STEPS[0]),
    );
    const safetyFloor = highestTier([
      body.safetyFloor,
      safety.tier,
      canonicalEmergency ? "EMERGENCY" : null,
      ...(body.history ?? []).map((item) => item.safetyTier),
    ]);
    // Safety context is carried across every follow-up. A later optimistic claim cannot lower it.
    const result = diagnoseDeterministic({
      symptomText: safety.tier ? safetyText : relevantText,
      profile: body.profile,
      hasPhoto: Boolean(body.image),
      safetyFloor: safetyFloor ?? undefined,
    });
    return jsonResponse({
      reply: {
        replyText: result.whatHappened,
        safetyTier: result.safetyTier,
        safetyFloor: highestTier([safetyFloor, result.safetyTier]),
        canDiy: result.canDiy,
        clarifyingQuestions: result.clarifyingQuestions,
        possibleCauses: [],
        nextSafeStep:
          result.steps[0] ??
          "Describe the observations above before attempting a repair.",
        materials: result.toolsNeeded,
        estimatedSavingsUsd: 0,
        recommendedGuideSlug: result.recommendedGuideSlug,
        engineMode: result.engineMode,
        steps: result.steps,
        detectedPresetId: observations.presetId ?? null,
      },
    });
  } catch (error) {
    return requestFailure(error);
  }
}
