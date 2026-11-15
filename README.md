# Fixdeed

Live product: https://fixdeed.vercel.app

Public source: https://github.com/a1ienpage/fixdeed

**Jury: [start here - access and Stripe test-card instructions](JUDGING.md).** No Fixdeed account or real payment is required. [Submission compliance checklist](docs/submission-checklist.md).

Home-care decisions for US first-time homeowners aged 25–45. Zimran Business Cup, Money track. Built by **extra moggers**: Aliaskar (captain and coder), Zhamilya (economics and speaker).

## Run

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3000
```

No account, provider key or external AI service is required for the core free product. The hosted Stripe Sandbox checkout needs the server-only test key described below. Use Node.js 22 or 24. The production build explicitly uses Next.js webpack compilation.

```sh
npm test
npx tsc --noEmit --incremental false
npm run build
npm run start
```

For a separate cache while a development server runs:

```sh
FIXDEED_BUILD_DIR=.next-build npm run build
FIXDEED_BUILD_DIR=.next-build npm run start -- --port 3002
```

## Jury walkthrough

1. Open `/fix`. Choose a sink issue, select its observations, or enter your own supported description. Higher-risk symptoms override reassuring selections. Unsupported descriptions ask for details.
2. The homepage starts `/start`: select home type, priority and relevant observations/equipment. A real free preview comes before membership. Continue to `/checkout`, choose $139.99/year or $14.99/month, then complete **Stripe Sandbox** checkout using card `4242 4242 4242 4242`, a future expiry, any 3-digit CVC and test email. It moves no real money. Returning to `/checkout/return` verifies the paid test subscription server-side before local Plus access activates. Original decisions survive the external redirect through a bounded tab-local handoff. Existing **Save this decision** upgrades use the same checkout.
3. Open `/cases`. The original observations and bounded result stay attached to the case. Add up to five quotes with work included, exclusions and warranty. The difference between amounts is arithmetic, not a recommendation or verified saving.
4. Download the contractor brief. It is a local text file; nothing is sent to a contractor.
5. Open `/prevent`. Complete a task to calculate its next due date. Plus exports recurring `.ics` events with reminder alarms for manual calendar import. Re-import after changing completion dates; no automatic sync or in-app background notification service exists.
6. Explore `/guides`. First instinct, explanation and a different situation build a separate practice record. A lesson never creates a repair or money record.
7. `/plans` and `/my-home` offer **Open sample home**. Existing sample cases survive reopening. Sample records and personal records stay separate. Changing the active home invalidates the current triage/chat draft. Personal JSON export and deletion controls remain free.

## Free and proposed paid value

Free: all safety stops, guided checks, explanations, all 12 lessons and practice scenarios, maintenance list/repeat dates, completed repair ledger and personal JSON export/deletion.

Plus demo: saved decision cases/follow-up notes, contractor quote scope comparison, local contractor brief downloads and recurring maintenance calendar exports. This is a testable product/pricing hypothesis, not evidence of real payments. Stripe Sandbox verification is real API integration, while Plus entitlement remains browser-local test state. Family accounts and cross-device sharing do not exist in this demo. A commercial launch requires production account/entitlement storage, verified webhook fulfillment, renewal/cancellation handling and applicable terms before charging.

## Honest limits

This is deterministic guided triage and a small curated library, not a professional diagnosis, inspection, safety certification or image analysis. It does not replace manufacturer instructions or qualified service. It cannot establish that a hazard has resolved. No real expert consultations, contractor bookings, household cloud sync or background notifications are included. Conservative language checks can ask for clarification or escalate too broadly; tests are finite and do not certify real-world safety.

A personal home starts with no invented repairs, skills or avoided cost. Repair costs are explicitly self-reported quote minus spend, clipped at zero as avoided cost, not independently verified savings or proof of product impact. Case resolution and quote comparison never add money. Browser-local records are not encrypted or backed up. Export before clearing data or changing devices.

Only observations, selected answers and construction-era context go to the same-origin app server. Saved private home names/notes, cases, quotes, inventory and ledger are excluded. No external AI provider receives requests. A memory-only, one-use assistant handoff expires after five minutes and is scoped to the active home.

## Evidence and economics

- `docs/business-research.md`: primary sources, competitor caveats, market scope and validation experiments checked 15 November 2026.
- `scripts/economics.mjs`: reproducible annual/monthly contribution and retention model. Run `node scripts/economics.mjs`.
- `docs/economics-model.json`: output snapshot, assumptions explicitly labeled.
- `docs/QA.md`: observed checks and remaining limitations.

No real interviews, paying customers, acquisition costs, renewal rates or quantified savings have been claimed. Public research supports the problem and competitive context; it does not validate Fixdeed demand.

## Deployment

Import this Next.js project into Vercel. If uploaded under a `fixdeed/` directory, set **Root Directory = fixdeed**. Build command: `npm run build`. The core free app works without environment variables; Stripe Sandbox checkout requires the server-only test secret described below. Keep the submitted product available through the end of judging, without registration, payment or deployment-protection prompts. Never upload `.env`, keys, `node_modules` or `.next*` caches.

## Stripe Sandbox configuration

Set `STRIPE_SECRET_KEY` to the existing sandbox secret in Vercel environment variables (Production only). Never commit it. Live keys are rejected by code. `APP_BASE_URL` optionally overrides the fixed production origin `https://fixdeed.vercel.app`; use `http://localhost:3000` only for local testing. No publishable key or Price IDs are needed for the hosted redirect: amounts and intervals come from server-owned pricing.

REST requests pin `Stripe-Version: 2026-10-28.endive`, matching the tested sandbox. Checkout explicitly uses English (`locale=en`) for the US audience. Payment methods use Stripe Dashboard dynamic settings; do not re-add the removed `payment_method_types` parameter. See [Stripe dynamic payment methods](https://docs.stripe.com/payments/payment-methods/dynamic-payment-methods).

POST `/api/checkout` validates origin/input, creates an idempotent test subscription session and an attempt-specific signed HttpOnly/SameSite=Lax binding cookie, scoped to its verification path. `/api/checkout/verify/[attemptId]` retrieves Stripe’s session and checks test mode, paid+complete status, active subscription, exact USD amount, plan, browser binding and home-context hash. Query strings alone cannot activate Plus. A best-effort 60/minute warm-instance creation guard limits accidental bursts; it is not distributed enforcement. A public launch needs a deployment-level/shared admission limit. No home observations or equipment are sent to Stripe. Session storage keeps the pending decision only for the external redirect, is valid for 30 minutes and clears when consumed, deleted, or the context changes (expired copies clear on the next visit or tab close).

The sandbox integration deliberately does not implement production webhook-based account fulfillment or a subscription lifecycle database. Closing the flow before the verified return does not provision test access. Canceling or declining does not grant access. The sample home remains a separate, explicitly illustrative reviewer entry.

Updated business assumptions: [financial-model.md](docs/financial-model.md). Annual savings $39.89 /22.18%, blended 24-month contribution $108.92, proposed CAC $34.50, modeled payback4.2 months. These are assumptions, not product-market fit.
