/**
 * Deterministic safety gate.
 *
 * Runs BEFORE and AFTER every AI diagnosis or assistant turn. Any red-line match
 * forces the tier to PRO_REQUIRED or EMERGENCY and strips DIY instructions so
 * neither AI mode can ever advise unsafe work.
 */

export type SafetyTier =
  "DIY_SAFE" | "DIY_CAUTION" | "PRO_REQUIRED" | "EMERGENCY";

export const TIER_RANK: Record<SafetyTier, number> = {
  DIY_SAFE: 0,
  DIY_CAUTION: 1,
  PRO_REQUIRED: 2,
  EMERGENCY: 3,
};

export const TIER_LABEL: Record<SafetyTier, string> = {
  DIY_SAFE: "Safe DIY",
  DIY_CAUTION: "DIY with Shutoff Caution",
  PRO_REQUIRED: "Licensed Pro Required",
  EMERGENCY: "Immediate Emergency",
};

export interface RedLineRule {
  category: string;
  tier: Extract<SafetyTier, "PRO_REQUIRED" | "EMERGENCY">;
  reason: string;
  patterns: RegExp[];
}

export const RED_LINES: RedLineRule[] = [
  {
    category: "active_fire_smoke",
    tier: "EMERGENCY",
    reason:
      "Active fire or smoke may be dangerous. Leave the affected area without touching equipment or controls. Call local emergency services from outside.",
    patterns: [
      /\bfire\b|\bflames?\b|\bsmok(?:ing|e)(?!\s+(?:alarm|detector|test)\b)|\bsmouldering\b|\bsmoldering\b/i,
      /\bsmoke\s+(?:alarm|detector)\b.{0,35}\b(?:sound\w*|going off|activat\w*|trigger\w*)\b/i,
    ],
  },
  {
    category: "gas_emergency",
    tier: "EMERGENCY",
    reason:
      "Possible natural gas, propane, or carbon monoxide hazard. Evacuate immediately, touch no switches or flames, and call 911 or your gas utility from outside.",
    patterns: [
      /\bsmell(s|ing|ed)?\s+(of\s+|like\s+)?(natural\s+)?gas\b/i,
      /\bgas\s+(smell|leak|odou?r)/i,
      /\brotten[\s-]?eggs?\b/i,
      /\bsulfur\s+smell|\bsmells?\s+like\s+sulfur/i,
      /\bmercaptan\b/i,
      /\b(gas|propane|meter|gas\s+line)\b.{0,70}\bhiss(?:ing|es)?\b/i,
      /\bhiss(ing)?\b.{0,25}\b(gas|line|pipe|meter)\b/i,
      /\bcarbon\s+monoxide\b/i,
      /\bco\s+(alarm|detector)\b/i,
      /\bcracked\s+heat\s+exchanger\b/i,
      /\bbackdraft(ing)?\b/i,
    ],
  },
  {
    category: "electrical_emergency",
    tier: "EMERGENCY",
    reason:
      "Active electrical or water-plus-electricity hazard. Keep clear of wet floors and fixtures, and have power shut off remotely by your electric utility or 911.",
    patterns: [
      /\b(?:water|drip\w*|wet|leak\w*)\b.{0,120}\b(?:lamp|light|luminaire)(?:\s+fixture)?\b/i,
      /\b(?:lamp|light|luminaire)(?:\s+fixture)?\b.{0,120}\b(?:water|drip\w*|wet|leak\w*)\b/i,
      /\b(light\s+fixture|ceiling\s+light|can\s+light|outlet|recessed\s+light)\b.{0,80}\b(water|drip(?:ping|s)?|wet)\b/i,
      /\bwater\b.{0,40}\b(breaker|electrical|fuse)\s+(panel|box)\b/i,
      /\b(breaker|electrical|fuse)\s+(panel|box)\b.{0,40}\b(wet|water|flood)/i,
      /\bwater\b.{0,30}\b(light\s+fixture|ceiling\s+light|can\s+light|outlet|recessed\s+light)\b/i,
      /\b(spark(s|ed|ing)?|arc(s|ed|ing)?)\b.{0,25}\b(outlet|wire|wiring|panel|switch|plug)\b/i,
      /\b(outlet|wire|wiring|panel|switch|plug)\b.{0,25}\b(spark(s|ed|ing)?|arc(s|ed|ing)?)\b/i,
      /\bburning\s+(plastic\s+|electrical\s+)?smell\b/i,
      /\bsmell\w*\s+(like\s+|of\s+)?burning\b/i,
      /\bburning\s+(plastic|wire|wires|wiring|insulation)\b/i,
      /\bsmoke\b.{0,20}\b(outlet|panel|wall|switch)\b/i,
      /\bbuzzing\b.{0,20}\b(panel|breaker)\b/i,
      /\b(hot|melted|melting)\s+(breaker|outlet|plug|switch)\b/i,
      /\b(downed|fallen)\s+power\s+line|\bpower\s+line\s+down\b/i,
    ],
  },
  {
    category: "electrical_panel_240v",
    tier: "PRO_REQUIRED",
    reason:
      "Work inside the breaker panel, main service lugs, or 240V circuits carries lethal shock/arc-flash risk even with the main breaker off. Hire a licensed electrician.",
    patterns: [
      /\bpanel\s+cover\s+(off|removed)\b|\bremov(e|ing)\s+(the\s+)?(dead\s*front|panel\s+cover)\b/i,
      /\bopen(ing)?\s+(up\s+)?(the\s+)?(breaker|electrical|service)\s+panel\b/i,
      /\bbus\s?bar\b/i,
      /\b(240|220)\s?-?v(olt)?s?\b/i,
      /\bdouble[\s-]pole\b/i,
      /\bsub[\s-]?panel\b/i,
      /\bnema\s*(14|6|10)-\d{2}\b/i,
      /\bmeter\s+(socket|base)\b/i,
      /\bservice\s+(entrance|drop|lugs?)\b|\bweatherhead\b/i,
      /\bmain\s+(service\s+)?breaker\b/i,
      /\breplac\w*\s+(a\s+|the\s+)?(circuit\s+)?breaker\b/i,
      /\bdouble[\s-]tapp?ed\b/i,
      /\brewire|rewiring|new\s+branch\s+circuit\b/i,
    ],
  },
  {
    category: "legacy_wiring",
    tier: "PRO_REQUIRED",
    reason:
      "Legacy wiring systems (aluminum branch wiring, knob-and-tube, Federal Pacific/Zinsco panels) require licensed electrician evaluation.",
    patterns: [
      /\balumin(i)?um\s+(branch\s+)?wir(e|ing)\b/i,
      /\bknob[\s-]*(and|&|n)[\s-]*tube\b/i,
      /\bfederal\s+pacific\b|\bstab[\s-]?lok\b|\bzinsco\b/i,
      /\bcloth[\s-]+(insulated\s+)?wir(e|ing)\b/i,
    ],
  },
  {
    category: "gas_piping",
    tier: "PRO_REQUIRED",
    reason:
      "Gas piping, regulators, and gas water heater control valves require pressure-tested licensed trade service.",
    patterns: [
      /\bgas\s+(line|pipe|piping|valve|meter|connector|flex|regulator|control\s+valve|fitting)\b/i,
      /\bblack\s+iron\s+(gas\s+)?pipe\b/i,
      /\bcsst\b/i,
      /\bpropane\s+(tank|regulator|line)\b/i,
      /\bthermocouple\b/i,
    ],
  },
  {
    category: "structural_roof",
    tier: "PRO_REQUIRED",
    reason:
      "Structural members, foundation walls, and multi-story roofs carry collapse and fall hazards that require licensed pros.",
    patterns: [
      /\bload[\s-]?bearing\b/i,
      /\b(sagging|cracked|cut)\s+(floor\s+)?(joist|truss|beam|header)s?\b/i,
      /\bfoundation\s+crack/i,
      /\bbowing\s+(basement\s+)?wall\b/i,
      /\b(on|onto|climb\w*)\s+(the\s+|my\s+)?roof\b|\broof\s+(repair|replacement|work|leak)\b|\bsecond[\s-]stor(y|ey)\s+roof\b/i,
      /\bchimney\b/i,
    ],
  },
  {
    category: "hvac_pressure",
    tier: "PRO_REQUIRED",
    reason:
      "HVAC refrigerant, high-voltage condenser capacitors, slab leaks, and sealed pressure valves require an EPA-certified HVAC tech or licensed plumber.",
    patterns: [
      /\bfreon\b|\brefrigerant\b|\br-?(22|410a|454b|32)\b|\bepa\s*608\b/i,
      /\bcapacitor\b/i,
      /\b(cap|capp?ing|plug|plugging|block|blocking)\b.{0,25}\b(t\s?&\s?p|relief|discharge)\b/i,
      /\bslab\s+leak\b/i,
    ],
  },
  {
    category: "garage_tension",
    tier: "PRO_REQUIRED",
    reason:
      "Overhead garage door torsion springs and lift cables store lethal mechanical tension and require specialist service.",
    patterns: [
      /\btorsion\s+spring\b/i,
      /\bgarage\s+(door\s+)?spring\b/i,
      /\bwinding\s+(cone|bar)s?\b/i,
      /\bgarage\b.{0,20}\b(lift\s+)?cable\b/i,
    ],
  },
  {
    category: "hazmat_sewer",
    tier: "PRO_REQUIRED",
    reason:
      "Suspected asbestos, lead paint dust, extensive hidden mold, or main sewer backups require certified remediation or drain specialists.",
    patterns: [
      /\basbestos\b/i,
      /\bvermiculite\b/i,
      /\bpopcorn\s+ceiling\b/i,
      /\blead\s+paint\b/i,
      /\bblack\s+mold\b|\bmold\b.{0,25}\b(behind|inside|wall|drywall|ceiling)\b/i,
      /\b(raw\s+)?sewage\b|\bsewer\s+(backup|back[\s-]up|main)\b|\bmain\s+sewer\b/i,
    ],
  },
];

