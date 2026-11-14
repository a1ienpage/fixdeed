# Fixdeed

Live product: https://fixdeed.vercel.app

Public source: https://github.com/a1ienpage/fixdeed

Home-care decisions for US first-time homeowners aged 25–45. Zimran Business Cup, Money track. Built by **extra moggers**: Aliaskar (captain and coder), Zhamilya (economics and speaker).

## Run

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3000
```

No provider keys, account or external AI service is required. Use Node.js 22 or 24. The production build explicitly uses Next.js webpack compilation.

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
2. After a non-emergency result, choose **Save this decision**. The paywall shows the proposed $59/year or $7.99/month price. Acknowledge the **demonstration checkout** and activate Plus demo. It charges $0, takes no card, creates no subscription and does not integrate with Stripe.
3. Open `/cases`. The original observations and bounded result stay attached to the case. Add up to five quotes with work included, exclusions and warranty. The difference between amounts is arithmetic, not a recommendation or verified saving.
4. Download the contractor brief. It is a local text file; nothing is sent to a contractor.
5. Open `/prevent`. Complete a task to calculate its next due date. Plus exports recurring `.ics` events with reminder alarms for manual calendar import. Re-import after changing completion dates; no automatic sync or in-app background notification service exists.
6. Explore `/guides`. First instinct, explanation and a different situation build a separate practice record. A lesson never creates a repair or money record.
7. `/plans` and `/my-home` offer **Open sample home**. Existing sample cases survive reopening. Sample records and personal records stay separate. Changing the active home invalidates the current triage/chat draft. Personal JSON export and deletion controls remain free.

## Free and proposed paid value

Free: all safety stops, guided checks, explanations, all 12 lessons and practice scenarios, maintenance list/repeat dates, completed repair ledger and personal JSON export/deletion.

Plus demo: saved decision cases/follow-up notes, contractor quote scope comparison, local contractor brief downloads and recurring maintenance calendar exports. This is a testable product/pricing hypothesis, not evidence that anyone has paid. Entitlement is browser-local demonstration state, not production payment security. A production launch needs real billing, entitlement verification and applicable terms before charging.

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

Import this Next.js project into Vercel. If uploaded under a `fixdeed/` directory, set **Root Directory = fixdeed**. Build command: `npm run build`. No environment variables are required. Keep the submitted product available through the end of judging, without registration, payment or deployment-protection prompts. Never upload `.env`, keys, `node_modules` or `.next*` caches.
