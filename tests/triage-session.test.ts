import { expect, it } from "vitest";
import { DEFAULT_STATE, DEMO_STATE } from "@/lib/homeStore";
import {
  getTriageSessionKey,
  putTriageHandoff,
  takeTriageHandoff,
} from "@/lib/triageSession";
it("invalidates the entire draft on home or material-context changes, but not demo billing", () => {
  const key = getTriageSessionKey(DEFAULT_STATE);
  expect(getTriageSessionKey(DEMO_STATE)).not.toBe(key);
  expect(
    getTriageSessionKey({
      ...DEFAULT_STATE,
      profileConfigured: true,
      profile: { ...DEFAULT_STATE.profile, yearBuilt: 1960 },
    }),
  ).not.toBe(key);
  expect(
    getTriageSessionKey({
      ...DEFAULT_STATE,
      plusDemo: true,
      profile: { ...DEFAULT_STATE.profile, planTier: "plus" },
    }),
  ).toBe(key);
});
it("hands observations to the matching home once, expires them, and carries the safety floor", () => {
  const handoff = {
    scope: "personal",
    observations: "My sink leaks only when draining",
    presetId: "sink-leaking",
    safetyFloor: "PRO_REQUIRED" as const,
  };
  putTriageHandoff(handoff, 1000);
  expect(takeTriageHandoff("personal", 2000)?.safetyFloor).toBe("PRO_REQUIRED");
  expect(takeTriageHandoff("personal", 2001)).toBeNull();
  putTriageHandoff(handoff, 1000);
  expect(takeTriageHandoff("demo", 2000)).toBeNull();
  putTriageHandoff(handoff, 1000);
  expect(takeTriageHandoff("personal", 400000)).toBeNull();
});
