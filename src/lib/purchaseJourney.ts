import type { FixdeedState, HousingType, ApplianceId } from "@/lib/homeStore";
import {
  DiagnosisResultSchema,
  type DiagnosisResult,
} from "@/lib/diagnosticEngine";
import { z } from "zod";
import { DecisionCaseSchema, type DecisionCase } from "@/lib/decisionCases";
import { scanText } from "@/lib/safetyGate";
import { getTriageSessionKey } from "@/lib/triageSession";
import { getTriageContext } from "@/lib/clientContext";
export type JourneyGoal = "problem" | "maintenance" | "quotes";
export interface PurchaseJourney {
  id: string;
  scope: string;
  housingType: HousingType;
  homeTypeConfirmed?: boolean;
  goal: JourneyGoal;
  observations: string;
  appliances: ApplianceId[];
  result: DiagnosisResult | null;
  presetId?: string;
  symptomText?: string;
  answers?: Record<string, string>;
}
let pending: {
  value: PurchaseJourney;
  expiresAt: number;
  attemptId?: string;
} | null = null;
const STORAGE_KEY = "fixdeed:checkout:v1";
const StoredJourney = z.object({
  expiresAt: z.number(),
  attemptId: z.uuid().optional(),
  value: z.object({
    id: z.string().min(1).max(100),
    scope: z.string().max(2000),
    housingType: z.enum(["house", "townhome", "apartment"]),
    homeTypeConfirmed: z.boolean().optional(),
    goal: z.enum(["problem", "maintenance", "quotes"]),
    observations: z.string().max(8000),
    appliances: z
      .array(
        z.enum([
          "tank_water_heater",
          "tankless_water_heater",
          "dishwasher",
          "washer_dryer",
          "garbage_disposal",
          "central_hvac",
        ]),
      )
      .max(6),
    result: DiagnosisResultSchema.nullable(),
    presetId: z.string().max(80).optional(),
    symptomText: z.string().max(1500).optional(),
    answers: z
      .record(z.string().max(80), z.string().max(300))
      .refine((a) => Object.keys(a).length <= 12)
      .optional(),
  }),
});
export function getPurchaseScope(state: FixdeedState): string {
  return JSON.stringify([
    getTriageSessionKey(state),
    state.profile.housingType,
    [...state.profile.appliances].sort(),
  ]);
}
export function preservePresetObservations(
  text: string,
  previousLabel: string | undefined,
  nextLabel: string,
): string {
  return text.trim() && text.trim() !== previousLabel ? text : nextLabel;
}
export function getJourneyTriageProfile(
  state: FixdeedState,
  housingType: HousingType,
) {
  return {
    housingType,
    ...(state.profileConfigured && state.profile.housingType === housingType
      ? getTriageContext(state.profile)
      : {}),
  };
}
/** Short-lived handoff. Explicit tab-local storage only when leaving for Stripe. */
export function putPurchaseJourney(
  value: PurchaseJourney,
  now = Date.now(),
): boolean {
  clearPurchaseJourney();
  if (
    value.result?.safetyTier === "EMERGENCY" ||
    scanText(value.symptomText ?? value.observations).tier === "EMERGENCY"
  )
    return false;
  const parsed = StoredJourney.safeParse({
    value,
    expiresAt: now + 30 * 60_000,
  });
  if (!parsed.success) return false;
  pending = parsed.data;
  return true;
}
export function getPurchaseJourney(
  scope: string,
  now = Date.now(),
): PurchaseJourney | null {
  if (!pending && typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage?.getItem(STORAGE_KEY);
      if (raw && raw.length <= 64000) {
        const parsed = StoredJourney.safeParse(JSON.parse(raw));
        if (parsed.success) pending = parsed.data;
      }
    } catch {
      /* A failed tab store does not affect existing home records. */
    }
  }
  if (!pending || pending.value.scope !== scope || now > pending.expiresAt) {
    clearPurchaseJourney();
    return null;
  }
  return structuredClone(pending.value);
}
export function consumePurchaseJourney(
  scope: string,
  now = Date.now(),
  attemptId?: string,
): PurchaseJourney | null {
  const value = getPurchaseJourney(scope, now);
  if (attemptId && pending?.attemptId !== attemptId) return null;
  clearPurchaseJourney();
  return value;
}
export function clearPurchaseJourney(): boolean {
  pending = null;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return window.sessionStorage.getItem(STORAGE_KEY) === null;
    }
    return true;
  } catch {
    return false;
  }
}
export function persistPurchaseJourney(
  scope: string,
  now = Date.now(),
  attemptId?: string,
): boolean {
  if (!getPurchaseJourney(scope, now)) return false;
  if (pending && attemptId) pending.attemptId = attemptId;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
    return true;
  } catch {
    return false;
  }
}
export async function checkoutScopeHash(scope: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(scope),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
export function makeJourneyCase(
  journey: PurchaseJourney,
  now: string,
): DecisionCase | null {
  const r = journey.result;
  if (!r || r.safetyTier === "EMERGENCY" || !journey.observations.trim())
    return null;
  return DecisionCaseSchema.parse({
    id: journey.id,
    title: r.diagnosisTitle.slice(0, 160),
    observations: journey.observations.trim(),
    createdAt: now,
    updatedAt: now,
    status: r.safetyTier === "PRO_REQUIRED" ? "professional" : "open",
    note: "",
    quotes: [],
    snapshot: {
      title: r.diagnosisTitle,
      summary: r.whatHappened,
      safetyTier: r.safetyTier,
      canDiy: r.canDiy,
      steps: r.steps,
      questions: r.clarifyingQuestions,
    },
  });
}
