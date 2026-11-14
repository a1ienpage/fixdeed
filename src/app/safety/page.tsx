import Link from "next/link";
import { Notice } from "@/components/Workspace";
export default function Safety() {
  return (
    <div className="container">
      <article className="prose-page">
        <p className="eyebrow">PRACTICAL HELP, WITH CLEAR LIMITS</p>
        <h1>
          Know where
          <br />
          the checks stop.
        </h1>
        <p className="intro-copy">
          Fixdeed helps organize observations and explain basic home components.
          It does not inspect a property, verify isolation or certify a repair.
        </p>
        <Notice tone="danger">
          For an active emergency in the US, get to a safe location and contact
          911. Follow the instructions of emergency responders and your utility.
        </Notice>
        <section>
          <h2>Recognized hazards stop the repair flow</h2>
          <p>
            Descriptions of fire or smoke, suspected gas leaks, CO alarms, water
            at electrical fixtures and other recognized warning signs produce a
            safety stop. Follow-up questions retain the safety stop within the
            same conversation.
          </p>
          <p>
            A text check cannot recognize every real-world hazard or phrasing.
            If anything seems unsafe or you are unsure, keep clear and seek
            qualified help regardless of what the app displays.
          </p>
        </section>
        <section>
          <h2>Unknown means more information</h2>
          <p>
            An unsupported problem, missing answer or “I'm not sure” response
            does not receive a guessed repair. Some situations remain
            clarification-only even after initial questions because a model,
            material or condition has not been established.
          </p>
          <p>
            The current MVP uses a limited guided library. It does not analyze
            images or generate repair instructions from an AI model.
          </p>
        </section>
        <section>
          <h2>Some work belongs with a qualified professional</h2>
          <p>
            Gas systems, internal electrical equipment, high-voltage circuits,
            refrigerant systems, structural issues, work at height, suspect
            materials and tank servicing are outside this MVP's DIY scope.
            Rental and shared-building work may also need your property
            manager's approval.
          </p>
          <p>
            Use manufacturer instructions for your exact equipment. A generic
            illustration cannot establish what is installed in your home.
          </p>
        </section>
        <section>
          <h2>Practice is not a qualification</h2>
          <p>
            Passing a new scenario records that you practiced a principle. It
            does not demonstrate physical repair competence, authorize regulated
            work or replace professional training.
          </p>
        </section>
        <section>
          <h2>Costs and coverage are limited measures</h2>
          <p>
            External cost references are illustrative context. They are not
            local quotes or promised savings. The repair ledger reflects costs
            you explicitly report. Maintenance coverage measures unexpired task
            completions, not the condition or safety of your home.
          </p>
        </section>
        <section>
          <h2>Official safety references</h2>
          <ul>
            <li>
              <a
                href="https://www.phmsa.dot.gov/safety-awareness/pipeline/pipeline-leak-recognition-and-what-do"
                target="_blank"
                rel="noopener noreferrer"
              >
                PHMSA: recognizing and responding to a gas leak
              </a>
            </li>
            <li>
              <a
                href="https://www.cpsc.gov/safety-education/safety-guides/carbon-monoxide/carbon-monoxide-fact-sheet"
                target="_blank"
                rel="noopener noreferrer"
              >
                CPSC: carbon monoxide safety
              </a>
            </li>
            <li>
              <a
                href="https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/home-fire-escape-plans/index.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                US Fire Administration: home fire escape plans
              </a>
            </li>
          </ul>
        </section>
        <Link href="/fix" className="button button-primary">
          Open guided troubleshooting
        </Link>
      </article>
    </div>
  );
}