export interface RedLineMatch {
  category: string;
  tier: SafetyTier;
  reason: string;
  matched: string;
}

export interface ScanResult {
  tier: SafetyTier | null;
  matches: RedLineMatch[];
}

/** Scan free text for safety red lines and return the highest triggered tier. */
export function scanText(text: string | null | undefined): ScanResult {
  if (!text) return { tier: null, matches: [] };
  const normalized = suppressExplicitAbsences(text.replace(/\s+/g, " "));
  const matches: RedLineMatch[] = [];
  for (const rule of RED_LINES) {
    for (const pattern of rule.patterns) {
      const m = normalized.match(pattern);
      if (m) {
        matches.push({
          category: rule.category,
          tier: rule.tier,
          reason: rule.reason,
          matched: m[0],
        });
        break;
      }
    }
  }
  return { tier: highestTier(matches.map((m) => m.tier)), matches };
}

/** Local absence statements are not incident reports. Uncertainty never cancels a stop. */
function suppressExplicitAbsences(text: string): string {
  function isCompleteAssertion(input: string, offset: number, length: number) {
    const start =
      Math.max(
        input.lastIndexOf(".", offset),
        input.lastIndexOf(";", offset),
        input.lastIndexOf("?", offset),
      ) + 1;
    const tail = input.slice(offset + length);
    const end = tail.search(/[.!?;]/);
    const clause = input.slice(
      start,
      end < 0 ? input.length : offset + length + end,
    );
    if (
      /\b(?:not sure|unsure|cannot confirm|can't confirm|cannot rule out|can't rule out|might|maybe|possibly|probably|think|believe|guess|until|yet|anymore)\b/i.test(
        clause,
      )
    )
      return false;
    if (
      /^\s+(?:here|there|in|from|around|at|now|upstairs|downstairs)\b/i.test(
        tail,
      )
    )
      return false;
    return end < 0 || tail[end] !== "?";
  }
  const hazard =
    "(?:smoke(?!\\s+(?:alarm|detector)\\b)|fire|flames?|sparks?|(?:natural\\s+)?gas\\s+(?:smell|odou?r|leak)|(?:smell|odou?r)(?:\\s+of)?\\s+(?:natural\\s+)?gas)";
  const absent = new RegExp(
    `\\b(?:no|without)\\s+(?:(?:visible|active|apparent)\\s+)?${hazard}(?:\\s+or\\s+(?:no\\s+)?${hazard}(?=\\s*(?:[.!;]|$)))?\\b`,
    "gi",
  );
  let result = text.replace(absent, (match, offset: number) =>
    !isCompleteAssertion(text, offset, match.length)
      ? match
      : " [explicitly absent] ",
  );
  result = result.replace(
    /\b(?:smoke|co|carbon monoxide)\s+(?:alarm|detector)\s+(?:(?:is|was)\s+)?(?:not|isn't|wasn't)\s+(?:going off|sounding|activated|triggered)\b/gi,
    (match, offset: number) =>
      !isCompleteAssertion(result, offset, match.length)
        ? match
        : " [alarm reported inactive] ",
  );
  return result;
}

