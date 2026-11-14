"use client";
import { useState } from "react";
import {
  logCompletedRepair,
  usePersistenceStatus,
} from "@/lib/homeClientStore";
import type { RepairLogEntry } from "@/lib/homeStore";
import { Icon } from "./Icon";
import { Notice } from "./Workspace";
type Category = RepairLogEntry["category"];
export function RepairLogForm({
  initialTitle = "",
  category = "Plumbing",
  guideSlug,
  onDone,
}: {
  initialTitle?: string;
  category?: Category;
  guideSlug?: string;
  onDone?: () => void;
}) {
  const persistence = usePersistenceStatus();
  const [title, setTitle] = useState(initialTitle);
  const [chosenCategory, setCategory] = useState<Category>(category);
  const [quote, setQuote] = useState("");
  const [spent, setSpent] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [confirmationId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `confirmation-${Date.now()}-${Math.random()}`,
  );
  const difference = Math.max(0, (Number(quote) || 0) - (Number(spent) || 0));
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saved) return;
    if (
      !confirmed ||
      !title.trim() ||
      quote === "" ||
      spent === "" ||
      !Number.isFinite(Number(quote)) ||
      !Number.isFinite(Number(spent)) ||
      Number(quote) < 0 ||
      Number(spent) < 0
    ) {
      setError("Enter valid costs and confirm you completed this repair.");
      return;
    }
    const ok = logCompletedRepair({
      title: title.trim(),
      category: chosenCategory,
      outcome: "diy_fixed",
      proEstimate: Number(quote),
      diySpent: Number(spent),
      savedAmount: difference,
      guideSlug,
      confirmationId,
    });
    if (ok) {
      setSaved(true);
      setError("");
    } else
      setError(
        "This repair could not be added, or this confirmation was already saved.",
      );
  }
  return saved ? (
    <div className="empty-state" role="status">
      <span className="icon-box">
        <Icon name="check" size={25} />
      </span>
      <h3>Repair recorded.</h3>
      <p>
        ${difference.toLocaleString("en-US", { maximumFractionDigits: 2 })} in
        self-reported avoided cost. Your quote and spend are saved with the
        repair.
      </p>
      {persistence === "unavailable" && (
        <Notice tone="warning">
          Browser storage is unavailable. This record is held in this session
          only. Export your home data before leaving.
        </Notice>
      )}
      <button className="button button-primary" onClick={onDone}>
        Back to my home
        <Icon name="arrow" size={17} />
      </button>
    </div>
  ) : (
    <form onSubmit={submit} className="form-stack">
      <Notice>
        Only log work you have actually completed. A lesson or estimate is not a
        completed repair.
      </Notice>
      <div className="field">
        <label htmlFor="repair-title">What did you complete?</label>
        <input
          id="repair-title"
          value={title}
          maxLength={160}
          required
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Replaced a worn sink washer"
        />
      </div>
      <div className="field">
        <label htmlFor="repair-category">Category</label>
        <select
          id="repair-category"
          value={chosenCategory}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {[
            "Plumbing",
            "Electrical Basics",
            "Appliances",
            "General & Walls",
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="repair-quote">Quote you received ($)</label>
          <input
            id="repair-quote"
            type="number"
            min="0"
            max="100000"
            step="0.01"
            required
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="180.00"
          />
          <small>Use a quote for this same scope of work.</small>
        </div>
        <div className="field">
          <label htmlFor="repair-spend">Total actual spend ($)</label>
          <input
            id="repair-spend"
            type="number"
            min="0"
            max="100000"
            step="0.01"
            required
            value={spent}
            onChange={(e) => setSpent(e.target.value)}
            placeholder="20.00"
          />
          <small>Include tools, parts and other costs.</small>
        </div>
      </div>
      <div className="calculator-result">
        <span>
          Self-reported avoided cost
          <br />
          Excludes the value of your time
        </span>
        <strong>
          ${difference.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </strong>
      </div>
      <label className="checkbox-line">
        <input
          type="checkbox"
          checked={confirmed}
          required
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span>
          I completed this repair and entered a real quote and my actual
          expenses. These are my own reported figures.
        </span>
      </label>
      {error && (
        <p role="alert" className="error-feedback">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button
          className="button button-primary"
          type="submit"
          disabled={!confirmed || !title.trim() || quote === "" || spent === ""}
        >
          Save completed repair
          <Icon name="check" size={17} />
        </button>
      </div>
    </form>
  );
}
