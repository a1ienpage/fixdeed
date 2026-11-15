# Zimran submission compliance check

Reviewed 15 November 2026 against all 150 FAQ entries and the five original slides in the supplied English casebook. This is the team's preparation checklist, not a certification by the organizers. The casebook's company-profile section is background, not additional contest rules.

## Captain's submission

The captain submits **one team entry** through the submission link sent by the organizers by email (FAQ82):

1. English PDF deck, **at most 10 slides total**, including title and any appendix (FAQ8,53,75,81,109).
2. Production URL: **https://fixdeed.vercel.app**.
3. Public GitHub source: **https://github.com/a1ienpage/fixdeed**.

The supplied deadline is **12:00, 15 November 2026**. Resubmissions before the deadline are allowed; the latest version is reviewed. The supplied materials do not specify a timezone. Missing any of the three items makes the submission incomplete. No pull request, custom domain, separate demo video, license or CI system is required (FAQ23,61,104,111,145).

Put the short English access note below into the form's optional notes field, if it has one. If there is no notes field, the same instructions are already in the linked repository README/JUDGING.md and on checkout. Add product/repository links and a short test-mode note to an existing deck slide without exceeding the 10-slide limit.

> No signup or real payment is required. Start at https://fixdeed.vercel.app/start. Stripe Sandbox checkout: select Card; use 4242 4242 4242 4242, expiry 12/34, CVC 123 and reviewer@example.com. Return to Fixdeed to activate Plus test access and view your saved decision. Full instructions: https://github.com/a1ienpage/fixdeed/blob/main/JUDGING.md

## Mandatory product conditions

| Requirement | Fixdeed / remaining action | FAQ |
|---|---|---|
| B2C: individuals pay | Household subscription; no employer/company payer | 2,18,38,42,83 |
| US adults aged25-45 | US first-time homeowners; English product and USD pricing. Keep this audience explicit in the deck | 6,13,29,43,75 |
| One main track, one user and pain | Money: managing uncertain home-repair decisions and costs. Lessons support that outcome | 4,10,62,80,101 |
| Browser product, no installation | Deployed Next.js website, responsive pages | 1,18,40,60,87 |
| Full flow without login or real money | Guest home, free result, Stripe Sandbox and separate sample home | 20,35,51,54,55,65,95,115,119,130,137,139 |
| Input-dependent core | Guided checks use descriptions, explicit answers and confirmed home context; no external AI is claimed | 3,25,32,36,66,69,84,96,127,134,136 |
| Public complete source matching deployment | Normal commits to main, automatic Vercel production deployment; secret is server configuration, not source | 22,28,46,48 |
| Secrets/data hygiene | No credential values in tracked source; blank .env.example only; home records stay in the browser; fictitious test data for Stripe | 26,46,48,138,150 |
| Availability | Keep Vercel and the sandbox key operational at least through the end of the final on Nov15 | 47,70,73,103 |
| Created during hackathon | Captain must confirm actual creation timing. Existing commit history is retained; it does not independently prove every development action | 64,93,98 |
| Legal topic | Home-care education; no adult content, real-money gambling or medical-treatment claim | 5,110,113,138,150 |

Anonymous/local storage, third-party APIs, AI coding tools, open-source libraries and clearly labeled sample inputs are allowed. AI, encryption, real sales and interviews are not mandatory (FAQ23,25,26,35,48,49,63,66,74,89,90,120,128,131,132,135,149).

## Evaluation and what the deck must still communicate

| Criterion | Weight | Evidence / message |
|---|---:|---|
| Does it work? | 40% | Live journey, actual free result, test checkout, saved case, quote notes and calendar export. Tests support, but do not replace, the working product |
| What do we sell? | 20% | Explicit Plus features and prices; saved decisions and repeat maintenance create an observable return mechanism |
| Who do we sell to? | 15% | One specific US homeowner segment and a reasoned concrete pain; real interviews strengthen this, but none are claimed |
| Why does it make money? | 15% | Price, channel CAC reasoning, retention, finite 24-month contribution LTV and a justified path toward $100M ARR. Label every unmeasured assumption |
| Is it new? | 10% | Explain the audience/mechanism/value difference from real alternatives; a new acquisition channel alone is insufficient |

Retention means reasons to renew, not mandatory daily usage (FAQ30,72,100,108,148). Show price, CAC, retention and LTV with sources or transparent reasoning; a full business plan/TAM study is not mandatory (FAQ33,49,58,81,120,142-144). Stripe test payments strengthen the product demonstration and **do not prove customer demand** (FAQ55,91,102,118).

Pitch format: **5 minutes plus 2 minutes Q&A**, in English, Russian or Kazakh. Deck and product UI are English. Use screenshots of key screens in the PDF; video/animation is not a substitute for the product link. The FAQ schedules review after12:00, Top10 announcement at15:00 and finalist pitches at16:30 in Green Hall; verify any organizer updates separately (FAQ45,70,75-77,121).

## Outstanding captain checks

- [ ] Attach the final English PDF and confirm it has at most10 pages/slides.
- [ ] State Money, the US25-45 homeowner segment, actual paid features, renewal logic and differentiated value in the deck.
- [ ] Match the deck's prices and assumptions to the current [financial model](financial-model.md); do not claim family cloud sharing, certified diagnosis, paying customers or measured retention.
- [ ] Confirm the team membership and product creation timing.
- [ ] Submit all three items through the organizer's emailed form before the deadline and retain its confirmation.
- [ ] Keep the public product, repository and test API operational through judging/final.
