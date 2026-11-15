# Pricing and purchase journey

User requests app/GitHub/Vercel changes, not presentation work. Replace proposed prices with $14.99/month and $139.99/year for one home. Carry the supplied financial assumptions into reproducible economics and repository documentation, clearly hypothetical.

Keep the existing Next.js/React stack. A primary /start journey asks home type, priority, then relevant observations/equipment. It shows an actual bounded triage result or tailored maintenance preview before offering a plan. Checkout is a separate /checkout page with annual/monthly choice, full-period price, annual savings and clear completion state. Free checks and safety exits remain available throughout. An emergency never becomes an upsell. Unknown problems get questions, never an invented personalized diagnosis. Existing upgrade entry points lead to the same checkout, preserving a pending decision where relevant.

Decision descriptions/results stay in memory until checkout, then use tab-local session storage for the external redirect, valid for 30 minutes. They are scoped to personal/sample home and relevant profile context, never enter URLs or Stripe, and clear on consumption/context change/deletion. The user selected Stripe Sandbox instead of manual activation and authorized transferring the existing test key to Vercel Production. The server selects prices and verifies a paid test subscription with an attempt-specific HttpOnly cookie before granting browser-local test access. Live keys are refused; real payments, accounts and webhook lifecycle fulfillment are outside scope.

One subscription is for a household, not per person. Current demo remains one browser, with no separate family accounts or cross-device sharing. Do not advertise those capabilities as implemented.

Approach: dedicated journey + shared checkout best fits the requested progressive conversion. Retaining only a modal cannot meet the requested final page. Replacing free troubleshooting with a forced purchase would break the safety/free boundary and existing review flow.

Preserve original data, separate demo/personal state, guard late responses, handle invalid plan query and double completion. Test real economics, handoff expiration/scope/safety, then inspect desktop/mobile end to end. Review branch once before publishing, fix material findings, push main normally and verify Vercel.
