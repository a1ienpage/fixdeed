import { describe, expect, it } from "vitest";
import { scanText } from "@/lib/safetyGate";
import {
  diagnoseDeterministic,
  enforceDiagnosisPostGate,
} from "@/lib/diagnosticEngine";
import { DEFAULT_STATE, calculateSavingsSummary } from "@/lib/homeStore";

const diagnose = (
  symptomText: string,
  presetId?: string,
  answers?: Record<string, string>,
) => diagnoseDeterministic({ symptomText, presetId, answers });

describe("conservative diagnosis authority", () => {
  it.each([
    "The outlet is on fire",
    "Fire in breaker panel",
    "Light fixture has water dripping from it",
    "Water is dripping from the light fixture",
    "The gas meter is hissing",
    "CO alarm sounding",
  ])("stops emergency: %s", (text) => {
    expect(scanText(text).tier).toBe("EMERGENCY");
    expect(diagnose(text).canDiy).toBe(false);
  });
  it.each([
    "My refrigerator makes a noise",
    "Something is broken",
    "package delivery issue",
  ])("does not default unknown input to sink: %s", (text) => {
    const result = diagnose(text);
    expect(result.canDiy).toBe(false);
    expect(result.steps).toEqual([]);
    expect(result.recommendedGuideSlug).toBeNull();
    expect(result.benchmark).toBeNull();
    expect(result.clarifyingQuestions.length).toBeGreaterThan(0);
  });
  it("requires every preset answer before authorizing DIY", () => {
    const result = diagnose("my sink leaks", "sink-leaking", {
      timing: "when_running",
    });
    expect(result.canDiy).toBe(false);
    expect(result.steps).toEqual([]);
    expect(result.clarifyingQuestions.join(" ")).toMatch(/handle|valve/i);
  });
  it("does not invent photo verification or diagnosis", () => {
    const result = diagnoseDeterministic({ symptomText: "", hasPhoto: true });
    expect(result.canDiy).toBe(false);
    expect(result.recommendedGuideSlug).toBeNull();
    expect(result.diagnosisTitle).not.toMatch(/verified/i);
  });
  it.each([
    ["toilet-wont-flush", { symptom: "water_rising_base" }, /flapper|chain/i],
    ["hole-in-wall", { size: "large_wet" }, /patch|sand|compound/i],
    [
      "sink-leaking",
      { timing: "constantly", valve_type: "quarter_lever" },
      /p-trap|slip.joint/i,
    ],
  ] as const)(
    "routes incompatible branch away from repair instructions: %s",
    (slug, answers, wrongSteps) => {
      const r = diagnose("", slug, answers);
      expect(r.canDiy).toBe(false);
      expect(r.steps.join(" ")).not.toMatch(wrongSteps);
      expect(r.recommendedGuideSlug).toBeNull();
    },
  );
  it("uses a matching flapper benchmark, and null for unsupported washer repair", () => {
    expect(
      diagnose("", "toilet-wont-flush", { symptom: "loose_handle" }).benchmark
        ?.id,
    ).toBe("toilet_flapper");
    expect(
      diagnose("", "washer-not-draining", { style: "hose_kink" }).benchmark,
    ).toBeNull();
  });
  it("replaces model instructions even if dangerous paraphrase misses regex", () => {
    const vetted = diagnose("my sink is leaking", "sink-leaking", {
      timing: "when_running",
      valve_type: "quarter_lever",
    });
    const raw = {
      ...vetted,
      steps: ["Bridge the two conductors using a metal spoon"],
      toolsNeeded: ["bare copper jumper"],
      estimatedSavingsUsd: 100000,
    };
    const gated = enforceDiagnosisPostGate(raw, "Unknown repair");
    expect(gated.steps).toEqual([]);
    expect(gated.canDiy).toBe(false);
    expect(gated.estimatedSavingsUsd).toBe(0);
  });
  it.each([
    "safetyReason",
    "profileTailoringNote",
    "toolsNeeded",
    "steps",
    "clarifyingQuestions",
    "proQuestions",
  ] as const)("scans every model field: %s", (field) => {
    const raw = diagnose("unknown");
    const changed = {
      ...raw,
      [field]: Array.isArray(raw[field])
        ? ["outlet is on fire"]
        : "outlet is on fire",
    };
    expect(enforceDiagnosisPostGate(changed, "my sink leaks").safetyTier).toBe(
      "EMERGENCY",
    );
  });
});

