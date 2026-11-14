import type { FixdeedState } from "@/lib/homeStore";
import type { SafetyTier } from "@/lib/safetyGate";
export function getTriageSessionKey(
  state: FixdeedState,
): string {
  return JSON.stringify([
    state.dataMode,
    state.profileConfigured,
    state.profile.yearBuilt,
    state.profile.homeEra,
  ]);
}
interface Handoff {
  scope: string;
  observations: string;
  presetId?: string;
  safetyFloor?: SafetyTier;
}
let pending: (Handoff & { expiresAt: number }) | null = null;
/** Memory-only, one-use transfer. Descriptions never enter URLs or persistent storage. */
export function putTriageHandoff(value: Handoff, now = Date.now()): void {
  pending = {
    ...value,
    observations: value.observations.slice(-1500),
    expiresAt: now + 300_000,
  };
}
export function takeTriageHandoff(
  scope: string,
  now = Date.now(),
): Handoff | null {
  const value = pending;
  pending = null;
  return value && value.scope === scope && value.expiresAt >= now
    ? value
    : null;
}
