# Fixdeed — Your home. Handled.

English browser-based home-care MVP for first-time US homeowners. Built with Next.js 16.4.6, React 19 and TypeScript.

## Run locally

```sh
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open http://127.0.0.1:3000. No API key is needed. Keep existing local environment files private; this MVP does not read a model key or call an external AI provider.

## Working flows

- `/`: explanatory landing page, interactive home illustration, feature walkthrough and illustrative cost calculator.
- `/fix`: guided questions, conservative symptom triage, emergency/professional stops, unknown-case clarification and contextual lessons. Partial observations can trigger a stop immediately. Changed input cancels and revokes older responses.
- `/my-home`: profile, actual self-reported repair ledger, current maintenance coverage, practiced skills, sample-home switch, JSON export and verified browser-data clearing.
- `/prevent`: due/upcoming/overdue tasks, calendar view, filters, completion and next-due calculation with calendar-month recurrence.
- `/guides`: 12 searchable practical lessons, component diagrams, fixture-specific first-instinct questions and different transfer scenarios. Learning never creates repair or money records.
- `/assistant`: contextual guided responses with a safety floor retained through follow-up questions. Conversation resets on reload or explicit new conversation.
- `/privacy` and `/safety`: plain-language limits, data handling and official emergency-reference links.

## Honest boundaries

This is guided, deterministic triage. It does not process photographs, provide professional inspections, generate repair procedures with an AI model, certify skills, take payments or synchronize households. The UI states these limits. Equipment-specific work may require the manufacturer's instructions or a qualified professional.

A fresh personal home starts with zero repairs, skills and avoided cost. Sample data uses a separate storage namespace. A confirmed repair requires an entered quote, actual expenses and a completion confirmation; duplicate submissions of that confirmation are rejected. Amounts are self-reported quote-minus-spend, not independently verified savings. Maintenance coverage is the share of currently unexpired completions, not a physical home-health score.

Profile/ledger/checklist/skill records are browser-local and not encrypted. Requests send only observations, selected answers and build-year/era context; the assistant also sends recent conversation and safety status. Saved home names, private notes, inventory and ledger are excluded. Browser/device access remains the user's responsibility. Export is available before data clearing; failures do not claim successful deletion.

## Checks

```sh
npm test
npx tsc --noEmit --incremental false
npm run build
```

To build without touching a running dev server's cache:

```sh
FIXDEED_BUILD_DIR=.next-build NEXT_TELEMETRY_DISABLED=1 npm run build
FIXDEED_BUILD_DIR=.next-build npm run start -- --hostname 127.0.0.1 --port 3002
```

Production fonts are system fonts; a build does not need Google Fonts. Turbopack may require permission to create a local worker port in restricted environments.

Regression coverage includes ordinary emergency phrasing, conflicting presets, model-output authority, assistant history/floor, unknown inputs, request bounds, confirmed-cost calculations, idempotence, personal/demo isolation and corruption, storage failure/deletion, month-end and leap-year recurrence, expired cycles, distinct skill assessments, delayed-response invalidation and minimal outbound context.
