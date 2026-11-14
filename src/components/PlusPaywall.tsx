"use client";
import { useState } from "react";
import { ModalDialog } from "./ModalDialog";
import { Notice } from "./Workspace";
import { activateDemoPlus, useFixdeedState } from "@/lib/homeClientStore";
import { PLUS_ANNUAL_USD, PLUS_MONTHLY_USD } from "@/lib/plans";
export function PlusPaywall({
  open,
  onClose,
  onActivated,
  reason = "Keep a decision record you can use again.",
}: {
  open: boolean;
  onClose: () => void;
  onActivated?: () => void;
  reason?: string;
}) {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [ack, setAck] = useState(false);
  const state = useFixdeedState();
  if (!open) return null;
  return (
    <ModalDialog
      open={open}
      title="Your next step, kept together"
      onClose={onClose}
    >
      <p className="intro-copy">{reason}</p>
      <p className="mt-20">
        Plus keeps decision cases, quote scope notes and contractor briefs
        together, and exports recurring maintenance reminders to your calendar.
      </p>
      <fieldset className="question mt-20">
        <legend>Proposed plan</legend>
        <div className="choice-list">
          <button
            className={`choice ${billing === "annual" ? "selected" : ""}`}
            aria-pressed={billing === "annual"}
            onClick={() => setBilling("annual")}
          >
            ${PLUS_ANNUAL_USD} / year{" "}
            <span className="small muted">One home</span>
          </button>
          <button
            className={`choice ${billing === "monthly" ? "selected" : ""}`}
            aria-pressed={billing === "monthly"}
            onClick={() => setBilling("monthly")}
          >
            ${PLUS_MONTHLY_USD} / month{" "}
            <span className="small muted">One home</span>
          </button>
        </div>
      </fieldset>
      <div className="checkout-total">
        <span>Amount charged today</span>
        <strong>$0.00</strong>
      </div>
      <Notice>
        Demonstration checkout. No card, payment, subscription or automatic
        renewal. These prices are being tested. Access is saved only in this
        browser’s {state.dataMode === "demo" ? "sample" : "personal"} home.
      </Notice>
      <label className="checkbox-line mt-20">
        <input
          type="checkbox"
          checked={ack}
          onChange={(e) => setAck(e.target.checked)}
        />
        <span>
          I understand this activates demo access and does not purchase a
          subscription.
        </span>
      </label>
      <div className="form-actions">
        <button
          className="button button-primary"
          disabled={!ack}
          onClick={() => {
            activateDemoPlus();
            onActivated?.();
            onClose();
          }}
        >
          Activate Plus demo
        </button>
        <button className="button button-outline" onClick={onClose}>
          Keep using free checks
        </button>
      </div>
    </ModalDialog>
  );
}
