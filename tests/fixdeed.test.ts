import { describe, expect, it } from "vitest";
import { scanText, enforceSafetyFloor } from "@/lib/safetyGate";
import { diagnoseDeterministic } from "@/lib/diagnosticEngine";
import {
  DEFAULT_STATE,
  calculateHomeHealthScore,
  calculateSavingsSummary,
} from "@/lib/homeStore";
import { filterTasksForProfile } from "@/content/preventive";

describe("Fixdeed Deterministic Safety Gate", () => {
  it("forces EMERGENCY on rotten-egg gas smells or CO alarms", () => {
    const res = scanText("I smell rotten eggs near my basement water heater.");
    expect(res.tier).toBe("EMERGENCY");
    expect(res.matches.length).toBeGreaterThan(0);
  });

  it("forces EMERGENCY on water dripping near lights or breaker panels", () => {
    const res = scanText(
      "Water dripping from ceiling light fixture above bathroom",
    );
    expect(res.tier).toBe("EMERGENCY");
  });

  it("forces PRO_REQUIRED on breaker panel removal, 240V circuits, and garage springs", () => {
    expect(
      scanText("removing the panel cover to add a 240v breaker").tier,
    ).toBe("PRO_REQUIRED");
    expect(
      scanText("replacing my broken garage door torsion spring").tier,
    ).toBe("PRO_REQUIRED");
    expect(scanText("capacitor buzzing on AC unit").tier).toBe("PRO_REQUIRED");
  });

  it("never lets an optimistic LLM tier downgrade a red-line floor", () => {
    expect(enforceSafetyFloor("DIY_SAFE", "EMERGENCY")).toBe("EMERGENCY");
    expect(enforceSafetyFloor("DIY_CAUTION", "PRO_REQUIRED")).toBe(
      "PRO_REQUIRED",
    );
  });
});

describe("Fixdeed Diagnostic Engine", () => {
  it("produces vetted guidance without treating a benchmark as actual savings", () => {
    const diag = diagnoseDeterministic({
      presetId: "sink-leaking",
      symptomText: "Water drips under sink only when faucet runs",
      answers: { timing: "when_running", valve_type: "quarter_lever" },
      profile: DEFAULT_STATE.profile,
    });
    expect(diag.canDiy).toBe(true);
    expect(diag.safetyTier).toBe("DIY_SAFE");
    expect(diag.estimatedSavingsUsd).toBe(0);
    expect(diag.recommendedGuideSlug).toBe("sink-leaking");
  });

  it("strips DIY steps when user describes gas odor", () => {
    const diag = diagnoseDeterministic({
      symptomText: "I smell gas when furnace kicks on",
      profile: DEFAULT_STATE.profile,
    });
    expect(diag.canDiy).toBe(false);
    expect(diag.safetyTier).toBe("EMERGENCY");
    expect(diag.estimatedSavingsUsd).toBe(0);
  });
});

describe("Fixdeed Home Profile & Preventive Math", () => {
  it("filters out house-only tasks such as gutters for apartment profiles", () => {
    const houseTasks = filterTasksForProfile(DEFAULT_STATE.profile);
    const aptTasks = filterTasksForProfile({
      ...DEFAULT_STATE.profile,
      housingType: "apartment",
    });
    expect(houseTasks.some((t) => t.id === "prev_gutter_downspout")).toBe(true);
    expect(aptTasks.some((t) => t.id === "prev_gutter_downspout")).toBe(false);
  });

  it("starts with no claimed savings or repair-based health boosts", () => {
    const tasks = filterTasksForProfile(DEFAULT_STATE.profile);
    const health = calculateHomeHealthScore(DEFAULT_STATE, tasks.length);
    const savings = calculateSavingsSummary(
      DEFAULT_STATE,
      tasks.reduce((sum, t) => sum + t.preventedBreakdownCost, 0),
    );
    expect(health).toBeGreaterThanOrEqual(0);
    expect(health).toBeLessThanOrEqual(100);
    expect(savings.savedThisYear).toBe(0);
    expect(savings.preventedRiskValue).toBe(0);
  });
});
