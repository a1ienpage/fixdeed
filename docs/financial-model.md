# Fixdeed financial model: team planning assumptions

Updated 15 November 2026. This is a planning model, not evidence of product-market fit. Acquisition, usage, refunds and renewal must be validated with real paying households. No traction or guaranteed saving is claimed. Run `node scripts/economics.mjs`; its output is saved in `docs/economics-model.json`. UI and model read the same `src/content/pricing.json`.

## Price and annual contribution

Proposed price: **$14.99/month or $139.99/year**, per home for its household. Twelve monthly payments total $179.88, so annual billing saves **$39.89 / 22.18%**. Annual price is billed upfront. The current MVP keeps access and records in one browser, with no separate family accounts or cross-device sharing. Family access is a planned commercial entitlement, not a claim that cloud sharing exists now.

`Annual contribution = $139.99 × (1 − 4% − 3.6%) − $0.30 − ($1.90 × 12) = $106.25076`

| Annual bridge, one paid home / 12 months | USD |
|---|---:|
| Subscription revenue | 139.99 |
| Refund allowance, 4% | −5.60 |
| Payment/Billing fees, 3.6% + $0.30 | −5.34 |
| Service cost, $1.90 × 12 | −22.80 |
| Contribution before acquisition, fixed costs and tax | **106.25** |

Line items round independently. The model conservatively retains processing fees on refunds. Contribution is not operating profit. Upfront annual cash is recognized across the service period when calculating cohort contribution payback.

## Acquisition budgets

| Channel | Share of new paying households | Target CAC | Team budget reasoning |
|---|---:|---:|---|
| Creators | 50% | $40 | $25 acquisition bounty + $15 creative/outreach operations |
| Content | 30% | $35 | $1,050 content/distribution budget ÷ 30 assumed paying homes |
| Referrals | 20% | $20 | $15 total referral rewards + $5 operations |

`Blended CAC = 50% × $40 + 30% × $35 + 20% × $20 = $34.50`

This mix describes new paying households, not advertising spend. All figures are proposed test budgets, not externally validated acquisition benchmarks. Paid search is excluded. Track creator fees, content review, distribution and the value of founder acquisition time, then replace assumptions with actual attributed cohort data.

## Costs

| Modeled service per paid home-month | USD |
|---|---:|
| AI allowance | 0.50 |
| Hosting, storage and email | 0.25 |
| Content/data delivery | 0.15 |
| Customer support | 0.75 |
| Allocated free-tier usage | 0.25 |
| Total | **1.90** |

The MVP currently uses guided rules, not external AI. AI/email budgets are future operating allowances, not an assertion that those integrations exist. No expert visits or unlimited human consultations are included.

Fees assume US domestic cards: Stripe Payments 2.9% + $0.30 and Billing 0.7%. See [Payments](https://stripe.com/pricing) and [Billing](https://stripe.com/billing/pricing). Actual fees depend on merchant location, payment method, cross-border activity and other terms. US fee assumptions do not establish eligibility for a live Stripe account. Test-mode payments move no real money.

Fixed monthly planning budget: $5,000 product/engineering including founder compensation, $1,500 expert content review, $500 tooling/security, $1,000 legal/accounting/insurance. **Total $8,000/month.** This is an illustrative early-stage allowance, not a cost forecast at scale. Tax is excluded.

## Contribution LTV, capped at 24 months

New-payer plan mix: 60% annual, 40% monthly. First monthly renewal 60%, then conditional monthly renewal 85%. Annual renewal 35%. These are unvalidated assumptions.

`Monthly contribution = $14.99 × 92.4% − $0.30 − $1.90 = $11.65076`

`Expected paid months = 1 + 0.60 × (1 − 0.85^23) ÷ (1 − 0.85) = 4.9048`

| 24-month cohort metric | USD |
|---|---:|
| Monthly-plan contribution LTV | 57.14 |
| Annual-plan contribution LTV: $106.25076 × 1.35 | 143.44 |
| Blended contribution LTV: 40% monthly + 60% annual | **108.92**, approximately **109** |
| Blended contribution LTV / $34.50 CAC | **3.16×**, approximately **3.2×** |

There is no infinite-horizon extrapolation or discounting. LTV excludes CAC and fixed costs. The annual first-year contribution and mixed-plan 24-month LTV use different populations and periods. A new-payer plan mix is not the same as the active subscriber mix after churn.

## Payback and scale

The script accumulates monthly cohort contribution, applies the separate first/subsequent monthly renewal assumptions, and spreads annual contribution over its service year. It linearly interpolates the crossing month: **approximately 4.2 months**. This is cohort contribution payback, not upfront cash payback. At $50 CAC with unchanged LTV, LTV/CAC is **2.18×**, about **2.2×**.

`715,000 active annual subscriptions × $139.99 = $100,092,850 ARR`

This is a required-scale scenario, not revenue guidance, market size or evidence of willingness to pay. A mixed monthly/annual active base requires different arithmetic. Real acquisition costs, renewal, refunds, usage and operational costs must replace these assumptions before scaling.
