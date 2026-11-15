"use client";
import Link from "next/link";
import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFixdeedState, useHydrated } from "@/lib/homeClientStore";
import {
  getPlanSummary,
  PLUS_FEATURES,
  type BillingPeriod,
  hasPlusAccess,
} from "@/lib/plans";
import {
  getPurchaseScope,
  getPurchaseJourney,
  persistPurchaseJourney,
  checkoutScopeHash,
} from "@/lib/purchaseJourney";
import { PlanPicker } from "@/components/PlanPicker";
import { Notice } from "@/components/Workspace";
import { Icon } from "@/components/Icon";
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={<div className="workspace container">Loading checkout…</div>}
    >
      <CheckoutContext />
    </Suspense>
  );
}
function CheckoutContext() {
  const state = useFixdeedState();
  const hydrated = useHydrated();
  if (!hydrated)
    return (
      <div className="workspace container" aria-busy="true">
        Loading checkout…
      </div>
    );
  return (
    <Checkout key={getPurchaseScope(state)} scope={getPurchaseScope(state)} />
  );
}
function Checkout({ scope }: { scope: string }) {
  const params = useSearchParams();
  const state = useFixdeedState();
  const [billing, setBilling] = useState<BillingPeriod>(
    params.get("plan") === "monthly" ? "monthly" : "annual",
  );
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(crypto.randomUUID());
  const submitted = useRef(false);
  const journey = getPurchaseJourney(scope);
  const plan = getPlanSummary(billing);
  async function finish(e: React.FormEvent) {
    e.preventDefault();
    if (!ack || submitted.current) return;
    submitted.current = true;
    setBusy(true);
    setError("");
    try {
      if (
        journey &&
        !persistPurchaseJourney(scope, Date.now(), requestId.current)
      )
        throw new Error(
          "This browser cannot retain your plan for the Stripe return. Allow tab storage, or start checkout again without a saved preview.",
        );
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing,
          scopeHash: await checkoutScopeHash(scope),
          homeMode: state.dataMode,
          requestId: requestId.current,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Stripe test checkout could not start.");
      if (
        typeof data.url !== "string" ||
        new URL(data.url).origin !== "https://checkout.stripe.com"
      )
        throw new Error("A valid Stripe test checkout was not returned.");
      window.location.assign(data.url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Checkout could not start. Try again.",
      );
      submitted.current = false;
      setBusy(false);
    }
  }
  if (hasPlusAccess(state))
    return (
      <div className="checkout-shell container">
        <section className="checkout-success">
          <p className="eyebrow">PLUS TEST ACCESS ACTIVE</p>
          <h1>Your home already has Plus.</h1>
          <p className="journey-lead">
            Open your workspace to continue. You can manage local test access in
            Plans.
          </p>
          <div className="form-actions">
            <Link className="button button-primary" href="/cases">
              Open decision cases
            </Link>
            <Link className="button button-outline" href="/prevent">
              Open maintenance
            </Link>
            <Link className="text-link" href="/plans">
              Manage test access
            </Link>
          </div>
        </section>
      </div>
    );
  return (
    <div className="checkout-shell container">
      <div className="journey-topline">
        <Link className="text-link" href={journey ? "/start" : "/plans"}>
          {journey ? "Back to your plan" : "Back to plans"}
        </Link>
        <span>STRIPE TEST CHECKOUT · NO REAL MONEY</span>
      </div>
      <div className="checkout-intro">
        <p className="eyebrow">THE FINAL STEP</p>
        <h1>Make room for the next decision.</h1>
        <p className="journey-lead">
          One home, for your household. Keep decisions and the work quoted
          together.
        </p>
      </div>
      {params.get("canceled") === "1" && (
        <Notice>
          Test checkout was canceled. No Plus access was activated by canceling.
          Your saved preview remains available in this tab until it expires.
        </Notice>
      )}
      {params.get("from") === "start" && !journey && (
        <Notice>
          Your earlier plan is no longer available after a refresh, expired
          session or home change. You can choose a membership below or{" "}
          <Link href="/start">start a new free plan</Link>. No old diagnosis
          will be saved.
        </Notice>
      )}
      <div className="checkout-layout">
        <form className="checkout-main" onSubmit={finish}>
          {journey && (
            <div className="checkout-context">
              <p className="eyebrow">YOUR STARTING POINT</p>
              <h2>
                {journey.result?.diagnosisTitle ?? "Your maintenance routine"}
              </h2>
              <p>
                {!journey.homeTypeConfirmed
                  ? "Home profile not configured"
                  : journey.housingType === "apartment"
                    ? "Apartment or condo"
                    : journey.housingType === "townhome"
                      ? "Townhome"
                      : "Detached house"}{" "}
                ·{" "}
                {journey.goal === "maintenance"
                  ? "Recurring upkeep"
                  : "A decision record you can continue"}
              </p>
            </div>
          )}
          <PlanPicker
            value={billing}
            onChange={(value) => {
              if (!busy) {
                setBilling(value);
                setAck(false);
                requestId.current = crypto.randomUUID();
              }
            }}
          />
          <section className="checkout-demo-notice">
            <h2>Complete a Stripe test payment.</h2>
            <p>
              You’ll continue to Stripe’s hosted sandbox checkout. It creates a
              test subscription only. No real money moves, and Fixdeed never
              receives your card number.
            </p>
            <p className="test-card">
              Test card: <strong>4242 4242 4242 4242</strong>
            </p>
            <p className="small">
              Use a future expiry, any 3-digit CVC and a test email such as
              reviewer@example.com. Do not use real card details.
            </p>
            <p className="small muted mt-20">
              Plus access and home records stay in this browser. No separate
              family accounts, cloud backup or cross-device sharing. No expert
              visits or unlimited human consultations.
            </p>
          </section>
          <label className="checkbox-line mt-20">
            <input
              type="checkbox"
              checked={ack}
              disabled={busy}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span>
              I understand this is Stripe test mode and no real money will be
              charged.
            </span>
          </label>
          {error && (
            <p role="alert" className="error-feedback mt-20">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="button button-primary checkout-submit"
            disabled={!ack || busy}
          >
            {busy
              ? "Opening Stripe test checkout…"
              : "Continue to Stripe test checkout"}
            <Icon name="arrow" size={18} />
          </button>
          <Link className="text-link mt-20" href="/fix">
            Continue with free checks
          </Link>
        </form>
        <aside className="checkout-summary" aria-label="Order summary">
          <p className="eyebrow">FIXDEED PLUS</p>
          <h2>Your home, kept together.</h2>
          <ul className="plan-list">
            {PLUS_FEATURES.map((feature) => (
              <li key={feature}>
                <Icon name="check" size={17} />
                {feature}
              </li>
            ))}
          </ul>
          <dl className="order-totals">
            <div>
              <dt>Test {billing} subscription</dt>
              <dd>
                ${plan.price.toFixed(2)} / {plan.period}
              </dd>
            </div>
            <div>
              <dt>Real money charged</dt>
              <dd>$0.00</dd>
            </div>
          </dl>
          <p className="small muted">
            {billing === "annual"
              ? `Stripe will show $${plan.price.toFixed(2)} for the full test year, not the monthly equivalent.`
              : "Stripe will show the monthly test amount."}{" "}
            Test subscriptions can renew in the sandbox, with no real charges.
          </p>
          <p className="small muted mt-20">
            Safety guidance, basic checks and personal data controls remain
            free.
          </p>
        </aside>
      </div>
    </div>
  );
}
