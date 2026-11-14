import { describe, expect, it, vi, afterEach } from "vitest";
import { FixdeedStateSchema, DEFAULT_STATE } from "@/lib/homeStore";
import {
  DecisionCaseSchema,
  compareQuotes,
  buildContractorBrief,
} from "@/lib/decisionCases";
import { hasPlusAccess, PLUS_ANNUAL_USD, PLUS_MONTHLY_USD } from "@/lib/plans";
const sample = {
  id: "case-a",
  title: "Sink leak",
  observations: "Drips only when draining",
  createdAt: "2026-11-15T00:00:00.000Z",
  updatedAt: "2026-11-15T00:00:00.000Z",
  status: "open",
  note: "Check before work",
  snapshot: {
    title: "Limited drain check",
    summary: "Observe the source first",
    safetyTier: "DIY_CAUTION",
    canDiy: true,
    steps: ["Stop if the conditions differ."],
    questions: [],
  },
  quotes: [],
};
describe("persistent decision cases", () => {
  it("migrates older browser data without losing repairs or adding paid access", () => {
    const legacy = { ...DEFAULT_STATE };
    delete (legacy as Record<string, unknown>).decisionCases;
    delete (legacy as Record<string, unknown>).plusDemo;
    const state = FixdeedStateSchema.parse(legacy);
    expect(state.decisionCases).toEqual([]);
    expect(state.plusDemo).toBe(false);
  });
  it("retains observations separately from result and follow-up notes", () => {
    const parsed = DecisionCaseSchema.parse(sample);
    expect(parsed.observations).toBe("Drips only when draining");
    expect(parsed.note).toBe("Check before work");
  });
  it.each([-1, Infinity, NaN])("rejects invalid quoted amount %s", (amount) => {
    expect(
      DecisionCaseSchema.safeParse({
        ...sample,
        quotes: [
          {
            id: "q",
            contractor: "A",
            amount,
            scope: "Drain",
            exclusions: "",
            warranty: "",
          },
        ],
      }).success,
    ).toBe(false);
  });
  it("shows arithmetic without claiming that unlike scopes are equivalent", () => {
    const compared = compareQuotes([
      {
        id: "a",
        contractor: "A",
        amount: 180,
        scope: "Reseat drain washer",
        exclusions: "Parts",
        warranty: "",
      },
      {
        id: "b",
        contractor: "B",
        amount: 260,
        scope: "Replace drain assembly",
        exclusions: "",
        warranty: "1 year",
      },
    ]);
    expect(compared.spread).toBe(80);
    expect(compared.lowest).toBe(180);
    expect(compared.warning).toMatch(/scope/i);
    expect(compared.missingDetails).toContain("A: warranty not recorded");
  });
  it("exports user observations as a brief without certification or invented savings", () => {
    const brief = buildContractorBrief(DecisionCaseSchema.parse(sample));
    expect(brief).toContain("Drips only when draining");
    expect(brief).toContain("not an inspection");
    expect(brief).toContain("Original observations");
    expect(brief).not.toContain("$160");
  });
  it("requires explicit demo activation instead of treating a price or old tier as payment", () => {
    expect(PLUS_ANNUAL_USD).toBe(59);
    expect(PLUS_MONTHLY_USD).toBe(7.99);
    expect(hasPlusAccess({ plusDemo: false })).toBe(false);
    expect(hasPlusAccess({ plusDemo: true })).toBe(true);
  });
});
afterEach(() => vi.unstubAllGlobals());
it("keeps saved cases and demo access isolated from the personal home", async () => {
  vi.resetModules();
  const values = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
      removeItem: (k: string) => values.delete(k),
    },
    addEventListener: () => {},
  });
  const store = await import("@/lib/homeClientStore");
  expect(typeof store.saveDecisionCase).toBe("function");
  expect(store.saveDecisionCase(DecisionCaseSchema.parse(sample)).ok).toBe(
    false,
  );
  store.activateDemoPlus();
  expect(store.saveDecisionCase(DecisionCaseSchema.parse(sample)).ok).toBe(
    true,
  );
  store.resetDemoHome();
  expect(
    store.saveDecisionCase(DecisionCaseSchema.parse({ ...sample, id: "demo" }))
      .ok,
  ).toBe(true);
  const personal = JSON.parse(store.getExportData());
  expect(personal.decisionCases.map((c: { id: string }) => c.id)).toEqual([
    "case-a",
  ]);
  store.switchToPersonalHome();
  store.disableDemoPlus();
  expect(JSON.parse(store.getExportData()).decisionCases).toHaveLength(1);
  expect(JSON.parse(store.getExportData()).plusDemo).toBe(false);
});
