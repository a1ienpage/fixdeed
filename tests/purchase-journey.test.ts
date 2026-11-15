import { afterEach, describe, expect, it, vi } from "vitest";
import { diagnoseDeterministic } from "@/lib/diagnosticEngine";
import { DEFAULT_STATE } from "@/lib/homeStore";
import {
  preservePresetObservations,
  getJourneyTriageProfile,
} from "@/lib/purchaseJourney";
import {
  putPurchaseJourney,
  getPurchaseJourney,
  clearPurchaseJourney,
  consumePurchaseJourney,
  makeJourneyCase,
  getPurchaseScope,
  persistPurchaseJourney,
} from "@/lib/purchaseJourney";
const result = diagnoseDeterministic({
  presetId: "sink-leaking",
  symptomText: "My sink leaks only when draining.",
  answers: { timing: "draining", valve: "quarter_turn" },
});
const draft = {
  id: "journey-1",
  scope: "personal",
  housingType: "house" as const,
  goal: "problem" as const,
  observations:
    "Only when faucet runs or basin drains. Clean 1/4-turn straight lever handle.",
  appliances: [],
  result,
};
afterEach(() => {
  clearPurchaseJourney();
  vi.unstubAllGlobals();
});
describe("purchase journey handoff", () => {
  it("preserves observations and a stable saved-case identity across navigation", () => {
    putPurchaseJourney(draft, 1000);
    const loaded = getPurchaseJourney("personal", 2000)!;
    const item = makeJourneyCase(loaded, "2026-11-15T05:00:00.000Z")!;
    expect(item.id).toBe("journey-1");
    expect(item.observations).toContain(
      "Only when faucet runs or basin drains",
    );
    expect(item.snapshot.title).toBe(result.diagnosisTitle);
  });
  it("expires without leaving an old diagnosis attached to checkout", () => {
    putPurchaseJourney(draft, 1000);
    expect(getPurchaseJourney("personal", 1801001)).toBeNull();
  });
  it("does not carry sample-home decisions into a personal purchase", () => {
    putPurchaseJourney({ ...draft, scope: "demo" }, 1000);
    expect(getPurchaseJourney("personal", 1001)).toBeNull();
    expect(getPurchaseScope(DEFAULT_STATE)).not.toBe(
      getPurchaseScope({ ...DEFAULT_STATE, dataMode: "demo" }),
    );
  });
  it("rejects emergency results and contradictory emergency observations", () => {
    expect(
      putPurchaseJourney(
        { ...draft, result: { ...result, safetyTier: "EMERGENCY" } },
        1000,
      ),
    ).toBe(false);
    expect(
      putPurchaseJourney(
        { ...draft, observations: "There is an active gas smell." },
        1000,
      ),
    ).toBe(false);
    expect(getPurchaseJourney("personal", 1001)).toBeNull();
  });
  it("isolates snapshots from later edits and consumes the intent only once", () => {
    const copy = structuredClone(draft);
    putPurchaseJourney(copy, 1000);
    copy.observations = "Changed";
    getPurchaseJourney("personal", 1001)!.observations = "Also changed";
    expect(consumePurchaseJourney("personal", 1002)?.observations).toContain(
      "Clean 1/4-turn",
    );
    expect(consumePurchaseJourney("personal", 1003)).toBeNull();
  });
  it("does not invent a repair case for a maintenance-only purchase", () => {
    expect(
      makeJourneyCase(
        { ...draft, goal: "maintenance", result: null },
        "2026-11-15T05:00:00.000Z",
      ),
    ).toBeNull();
  });
});
it("restores a bounded tab-local handoff after the Stripe redirect and clears it on consumption", async () => {
  const values = new Map<string, string>();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
      removeItem: (k: string) => values.delete(k),
    },
  });
  putPurchaseJourney(draft, 1000);
  expect(persistPurchaseJourney("personal", 1001)).toBe(true);
  vi.resetModules();
  const restored = await import("@/lib/purchaseJourney");
  expect(restored.getPurchaseJourney("personal", 1002)?.observations).toContain(
    "Clean 1/4-turn",
  );
  restored.consumePurchaseJourney("personal", 1003);
  expect([...values.values()]).toHaveLength(0);
});
it("keeps setup choices without inventing a build year or overwriting personal data from the sample", async () => {
  const values = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
    addEventListener: () => {},
  });
  vi.resetModules();
  const store = await import("@/lib/homeClientStore");
  const personal = store.applyHomeSetup("apartment", ["dishwasher"]);
  expect(personal.profile.housingType).toBe("apartment");
  expect(personal.profile.appliances).toEqual(["dishwasher"]);
  expect(personal.profileConfigured).toBe(false);
  const before = store.getExportData();
  store.openSampleHome();
  expect(store.applyHomeSetup("townhome", ["washer_dryer"]).dataMode).toBe(
    "demo",
  );
  expect(store.getExportData()).toBe(before);
});
it("never replaces authored warning signs when a preset classifies the issue", () => {
  expect(
    preservePresetObservations(
      "My sink leaks and I smell gas.",
      undefined,
      "My sink is leaking.",
    ),
  ).toBe("My sink leaks and I smell gas.");
  expect(
    preservePresetObservations(
      "My sink is leaking.",
      "My sink is leaking.",
      "My door won't close.",
    ),
  ).toBe("My door won't close.");
});
it("uses confirmed construction context only for the same selected home type", () => {
  const old = {
    ...DEFAULT_STATE,
    profileConfigured: true,
    profile: {
      ...DEFAULT_STATE.profile,
      yearBuilt: 1960,
      homeEra: "pre1980" as const,
    },
  };
  expect(getJourneyTriageProfile(old, "house")).toEqual({
    housingType: "house",
    yearBuilt: 1960,
    homeEra: "pre1980",
  });
  expect(getJourneyTriageProfile(old, "apartment")).toEqual({
    housingType: "apartment",
  });
  expect(getJourneyTriageProfile(DEFAULT_STATE, "house")).toEqual({
    housingType: "house",
  });
});
it("accepts selected safe washer wording without rescanning the app label as a symptom", () => {
  const washer = diagnoseDeterministic({
    presetId: "washer-not-draining",
    symptomText: "My washing machine isn't draining.",
    answers: { style: "hose_kink" },
  });
  expect(washer.safetyTier).toBe("DIY_SAFE");
  expect(
    putPurchaseJourney(
      {
        ...draft,
        result: washer,
        symptomText: "My washing machine isn't draining.",
        observations:
          "My washing machine isn't draining. Kinked/pinched hose behind machine (no electrical burning smell)",
      },
      1000,
    ),
  ).toBe(true);
});
it("retains a maximum-length authored description and every checked observation after redirect", async () => {
  const values = new Map<string, string>();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
      removeItem: (k: string) => values.delete(k),
    },
  });
  const observations =
    "Home type: house.\n" +
    "x".repeat(1500) +
    "\nChecked: Only when faucet runs or basin drains";
  expect(
    putPurchaseJourney(
      { ...draft, symptomText: "x".repeat(1500), observations },
      1000,
    ),
  ).toBe(true);
  expect(persistPurchaseJourney("personal", 1001)).toBe(true);
  vi.resetModules();
  const restored = await import("@/lib/purchaseJourney");
  expect(
    makeJourneyCase(
      restored.getPurchaseJourney("personal", 1002)!,
      "2026-11-15T05:00:00.000Z",
    )?.observations,
  ).toBe(observations);
});
it("explicit home deletion removes both private checkout copies", async () => {
  const values = new Map<string, string>(),
    session = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
      removeItem: (k: string) => values.delete(k),
    },
    sessionStorage: {
      getItem: (k: string) => session.get(k) ?? null,
      setItem: (k: string, v: string) => session.set(k, v),
      removeItem: (k: string) => session.delete(k),
    },
    addEventListener: () => {},
  });
  vi.resetModules();
  const journey = await import("@/lib/purchaseJourney");
  const store = await import("@/lib/homeClientStore");
  journey.putPurchaseJourney(
    { ...draft, scope: getPurchaseScope(DEFAULT_STATE) },
    1000,
  );
  journey.persistPurchaseJourney(getPurchaseScope(DEFAULT_STATE), 1001);
  expect(store.clearHomeData()).toBe(true);
  expect(
    journey.getPurchaseJourney(getPurchaseScope(DEFAULT_STATE), 1002),
  ).toBeNull();
  expect(session.size).toBe(0);
});
it("does not let an earlier paid return consume the next checkout's decision", () => {
  const values = new Map<string, string>();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
      removeItem: (k: string) => values.delete(k),
    },
  });
  putPurchaseJourney(draft, 1000);
  persistPurchaseJourney(
    "personal",
    1001,
    "765d51cb-9ba7-49b2-86b1-981529bd60f8",
  );
  expect(
    consumePurchaseJourney(
      "personal",
      1002,
      "765d51cb-9ba7-49b2-86b1-981529bd60f9",
    ),
  ).toBeNull();
  expect(
    consumePurchaseJourney(
      "personal",
      1003,
      "765d51cb-9ba7-49b2-86b1-981529bd60f8",
    )?.id,
  ).toBe("journey-1");
});
