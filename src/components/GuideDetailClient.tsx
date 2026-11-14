"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { RepairGuide } from "@/content/guides";
import { getTransferCase } from "@/content/practice";
import {
  completeSkillAssessment,
  useFixdeedState,
  usePersistenceStatus,
} from "@/lib/homeClientStore";
import { Icon } from "./Icon";
import { AnatomyDiagram } from "./AnatomyDiagram";
import { TierBadge } from "./TierBadge";
import { Notice } from "./Workspace";
export function GuideDetailClient({ guide }: { guide: RepairGuide }) {
  const state = useFixdeedState();
  const storage = usePersistenceStatus();
  const earned = state.unlockedSkills.some((s) => s.id === guide.slug);
  const [stage, setStage] = useState<"baseline" | "learn" | "practice">(
    earned ? "learn" : "baseline",
  );
  const [baseline, setBaseline] = useState("");
  const [baselineChecked, setBaselineChecked] = useState(false);
  const [part, setPart] = useState(guide.partsAnatomy[0]?.id ?? "");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    if (earned && stage === "baseline" && !baseline) setStage("learn");
  }, [earned, stage, baseline]);
  const transfer = getTransferCase(guide.slug);
  const question = guide.quiz[0];
  function move(next: typeof stage) {
    setStage(next);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  function assess() {
    if (!answer) return;
    setChecked(true);
    if (answer === transfer.correctId) {
      completeSkillAssessment(guide.slug, answer);
      setPassed(true);
    }
  }
  return (
    <div className="workspace container">
      <Link className="back-link" href="/guides">
        <Icon name="arrow" size={15} />
        All practical skills
      </Link>
      <header className="lesson-heading">
        <p className="eyebrow">{guide.category} / PRACTICAL KNOW-HOW</p>
        <h1>{guide.title}</h1>
        <p>{guide.summary}</p>
        <div className="lesson-meta">
          <TierBadge tier={guide.safetyTier} />
          <span>
            <Icon name="book" size={14} />
            Learn, explore, practice
          </span>
          {earned && (
            <span style={{ color: "var(--violet)" }}>
              <Icon name="check" size={14} />
              New scenario passed
            </span>
          )}
        </div>
      </header>
      <div className="stepper" aria-label="Lesson progress">
        <span className={stage === "baseline" ? "active" : ""}>
          <b>1</b>First instinct
        </span>
        <i />
        <span className={stage === "learn" ? "active" : ""}>
          <b>2</b>Understand it
        </span>
        <i />
        <span className={stage === "practice" ? "active" : ""}>
          <b>3</b>New scenario
        </span>
      </div>
      {stage === "baseline" && (
        <section className="surface quiz-baseline">
          <p className="eyebrow">TRY IT BEFORE YOU LEARN IT</p>
          <h2>What would you do first?</h2>
          <p className="small muted mt-20">
            There's no score to protect. Start with your instinct, then learn
            why it matters.
          </p>
          <p className="assessment-prompt">{question.prompt}</p>
          {question.options.map((option) => (
            <button
              key={option.id}
              className={`choice ${baseline === option.id ? "selected" : ""}`}
              aria-pressed={baseline === option.id}
              onClick={() => {
                setBaseline(option.id);
                setBaselineChecked(false);
              }}
            >
              <span className="choice-dot" />
              {option.label}
            </button>
          ))}
          {!baselineChecked ? (
            <button
              className="button button-primary"
              disabled={!baseline}
              onClick={() => setBaselineChecked(true)}
            >
              Check my instinct
              <Icon name="arrow" size={17} />
            </button>
          ) : (
            <>
              <div className="mt-20">
                <Notice
                  tone={baseline === question.correctId ? "success" : "warning"}
                >
                  <strong>
                    {baseline === question.correctId
                      ? "A useful starting point."
                      : "A good moment to learn the difference."}
                  </strong>
                  <p>{question.explanation}</p>
                </Notice>
              </div>
              <button
                className="button button-primary"
                onClick={() => move("learn")}
              >
                Explore the guide
                <Icon name="arrow" size={17} />
              </button>
            </>
          )}
        </section>
      )}
      {stage === "learn" && (
        <div className="lesson-layout">
          <div className="lesson-content">
            <Notice>
              These are educational explanations, not an inspection of your
              situation.{" "}
              <Link href={`/fix?problem=${guide.slug}`}>
                Run the guided checks
              </Link>{" "}
              before applying any steps to your home.
            </Notice>
            <section className="surface lesson-section" id="understand">
              <p className="eyebrow">01 / GET TO KNOW THE PARTS</p>
              <h2>Understand what you're looking at.</h2>
              <p>{guide.howItWorks}</p>
              <AnatomyDiagram
                guideSlug={guide.slug}
                kind={guide.diagram}
                parts={guide.partsAnatomy}
                selectedId={part}
                onSelect={setPart}
              />
            </section>
            <section className="surface lesson-section" id="cause">
              <p className="eyebrow">02 / LOOK BEYOND THE SYMPTOM</p>
              <h2>Why this can happen.</h2>
              <p>{guide.whyItHappens}</p>
              <div className="mt-20">
                <Notice tone="warning">
                  <strong>One common mistake</strong>
                  <p>{guide.rookieMistake}</p>
                </Notice>
              </div>
            </section>
            <section className="surface lesson-section" id="steps">
              <p className="eyebrow">03 / KEEP THE LIMITS IN VIEW</p>
              <h2>
                {guide.safetyTier === "PRO_REQUIRED"
                  ? "Observe, document, call a pro."
                  : "A limited sequence to understand."}
              </h2>
              <p>
                Conditions and equipment vary. Stop if anything differs from the
                guide, and use manufacturer instructions for your exact model.
              </p>
              <ol className="instruction-list">
                {guide.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <div className="spacer-line" />
              <h3 style={{ fontSize: 17 }}>
                Materials or observations mentioned
              </h3>
              <ul className="materials-list">
                {guide.toolsNeeded.map((tool) => (
                  <li key={tool}>
                    <Icon name="check" size={14} />
                    {tool}
                  </li>
                ))}
              </ul>
              <Link
                className="text-link mt-20"
                href={`/fix?problem=${guide.slug}`}
              >
                Check whether this applies to your issue
                <Icon name="arrow" size={15} />
              </Link>
            </section>
            <section className="assessment-card">
              <p className="eyebrow">04 / THE SITUATION CHANGES</p>
              <h2>Can you spot the difference?</h2>
              <p>
                The next scenario is different from your first question. Apply
                the principle, rather than repeat the same answer.
              </p>
              <button
                className="button button-lime"
                onClick={() => move("practice")}
              >
                {earned ? "Review a new situation" : "Try a new situation"}
                <Icon name="arrow" size={18} />
              </button>
            </section>
          </div>
          <aside className="lesson-nav">
            <p>IN THIS GUIDE</p>
            <a href="#understand">
              <span>01</span>Understand the parts
            </a>
            <a href="#cause">
              <span>02</span>Read the cause
            </a>
            <a href="#steps">
              <span>03</span>Know the limits
            </a>
            <button
              className="text-link mt-20"
              onClick={() => move("practice")}
            >
              <span>04</span>Try a new situation
              <Icon name="arrow" size={14} />
            </button>
            <p className="lesson-nav-note">
              Completing a scenario records practice, not a professional
              qualification. No repair or money is automatically logged.
            </p>
          </aside>
        </div>
      )}
      {stage === "practice" && (
        <div className="quiz-baseline">
          <section className="assessment-card">
            <p className="eyebrow">APPLY IT TO A NEW SITUATION</p>
            <h2>
              A different symptom.
              <br />
              The same principle?
            </h2>
            <p className="assessment-prompt">{transfer.prompt}</p>
            {transfer.options.map((option) => (
              <button
                key={option.id}
                className={`choice ${answer === option.id ? "selected" : ""}`}
                aria-pressed={answer === option.id}
                disabled={passed}
                onClick={() => {
                  setAnswer(option.id);
                  setChecked(false);
                }}
              >
                <span className="choice-dot" />
                {option.label}
              </button>
            ))}
            {!passed && (
              <button
                className="button button-lime"
                disabled={!answer}
                onClick={assess}
              >
                Check my next step
                <Icon name="arrow" size={17} />
              </button>
            )}
            {checked && (
              <Notice
                tone={answer === transfer.correctId ? "success" : "warning"}
              >
                {answer === transfer.correctId
                  ? "You applied the principle to a different situation."
                  : "This situation needs a different response. Try again."}
                <p>{transfer.explanation}</p>
              </Notice>
            )}
          </section>
          {passed && (
            <section className="lesson-complete mt-20" role="status">
              <span className="icon-box">
                <Icon name="check" size={24} />
              </span>
              <h3>{earned ? "Practice recorded." : "New scenario passed."}</h3>
              <p>
                {guide.skillUnlockedTitle.replace(/Mastery/g, "Practice")} is
                now in your home skills. No repair was recorded, and your
                avoided-cost total has not changed.
              </p>
              {storage === "unavailable" && (
                <p className="error-feedback">
                  Storage is unavailable. This practice may not survive a
                  reload. Export your home data before leaving.
                </p>
              )}
              <Link href="/my-home" className="button button-primary">
                See my home skills
                <Icon name="arrow" size={17} />
              </Link>
            </section>
          )}
          <div className="result-actions">
            <button
              className="button button-outline"
              onClick={() => move("learn")}
            >
              Revisit the explanation
              <Icon name="book" size={16} />
            </button>
            <Link href="/guides" className="button button-outline">
              Find another skill
              <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
