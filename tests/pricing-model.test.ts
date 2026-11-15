import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";

describe("household subscription economics", () => {
  it("keeps full annual billing, savings and the cohort bridge consistent", () => {
    const model = JSON.parse(
      execFileSync(process.execPath, ["scripts/economics.mjs"], {
        encoding: "utf8",
      }),
    );
    expect(model.inputs.annualPrice).toBe(139.99);
    expect(model.pricing.twelveMonthlyPayments).toBe(179.88);
    expect(model.pricing.annualSaving).toBe(39.89);
    expect(model.pricing.annualSavingPercent).toBe(22.18);
    expect(model.annual.contribution).toBe(106.25);
    expect(model.monthly.contribution).toBe(11.65);
    expect(model.acquisition.blendedCac).toBe(34.5);
    expect(model.monthly.expectedPaidMonths24).toBeCloseTo(4.9048, 4);
    expect(model.blended.contribution24Months).toBe(108.92);
    expect(model.blended.cohortPaybackMonths).toBeCloseTo(4.2, 1);
    expect(model.scale.arrAt715000AnnualHomes).toBe(100092850);
  });
  it("does not apply later monthly renewal to customers who never renew once", async () => {
    const { calculateModel } = await import("../scripts/economics.mjs");
    const model = calculateModel({ firstMonthlyRenewal: 0 });
    expect(model.monthly.expectedPaidMonths24).toBe(1);
    expect(model.monthly.contribution24Months).toBe(11.65);
  });
  it("caps annual and monthly contribution at 24 months without an infinite lifetime", async () => {
    const { calculateModel } = await import("../scripts/economics.mjs");
    const model = calculateModel({
      firstMonthlyRenewal: 1,
      laterMonthlyRenewal: 1,
      annualRenewal: 1,
    });
    expect(model.monthly.expectedPaidMonths24).toBe(24);
    expect(model.annual.contribution24Months).toBe(212.5);
    expect(model.monthly.contribution24Months).toBe(279.62);
  });
});
