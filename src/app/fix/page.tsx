"use client";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PROBLEM_PRESETS, type DiagnosisResult } from "@/lib/diagnosticEngine";
import { getGuideBySlug } from "@/content/guides";
import { createRequestGuard } from "@/lib/requestGuard";
import { getTriageContext } from "@/lib/clientContext";
import {
  incrementDiagnosticsCount,
  useFixdeedState,
} from "@/lib/homeClientStore";
import { Icon, type IconName } from "@/components/Icon";
import { PageIntro, Notice } from "@/components/Workspace";
import { TierBadge } from "@/components/TierBadge";
import { ModalDialog } from "@/components/ModalDialog";
import { RepairLogForm } from "@/components/RepairLogForm";
import { SaveCaseAction } from "@/components/SaveCaseAction";
const ICONS: Record<string, IconName> = {
  "sink-leaking": "drop",
  "toilet-wont-flush": "layers",
  "ac-not-cooling": "wind",
  "door-wont-close": "door",
  "hole-in-wall": "layers",
  "washer-not-draining": "washer",
};
function FixTool() {
  const params = useSearchParams();
  const state = useFixdeedState();
  const [presetId, setPresetId] = useState("");
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const guardRef = useRef<ReturnType<typeof createRequestGuard> | null>(null);
  if (!guardRef.current) guardRef.current = createRequestGuard();
  const guard = guardRef.current;
  function invalidate() {
    guard.invalidate();
    setLoading(false);
    setResult(null);
    setError("");
  }
  useEffect(() => () => guard.invalidate(), [guard]);
  const preset = PROBLEM_PRESETS.find((p) => p.id === presetId);
  const guide = result?.recommendedGuideSlug
    ? getGuideBySlug(result.recommendedGuideSlug)
    : undefined;
  const needsInfo =
    result && !result.canDiy && result.clarifyingQuestions.length > 0;
  const ready = Boolean(preset || text.trim().length >= 3);
  useEffect(() => {
    invalidate();
    const id = params.get("problem");
    const match = PROBLEM_PRESETS.find((p) => p.id === id);
    if (match) {
      setPresetId(match.id);
      setText(match.label);
      setAnswers({});
      setResult(null);
    } else if (id) {
      const linked = getGuideBySlug(id);
      if (linked) {
        setPresetId("");
        setText(linked.shortProblem);
        setAnswers({});
        setResult(null);
      }
    }
  }, [params]);
  function choose(id: string) {
    invalidate();
    const p = PROBLEM_PRESETS.find((p) => p.id === id);
    const previous = PROBLEM_PRESETS.find((p) => p.id === presetId);
    const hasObservations =
      text.trim() && (!previous || text.trim() !== previous.label);
    setPresetId(id);
    if (!hasObservations) setText(p?.label ?? "");
    setAnswers({});
    setResult(null);
    setError("");
  }
  async function diagnose() {
    if (loading || !ready) return;
    const request = guard.start();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetId: presetId || undefined,
          symptomText: text,
          answers,
          profile: state.profileConfigured
            ? getTriageContext(state.profile)
            : undefined,
        }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(15000)]),
      });
      const data = await response.json();
      if (!request.isCurrent()) return;
      if (!response.ok)
        throw new Error(
          data.error ?? "We couldn't complete the check. Try again.",
        );
      setResult(data.result);
      incrementDiagnosticsCount();
      requestAnimationFrame(
        () =>
          request.isCurrent() &&
          resultRef.current?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
            block: "start",
          }),
      );
    } catch (e) {
      if (!request.isCurrent()) return;
      setError(
        e instanceof Error
          ? e.message
          : "We couldn't connect. Please try again.",
      );
    } finally {
      if (request.isCurrent()) setLoading(false);
    }
  }
  return (
    <div className="workspace container">
      <PageIntro
        eyebrow="GUIDED TROUBLESHOOTING"
        title="Let's figure it out."
        description="Start with what you notice. A few specific checks help you understand the problem and choose your next step."
        action={
          <Link className="text-link" href="/assistant">
            Prefer a conversation?
            <Icon name="chat" size={17} />
          </Link>
        }
      />
      <div className="stepper" aria-label="Troubleshooting progress">
        <span className={!result ? "active" : ""}>
          <b>1</b>Describe it
        </span>
        <i />
        <span className={preset && !result ? "active" : ""}>
          <b>2</b>Check the details
        </span>
        <i />
        <span className={result ? "active" : ""}>
          <b>3</b>Your next step
        </span>
      </div>
      <div className="split-layout">
        <div className="stack">
          <section className="surface">
            <p className="step-label">
              <span>1</span>WHAT'S HAPPENING AT HOME?
            </p>
            <div className="problem-grid">
              {PROBLEM_PRESETS.map((p) => (
                <button
                  key={p.id}
                  className={`problem-card ${p.id === presetId ? "active" : ""}`}
                  aria-pressed={p.id === presetId}
                  onClick={() => choose(p.id)}
                >
                  <Icon name={ICONS[p.id] ?? "tool"} size={25} />
                  <span>{p.label}</span>
                  <span className="problem-category">
                    {p.category.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
            <div className="divider-label">or describe something else</div>
            <div className="field">
              <label htmlFor="symptom-description">
                What have you noticed?
              </label>
              <textarea
                id="symptom-description"
                placeholder="e.g. Water drips under my kitchen sink only when I run the faucet."
                maxLength={1000}
                value={text}
                onChange={(e) => {
                  invalidate();
                  setText(e.target.value);
                  setPresetId("");
                  setAnswers({});
                  setResult(null);
                }}
              />
              <small>
                Include the fixture, what happens and when it started. Avoid
                personal details.
              </small>
            </div>
          </section>
          {preset && (
            <section className="surface">
              <p className="step-label">
                <span>2</span>A COUPLE OF DETAILS FIRST
              </p>
              {preset.clarifyingPrompts.map((q) => (
                <fieldset className="question" key={q.id}>
                  <legend>{q.question}</legend>
                  <div className="choice-list">
                    {[
                      ...q.options,
                      {
                        value: "not_sure",
                        label: "I'm not sure / I can't check this safely",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`choice ${answers[q.id] === option.value ? "selected" : ""}`}
                        aria-pressed={answers[q.id] === option.value}
                        onClick={() => {
                          invalidate();
                          setAnswers({ ...answers, [q.id]: option.value });
                          setResult(null);
                        }}
                      >
                        <span className="choice-dot" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
              <p className="small muted">
                Only observe from a safe position. If a check requires moving
                equipment or touching damaged parts, choose “I'm not sure.”
              </p>
            </section>
          )}
          <div>
            <button
              className="button button-primary"
              onClick={diagnose}
              disabled={!ready || loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Checking the details…
                </>
              ) : (
                <>
                  Show my next step
                  <Icon name="arrow" size={18} />
                </>
              )}
            </button>
            {error && (
              <p role="alert" className="error-feedback">
                {error}
              </p>
            )}
            {loading && <div className="loading-line" />}
          </div>
          {result && (
            <div
              ref={resultRef}
              className="stack"
              style={{ scrollMarginTop: 110 }}
              aria-live="polite"
            >
              <section className="surface">
                <div className="result-top">
                  {needsInfo ? (
                    <span className="pill">
                      <Icon name="search" size={13} />
                      More details needed
                    </span>
                  ) : (
                    <TierBadge tier={result.safetyTier} />
                  )}
                  <span className="mini-label muted">
                    GUIDED RULES · NO IMAGE ANALYSIS
                  </span>
                </div>
                <h2 className="result-heading">{result.diagnosisTitle}</h2>
                <p className="result-summary">{result.whatHappened}</p>
                {result.safetyTier === "EMERGENCY" && (
                  <div className="mt-20">
                    <Notice tone="danger">
                      Treat an active emergency as urgent. In the US, contact
                      911 from a safe location. Follow emergency-service
                      instructions.
                    </Notice>
                  </div>
                )}
                {needsInfo && (
                  <div className="mt-20">
                    <h3 style={{ fontSize: 17 }}>Before choosing a repair</h3>
                    <ul className="materials-list">
                      {result.clarifyingQuestions.map((q) => (
                        <li key={q}>
                          <Icon name="search" size={15} />
                          {q}
                        </li>
                      ))}
                    </ul>
                    <p className="small muted mt-20">
                      Choose the matching problem above to answer its guided
                      checks. If the issue is not covered, ask a qualified
                      professional for an inspection.
                    </p>
                  </div>
                )}
                {result.steps.length > 0 && (
                  <div className="mt-30">
                    <h3 style={{ fontSize: 18 }}>
                      {result.canDiy
                        ? "Your limited next steps"
                        : "What to do now"}
                    </h3>
                    <ol className="instruction-list">
                      {result.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                <p className="result-meta">
                  {result.safetyReason}{" "}
                  {state.profileConfigured && result.profileTailoringNote}
                </p>
                {guide && (
                  <div className="result-actions">
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="button button-primary"
                    >
                      Understand how it works
                      <Icon name="book" size={17} />
                    </Link>
                    {result.canDiy && (
                      <button
                        className="button button-outline"
                        onClick={() => setLogOpen(true)}
                      >
                        I completed a repair
                        <Icon name="receipt" size={17} />
                      </button>
                    )}
                  </div>
                )}
              </section>
              <SaveCaseAction
                result={result}
                observations={[
                  text,
                  ...(preset?.clarifyingPrompts ?? [])
                    .filter((q) => answers[q.id])
                    .map(
                      (q) =>
                        `${q.question} ${q.options.find((o) => o.value === answers[q.id])?.label ?? "Not sure / cannot check safely"}`,
                    ),
                ].join("\n")}
              />
              {result.canDiy && result.toolsNeeded.length > 0 && (
                <section className="surface">
                  <h3>What the guide calls for</h3>
                  <ul className="materials-list">
                    {result.toolsNeeded.map((t) => (
                      <li key={t}>
                        <Icon name="check" size={15} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {result.benchmark && (
                <section className="surface">
                  <p className="eyebrow">COST CONTEXT, NOT A QUOTE</p>
                  <h3>Know what to ask about.</h3>
                  <div className="estimate-numbers">
                    <div>
                      <strong>
                        ${result.benchmark.proLow}–${result.benchmark.proHigh}
                      </strong>
                      <span>Illustrative professional cost</span>
                    </div>
                    <div>
                      <strong>${result.benchmark.diyParts}</strong>
                      <span>Illustrative parts cost</span>
                    </div>
                  </div>
                  <p className="estimate-note">
                    Scope, location, equipment and labor vary. This reference is
                    not a price verification, promised saving or reason to
                    attempt unsuitable work. Nothing is added to your ledger.
                  </p>
                  <a
                    href={result.benchmark.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link mt-20"
                  >
                    View the external cost reference
                    <Icon name="arrow-up" size={14} />
                  </a>
                </section>
              )}
            </div>
          )}
        </div>
        <aside className="aside-sticky stack">
          <section className="surface checks-card">
            <span
              className="icon-box"
              style={{ background: "#ffffff80", borderColor: "#d7cbee" }}
            >
              <Icon name="shield" size={24} />
            </span>
            <h2 className="aside-title mt-20">
              A useful answer
              <br />
              starts with the limits.
            </h2>
            <p className="aside-copy">
              This MVP uses guided rules and a small library of practical
              explanations. It does not inspect your home.
            </p>
            <div className="aside-list">
              <div>
                <Icon name="check" size={17} />
                <div>
                  <h4>Specific questions first</h4>
                  <p>No repair steps until the relevant checks are answered.</p>
                </div>
              </div>
              <div>
                <Icon name="search" size={17} />
                <div>
                  <h4>Uncertainty stays visible</h4>
                  <p>
                    An unfamiliar issue gets questions, not an invented cause.
                  </p>
                </div>
              </div>
              <div>
                <Icon name="lock" size={17} />
                <div>
                  <h4>No photo processing</h4>
                  <p>
                    Describe what you can observe. Images are not uploaded or
                    analyzed.
                  </p>
                </div>
              </div>
            </div>
            <Link href="/safety" className="text-link mt-30">
              How safety checks work
              <Icon name="arrow" size={15} />
            </Link>
          </section>
          <Notice tone="warning">
            Smell gas, see active smoke or fire, or hear a CO alarm? Keep clear
            and seek emergency help.{" "}
            <Link href="/safety">Read the safety guidance.</Link>
          </Notice>
        </aside>
      </div>
      <ModalDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        title="Record a completed repair"
      >
        {logOpen && (
          <RepairLogForm
            initialTitle={guide?.shortProblem.replace(/^My /, "") ?? ""}
            category={guide?.category}
            guideSlug={guide?.slug}
            onDone={() => setLogOpen(false)}
          />
        )}
      </ModalDialog>
    </div>
  );
}
export default function FixPage() {
  return (
    <Suspense
      fallback={
        <div className="workspace container">
          <p>Loading your troubleshooting workspace…</p>
        </div>
      }
    >
      <FixTool />
    </Suspense>
  );
}
