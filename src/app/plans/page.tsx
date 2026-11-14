"use client";
import Link from "next/link";
import { useState } from "react";
import { PageIntro, Notice } from "@/components/Workspace";
import { PlusPaywall } from "@/components/PlusPaywall";
import {
  useFixdeedState,
  disableDemoPlus,
  openSampleHome,
  useHydrated,
} from "@/lib/homeClientStore";
import {
  PLUS_ANNUAL_USD,
  PLUS_MONTHLY_USD,
  PLUS_FEATURES,
  hasPlusAccess,
} from "@/lib/plans";
import { Icon } from "@/components/Icon";
export default function Plans() {
  const state = useFixdeedState();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <div className="workspace container">
      <PageIntro
        eyebrow="A PLAN FOR YOUR FIRST HOME"
        title="Keep the next decision easier."
        description="Start with free checks. Plus carries your decisions and upkeep forward, so the next problem starts with a record."
      />
      <Notice>
        Competition MVP: proposed pricing and a demonstration checkout. No real
        subscription or billing is available.
      </Notice>
      {message && (
        <p className="success-feedback mt-20" role="status">
          {message}
        </p>
      )}
      <div className="pricing-layout mt-30">
        <section className="surface pricing-free">
          <p className="eyebrow">FIXDEED FREE</p>
          <h2>The next safe step.</h2>
          <div className="plan-price">$0</div>
          <p>For a problem you want to understand now.</p>
          <ul className="plan-list">
            {[
              "Guided symptom checks and safety stops",
              "All 12 practical lessons and new scenarios",
              "Maintenance list and repeat dates",
              "Completed repair ledger",
              "Personal JSON export and data controls",
            ].map((t) => (
              <li key={t}>
                <Icon name="check" size={18} />
                {t}
              </li>
            ))}
          </ul>
          <Link className="button button-outline" href="/fix">
            Start a free check
          </Link>
        </section>
        <section className="surface pricing-plus">
          <p className="eyebrow">FIXDEED PLUS</p>
          <h2>A record you can act on.</h2>
          <div className="plan-price">
            ${PLUS_ANNUAL_USD}
            <span>/ year</span>
          </div>
          <p>Or ${PLUS_MONTHLY_USD} per month. Proposed price for one home.</p>
          <ul className="plan-list">
            {PLUS_FEATURES.map((t) => (
              <li key={t}>
                <Icon name="check" size={18} />
                {t}
              </li>
            ))}
          </ul>
          {hydrated && hasPlusAccess(state) ? (
            <>
              <Notice tone="success">
                Plus demo active in this browser. No charge or subscription.
              </Notice>
              <Link className="button button-primary mt-20" href="/cases">
                Open decision cases
              </Link>
              <button
                className="text-link mt-20"
                onClick={() => {
                  disableDemoPlus();
                  setMessage(
                    "Returned to Free. Your existing records are preserved and can still be exported.",
                  );
                }}
              >
                Return to Free
              </button>
            </>
          ) : (
            <button
              className="button button-primary"
              onClick={() => setOpen(true)}
            >
              Try the Plus checkout <Icon name="arrow" size={18} />
            </button>
          )}
        </section>
      </div>
      <section className="surface mt-30">
        <p className="eyebrow">WHY KEEP IT?</p>
        <h2>One issue becomes useful history.</h2>
        <p className="intro-copy mt-20">
          Keep what you observed, record the work a contractor quoted, and bring
          the same facts to the next conversation. After maintenance, move the
          next check into the calendar you already use.
        </p>
        <p className="small muted mt-20">
          Records stay in this browser. Calendar files require manual import and
          do not sync. Plus does not include a professional inspection,
          contractor booking, live expert advice or cloud backup.
        </p>
      </section>
      <section className="judge-entry">
        <div>
          <p className="eyebrow">REVIEWING THE MVP?</p>
          <h3>Explore a clearly marked sample home.</h3>
          <p>
            One click opens illustrative records with Plus demo access. Your
            personal home stays separate.
          </p>
        </div>
        <button
          className="button button-outline"
          onClick={() => {
            openSampleHome();
            setMessage(
              "Sample home opened with Plus demo. All example history is illustrative.",
            );
          }}
        >
          Open sample home
        </button>
        <Link href="/my-home" className="text-link">
          View my home <Icon name="arrow" size={16} />
        </Link>
      </section>
      <PlusPaywall
        open={open}
        onClose={() => setOpen(false)}
        onActivated={() =>
          setMessage(
            "Plus demo activated. Try saved cases, quote notes and calendar export. No payment was taken.",
          )
        }
      />
    </div>
  );
}
