# Pricing and Purchase Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Publish the new pricing/model and a progressive home-care journey ending in a separate checkout.
**Architecture:** Existing client state and deterministic triage. A scoped memory handoff connects /start and existing upgrade gates to /checkout. One source of pricing feeds UI and model.
**Tech Stack:** Next.js 16.4.6, React 19, TypeScript, Zod, Vitest.
**Spec:** docs/superpowers/specs/2026-11-15-price-funnel-design.md

## Global Constraints
- $14.99/month, $139.99/year, one home. No invented users, payments or savings.
- Keep free safety/triage/data controls, personal/sample isolation and existing records.
- No presentation changes. Stripe Sandbox only, as explicitly requested; no live billing.
- No cross-device family sharing claim. No private descriptions in URLs/Stripe; short-lived tab storage only for the hosted redirect.

## Review Focus
- Emergency/uncertain descriptions must stop conversion or show questions, never authorize guessed repair.
- Pending results and checkout must invalidate across home/context changes and expiration.
- Annual discount uses twelve monthly payments, while annual checkout shows the full annual bill.
- Double completion/refresh must not duplicate a case or claim real payment.
- Renewal first-month and later-month probabilities must stay separate in the cohort model.

### Task 1: Pricing and reproducible model
Files: src/content/pricing.json, src/lib/plans.ts, scripts/economics.mjs, tests/pricing-model.test.ts, docs/business-research.md, docs/economics-model.json.
Interfaces: getPlanSummary(billing) returns selected period/price/savings; calculateModel(overrides) returns cohort contributions/payback/scale.
- [x] Write behavior tests: annual full price139.99, monthly total179.88, saving39.89, contribution106.25076, monthly11.65076, blended CAC34.50, 24m LTV108.92, payback4.2, first renewal0 yields one paid monthly period.
- [x] Watch failures, implement common pricing + model, pass suite, update finance docs and commit.

### Task 2: Purchase flow and shared checkout
Files: src/lib/purchaseJourney.ts, src/app/start/page.tsx, src/app/checkout/page.tsx, src/components/PlanPicker.tsx, src/components/PlusPaywall.tsx, src/components/SaveCaseAction.tsx, src/app/plans/page.tsx, src/app/page.tsx, src/app/globals.css, tests/purchase-journey.test.ts.
Interfaces: put/get/clearPurchaseJourney scoped memory handoff, buildJourneyCase verified snapshot; getPurchaseScope(state).
- [x] Test expiry, context mismatch, emergency exclusion, mutation isolation and preserved selected observations/case id.
- [x] Watch failures, implement handoff and journey. Provide home/goal/details/preview screens, loading and safe error exits.
- [x] Implement checkout chosen after user answer. Existing modal gates continue to it. Preserve free exits, show exact price/discount, prevent duplicate activation/case creation.
- [x] Inspect browser desktop/mobile, full suite, TypeScript and production build. Fresh whole-branch review and material fixes.
- [ ] Publish normal GitHub push, verify Vercel/hosted Stripe, sync Desktop and source output archive.
