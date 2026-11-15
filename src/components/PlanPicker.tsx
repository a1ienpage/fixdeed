"use client";
import {
  getPlanSummary,
  PLUS_ANNUAL_USD,
  PLUS_MONTHLY_USD,
  type BillingPeriod,
} from "@/lib/plans";
export function PlanPicker({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
}) {
  const annual = getPlanSummary("annual");
  return (
    <fieldset className="plan-picker">
      <legend>Choose your billing period</legend>
      <div className="billing-options">
        <button
          type="button"
          className={`billing-option ${value === "annual" ? "selected" : ""}`}
          aria-pressed={value === "annual"}
          onClick={() => onChange("annual")}
        >
          <span className="billing-label">
            Annual{" "}
            <span className="saving-label">
              Save {annual.annualSavingPercent.toFixed(0)}%
            </span>
          </span>
          <strong>
            ${PLUS_ANNUAL_USD.toFixed(2)}
            <small> / year</small>
          </strong>
          <span>
            ${annual.annualMonthlyEquivalent.toFixed(2)}/month equivalent.
            Billed annually.
          </span>
        </button>
        <button
          type="button"
          className={`billing-option ${value === "monthly" ? "selected" : ""}`}
          aria-pressed={value === "monthly"}
          onClick={() => onChange("monthly")}
        >
          <span className="billing-label">Monthly</span>
          <strong>
            ${PLUS_MONTHLY_USD.toFixed(2)}
            <small> / month</small>
          </strong>
          <span>One month at a time.</span>
        </button>
      </div>
      <p className="small muted mt-20">
        Annual billing saves ${annual.annualSaving.toFixed(2)} (
        {annual.annualSavingPercent.toFixed(2)}%) compared with 12 monthly
        payments. One home, for your household.
      </p>
    </fieldset>
  );
}
