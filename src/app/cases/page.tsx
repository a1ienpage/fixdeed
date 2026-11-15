"use client";
import Link from "next/link";
import { useState } from "react";
import {
  useFixdeedState,
  useHydrated,
  saveDecisionCase,
  usePersistenceStatus,
} from "@/lib/homeClientStore";
import {
  compareQuotes,
  buildContractorBrief,
  QuoteSchema,
  type DecisionCase,
} from "@/lib/decisionCases";
import { downloadText } from "@/lib/download";
import { hasPlusAccess } from "@/lib/plans";
import { PageIntro, Notice, EmptyState } from "@/components/Workspace";
import { PlusPaywall } from "@/components/PlusPaywall";
import { Icon } from "@/components/Icon";
import { TierBadge } from "@/components/TierBadge";
const dollars = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
function CaseDetail({ item }: { item: DecisionCase }) {
  const state = useFixdeedState();
  const [note, setNote] = useState(item.note);
  const [status, setStatus] = useState(item.status);
  const [contractor, setContractor] = useState("");
  const [amount, setAmount] = useState("");
  const [scope, setScope] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [warranty, setWarranty] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [paywall, setPaywall] = useState(false);
  const compared = compareQuotes(item.quotes);
  function update(
    patch: Partial<Pick<DecisionCase, "note" | "status" | "quotes">>,
  ) {
    if (!hasPlusAccess(state)) {
      setPaywall(true);
      return false;
    }
    const result = saveDecisionCase({
      ...item,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
    setError(result.error ?? "");
    return result.ok;
  }
  function addQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!hasPlusAccess(state)) {
      setPaywall(true);
      return;
    }
    const parsed = QuoteSchema.safeParse({
      id: crypto.randomUUID(),
      contractor,
      amount: amount.trim() === "" ? NaN : Number(amount),
      scope,
      exclusions,
      warranty,
    });
    if (!parsed.success) {
      setError("Enter a provider, valid quoted amount and the scope of work.");
      return;
    }
    if (update({ quotes: [...item.quotes, parsed.data] })) {
      setContractor("");
      setAmount("");
      setScope("");
      setExclusions("");
      setWarranty("");
      setMessage("Quote recorded. Compare the scope before choosing.");
    }
  }
  return (
    <article className="stack case-record">
      <section className="surface">
        <p className="eyebrow">DECISION RECORD</p>
        <h2>{item.title}</h2>
        <p className="small muted mt-20">
          Recorded {new Date(item.createdAt).toLocaleString("en-US")} ·{" "}
          {state.dataMode === "demo" ? "Sample home" : "Personal home"}
        </p>
        <div className="mt-20">
          <TierBadge tier={item.snapshot.safetyTier} />
        </div>
        <h3 className="mt-30">What you observed</h3>
        <p className="case-observations">{item.observations}</p>
        <h3 className="mt-30">Guided result at that time</h3>
        <p className="aside-copy">{item.snapshot.summary}</p>
        <Notice>
          Conditions may have changed. This saved result is not a current
          inspection. <Link href="/fix">Run a new check</Link> for new or
          changed symptoms.
        </Notice>
        {item.snapshot.questions.length > 0 && (
          <>
            <h4 className="mt-20">Still unknown</h4>
            <ul className="plain-list">
              {item.snapshot.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </>
        )}
        <div className="field mt-30">
          <label htmlFor="case-status">Follow-up status</label>
          <select
            id="case-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="open">Open</option>
            <option value="professional">Professional follow-up</option>
            <option value="resolved">Resolved by homeowner report</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="case-note">Your follow-up note</label>
          <textarea
            id="case-note"
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What changed, who you spoke to, or what needs checking next. Avoid sensitive details."
          />
        </div>
        <button
          className="button button-outline"
          onClick={() => {
            if (update({ note, status }))
              setMessage(
                "Follow-up saved. No repair completion or savings were inferred.",
              );
          }}
        >
          Save follow-up
        </button>
      </section>
      <section className="surface">
        <p className="eyebrow">COMPARE THE WORK, THEN THE AMOUNT</p>
        <h2>Contractor quote notes</h2>
        <p className="aside-copy">
          Enter quotes you received for this issue. Fixdeed does not obtain,
          verify or recommend providers.
        </p>
        {item.quotes.length > 0 ? (
          <>
            <div className="quote-table-wrap">
              <table className="quote-table">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Quoted amount</th>
                    <th>Scope</th>
                    <th>Exclusions / warranty</th>
                  </tr>
                </thead>
                <tbody>
                  {item.quotes.map((q) => (
                    <tr key={q.id}>
                      <th scope="row">{q.contractor}</th>
                      <td>{dollars(q.amount)}</td>
                      <td>{q.scope}</td>
                      <td>
                        {q.exclusions || "Exclusions not recorded"}
                        <br />
                        {q.warranty || "Warranty not recorded"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {item.quotes.length > 1 && (
              <div className="quote-spread">
                <span>
                  Difference between lowest and highest quoted amounts
                </span>
                <strong>{dollars(compared.spread)}</strong>
              </div>
            )}
            <Notice>{compared.warning}</Notice>
            {compared.missingDetails.length > 0 && (
              <ul className="plain-list small mt-20">
                {compared.missingDetails.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="empty-inline">
            No quotes recorded. Start with the same written scope when
            requesting them.
          </p>
        )}
        {item.quotes.length < 5 ? (
          <form onSubmit={addQuote} className="form-stack mt-30">
            <h3>Add a quote</h3>
            <div className="field-row">
              <div className="field">
                <label htmlFor="quote-provider">Provider name</label>
                <input
                  id="quote-provider"
                  value={contractor}
                  maxLength={100}
                  required
                  onChange={(e) => setContractor(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="quote-amount">Quoted amount ($)</label>
                <input
                  id="quote-amount"
                  type="number"
                  min={0}
                  max={1000000}
                  step="0.01"
                  value={amount}
                  required
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="quote-scope">Work included</label>
              <textarea
                id="quote-scope"
                value={scope}
                maxLength={1000}
                required
                onChange={(e) => setScope(e.target.value)}
                placeholder="Parts, labor and the work this amount covers"
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="quote-exclusions">
                  Exclusions / possible extras
                </label>
                <input
                  id="quote-exclusions"
                  value={exclusions}
                  maxLength={1000}
                  onChange={(e) => setExclusions(e.target.value)}
                  placeholder="Optional, but important to compare"
                />
              </div>
              <div className="field">
                <label htmlFor="quote-warranty">
                  Warranty / guarantee offered
                </label>
                <input
                  id="quote-warranty"
                  value={warranty}
                  maxLength={500}
                  onChange={(e) => setWarranty(e.target.value)}
                />
              </div>
            </div>
            <button className="button button-primary" type="submit">
              Record quote <Icon name="plus" size={17} />
            </button>
          </form>
        ) : (
          <p className="small muted mt-20">
            Five quotes recorded for this case.
          </p>
        )}
      </section>
      <section className="surface case-brief">
        <div>
          <p className="eyebrow">BEFORE THE NEXT CALL</p>
          <h3>Take the facts with you.</h3>
          <p>
            Your original observations, open questions and entered quotes in one
            text file.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => {
            if (!hasPlusAccess(state)) {
              setPaywall(true);
              return;
            }
            downloadText(
              `fixdeed-${item.id}-brief.txt`,
              buildContractorBrief(item),
            );
            setMessage(
              "Brief downloaded locally. Review it before sharing. Nothing was sent to a contractor.",
            );
          }}
        >
          Download contractor brief <Icon name="download" size={18} />
        </button>
      </section>
      {message && (
        <p role="status" className="success-feedback">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="error-feedback">
          {error}
        </p>
      )}
      <p className="small muted">
        Plus demo feature. No billing. Notes and quotes stay in this browser.
        Marking a case resolved does not add a repair or any savings.
      </p>
      <PlusPaywall open={paywall} onClose={() => setPaywall(false)} />
    </article>
  );
}
export default function Cases() {
  const state = useFixdeedState();
  const hydrated = useHydrated();
  const persistence = usePersistenceStatus();
  const [selected, setSelected] = useState<string | null>(null);
  const item =
    state.decisionCases.find((c) => c.id === selected) ??
    state.decisionCases[0];
  return (
    <div className="workspace container">
      <PageIntro
        eyebrow="YOUR HOME DECISIONS"
        title="Pick up where you left off."
        description="The observations you recorded, the work quoted and the next conversation. Keep the facts together."
        action={
          <Link className="button button-primary" href="/fix">
            Check a new problem <Icon name="plus" size={17} />
          </Link>
        }
      />
      {state.dataMode === "demo" && (
        <div className="demo-banner">
          Sample home cases. Your personal records are separate.
        </div>
      )}
      {persistence === "unavailable" && (
        <Notice tone="warning">
          Browser storage is unavailable. Export personal records in My home
          before leaving.
        </Notice>
      )}
      {!hydrated ? (
        <p>Loading records from this browser…</p>
      ) : item ? (
        <div className="case-layout">
          <aside className="case-selector">
            <p className="eyebrow">{state.decisionCases.length} SAVED CASES</p>
            {state.decisionCases.map((c) => (
              <button
                key={c.id}
                className={c.id === item.id ? "selected" : ""}
                onClick={() => setSelected(c.id)}
              >
                <strong>{c.title}</strong>
                <span>
                  {c.status === "professional"
                    ? "Professional follow-up"
                    : c.status}{" "}
                  · {new Date(c.createdAt).toLocaleDateString("en-US")}
                </span>
              </button>
            ))}
            <Link className="text-link mt-20" href="/my-home">
              Export personal records
            </Link>
          </aside>
          <CaseDetail key={item.id} item={item} />
        </div>
      ) : (
        <section className="surface">
          <EmptyState
            icon="receipt"
            title="The next check can become a useful record."
            description="Run a guided check, then save the result as a decision case. Plus adds quote notes and a downloadable brief."
            href="/fix"
            label="Start a guided check"
          />
          <div className="text-center">
            <Link className="text-link" href="/plans">
              See Free and Plus plans <Icon name="arrow" size={17} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
