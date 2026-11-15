// Team planning assumptions. Not measured acquisition, retention or product-market fit.
import { pathToFileURL } from "node:url";
import pricing from "../src/content/pricing.json" with { type: "json" };
export function calculateModel(overrides = {}) {
  const inputs = {
    annualPrice: pricing.annualCents / 100,
    monthlyPrice: pricing.monthlyCents / 100,
    paymentPercent: 0.036,
    paymentFixed: 0.3,
    refundReserve: 0.04,
    monthlyAi: 0.5,
    monthlyHostingEmail: 0.25,
    monthlyContent: 0.15,
    monthlySupport: 0.75,
    monthlyFreeTier: 0.25,
    annualPayerMix: 0.6,
    firstMonthlyRenewal: 0.6,
    laterMonthlyRenewal: 0.85,
    annualRenewal: 0.35,
    ...overrides,
  };
  const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  const service =
    inputs.monthlyAi +
    inputs.monthlyHostingEmail +
    inputs.monthlyContent +
    inputs.monthlySupport +
    inputs.monthlyFreeTier;
  const contribution = (price, months) =>
    price * (1 - inputs.refundReserve - inputs.paymentPercent) -
    inputs.paymentFixed -
    months * service;
  const annual = contribution(inputs.annualPrice, 12),
    monthly = contribution(inputs.monthlyPrice, 1);
  const channels = [
    {
      channel: "Creators",
      payerMix: 0.5,
      targetCac: 40,
      reasoning: "$25 bounty + $15 creative/outreach operations",
    },
    {
      channel: "Content",
      payerMix: 0.3,
      targetCac: 35,
      reasoning: "$1,050 budget / 30 assumed new paying homes",
    },
    {
      channel: "Referrals",
      payerMix: 0.2,
      targetCac: 20,
      reasoning: "$15 total rewards + $5 operations",
    },
  ];
  const cac = channels.reduce((sum, c) => sum + c.payerMix * c.targetCac, 0);
  const monthlySurvival = (month) =>
    month === 1
      ? 1
      : inputs.firstMonthlyRenewal * inputs.laterMonthlyRenewal ** (month - 2);
  const paidMonths = Array.from({ length: 24 }, (_, i) =>
    monthlySurvival(i + 1),
  ).reduce((a, b) => a + b, 0);
  const annual24 = annual * (1 + inputs.annualRenewal),
    monthly24 = monthly * paidMonths;
  const blended24 =
    inputs.annualPayerMix * annual24 + (1 - inputs.annualPayerMix) * monthly24;
  let cumulative = 0,
    payback = null;
  const cohort = Array.from({ length: 24 }, (_, i) => {
    const month = i + 1;
    const value =
      ((inputs.annualPayerMix * annual) / 12) *
        (month <= 12 ? 1 : inputs.annualRenewal) +
      (1 - inputs.annualPayerMix) * monthly * monthlySurvival(month);
    if (payback === null && value > 0 && cumulative + value >= cac)
      payback = i + (cac - cumulative) / value;
    cumulative += value;
    return {
      month,
      contribution: round(value),
      cumulativeContribution: round(cumulative),
    };
  });
  return {
    label:
      "Planning model. No product-market fit, traction, payments, CAC or retention is claimed.",
    inputs,
    pricing: {
      twelveMonthlyPayments: round(inputs.monthlyPrice * 12),
      annualSaving: round(inputs.monthlyPrice * 12 - inputs.annualPrice),
      annualSavingPercent: round(
        (1 - inputs.annualPrice / (inputs.monthlyPrice * 12)) * 100,
      ),
    },
    costs: {
      monthlyServicePerPaidHome: round(service),
      fixedMonthlyBudget: 8000,
      fixedBreakdown: {
        productEngineeringAndFounder: 5000,
        expertContentReview: 1500,
        toolingSecurity: 500,
        legalAccountingInsurance: 1000,
      },
    },
    annual: {
      contribution: round(annual),
      contributionRaw: annual,
      contributionMarginPct: round((annual / inputs.annualPrice) * 100),
      paymentFees: round(
        inputs.annualPrice * inputs.paymentPercent + inputs.paymentFixed,
      ),
      refundReserve: round(inputs.annualPrice * inputs.refundReserve),
      serviceCosts: round(service * 12),
      contribution24Months: round(annual24),
    },
    monthly: {
      contribution: round(monthly),
      contributionRaw: monthly,
      expectedPaidMonths24: Math.round(paidMonths * 10000) / 10000,
      contribution24Months: round(monthly24),
    },
    acquisition: {
      channels,
      blendedCac: round(cac),
      mixDefinition:
        "Share of new paying households, not share of spend. Test budgets, not benchmarks. Paid search excluded.",
    },
    blended: {
      contribution24Months: round(blended24),
      contributionToCac: round(blended24 / cac),
      cohortPaybackMonths: payback === null ? null : round(payback),
      cohort,
    },
    sensitivity: { cac: 50, contributionToCac: round(blended24 / 50) },
    scale: {
      annualPayersFor100MARR: Math.ceil(100_000_000 / inputs.annualPrice),
      arrAt715000AnnualHomes: round(715000 * inputs.annualPrice),
      warning:
        "Required scale, not forecast, market size or willingness to pay. A mixed subscriber base has different arithmetic.",
    },
    exclusions:
      "Before CAC, fixed costs and tax. No expert visits or unlimited human consultations. Annual contribution recognized across service period for payback. 24-month cap, no infinite horizon or discounting. US card fee assumptions do not establish Stripe account eligibility.",
  };
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url)
  console.log(JSON.stringify(calculateModel(), null, 2));
