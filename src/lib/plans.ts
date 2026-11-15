import pricing from "@/content/pricing.json";
export const PLUS_ANNUAL_USD = pricing.annualCents / 100;
export const PLUS_MONTHLY_USD = pricing.monthlyCents / 100;
export type BillingPeriod = "annual" | "monthly";
export function getPlanSummary(billing: BillingPeriod) {
  const savingCents = pricing.monthlyCents * 12 - pricing.annualCents;
  return {
    price: billing === "annual" ? PLUS_ANNUAL_USD : PLUS_MONTHLY_USD,
    period: billing === "annual" ? "year" : "month",
    annualSaving: savingCents / 100,
    annualSavingPercent: savingCents / (pricing.monthlyCents * 12) * 100,
    annualMonthlyEquivalent: PLUS_ANNUAL_USD / 12,
  };
}
export const PLUS_FEATURES = [
  "Saved repair decision cases",
  "Side-by-side contractor quote notes",
  "Downloadable contractor briefs",
  "Recurring maintenance calendar with reminders",
];
/** An explicit demo entitlement, never evidence of a payment. */
export function hasPlusAccess(state: { plusDemo?: boolean }): boolean {
  return state.plusDemo === true;
}
