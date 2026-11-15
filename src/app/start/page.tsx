"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useFixdeedState,
  useHydrated,
  applyHomeSetup,
  saveDecisionCase,
} from "@/lib/homeClientStore";
import {
  APPLIANCE_LABELS,
  DEFAULT_STATE,
  type HousingType,
  type ApplianceId,
} from "@/lib/homeStore";
import {
  PROBLEM_PRESETS,
  DiagnosisResultSchema,
  type DiagnosisResult,
} from "@/lib/diagnosticEngine";
import { filterTasksForProfile } from "@/content/preventive";
import { scanText, EMERGENCY_STEPS } from "@/lib/safetyGate";
import {
  getPurchaseScope,
  getPurchaseJourney,
  putPurchaseJourney,
  preservePresetObservations,
  getJourneyTriageProfile,
  makeJourneyCase,
  clearPurchaseJourney,
  type JourneyGoal,
} from "@/lib/purchaseJourney";
import {
  getPlanSummary,
  PLUS_ANNUAL_USD,
  PLUS_MONTHLY_USD,
  hasPlusAccess,
} from "@/lib/plans";
import { Notice } from "@/components/Workspace";
import { TierBadge } from "@/components/TierBadge";
import { Icon } from "@/components/Icon";

const homes: { value: HousingType; title: string; description: string }[] = [
  {
    value: "house",
    title: "Detached house",
    description: "Your own structure and outdoor upkeep",
  },
  {
    value: "townhome",
    title: "Townhome",
    description: "Your home, with some shared responsibilities",
  },
  {
    value: "apartment",
    title: "Apartment or condo",
    description: "Focus on your unit and building rules",
  },
];
const goals: { value: JourneyGoal; title: string; description: string }[] = [
  {
    value: "problem",
    title: "Understand a problem",
    description: "Find a bounded next step for something happening now",
  },
  {
    value: "maintenance",
    title: "Get ahead of upkeep",
    description: "Start a routine for the equipment you have",
  },
  {
    value: "quotes",
    title: "Prepare for contractor quotes",
    description: "Keep the facts and compare what the work includes",
  },
];
export default function StartPage() {
  const state = useFixdeedState();
  const hydrated = useHydrated();
  if (!hydrated)
    return (
      <div className="workspace container" aria-busy="true">
        Loading your home context…
      </div>
    );
  return (
    <Journey key={getPurchaseScope(state)} scope={getPurchaseScope(state)} />
  );
}
function Journey({ scope }: { scope: string }) {
  const router = useRouter();
  const state = useFixdeedState();
  const prior = useRef(getPurchaseJourney(scope)).current;
  const [step, setStep] = useState(prior ? 3 : 0);
  const [housing, setHousing] = useState<HousingType | null>(
    prior?.housingType ?? null,
  );
  const [goal, setGoal] = useState<JourneyGoal | null>(prior?.goal ?? null);
  const [presetId, setPresetId] = useState(prior?.presetId ?? "");
  const [text, setText] = useState(prior?.symptomText ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>(
    prior?.answers ?? {},
  );
  const [appliances, setAppliances] = useState<ApplianceId[]>(
    prior?.appliances ?? [],
  );
  const [result, setResult] = useState<DiagnosisResult | null>(
    prior?.result ?? null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const id = useRef(prior?.id ?? "");
  const heading = useRef<HTMLHeadingElement>(null);
  const preset = PROBLEM_PRESETS.find((p) => p.id === presetId);
  const hazard = scanText(text).tier === "EMERGENCY";
  const home = homes.find((h) => h.value === housing);
  const annual = getPlanSummary("annual");
  const tasks = filterTasksForProfile(
    { ...DEFAULT_STATE.profile, housingType: housing ?? "house", appliances },
    false,
  );
  useEffect(
    () => () => {
      request.current++;
      controller.current?.abort();
    },
    [],
  );
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  function invalidate() {
    request.current++;
    controller.current?.abort();
    setResult(null);
    setBusy(false);
    setError("");
  }
  async function preview() {
    if (!housing || !goal) return;
    if (goal === "maintenance") {
      setStep(3);
      return;
    }
    if (!text.trim()) {
      setError("Describe what you have noticed first.");
      return;
    }
    if (hazard) return;
    const current = ++request.current;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          presetId: presetId || undefined,
          symptomText: text,
          answers,
          profile: getJourneyTriageProfile(state, housing),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "The check could not finish. Try again.");
      const parsed = DiagnosisResultSchema.parse(data.result);
      if (current !== request.current) return;
      setResult(parsed);
      setStep(3);
    } catch (e) {
      if (current === request.current && !abort.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "The check could not finish. Try again.",
        );
    } finally {
      if (current === request.current) setBusy(false);
    }
  }
  function continueToCheckout() {
    if (!housing || !goal || hazard || result?.safetyTier === "EMERGENCY")
      return;
    if (!id.current) id.current = crypto.randomUUID();
    const checks = (preset?.clarifyingPrompts ?? []).flatMap((q) => {
      const answer = q.options.find((o) => o.value === answers[q.id]);
      return answer ? [`${q.question} ${answer.label}`] : [];
    });
    const observations = [`Home type: ${home?.title}.`, text.trim(), ...checks]
      .filter(Boolean)
      .join("\n");
    const updated = applyHomeSetup(
      housing,
      goal === "maintenance" ? appliances : undefined,
    );
    const journey = {
      id: id.current,
      scope: getPurchaseScope(updated),
      housingType: housing,
      homeTypeConfirmed: true,
      goal,
      observations,
      appliances,
      result,
      presetId,
      symptomText: text,
      answers,
    };
    if (hasPlusAccess(updated)) {
      const item = makeJourneyCase(journey, new Date().toISOString());
      if (item) {
        const saved = saveDecisionCase(item);
        if (!saved.ok) {
          setError(saved.error || "The decision could not be saved.");
          return;
        }
      }
      clearPurchaseJourney();
      router.push(goal === "maintenance" ? "/prevent" : "/cases");
      return;
    }
    if (putPurchaseJourney(journey))
      router.push("/checkout?plan=annual&from=start");
    else
      setError(
        "This decision cannot continue to checkout. Review the safety guidance or start a new free check.",
      );
  }
  return (
    <div className="journey-shell container">
      <div className="journey-topline">
        <Link href="/" className="text-link">
          Back to Fixdeed
        </Link>
        <span>Free setup. No real card needed.</span>
      </div>
      <ol className="journey-progress" aria-label="Your plan progress">
        {["Your home", "Your priority", "The details", "Your plan"].map(
          (label, i) => (
            <li
              key={label}
              aria-current={i === step ? "step" : undefined}
              className={i <= step ? "reached" : ""}
            >
              <span>{i + 1}</span>
              {label}
            </li>
          ),
        )}
      </ol>
      <section className="journey-stage">
        <p className="eyebrow">A LITTLE CONTEXT. A MORE USEFUL PLAN.</p>
        <h1 tabIndex={-1} ref={heading}>
          {
            [
              "What kind of home is yours?",
              "What would help you most today?",
              goal === "maintenance"
                ? "What does your home have?"
                : "What have you noticed?",
              "Your next step starts here.",
            ][step]
          }
        </h1>
        {step === 0 && (
          <>
            <p className="journey-lead">
              Choose the place you look after. We’ll adapt the starting point.
            </p>
            <div className="journey-choices">
              {homes.map((h) => (
                <button
                  className={`journey-choice ${housing === h.value ? "selected" : ""}`}
                  key={h.value}
                  aria-pressed={housing === h.value}
                  onClick={() => setHousing(h.value)}
                >
                  <strong>{h.title}</strong>
                  <span>{h.description}</span>
                  <Icon name="arrow" size={20} />
                </button>
              ))}
            </div>
            <button
              className="button button-primary journey-next"
              disabled={!housing}
              onClick={() => setStep(1)}
            >
              Continue <Icon name="arrow" size={18} />
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <p className="journey-lead">
              We’ll show a useful first step before you choose a membership.
            </p>
            <div className="journey-choices">
              {goals.map((g) => (
                <button
                  className={`journey-choice ${goal === g.value ? "selected" : ""}`}
                  key={g.value}
                  aria-pressed={goal === g.value}
                  onClick={() => {
                    invalidate();
                    setGoal(g.value);
                  }}
                >
                  <strong>{g.title}</strong>
                  <span>{g.description}</span>
                  <Icon name="arrow" size={20} />
                </button>
              ))}
            </div>
            <button
              className="button button-primary journey-next"
              disabled={!goal}
              onClick={() => setStep(2)}
            >
              Continue <Icon name="arrow" size={18} />
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <p className="journey-lead">
              {goal === "maintenance"
                ? "Select only the equipment you know you have. You can leave this empty for a general starter list."
                : goal === "quotes"
                  ? "Start with the issue you want a contractor to quote. These checks stay free."
                  : "A few observations help us ask the right questions. Avoid names, addresses and other personal details."}
            </p>
            {goal === "maintenance" ? (
              <div className="equipment-choices">
                {Object.entries(APPLIANCE_LABELS).map(([value, label]) => (
                  <label className="equipment-choice" key={value}>
                    <input
                      type="checkbox"
                      checked={appliances.includes(value as ApplianceId)}
                      onChange={(e) =>
                        setAppliances((old) =>
                          e.target.checked
                            ? [...old, value as ApplianceId]
                            : old.filter((a) => a !== value),
                        )
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            ) : (
              <>
                <div className="journey-presets">
                  {PROBLEM_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      className={`choice ${presetId === p.id ? "selected" : ""}`}
                      aria-pressed={presetId === p.id}
                      onClick={() => {
                        invalidate();
                        setPresetId(p.id);
                        setText((old) =>
                          preservePresetObservations(
                            old,
                            preset?.label,
                            p.label,
                          ),
                        );
                        setAnswers({});
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <label className="field-label" htmlFor="journey-observations">
                  Your observations
                </label>
                <textarea
                  id="journey-observations"
                  maxLength={1500}
                  value={text}
                  placeholder="What happens, where, and when?"
                  onChange={(e) => {
                    invalidate();
                    setText(e.target.value);
                  }}
                />
                {!hazard &&
                  preset?.clarifyingPrompts.map((q) => (
                    <fieldset className="question mt-20" key={q.id}>
                      <legend>{q.question}</legend>
                      <div className="choice-list">
                        {q.options.map((o) => (
                          <button
                            type="button"
                            className={`choice ${answers[q.id] === o.value ? "selected" : ""}`}
                            aria-pressed={answers[q.id] === o.value}
                            key={o.value}
                            onClick={() => {
                              invalidate();
                              setAnswers((old) => ({
                                ...old,
                                [q.id]: o.value,
                              }));
                            }}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                <p className="small muted mt-20">
                  Observe from a safe position. If you cannot check safely,
                  choose “I’m not sure.” Guided rules, no image analysis.
                </p>
              </>
            )}
            {hazard ? (
              <div className="journey-emergency" role="alert">
                <h2>Stop here. Safety comes first.</h2>
                <ul>
                  {EMERGENCY_STEPS.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <Link className="button button-dark" href="/safety">
                  Read safety guidance
                </Link>
              </div>
            ) : (
              <button
                className="button button-primary journey-next"
                disabled={busy || (goal !== "maintenance" && !text.trim())}
                onClick={preview}
              >
                {busy ? "Preparing your next step…" : "See my free plan"}
                <Icon name="arrow" size={18} />
              </button>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <p className="journey-lead">
              {home?.title} · {goals.find((g) => g.value === goal)?.title}
            </p>
            {result ? (
              <div className="journey-result">
                <TierBadge tier={result.safetyTier} />
                <h2>{result.diagnosisTitle}</h2>
                <p>{result.whatHappened}</p>
                {result.clarifyingQuestions.length > 0 && (
                  <>
                    <h3>A little more detail is needed</h3>
                    <ul>
                      {result.clarifyingQuestions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </>
                )}
                {result.steps.length > 0 && (
                  <ol>
                    {result.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                )}
                <p className="small muted">
                  Educational guidance, not an inspection or professional
                  diagnosis. Conditions can differ.
                </p>
              </div>
            ) : (
              <div className="journey-result">
                <h2>
                  A starting routine for your{" "}
                  {housing === "apartment" ? "unit" : "home"}
                </h2>
                <p>
                  {tasks.length} starter tasks match the home type and equipment
                  you selected. Check your manuals and building responsibilities
                  before acting.
                </p>
                <ul>
                  {tasks.slice(0, 4).map((t) => (
                    <li key={t.id}>
                      {t.title}{" "}
                      <span className="small muted">({t.cadence})</span>
                    </li>
                  ))}
                </ul>
                <p className="small muted">
                  Your home type and equipment choices will be saved when you
                  continue. Add your construction year in My home for more
                  context.
                </p>
              </div>
            )}
            {result?.safetyTier !== "EMERGENCY" && (
              <section className="journey-offer">
                <p className="eyebrow">KEEP THE PLAN MOVING</p>
                <h2>
                  {goal === "maintenance"
                    ? "Put the next check on your calendar."
                    : "Keep the facts for the next conversation."}
                </h2>
                <p>
                  {goal === "maintenance"
                    ? "Plus exports recurring checks with reminder alarms for your calendar."
                    : "Plus saves this decision, keeps quote scope notes together and downloads a clear brief for a contractor."}
                </p>
                <p className="journey-price">
                  ${PLUS_ANNUAL_USD.toFixed(2)}
                  <span>/year</span>{" "}
                  <small>or ${PLUS_MONTHLY_USD.toFixed(2)}/month</small>
                </p>
                <p className="small">
                  Annual billing saves ${annual.annualSaving.toFixed(2)}{" "}
                  compared with 12 monthly payments. One home, for your
                  household.
                </p>
                <button
                  className="button button-primary mt-20"
                  onClick={continueToCheckout}
                >
                  {hasPlusAccess(state)
                    ? goal === "maintenance"
                      ? "Open my maintenance plan"
                      : "Save and open my decision"
                    : "Continue to checkout"}{" "}
                  <Icon name="arrow" size={18} />
                </button>
                <p className="small muted mt-20">
                  {hasPlusAccess(state)
                    ? "Your existing Plus test access covers this plan."
                    : "Continue through Stripe Sandbox with a test card. It creates a test subscription. No real money is charged."}
                </p>
              </section>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="error-feedback mt-20">
            {error}
          </p>
        )}
        <div className="journey-footer">
          {step > 0 && (
            <button
              className="text-link"
              disabled={busy}
              onClick={() => {
                invalidate();
                setStep(step - 1);
              }}
            >
              Back
            </button>
          )}
          <Link href="/fix" className="text-link">
            Keep using free checks
          </Link>
        </div>
      </section>
      <Notice>
        Safety guidance stays free. This demo stores home records in this
        browser. It does not include expert visits, family accounts or
        cross-device sharing.
      </Notice>
    </div>
  );
}
