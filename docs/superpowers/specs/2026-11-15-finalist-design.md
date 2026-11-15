# Fixdeed competition upgrade

> Historical implementation record. Current pricing and Stripe Sandbox purchase behavior are specified in `2026-11-15-price-funnel-design.md` / `2026-11-15-price-funnel.md` and documented in the README.

## Intent and authorization
The user asked to implement the audit fixes, develop the paid value/business model, prepare a Zimran presentation, and delegated additions/improvements. Preserve the existing Next.js/React application and its visual language. Build a concrete candidate for review; do not invent traction or promise a competition placing. Implementation choices below are builder decisions under that authorization, not claims of individually approved requirements.

## Product focus
Money track. US consumers aged 25–45 who own their first home, initially during their first two years of ownership. Core job: turn an unfamiliar symptom into a bounded next decision, then carry the observations, quotes and maintenance work forward. No professional inspection, safety certification, medical/legal guidance, external AI diagnosis or automated contractor contacting.

## Approaches
1. Broader generative diagnosis would increase provider costs and safety validation requirements while leaving payment value unclear.
2. A focused decision workspace extends the functioning guided checks with a persistent case, comparable quotes, a contractor brief and calendar reminders. Selected builder approach: directly addresses the audit, works without external credentials and supports a demonstrable paid boundary.
3. A marketplace depends on contractor supply and changes the execution scope substantially. Deferred.

## Subproject A: diagnostic reliability
Before regex safety scanning, suppress only explicit, local, unambiguous negations of reported hazards. Preserve mixed positive hazards, uncertainty, resolved/past incidents requiring assessment, and the assistant's existing safety floor. Never globally strip a sentence because it contains "no". Handle phrases such as "no smoke and no fire", "no gas smell", and "smoke detector is not going off" conservatively. Active smoke, fire, gas smells, wet electricity and uncertain observations keep stops.

Extract supported structured answers from explicit user observations for assistant turns. Selected structured answers are authoritative unless contradicted by higher-risk text. Return detected preset and answer context, so the conversation shows progress and a meaningful route into the guided flow. A wall shutoff valve is part of sink context, not a second wall issue. Unsupported symptoms retain clarification rather than invented repairs.

## Subproject B: paid decision workspace
Retain all triage, emergency guidance, core lessons, personal-data export and data deletion for free. Never gate safety.

Fixdeed Plus proposed price: $59/year or $7.99/month. This is a pricing hypothesis, not measured willingness to pay. Add a working plans/paywall and clearly labeled simulated checkout. No card entry, billing, automatic renewal or claim of Stripe integration. Activating demo Plus changes only the active browser home's demo entitlement and is clearly disclosed wherever premium features are used. The normal free experience and optional sample home remain usable without login.

Premium tools implemented now:
- Save a diagnostic case with original observations, current bounded result, answers and a personal note. Keep updates explicit; an old result may not be passed off as applying to changed observations. Maximum 100 saved cases per browser home; no silent data truncation.
- Add up to 5 contractor quotes per case, with quoted scope, amount, exclusions and warranty note. Show arithmetic comparison and missing scope fields, never automatically call the cheapest quote best or infer equivalent scope.
- Download a plain-text contractor brief containing observations, status, result limits, questions, quote notes and user-entered amounts. The brief is not an inspection and is not transmitted to anyone. Export content as text, escaping calendar control characters where relevant.
- Export currently applicable maintenance tasks as recurring all-day iCalendar events with VALARM, stable task UIDs, calendar-month recurrence and clearly stated manual import. No claim of in-app background reminders or automatic calendar sync. Export updates require re-import; existing events in other apps are not modified automatically.

State: add backward-compatible defaulted fields to the existing validated home state, with demo/personal isolation and verified deletion preserved. Premium access remains a demo implementation, not a production entitlement security system. No sensitive home names/notes/quotes leave the browser.

## Subproject C: business and competition artifacts
Official weights: Product & engineering 40%, Value & retention 20%, Problem & user 15%, Business potential 15%, Originality 10%. Pass/fail: B2C, web only, all three submission items. English PDF <=10 total slides, public end-to-end production URL without login/payment, public GitHub source. No mandatory real payment, AI, interviews or automated tests. The user-supplied 34-page casebook is the competition authority.
Create an English PDF of at most 10 total slides, with a coherent five-minute pitch and Russian speaker/Q&A notes. Cover all five criteria, an actual product demonstration using final screens, specific free/paid boundary, competition, acquisition hypotheses, transparent unit economics, reachable initial segment and an explicitly conditional expansion path to $100M ARR. All market and competitor claims get primary sources; all modeled CAC/retention/conversion numbers are clearly labeled assumptions. No fake interviews, revenue, payments, users or fabricated public product/repository URLs.

Economics: model annual and monthly cohorts separately, distinguish revenue from contribution, avoid double-counting annual churn as monthly churn, disclose assumptions/costs and downside sensitivity. A small initial segment cannot be represented as a standalone $100M ARR market.

## Implementation and delivery
Use isolated workspace under this chat, preserve original source as a backup, then update the user-authorized Desktop project with verified changes. No new runtime dependencies required. Production build uses supported webpack compilation to avoid Turbopack's external symlink limitation in isolated QA. Real public publishing is a final external action after the complete code and deck are reviewable; prepare deployment instructions and a source archive meanwhile. Do not expose .env files or invent historical commits.

## Acceptance
Regression cases for negation/mixed hazards, assistant answer progression, case persistence/isolation, quote validation/comparison, paywall access, ICS recurrence/escaping. Full original suite, TypeScript and production build pass. Browser verification of free triage, simulated checkout, saved case, quote comparison, downloads, maintenance and skill separation on desktop/mobile. Review by an independent agent before handoff. Render and inspect every presentation page.
