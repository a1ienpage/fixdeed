"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ModalDialog } from "./ModalDialog";
import { Notice } from "./Workspace";
import { PlanPicker } from "./PlanPicker";
import { clearPurchaseJourney } from "@/lib/purchaseJourney";
import type { BillingPeriod } from "@/lib/plans";
export function PlusPaywall({
  open,
  onClose,
  onCheckout,
  reason = "Keep a decision record you can use again.",
}: {
  open: boolean;
  onClose: () => void;
  onCheckout?: () => boolean;
  reason?: string;
}) {
  const [billing, setBilling] = useState<BillingPeriod>("annual");
  const path = usePathname();
  const from = ["fix", "assistant", "cases", "prevent", "plans"].includes(
    path.slice(1),
  )
    ? path.slice(1)
    : "plans";
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
        together, and exports recurring calendar reminders.
      </p>
      <div className="mt-20">
        <PlanPicker value={billing} onChange={setBilling} />
      </div>
      <Notice>
        The next page uses Stripe Sandbox and a test card. It creates a test
        subscription with no real money movement.
      </Notice>
      <div className="form-actions">
        <Link
          className="button button-primary"
          href={`/checkout?plan=${billing}&from=${from}`}
          onClick={(e) => {
            if (onCheckout) {
              if (!onCheckout()) e.preventDefault();
            } else clearPurchaseJourney();
          }}
        >
          Continue to checkout
        </Link>
        <button className="button button-outline" onClick={onClose}>
          Keep using free checks
        </button>
      </div>
    </ModalDialog>
  );
}
