"use client";
import Link from "next/link";
import { PLUS_ANNUAL_USD, PLUS_MONTHLY_USD } from "@/lib/plans";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { HomeIllustration } from "@/components/HomeIllustration";
const FAQ = [
  [
    "What can I actually use Fixdeed for?",
    "Start with a common home problem, answer a few specific questions and get a next step. You can also organize recurring maintenance, explore how components work and keep a record of repairs you have actually completed.",
  ],
  [
    "Will it tell me when to call a professional?",
    "Yes. Recognized warning signs stop the repair flow. Unsupported or uncertain problems get clarifying questions instead of a guessed repair. Fixdeed is educational guidance and cannot inspect your home or guarantee that a situation is safe.",
  ],
  [
    "Does it work for apartments, too?",
    "Yes. Choose an apartment in your home profile and the maintenance list adapts. For shared building systems or changes to a rental, contact your landlord or property manager before starting work.",
  ],
  [
    "How do you calculate money saved?",
    "Only repairs you explicitly log count. Enter a quote you received and what you actually spent. We show the difference as your self-reported avoided cost. Reading a guide or completing a quiz never adds dollars.",
  ],
  [
    "Is there a subscription?",
    `Checks, safety guidance, lessons and your repair ledger are free. Plus adds decision cases, quote scope notes, contractor briefs and recurring calendar export. Proposed pricing is $${PLUS_ANNUAL_USD.toFixed(2)}/year or $${PLUS_MONTHLY_USD.toFixed(2)}/month for one home. This MVP uses Stripe Sandbox checkout with test cards and a test subscription. No real money is charged.`,
  ],
  [
    "Where does my home information go?",
    "Your home record is stored in this browser. Troubleshooting sends your description, selected answers and build-year context to the app server. The assistant also sends recent conversation and safety status. Saved home notes, nickname, inventory and repair history are not included. This MVP does not analyze photos or send requests to an external AI model. You can export or clear your browser data in My home.",
  ],
];
export default function HomePage() {
  const [quote, setQuote] = useState("180");
  const [parts, setParts] = useState("20");
  const difference = Math.max(0, (Number(quote) || 0) - (Number(parts) || 0));
  return (
    <>
      <div className="container">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <span className="tiny-square" />
              FOR THE FIRST HOME YOU CALL YOUR OWN
            </p>
            <h1>
              Your home.
              <br />
              <em>Handled.</em>
            </h1>
            <p className="hero-sub">
              That drip. That noise. That thing you've been putting off.
              <br />
              Know your next step. Keep the details. Stay ahead of upkeep.
            </p>
            <div className="hero-actions">
              <Link href="/start" className="button button-primary">
                Build my home plan
                <Icon name="arrow" size={18} />
              </Link>
              <a href="#how-it-works" className="button button-outline">
                See how it works
              </a>
            </div>
            <p className="hero-note">
              <Icon name="lock" size={12} />
              Free checks · No account or credit card needed
            </p>
            <div className="hero-bottomline">
              <span>
                <Icon name="shield" size={18} />
              </span>
              <p>
                <b>A confident next step starts with a careful check.</b>
                <br />
                Clear limits. Practical explanations. Your call.
              </p>
            </div>
          </div>
          <HomeIllustration />
        </section>
        <div className="utility-strip">
          <div>
            <Icon name="tool" size={24} />
            <div>
              Understand the problem<span>before the toolbox.</span>
            </div>
          </div>
          <div>
            <Icon name="calendar" size={24} />
            <div>
              Stay ahead of upkeep<span>one small task at a time.</span>
            </div>
          </div>
          <div>
            <Icon name="book" size={24} />
            <div>
              Build real know-how<span>with a fresh scenario.</span>
            </div>
          </div>
        </div>
      </div>
      <section className="container decision-home-strip">
        <div>
          <p className="eyebrow">ONE PROBLEM. A CLEARER DECISION.</p>
          <h2>The facts for your next call.</h2>
          <p>
            Save what you noticed. Compare what each quote includes. Take a
            brief to a professional, then keep the next maintenance check in
            your calendar.
          </p>
        </div>
        <Link className="button button-primary" href="/plans">
          Explore Free and Plus <Icon name="arrow" size={18} />
        </Link>
      </section>
      <section className="section container">
        <div className="section-header">
          <div>
            <p className="eyebrow">LESS GUESSWORK. MORE KNOW-HOW.</p>
            <h2>
              A plan for the problem.
              <br />
              And the next one.
            </h2>
          </div>
          <p>
            A few useful tools that work together. So homeownership feels a
            little less like figuring everything out alone.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-panel">
            <span className="feature-number">
              01 / WHEN SOMETHING GOES WRONG
            </span>
            <h3>
              Start with
              <br />
              the right checks.
            </h3>
            <p>
              A few questions help separate a basic check from a job that needs
              professional attention.
            </p>
            <div className="feature-preview">
              <svg
                className="preview-pipes"
                viewBox="0 0 180 120"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M45 10v58a28 28 0 0 0 56 0V48h55"
                  stroke="#b1a3cf"
                  strokeWidth="22"
                />
                <path
                  d="M45 10v58a28 28 0 0 0 56 0V48h55"
                  stroke="#f6f3fc"
                  strokeWidth="15"
                />
                <rect
                  x="30"
                  y="24"
                  width="30"
                  height="14"
                  rx="3"
                  fill="#6747d8"
                />
                <circle cx="107" cy="48" r="16" fill="#d2f66b" />
                <path d="m100 48 5 5 9-10" stroke="#495c25" strokeWidth="2" />
                <path d="M13 29H1m170 19h9M48 103v12" stroke="#aaa0b9" />
              </svg>
            </div>
            <Link className="text-link" href="/fix">
              Troubleshoot a problem
              <Icon name="arrow" size={16} />
            </Link>
          </article>
          <article className="feature-panel violet-panel">
            <span className="feature-number">
              02 / BEFORE IT BECOMES A PROBLEM
            </span>
            <h3>
              Small upkeep.
              <br />
              Right on time.
            </h3>
            <p>
              A maintenance plan for your home. Complete a check and its next
              due date moves forward automatically.
            </p>
            <div className="feature-preview">
              <div className="preview-calendar" aria-hidden="true">
                <p>YOUR MONTH, WITH A PLAN</p>
                <div className="calendar-dots">
                  {Array.from({ length: 28 }, (_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div>
              </div>
            </div>
            <Link className="text-link" href="/prevent">
              Build my maintenance plan
              <Icon name="arrow" size={16} />
            </Link>
          </article>
          <article className="feature-panel">
            <span className="feature-number">03 / KNOW MORE FOR NEXT TIME</span>
            <h3>
              Learn it.
              <br />
              Then try it.
            </h3>
            <p>
              Explore the parts, understand the cause and test your judgment in
              a different situation.
            </p>
            <div className="feature-preview">
              <div className="preview-check" aria-hidden="true">
                <div>
                  <Icon name="layers" size={15} />
                  Understand the parts<span>01</span>
                </div>
                <div>
                  <Icon name="search" size={15} />
                  Spot the difference<span>02</span>
                </div>
                <div>
                  <Icon name="check" size={15} />
                  Try a new scenario<span>03</span>
                </div>
              </div>
            </div>
            <Link className="text-link" href="/guides">
              Explore practical skills
              <Icon name="arrow" size={16} />
            </Link>
          </article>
        </div>
      </section>
      <section className="proof-section">
        <div className="container proof-grid">
          <div>
            <p className="eyebrow eyebrow-light">CONFIDENCE, WITH BOUNDARIES</p>
            <h2>
              Know what you can handle.
              <br />
              Know when to call.
            </h2>
            <p>
              Good home care starts with knowing the difference. We help you ask
              better questions, understand the parts and recognize where basic
              checks should stop.
            </p>
            <Link href="/safety" className="button button-lime">
              Our approach to safety
              <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="journey">
            <div className="journey-item">
              <span className="mini-label">FIRST / UNDERSTAND</span>
              <h3>Start with what you notice.</h3>
              <p>
                Describe the symptom. Answer a few relevant questions.
                Uncertainty stays visible.
              </p>
            </div>
            <div className="journey-item">
              <span className="mini-label">THEN / CHOOSE A NEXT STEP</span>
              <h3>A check, a lesson, or a professional.</h3>
              <p>
                No generic repair plan for an unsupported problem. No treating a
                photo as a diagnosis.
              </p>
            </div>
            <div className="journey-item">
              <span className="mini-label">AFTER / KEEP THE KNOW-HOW</span>
              <h3>A home record that belongs to you.</h3>
              <p>
                Save completed maintenance, practiced skills and repairs you
                explicitly confirm.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="section container">
        <div className="section-header">
          <div>
            <p className="eyebrow">FROM “NOW WHAT?” TO A NEXT STEP</p>
            <h2>
              Made for real life.
              <br />
              And first-time homeowners.
            </h2>
          </div>
          <Link href="/my-home" className="text-link">
            Set up my home
            <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="how-grid">
          <div className="how-item">
            <span>01</span>
            <h3>Make it your home.</h3>
            <p>
              Add the year, home type and equipment. Your maintenance plan
              adapts to what you actually have.
            </p>
          </div>
          <div className="how-item">
            <span>02</span>
            <h3>Take one useful step.</h3>
            <p>
              Work through a guided problem, complete a maintenance check or
              learn how a component works.
            </p>
          </div>
          <div className="how-item">
            <span>03</span>
            <h3>Build on what you did.</h3>
            <p>
              Keep a history, see what comes due next and practice a skill in a
              new scenario.
            </p>
          </div>
        </div>
        <div className="cost-calculator">
          <div>
            <p className="eyebrow">THE NUMBERS SHOULD MAKE SENSE</p>
            <h3>
              Understand the cost.
              <br />
              Keep the record honest.
            </h3>
            <p>
              If you receive a quote and complete a suitable repair yourself,
              compare it with your actual spend. This example is a calculator,
              not a promise of savings.
            </p>
          </div>
          <div className="calculator-inputs">
            <div className="field">
              <label htmlFor="example-quote">Your quote ($)</label>
              <input
                id="example-quote"
                type="number"
                min="0"
                max="100000"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="example-spend">Your total spend ($)</label>
              <input
                id="example-spend"
                type="number"
                min="0"
                max="100000"
                value={parts}
                onChange={(e) => setParts(e.target.value)}
              />
            </div>
            <div className="calculator-result" aria-live="polite">
              <span>
                Illustrative difference
                <br />
                Not added to your home ledger
              </span>
              <strong>
                $
                {difference.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>
        </div>
      </section>
      <section className="section container" style={{ paddingTop: 0 }}>
        <div className="faq-layout">
          <div>
            <p className="eyebrow">A FEW GOOD QUESTIONS</p>
            <h2>
              Before you
              <br />
              make yourself
              <br />
              at home.
            </h2>
          </div>
          <div>
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="container closing-cta">
        <div>
          <h2>
            One less thing
            <br />
            to figure out on your own.
          </h2>
          <p>
            Start with what's happening at home. We'll help you find a next
            step.
          </p>
        </div>
        <Link href="/fix" className="button button-dark">
          Let's figure it out
          <Icon name="arrow" size={18} />
        </Link>
      </section>
    </>
  );
}