export function highestTier(
  tiers: (SafetyTier | null | undefined)[],
): SafetyTier | null {
  let best: SafetyTier | null = null;
  for (const t of tiers) {
    if (!t) continue;
    if (best === null || TIER_RANK[t] > TIER_RANK[best]) best = t;
  }
  return best;
}

/** Ensure final tier never falls below any deterministic red-line floor. */
export function enforceSafetyFloor(
  llmTier: SafetyTier,
  floor: SafetyTier | null,
): SafetyTier {
  if (!floor) return llmTier;
  return TIER_RANK[floor] > TIER_RANK[llmTier] ? floor : llmTier;
}

export function isDiyAllowed(tier: SafetyTier): boolean {
  return tier === "DIY_SAFE" || tier === "DIY_CAUTION";
}

export const EMERGENCY_STEPS = [
  "Leave the affected area and get everyone to a safe location. Do not touch switches, appliances, wet surfaces, or the affected equipment.",
  "From a safe location outside, call your local emergency services or the relevant utility. Follow their instructions and stay out until cleared.",
];

export const PRO_STEPS = [
  "Stop using the affected fixture or appliance. Do not disassemble it or attempt a repair.",
  "Contact a qualified, licensed professional to inspect the issue. Describe the symptoms and request an itemized quote.",
];
