"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import {
  useFixdeedState,
  useHydrated,
  activateDemoPlus,
  saveDecisionCase,
  usePersistenceStatus,
} from "@/lib/homeClientStore";
import {
  getPurchaseScope,
  consumePurchaseJourney,
  makeJourneyCase,
  checkoutScopeHash,
} from "@/lib/purchaseJourney";
import { getPlanSummary, type BillingPeriod } from "@/lib/plans";
import { Notice } from "@/components/Workspace";
import { Icon } from "@/components/Icon";
const Verified = z.object({
  verified: z.literal(true),
  attemptId: z.uuid(),
  billing: z.enum(["annual", "monthly"]),
  homeMode: z.enum(["personal", "demo"]),
  scopeHash: z.string(),
  sessionId: z.string(),
  realMoneyCharged: z.literal(false),
});
export default function ReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="workspace container">Checking your test checkout…</div>
      }
    >
      <ReturnContext />
    </Suspense>
  );
}
function ReturnContext() {
  const state = useFixdeedState();
  const hydrated = useHydrated();
  if (!hydrated)
    return (
      <div className="workspace container" aria-busy="true">
        Loading your home context…
      </div>
    );
  return (
    <CheckoutReturn
      key={getPurchaseScope(state)}
      scope={getPurchaseScope(state)}
      mode={state.dataMode}
    />
  );
}
function CheckoutReturn({
  scope,
  mode,
}: {
  scope: string;
  mode: "personal" | "demo";
}) {
  const params = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const attemptId = params.get("attempt_id") ?? "";
  const [retry, setRetry] = useState(0);
  const [billing, setBilling] = useState<BillingPeriod | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const persistence = usePersistenceStatus();
  useEffect(() => {
    setError("");
    let canceled = false;
    const abort = new AbortController();
    async function verify() {
      try {
        if (
          !z.uuid().safeParse(attemptId).success ||
          !/^cs_test_[A-Za-z0-9_]+$/.test(sessionId)
        )
          throw new Error(
            "A Stripe test session is required. No Plus access was activated.",
          );
        const response = await fetch(`/api/checkout/verify/${attemptId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
          signal: abort.signal,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.error || "The test payment could not be verified.",
          );
        const receipt = Verified.parse(data);
        const expectedScope = await checkoutScopeHash(scope);
        if (canceled) return;
        if (
          receipt.scopeHash !== expectedScope ||
          receipt.homeMode !== mode ||
          receipt.sessionId !== sessionId ||
          receipt.attemptId !== attemptId
        )
          throw new Error(
            "Your active home changed during checkout. Return to that home before verifying this test subscription.",
          );
        activateDemoPlus();
        const journey = consumePurchaseJourney(
          scope,
          Date.now(),
          receipt.attemptId,
        );
        if (journey) {
          try {
            const item = makeJourneyCase(journey, new Date().toISOString());
            if (item) {
              const result = saveDecisionCase(item);
              setSaved(result.ok);
              if (!result.ok)
                setNote(
                  result.error ||
                    "The decision could not be saved. Run another free check to try again.",
                );
            }
          } catch {
            setNote(
              "Test access is active, but the earlier decision could not be saved. Run a new free check before continuing that issue.",
            );
          }
        } else
          setNote(
            "Test access is active. Start a new check or open your maintenance plan.",
          );
        setBilling(receipt.billing);
      } catch (e) {
        if (!canceled && !abort.signal.aborted)
          setError(
            e instanceof Error
              ? e.message
              : "The test payment could not be verified.",
          );
      }
    }
    void verify();
    return () => {
      canceled = true;
      abort.abort();
    };
  }, [sessionId, attemptId, scope, mode, retry]);
  const plan = billing ? getPlanSummary(billing) : null;
  return (
    <div className="checkout-shell container">
      <section className="checkout-success" aria-live="polite">
        {error ? (
          <>
            <p className="eyebrow">CHECKOUT NEEDS ATTENTION</p>
            <h1>We couldn’t verify this test payment.</h1>
            <p className="journey-lead" role="alert">
              {error}
            </p>
            <div className="form-actions">
              <button
                className="button button-primary"
                onClick={() => setRetry((value) => value + 1)}
              >
                Retry this test payment verification
              </button>
              <Link className="button button-outline" href="/checkout">
                Back to checkout
              </Link>
              <Link className="button button-outline" href="/fix">
                Use free checks
              </Link>
            </div>
          </>
        ) : !plan ? (
          <>
            <p className="eyebrow">STRIPE SANDBOX</p>
            <h1>Checking your test payment…</h1>
            <p className="journey-lead">
              Plus activates after our server confirms the paid test
              subscription with Stripe.
            </p>
          </>
        ) : (
          <>
            <span className="checkout-success-icon">
              <Icon name="check" size={30} />
            </span>
            <p className="eyebrow">STRIPE TEST PAYMENT VERIFIED</p>
            <h1>Your Plus test access is ready.</h1>
            <p className="journey-lead">
              Stripe confirmed the ${plan.price.toFixed(2)} / {plan.period} test
              subscription. <strong>No real money was charged.</strong>
            </p>
            {saved && (
              <Notice tone="success">
                Your decision and original observations are saved in this{" "}
                {mode === "demo" ? "sample" : "personal"} home.
              </Notice>
            )}
            {note && <Notice>{note}</Notice>}
            {persistence === "unavailable" && (
              <Notice>
                Browser storage is unavailable. Export important records before
                closing this tab.
              </Notice>
            )}
            <div className="form-actions">
              <Link className="button button-primary" href="/cases">
                Open decision cases <Icon name="arrow" size={18} />
              </Link>
              <Link className="button button-outline" href="/prevent">
                Open maintenance
              </Link>
            </div>
            <p className="small muted mt-20">
              One home, for your household. This MVP keeps test access and
              records in this browser. Family accounts, cloud sync and
              production billing lifecycle management are not included.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
