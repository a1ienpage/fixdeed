import type { SafetyTier } from "@/lib/safetyGate";
import { Icon } from "./Icon";
const LABELS = {
  DIY_SAFE: "Basic checks",
  DIY_CAUTION: "Extra care needed",
  PRO_REQUIRED: "Professional help",
  EMERGENCY: "Urgent safety stop",
};
export function TierBadge({ tier }: { tier: SafetyTier }) {
  return (
    <span className={`tier-badge tier-${tier.toLowerCase()}`}>
      <Icon name={tier === "EMERGENCY" ? "alert" : "shield"} size={14} />
      {LABELS[tier]}
    </span>
  );
}
