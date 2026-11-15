# Verification — 15 November 2026

**168 Vitest tests across 14 files pass.** The submission-cleanup pass reran the suite, TypeScript and production build; removed unused Google GenAI dependencies without changing remaining package versions; and added an English-locale checkout regression. TypeScript and the webpack production build pass. Tests include the original 103-test baseline, earlier safety/context fixes, finite-cohort financial arithmetic, purchase handoff isolation/deletion/size boundaries and server-side Stripe verification. Passing finite tests is not professional safety validation.

## Observed in the browser

- The four-stage journey asks for home type, priority and issue details/equipment, then shows a real guided result or maintenance preview before checkout.
- A typed gas-smell observation remains present after a problem preset is selected. The emergency stop prevents the offer/checkout path.
- Washer → visible kinked hose (with the app's negated electrical-smell label) reaches the bounded free result and checkout normally.
- Editing answers after a saved preview invalidates the pending handoff. Reload no longer resurrects an old diagnosis. This was reproduced before the fix and repeated successfully afterward.
- Checkout shows $14.99/month or the full $139.99/year, $39.89/22.18% annual savings and no real money charged. The pending result survives the external redirect/reload through bounded tab storage.
- Mobile journey and checkout were inspected at 390px. The first-step cards, navigation, plan choices and submit controls remain usable.
- An already-active Plus home opens its selected maintenance plan without creating another subscription. The selected home type/equipment are retained.
- A fabricated success URL is rejected and presents a retry for that receipt. It does not activate Plus.
- The earlier assistant handoff, sample/personal separation, synthetic quote comparison, contractor brief and recurring calendar export remain covered by regressions and prior browser checks.

## Public Stripe Sandbox check

On https://fixdeed.vercel.app, unauthenticated on 15 November 2026:

1. Completed the guided washer flow with explicit synthetic observations.
2. Opened the real Stripe-hosted test Checkout at **$14.99/month**. Returning via the merchant cancel link kept the preview and left Plus disabled.
3. Selected annual billing and opened Stripe at **$139.99/year** (full annual amount; $11.67 monthly equivalent).
4. Completed Checkout with Stripe's standard `4242 4242 4242 4242` test card, future expiry, fictitious name and `reviewer@example.com`; no real card details or real funds were used.
5. Returned to Fixdeed. The app displayed **STRIPE TEST PAYMENT VERIFIED**, the annual price, no real charge and successful case saving.
6. Opened Decision cases and verified the newly saved washer case retained the original typed observations and the full selected clarifying answer in the personal home. The existing case remained present.

The initial live integration attempt revealed the sandbox's API `2026-10-28.endive` rejects the old `payment_method_types` parameter. The error was inspected in Stripe Workbench, the integration migrated to Dashboard-managed dynamic methods, the API version was pinned, a regression assertion was added and the public checkout then completed successfully. No account API-version setting was changed.

Server tests also verify rejected live credentials, untrusted origins, modified/expired binding cookies, unpaid/incomplete subscriptions, wrong amounts/nonces and independent cookies for concurrent HTTP checkout requests. Only Stripe-confirmed paid, complete test subscriptions with the expected amount and home scope can activate browser-local test access.

## Repository and submission hygiene

The reviewer guide is `JUDGING.md`, linked prominently from the README. The submission checklist maps the supplied rules to implemented behavior and remaining captain actions. Obsolete internal implementation plans and one unreferenced image were removed from the current public tree. Generated builds, dependency folders, local exports and secret files are ignored. A known-credential-pattern scan of the pre-cleanup nine reachable commits (257 text objects) and pending source found no matches; this is not an exhaustive security audit. Actual Stripe credentials remain server environment configuration.

## Remaining limits

- This is **Stripe Sandbox**, not live billing or evidence of paying customers. Plus entitlement and home records remain local to the browser; family accounts and cross-device/cloud sync do not exist.
- Production launch requires account-backed entitlements, verified webhook fulfillment, renewal/cancellation handling and applicable commercial terms. Closing before the verified return does not provision test access. Disabling local test access does not cancel the sandbox subscription.
- The warm-instance creation budget is best-effort, not a distributed rate limit; a public commercial launch needs shared/deployment-level admission control.
- Professional content certification and actual user validation remain outstanding. Calendar alarms depend on the external calendar app after manual import and do not automatically sync.
- Pricing, CAC, retention, operating costs and modeled LTV/payback are planning assumptions, not measured product-market fit.
