"use client";
import Link from "next/link";
import { useState } from "react";
import type { DiagnosisResult } from "@/lib/diagnosticEngine";
import {
  saveDecisionCase,
  useFixdeedState,
  usePersistenceStatus,
} from "@/lib/homeClientStore";
import { hasPlusAccess } from "@/lib/plans";
import { PlusPaywall } from "./PlusPaywall";
import { Notice } from "./Workspace";
import { Icon } from "./Icon";
export function SaveCaseAction({
  result,
  observations,
}: {
  result: DiagnosisResult;
  observations: string;
}) {
  const state = useFixdeedState();
  const persistence = usePersistenceStatus();
  const [paywall, setPaywall] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  function save() {
    const now = new Date().toISOString();
    const record = saveDecisionCase({
      id: crypto.randomUUID(),
      title: result.diagnosisTitle,
      observations: observations.trim() || result.diagnosisTitle,
      createdAt: now,
      updatedAt: now,
      status: result.safetyTier === "PRO_REQUIRED" ? "professional" : "open",
      note: "",
      quotes: [],
      snapshot: {
        title: result.diagnosisTitle,
        summary: result.whatHappened,
        safetyTier: result.safetyTier,
        canDiy: result.canDiy,
        steps: result.steps,
        questions: result.clarifyingQuestions,
      },
    });
    setSaved(record.ok);
    setError(record.error ?? "");
  }
  if (result.safetyTier === "EMERGENCY") return null;
  return (
    <section className="surface decision-prompt">
      <p className="eyebrow">KEEP THE DECISION, NOT JUST THE ANSWER</p>
      <h3>Have the right details ready.</h3>
      <p className="aside-copy">
        Keep these observations, compare contractor quotes and download a brief
        before you ask for help.
      </p>
      {saved ? (
        <Notice tone="success">
          Case saved
          {persistence === "unavailable"
            ? " in this session only. Browser storage is unavailable"
            : " in this browser"}
          . <Link href="/cases">Open decision cases</Link>
        </Notice>
      ) : (
        <button
          className="button button-primary mt-20"
          onClick={() => (hasPlusAccess(state) ? save() : setPaywall(true))}
        >
          Save this decision <Icon name="receipt" size={17} />
        </button>
      )}
      <p className="small muted mt-20">
        {hasPlusAccess(state)
          ? "Plus demo active. No payment was taken."
          : "Plus feature. All safety checks and explanations remain free."}
      </p>
      {error && (
        <p role="alert" className="error-feedback">
          {error}
        </p>
      )}
      <PlusPaywall
        open={paywall}
        onClose={() => setPaywall(false)}
        onActivated={save}
        reason="Save this result, compare the work quoted and take a clear brief to a professional."
      />
    </section>
  );
}