describe("truthful personal state", () => {
  it("has no fabricated personal history", () => {
    expect(DEFAULT_STATE.repairHistory).toEqual([]);
    expect(DEFAULT_STATE.unlockedSkills).toEqual([]);
    expect(DEFAULT_STATE.completedPreventive).toEqual({});
    expect(DEFAULT_STATE.dataMode).toBe("personal");
    expect(DEFAULT_STATE.profileConfigured).toBe(false);
  });
  it("counts confirmed repair differences only in the requested year/month", () => {
    const entry = {
      id: "x",
      date: "2025-11-01",
      title: "fixture",
      category: "Plumbing" as const,
      outcome: "diy_fixed" as const,
      proEstimate: 100,
      diySpent: 20,
      savedAmount: 999,
      confirmationId: "a",
    };
    const state = {
      ...DEFAULT_STATE,
      repairHistory: [
        entry,
        { ...entry, id: "y", date: "2026-11-01", confirmationId: "b" },
        { ...entry, id: "z", date: "2026-10-01", confirmationId: "c" },
        {
          ...entry,
          id: "p",
          date: "2026-11-01",
          outcome: "pro_routed" as const,
          confirmationId: "d",
        },
      ],
    };
    expect(calculateSavingsSummary(state, 100000, "2026-11")).toEqual({
      savedThisMonth: 80,
      savedThisYear: 160,
      totalDiyOutlay: 80,
      preventedRiskValue: 0,
    });
  });
});

it("does not establish a flapper cause from generic continuous tank filling", () => {
  const r = diagnose("", "toilet-wont-flush", { symptom: "runs_constantly" });
  expect(r.canDiy).toBe(false);
  expect(r.steps).toEqual([]);
  expect(r.clarifyingQuestions.length).toBeGreaterThan(0);
});
it("does not sand an unverified old wall finish", () => {
  const r = diagnoseDeterministic({
    presetId: "hole-in-wall",
    symptomText: "small hole",
    answers: { size: "small" },
    profile: { yearBuilt: 1960 },
  });
  expect(r.canDiy).toBe(false);
  expect(r.steps.join(" ")).not.toMatch(/sand/i);
});

it("cannot use a conflicting refrigerator symptom with a selected sink preset to obtain steps", () => {
  const r = diagnose("My refrigerator makes a noise", "sink-leaking", {
    timing: "when_running",
    valve_type: "quarter_lever",
  });
  expect(r.canDiy).toBe(false);
  expect(r.steps).toEqual([]);
  expect(r.recommendedGuideSlug).toBeNull();
});

it.each([undefined, {}])(
  "keeps small wall damage in clarification when construction context is missing: %s",
  (profile) => {
    const r = diagnoseDeterministic({
      presetId: "hole-in-wall",
      symptomText: "Small dry hole in drywall",
      answers: { size: "small", surface: "known_safe" },
      profile,
    });
    expect(r.canDiy).toBe(false);
    expect(r.steps).toEqual([]);
    expect(r.recommendedGuideSlug).toBeNull();
    expect(r.clarifyingQuestions.join(" ")).toMatch(/year|built|era/i);
  },
);
it.each([undefined, "unknown"])(
  "requires established wall material/finish even in a newer home: %s",
  (surface) => {
    const r = diagnoseDeterministic({
      presetId: "hole-in-wall",
      symptomText: "Small dry hole in drywall",
      answers: { size: "small", ...(surface ? { surface } : {}) },
      profile: { yearBuilt: 2010, homeEra: "post2000" },
    });
    expect(r.canDiy).toBe(false);
    expect(r.steps).toEqual([]);
    expect(r.recommendedGuideSlug).toBeNull();
  },
);
it("allows only limited wall guidance after modern construction and safe material confirmation", () => {
  const r = diagnoseDeterministic({
    presetId: "hole-in-wall",
    symptomText: "Small dry hole in drywall",
    answers: { size: "small", surface: "known_safe" },
    profile: { yearBuilt: 2010, homeEra: "post2000" },
  });
  expect(r.canDiy).toBe(true);
  expect(r.recommendedGuideSlug).toBe("hole-in-wall");
});
