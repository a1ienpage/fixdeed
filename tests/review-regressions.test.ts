import { afterEach, describe, expect, it, vi } from "vitest";
import {
  diagnoseDeterministic,
  enforceDiagnosisPostGate,
} from "@/lib/diagnosticEngine";
import { DEFAULT_STATE, calculateSkillProgress } from "@/lib/homeStore";
import { POST as assistant } from "@/app/api/assistant/route";
import { GUIDES } from "@/content/guides";

const result = (
  symptomText: string,
  presetId: string,
  answers: Record<string, string>,
) => diagnoseDeterministic({ symptomText, presetId, answers });
const post = (body: unknown) =>
  assistant(
    new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("independent review source authority regressions", () => {
  it.each([
    [
      "My washing machine is smoking",
      "washer-not-draining",
      { style: "hose_kink" },
    ],
    [
      "Smoke is coming from the dishwasher",
      "sink-leaking",
      { timing: "when_running", valve_type: "quarter_lever" },
    ],
    [
      "Water is dripping from my ceiling lamp",
      "hole-in-wall",
      { size: "small" },
    ],
    ["The ceiling lamp is dripping water", "hole-in-wall", { size: "small" }],
  ] as const)(
    "forces emergency before selected preset: %s",
    (text, preset, answers) => {
      const r = result(text, preset, answers);
      expect(r.safetyTier).toBe("EMERGENCY");
      expect(r.canDiy).toBe(false);
      expect(r.recommendedGuideSlug).toBeNull();
      expect(r.steps.join(" ")).not.toMatch(/thermostat|cycle|controls|patch/i);
    },
  );
  it.each([
    ["The drywall is wet and soft", "hole-in-wall", { size: "small" }],
    [
      "The toilet leaks under the base",
      "toilet-wont-flush",
      { symptom: "loose_handle" },
    ],
    [
      "The pipe leaks constantly even with the faucet off",
      "sink-leaking",
      { timing: "when_running", valve_type: "quarter_lever" },
    ],
    [
      "My AC pipe has frost on it",
      "ac-not-cooling",
      { symptom: "weak_airflow_dirty" },
    ],
  ] as const)(
    "source professional condition outranks selected low-risk answer: %s",
    (text, preset, answers) => {
      const r = result(text, preset, answers);
      expect(r.safetyTier).toBe("PRO_REQUIRED");
      expect(r.canDiy).toBe(false);
      expect(r.recommendedGuideSlug).toBeNull();
    },
  );
  it("does not defer known continuous supply stop until other questions answered", () => {
    const r = result("", "sink-leaking", { timing: "constantly" });
    expect(r.safetyTier).toBe("PRO_REQUIRED");
    expect(r.canDiy).toBe(false);
  });
  it.each([
    [
      "My dishwasher is making strange noises",
      "sink-leaking",
      { timing: "when_running", valve_type: "quarter_lever" },
    ],
    [
      "My toilet will not flush",
      "sink-leaking",
      { timing: "when_running", valve_type: "quarter_lever" },
    ],
    [
      "My sink leaks and my washer will not drain",
      "sink-leaking",
      { timing: "when_running", valve_type: "quarter_lever" },
    ],
    [
      "My door is swollen evenly all around",
      "door-wont-close",
      { location: "all_around" },
    ],
    ["Unknown problem", "ac-not-cooling", { symptom: "weak_airflow_dirty" }],
  ] as const)(
    "clarifies mismatch or insufficient low-risk proof: %s",
    (text, preset, answers) => {
      const r = result(text, preset, answers);
      expect(r.canDiy).toBe(false);
      expect(r.steps).toEqual([]);
      expect(r.recommendedGuideSlug).toBeNull();
      expect(r.clarifyingQuestions.length).toBeGreaterThan(0);
    },
  );
  it("does not combine frost with the safe airflow selection label", () => {
    // A clean filter-only answer is a distinct choice; the legacy combined answer remains uncertain.
    const r = result("", "ac-not-cooling", { symptom: "weak_airflow_dirty" });
    expect(r.canDiy).toBe(false);
  });
  it("preserves higher caution even when vetted baseline is safe", () => {
    const params = {
      presetId: "sink-leaking",
      answers: { timing: "when_running", valve_type: "quarter_lever" },
    };
    const baseline = diagnoseDeterministic({
      ...params,
      symptomText: "My sink leaks",
    });
    const gated = enforceDiagnosisPostGate(
      { ...baseline, safetyTier: "DIY_CAUTION" },
      "My sink leaks",
      params,
    );
    expect(gated.safetyTier).toBe("DIY_CAUTION");
    expect(gated.severity).toBe("moderate");
  });
});

describe("durable assistant floor contract", () => {
  it("retains an actual emergency response after original user text leaves history", async () => {
    const first = (
      await (await post({ message: "My outlet is on fire" })).json()
    ).reply;
    const next = (
      await (
        await post({
          message: "What should I do now?",
          history: [
            {
              role: "assistant",
              text: first.replyText + " " + first.nextSafeStep,
            },
          ],
        })
      ).json()
    ).reply;
    expect(next.safetyTier).toBe("EMERGENCY");
    expect(next.canDiy).toBe(false);
  });
  it("carries explicit supplied floor across bounded history rolloff and optimistic text", async () => {
    const next = (
      await (
        await post({
          message: "Everything is fine now. How do I fix my sink?",
          safetyFloor: "EMERGENCY",
          history: [],
        })
      ).json()
    ).reply;
    expect(next.safetyTier).toBe("EMERGENCY");
    expect(next.safetyFloor).toBe("EMERGENCY");
    expect(next.canDiy).toBe(false);
  });
  it("preserves structured assistant hazard metadata independently of display text", async () => {
    const next = (
      await (
        await post({
          message: "What next?",
          history: [
            {
              role: "assistant",
              text: "Stop and leave.",
              safetyTier: "EMERGENCY",
            },
          ],
        })
      ).json()
    ).reply;
    expect(next.safetyTier).toBe("EMERGENCY");
    expect(next.canDiy).toBe(false);
  });
});

it.each(["{}", "{"])(
  "recovers corrupt demo %s without overwriting validated personal history",
  async (corruptDemo) => {
    const personal = {
      ...DEFAULT_STATE,
      profileConfigured: true,
      repairHistory: [
        {
          id: "actual",
          title: "confirmed",
          date: "2026-11-15",
          category: "Plumbing",
          outcome: "diy_fixed",
          proEstimate: 100,
          diySpent: 20,
          savedAmount: 80,
          confirmationId: "real-confirmation",
        },
      ],
    };
    const values = new Map([
      ["fixdeed:v2", JSON.stringify(personal)],
      ["fixdeed:demo:v2", corruptDemo],
      ["fixdeed:mode:v2", "demo"],
    ]);
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => values.get(k) ?? null,
        setItem: (k: string, v: string) => values.set(k, v),
        removeItem: (k: string) => values.delete(k),
      },
      addEventListener: () => {},
    });
    vi.resetModules();
    const store = await import("@/lib/homeClientStore");
    expect(JSON.parse(store.getExportData()).repairHistory).toHaveLength(1);
    expect(store.getPersistenceStatus()).toBe("unavailable");
    store.updateProfile({ homeName: "Renamed real home" });
    expect(JSON.parse(values.get("fixdeed:v2")!).repairHistory).toHaveLength(1);
  },
);

it("derives skill targets from catalog and reaches 100% after each real guide assessment", () => {
  const complete = {
    ...DEFAULT_STATE,
    unlockedSkills: GUIDES.map((guide) => ({
      id: guide.slug,
      title: guide.skillUnlockedTitle,
      category: guide.skillCategory,
      unlockedAt: "2026-11-15",
    })),
  };
  const progress = calculateSkillProgress(complete);
  expect(progress.find((p) => p.category === "Plumbing Basics")?.target).toBe(
    5,
  );
  expect(
    progress.find((p) => p.category === "Electrical & Safety Triage")?.target,
  ).toBe(1);
  expect(progress.every((p) => p.unlocked === p.target && p.pct === 100)).toBe(
    true,
  );
});

it("never directs screws into an unverified jamb or wall from a direct door guide", () => {
  const guide = GUIDES.find((g) => g.slug === "door-wont-close")!;
  expect(guide.steps.join(" ")).not.toMatch(
    /3.inch|three.inch|long.screw|drive.*screw|screw.*stud/i,
  );
});
