# Jury access: Fixdeed

**Team:** extra moggers. **Track:** Money. **User:** US first-time homeowners aged 25-45.

- **Live product:** https://fixdeed.vercel.app
- **Guided starting point:** https://fixdeed.vercel.app/start
- **Source:** https://github.com/a1ienpage/fixdeed
- No Fixdeed account, login, installation or real payment is required.

## Complete the product and test checkout

1. Open **Build my home plan**. Select your home type and **Understand a problem**.
2. Enter your observations and answer the relevant questions. For an easy example, choose **My washing machine isn't draining**, then **Kinked/pinched hose behind machine (no electrical burning smell)**. The result runs through the same guided rules as entered observations. An unsafe or unsupported issue can stop the flow or ask for more detail.
3. Read your free result, then choose **Continue to checkout**. Prices are **$14.99/month** or **$139.99/year** for one home.
4. Acknowledge test mode and open Stripe Checkout. Select **Card** if multiple methods are shown. Use only these fictitious test details:

| Stripe field | Test value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | `12/34`, or any future expiry |
| CVC | `123` |
| Email | `reviewer@example.com` |
| Cardholder name | `Fixdeed Test Judge` |
| Country / postal code, if required | Any valid test selection/value; e.g. United States / `10001` |

5. Complete the **test subscription**. On return, Fixdeed's server verifies the paid test session with Stripe before enabling local Plus test access.
6. Open **Decision cases**. Your original observations and chosen answers are attached to the saved decision. Add quote scope notes and download a contractor brief. Under **Maintenance**, export recurring tasks to a calendar file with alarms.

**No real money is charged.** Do not enter real card or personal details. The public test-card number is a test fixture, not a secret. No Stripe secret or dashboard access is needed by the jury.

## Other useful checks

- Cancel Stripe using its merchant-return link: Plus stays disabled and the pending preview remains available in the same tab until it expires.
- Enter an urgent hazard such as a gas smell: safety stops stay free and prevent a repair upsell.
- Open an existing Plus workspace: continuing a plan does not start another test subscription.
- To repeat checkout in the same personal browser, use **Plans > Disable test access in this browser**. It preserves records and does not cancel the separate Stripe sandbox subscription.
- **Plans > Open sample home** provides clearly marked illustrative records without checkout. Return to your personal home before testing your own purchase; the two data sets are separate.
- **Learn** provides first-response practice, an explanation and a different scenario. **My home** provides free JSON export and explicit deletion controls.

## Scope and evidence

Records and test access are local to this browser. No family accounts, cloud sync, live expert visits or production billing lifecycle are implemented. Calendar files require manual import; external calendar apps control reminder delivery.

This is guided rule-based triage, not live AI, image analysis or a professional inspection. Test payments are engineering evidence, not paying-user traction or proof of willingness to pay. Pricing, acquisition costs, retention and economics remain hypotheses.

[Observed QA and limitations](docs/QA.md) · [Research and sources](docs/business-research.md) · [Financial model](docs/financial-model.md)
