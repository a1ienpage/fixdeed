import { z } from "zod";
import { diagnoseDeterministic } from "@/lib/diagnosticEngine";
import {
  ImageSchema,
  PartialProfileSchema,
  jsonResponse,
  readBoundedJson,
  requestFailure,
} from "@/lib/api";

export const runtime = "nodejs";
const RequestSchema = z
  .object({
    presetId: z.string().max(80).optional(),
    symptomText: z.string().max(1500).optional(),
    answers: z
      .record(z.string().max(80), z.string().max(300))
      .refine((v) => Object.keys(v).length <= 12)
      .optional(),
    image: ImageSchema.optional(),
    profile: PartialProfileSchema.optional(),
  })
  .refine(
    (v) =>
      Boolean(v.presetId) || Boolean(v.image) || Boolean(v.symptomText?.trim()),
    { message: "Choose a problem or describe the symptom." },
  );

/** MVP uses vetted deterministic triage; image pixels are not analyzed. */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = RequestSchema.parse(await readBoundedJson(req));
    return jsonResponse({
      result: diagnoseDeterministic({
        presetId: body.presetId,
        symptomText: body.symptomText?.trim() ?? "",
        answers: body.answers,
        profile: body.profile,
        hasPhoto: Boolean(body.image),
      }),
    });
  } catch (error) {
    return requestFailure(error);
  }
}
