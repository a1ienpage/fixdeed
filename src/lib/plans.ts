export const PLUS_ANNUAL_USD = 59;
export const PLUS_MONTHLY_USD = 7.99;
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
