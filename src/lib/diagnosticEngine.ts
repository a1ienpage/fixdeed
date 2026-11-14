import { z } from "zod";
import pricesData from "@/content/prices.json";
import { GUIDES } from "@/content/guides";
import {
  EMERGENCY_STEPS,
  PRO_STEPS,
  highestTier,
  isDiyAllowed,
  scanText,
  type SafetyTier,
} from "@/lib/safetyGate";
import type { HomeProfile } from "@/lib/homeStore";
import { inferObservationContext } from "@/lib/observationContext";

export interface PriceBenchmark {
  id: string;
  task: string;
  tier: SafetyTier;
  proLow: number;
  proHigh: number;
  diyParts: number;
  minutes: number;
  source: string;
}

export const PRICES = pricesData as PriceBenchmark[];

export const DiagnosisResultSchema = z.object({
  diagnosisTitle: z.string(),
  whatHappened: z.string(),
  severity: z.enum(["low", "moderate", "high", "critical"]),
  safetyTier: z.enum(["DIY_SAFE", "DIY_CAUTION", "PRO_REQUIRED", "EMERGENCY"]),
  safetyReason: z.string(),
  canDiy: z.boolean(),
  profileTailoringNote: z.string(),
  toolsNeeded: z.array(z.string()),
  steps: z.array(z.string()),
  clarifyingQuestions: z.array(z.string()),
  proQuestions: z.array(z.string()),
  estimatedSavingsUsd: z.number(),
  benchmark: z
    .object({
      id: z.string(),
      task: z.string(),
      proLow: z.number(),
      proHigh: z.number(),
      diyParts: z.number(),
      minutes: z.number(),
      source: z.string(),
    })
    .nullable(),
  recommendedGuideSlug: z.string().nullable(),
  recommendedDiagram: z
    .enum([
      "sink-ptrap",
      "toilet-tank",
      "faucet",
      "hvac-airflow",
      "drywall-wall",
      "water-heater",
    ])
    .nullable(),
  engineMode: z.enum(["gemini-live", "verified-rule-engine"]),
  redLineMatches: z.array(
    z.object({
      category: z.string(),
      matched: z.string(),
      reason: z.string(),
    }),
  ),
});

export type DiagnosisResult = z.infer<typeof DiagnosisResultSchema>;

export interface ProblemPreset {
  id: string;
  label: string;
  category: "Plumbing" | "Electrical Basics" | "Appliances" | "General & Walls";
  image: string;
  guideSlug: string;
  clarifyingPrompts: {
    id: string;
    question: string;
    options: { value: string; label: string }[];
  }[];
}

export const PROBLEM_PRESETS: ProblemPreset[] = [
  {
    id: "sink-leaking",
    label: "My sink is leaking.",
    category: "Plumbing",
    image: "/images/hero-sink-repair.png",
    guideSlug: "sink-leaking",
    clarifyingPrompts: [
      {
        id: "timing",
        question: "When does water drip inside the cabinet?",
        options: [
          {
            value: "when_running",
            label: "Only when faucet runs or basin drains",
          },
          {
            value: "constantly",
            label: "Continuously even with faucet completely OFF",
          },
        ],
      },
      {
        id: "valve_type",
        question:
          "Look at the wall shutoff valve underneath: what handle does it have?",
        options: [
          {
            value: "quarter_lever",
            label: "Clean 1/4-turn straight lever handle",
          },
          {
            value: "crusty_oval",
            label: "Older oval/round handle with white-green crust",
          },
        ],
      },
    ],
  },
  {
    id: "toilet-wont-flush",
    label: "My toilet won't flush.",
    category: "Plumbing",
    image: "/images/hero-sink-repair.png",
    guideSlug: "toilet-wont-flush",
    clarifyingPrompts: [
      {
        id: "symptom",
        question:
          "What happens inside the porcelain tank when you press the handle?",
        options: [
          {
            value: "loose_handle",
            label:
              "Handle feels loose—flapper doesn't lift (or chain unhooked)",
          },
          {
            value: "runs_constantly",
            label: "Tank keeps refilling / hissing every 10–15 minutes",
          },
          {
            value: "water_rising_base",
            label: "Water is seeping out under the toilet base on the floor",
          },
        ],
      },
    ],
  },
  {
    id: "ac-not-cooling",
    label: "My AC isn't cooling.",
    category: "Appliances",
    image: "/images/hvac-filter-check.png",
    guideSlug: "ac-not-cooling",
    clarifyingPrompts: [
      {
        id: "symptom",
        question: "What do you notice right now?",
        options: [
          {
            value: "filter_only",
            label:
              "Weak airflow or dusty user-accessible filter, with no ice or frost",
          },
          {
            value: "ice_frost",
            label: "Ice or frost on the pipe or equipment",
          },
          {
            value: "outdoor_buzz",
            label: "Filter clean, outdoor unit buzzes but fan won't spin",
          },
          {
            value: "warm_no_fan",
            label: "Thermostat blank or condensate pan full of water",
          },
        ],
      },
    ],
  },
  {
    id: "door-wont-close",
    label: "My door won't close.",
    category: "General & Walls",
    image: "/images/drywall-patch.png",
    guideSlug: "door-wont-close",
    clarifyingPrompts: [
      {
        id: "location",
        question: "Where does the door stick or miss?",
        options: [
          {
            value: "top_rub",
            label:
              "Rubs top-latch frame edge; latch sits slightly below metal strike plate",
          },
          {
            value: "all_around",
            label: "Swollen evenly all around in humid weather",
          },
        ],
      },
    ],
  },
  {
    id: "hole-in-wall",
    label: "There's a hole in my wall.",
    category: "General & Walls",
    image: "/images/drywall-patch.png",
    guideSlug: "hole-in-wall",
    clarifyingPrompts: [
      {
        id: "size",
        question: "How large is the hole in the drywall?",
        options: [
          {
            value: "small",
            label: "Smaller than a fist (<4 inches—doorknob or wall anchor)",
          },
          {
            value: "large_wet",
            label: "Large (>6 inches) or soft/wet ceiling drywall",
          },
        ],
      },
      {
        id: "surface",
        question:
          "Are the wall material and coating identified as safe for a surface patch?",
        options: [
          {
            value: "known_safe",
            label:
              "Known drywall and an assessed safe coating, with no suspected hazardous material",
          },
          {
            value: "unknown",
            label: "The wall material or coating is unknown or unassessed",
          },
        ],
      },
    ],
  },
  {
    id: "washer-not-draining",
    label: "My washing machine isn't draining.",
    category: "Appliances",
    image: "/images/hvac-filter-check.png",
    guideSlug: "washer-not-draining",
    clarifyingPrompts: [
      {
        id: "style",
        question: "Which washer symptom matches yours?",
        options: [
          {
            value: "front_load_err",
            label:
              "Front-loader stopped with standing water & drain error code",
          },
          {
            value: "hose_kink",
            label:
              "Kinked/pinched hose behind machine (no electrical burning smell)",
          },
        ],
      },
    ],
  },
];

function profileEraAdvice(profile?: Partial<HomeProfile>): string {
  return profile
    ? "Your home profile provides context, but does not verify its materials, condition, or installed equipment. Follow the equipment manufacturer instructions."
    : "Home materials and equipment have not been verified. Follow the equipment manufacturer instructions.";
}

export function buildMatchedBenchmark(guideId?: string): PriceBenchmark | null {
  const map: Record<string, string> = {
    "toilet-wont-flush": "toilet_flapper",
    "door-wont-close": "door_sticking",
    "hole-in-wall": "drywall_small",
    "dripping-faucet": "faucet_drip",
    "dryer-vent-lint": "dryer_vent",
  };
  return (
    PRICES.find((p) => p.id === (guideId ? map[guideId] : undefined)) ?? null
  );
}

export interface DiagnosticParams {
  presetId?: string;
  symptomText: string;
  answers?: Record<string, string>;
  profile?: Partial<HomeProfile>;
  hasPhoto?: boolean;
  safetyFloor?: SafetyTier;
}

function emptyResult(params: DiagnosticParams): DiagnosisResult {
  return {
    diagnosisTitle: "More information needed",
    whatHappened: params.hasPhoto
      ? "Photos are not analyzed in this version. Describe what you can observe from a safe position."
      : "The cause cannot be established from this description. Answer the questions before choosing a repair.",
    severity: "moderate",
    safetyTier: "DIY_CAUTION",
    safetyReason: "A repair has not been established.",
    canDiy: false,
    profileTailoringNote: profileEraAdvice(params.profile),
    toolsNeeded: [],
    steps: [],
    clarifyingQuestions: [
      "Which fixture or appliance is affected, and what exactly is happening?",
      "When did it start, and is there active leaking, heat, smoke, or an alarm?",
    ],
    proQuestions: [],
    estimatedSavingsUsd: 0,
    benchmark: null,
    recommendedGuideSlug: null,
    recommendedDiagram: null,
    engineMode: "verified-rule-engine",
    redLineMatches: [],
  };
}

function blockedResult(
  params: DiagnosticParams,
  tier: SafetyTier,
  reason: string,
): DiagnosisResult {
  const base = emptyResult(params);
  return {
    ...base,
    diagnosisTitle:
      tier === "EMERGENCY"
        ? "Emergency safety stop"
        : "Professional inspection required",
    whatHappened: reason,
    safetyReason: reason,
    safetyTier: tier,
    severity: tier === "EMERGENCY" ? "critical" : "high",
    steps: tier === "EMERGENCY" ? EMERGENCY_STEPS : PRO_STEPS,
    clarifyingQuestions: [],
    proQuestions:
      tier === "EMERGENCY"
        ? []
        : [
            "What caused the issue, and what work is included in the itemized quote?",
          ],
  };
}

/** Deterministic triage. Supplied photos are never interpreted or described as verified. */
export function diagnoseDeterministic(
  params: DiagnosticParams,
): DiagnosisResult {
  const combined = `${params.symptomText} ${Object.entries(params.answers ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(" ")}`;
  const scan = scanText(combined);
  const floor = highestTier([scan.tier, params.safetyFloor]);
  if (floor === "EMERGENCY" || floor === "PRO_REQUIRED") {
    const reason =
      scan.matches.find((match) => match.tier === floor)?.reason ??
      "A previous safety stop remains unresolved. Stay clear and follow the relevant emergency or professional guidance.";
    return {
      ...blockedResult(params, floor, reason),
      redLineMatches: scan.matches.map(({ category, matched, reason }) => ({
        category,
        matched,
        reason,
      })),
    };
  }
  const text = params.symptomText.toLowerCase().replace(/\s+/g, " ").trim();
  const inferred = inferObservationContext(params.symptomText);
  const answers = { ...inferred.answers, ...params.answers };
  const stopValues = new Set([
    "constantly",
    "crusty_oval",
    "water_rising_base",
    "ice_frost",
    "outdoor_buzz",
    "warm_no_fan",
    "large_wet",
  ]);
  for (const [key, value] of Object.entries(inferred.answers))
    if (stopValues.has(value)) answers[key] = value;
  params = {
    ...params,
    presetId: params.presetId ?? inferred.presetId,
    answers,
  };
  // Source conditions take precedence over lower-risk selections, even with incomplete answers.
  if (
    (/\b(?:wall|drywall|ceiling)\b/.test(text) &&
      /\b(?:wet|soft|damp|soggy|saturat\w*|water.damage\w*)\b/.test(text)) ||
    (params.presetId === "hole-in-wall" && answers.size === "large_wet")
  ) {
    return blockedResult(
      params,
      "PRO_REQUIRED",
      "Damp, soft, or extensive wall material needs inspection of the moisture source and structure before any surface work.",
    );
  }
  if (
    (/\btoilet\b/.test(text) &&
      /\b(?:base|floor|bottom|seal)\b/.test(text) &&
      /\b(?:leak\w*|water|wet|pool\w*|drip\w*)\b/.test(text)) ||
    (params.presetId === "toilet-wont-flush" &&
      answers.symptom === "water_rising_base")
  ) {
    return blockedResult(
      params,
      "PRO_REQUIRED",
      "Water at the toilet base has several possible causes. Stop using the toilet and arrange a plumber to inspect the source and floor.",
    );
  }
  if (
    (/\b(?:sink|faucet|pipe|supply|hose)\b/.test(text) &&
      /\b(?:leak\w*|drip\w*)\b/.test(text) &&
      /\b(?:constant\w*|continu\w*|always)\b|\bfaucet\b.{0,25}\b(?:off|closed)\b|\b(?:off|closed)\b.{0,25}\bfaucet\b/.test(
        text,
      )) ||
    (params.presetId === "sink-leaking" &&
      (answers.timing === "constantly" || answers.valve_type === "crusty_oval"))
  ) {
    return blockedResult(
      params,
      "PRO_REQUIRED",
      "A continuous leak or deteriorated valve needs inspection of the pressurized supply. Stop using the fixture and arrange a plumber; drain repair instructions do not apply.",
    );
  }
  const frostText = text.replace(
    /\b(?:no|without)\s+(?:visible\s+)?(?:ice|frost)\b/g,
    "",
  );
  if (
    ((params.presetId === "ac-not-cooling" ||
      /\b(?:ac|hvac|air condition\w*)\b/.test(text)) &&
      /\b(?:ice|frost\w*|frozen)\b/.test(frostText)) ||
    (params.presetId === "ac-not-cooling" &&
      ["ice_frost", "outdoor_buzz", "warm_no_fan"].includes(answers.symptom))
  ) {
    return blockedResult(
      params,
      "PRO_REQUIRED",
      "Ice, frost, unusual outdoor noise, or a full drain pan requires an HVAC professional. Stay clear and do not open or touch equipment.",
    );
  }
  const entities: [string, RegExp][] = [
    ["sink", /\b(?:sink|faucet|p-trap)\b/],
    ["toilet", /\b(?:toilet|flapper)\b/],
    ["ac", /\b(?:ac|hvac|air condition\w*)\b/],
    ["door", /\b(?:door|hinge|latch)\b/],
    ["wall", /\b(?:drywall|wall|ceiling)\b/],
    ["washer", /\b(?:washer|washing machine)\b/],
    ["outlet", /\b(?:outlet|gfci)\b/],
    ["disposal", /\bdisposal\b/],
    ["dryer", /\bdryer\b/],
    ["water-heater", /\bwater heater\b/],
  ];
  if (
    /\b(?:refrigerator|fridge|freezer|oven|microwave|dishwasher|toaster|blender|kettle|boiler|air fryer|sump pump)\b/.test(
      text,
    )
  )
    return emptyResult(params);
  const entityText = text.replace(
    /\bwall(?:-mounted)?\s+(?:shutoff|shut-off|supply|angle[ -]stop)(?:\s+valve)?\b/g,
    "shutoff valve",
  );
  const seen = entities
    .filter(([, pattern]) => pattern.test(entityText))
    .map(([entity]) => entity);
  if (seen.length > 1)
    return {
      ...emptyResult(params),
      clarifyingQuestions: [
        "More than one fixture or system is mentioned. Which single issue should we assess first?",
        "Describe the observations for that fixture without assuming a cause.",
      ],
    };
  const evidence: [string, string, RegExp][] = [
    ["water-heater-check", "water-heater", /\bwater heater\b/],
    [
      "strange-sink-noise",
      "sink",
      /\bsink\b.*\b(?:noise|gurg\w*|whistl\w*|sound)\b|\b(?:gurg\w*|whistl\w*)\b.*\bsink\b/,
    ],
    ["dripping-faucet", "sink", /\bfaucet\b.*\b(?:drip\w*|leak\w*)\b/],
    [
      "sink-leaking",
      "sink",
      /\b(?:sink|p-trap)\b.*\b(?:leak\w*|drip\w*)\b|\b(?:leak\w*|drip\w*)\b.*\bsink\b/,
    ],
    ["toilet-wont-flush", "toilet", /\b(?:toilet|flapper)\b/],
    [
      "ac-not-cooling",
      "ac",
      /\b(?:ac|hvac|air condition\w*)\b.*\b(?:cool\w*|airflow|filter|warm)\b|\b(?:airflow|filter|cool\w*)\b.*\b(?:ac|hvac)\b/,
    ],
    ["door-wont-close", "door", /\b(?:door|hinge|latch)\b/],
    ["hole-in-wall", "wall", /\b(?:hole|dent|patch|drywall)\b/],
    [
      "washer-not-draining",
      "washer",
      /\b(?:washer|washing machine)\b.*\b(?:drain\w*|hose|error|stopped|standing water)\b/,
    ],
    ["dead-gfci-outlet", "outlet", /\b(?:outlet|gfci)\b/],
    ["disposal-humming", "disposal", /\bdisposal\b/],
    ["dryer-vent-lint", "dryer", /\bdryer\b/],
  ];
  let slug = GUIDES.some((g) => g.slug === params.presetId)
    ? params.presetId
    : undefined;
  const chosen = evidence.find(([id]) => id === slug);
  if (
    slug &&
    text &&
    (!chosen ||
      !chosen[2].test(text) ||
      (seen.length === 1 && chosen[1] !== seen[0]))
  )
    return emptyResult(params);
  if (!slug) slug = evidence.find(([, , pattern]) => pattern.test(text))?.[0];
  if (!slug) return emptyResult(params);
  const guide = GUIDES.find((g) => g.slug === slug)!;
  const preset = PROBLEM_PRESETS.find((p) => p.id === slug);
  if (slug === "hole-in-wall") {
    const year = params.profile?.yearBuilt;
    const era = params.profile?.homeEra;
    if (era === "pre1980" || (year !== undefined && year < 1980)) {
      return blockedResult(
        params,
        "PRO_REQUIRED",
        "Older wall finishes need appropriate material assessment before disturbing the surface. Arrange qualified inspection.",
      );
    }
    const knownYear =
      year !== undefined &&
      Number.isFinite(year) &&
      year >= 1980 &&
      year <= new Date().getFullYear() + 1;
    if (!knownYear && era !== "1980_2000" && era !== "post2000") {
      return {
        ...emptyResult(params),
        clarifyingQuestions: [
          "What year or construction era is the home from?",
          "Are the wall material and coating identified as safe to disturb? Do not patch or prepare an unverified surface.",
        ],
      };
    }
  }
  const missing = preset?.clarifyingPrompts.filter(
    (q) => !q.options.some((o) => o.value === params.answers?.[q.id]),
  );
  if (missing?.length)
    return {
      ...emptyResult(params),
      clarifyingQuestions: missing.map((q) => q.question),
    };
  if (Object.values(answers).includes("not_sure")) return emptyResult(params);
  if (slug === "hole-in-wall" && answers.surface !== "known_safe") {
    return {
      ...emptyResult(params),
      clarifyingQuestions: [
        "Have the wall material and coating been identified as safe for a surface patch?",
        "Arrange qualified material assessment before disturbing an unknown finish.",
      ],
    };
  }
  if (
    slug === "sink-leaking" &&
    (answers.timing === "constantly" || answers.valve_type === "crusty_oval")
  ) {
    return blockedResult(
      params,
      "PRO_REQUIRED",
      "A continuous leak or deteriorated valve needs inspection of the pressurized supply. Stop using the fixture and arrange a plumber; the drain repair instructions do not apply.",
    );
  }
  if (slug === "toilet-wont-flush" && answers.symptom === "water_rising_base") {
    return {
      ...blockedResult(
        params,
        "PRO_REQUIRED",
        "Water at the toilet base has several possible causes. Stop using the toilet and arrange a plumber to inspect the seal and floor.",
      ),
      benchmark: PRICES.find((p) => p.id === "toilet_wax_ring") ?? null,
    };
  }
  if (slug === "toilet-wont-flush" && answers.symptom === "runs_constantly")
    return {
      ...emptyResult(params),
      clarifyingQuestions: [
        "Is water reaching the top of the overflow tube, or is the tank level below it?",
        "Does the model-specific flapper sit flat, and is there a visible chain obstruction?",
      ],
    };
  if (
    slug === "hole-in-wall" &&
    (params.profile?.homeEra === "pre1980" ||
      (params.profile?.yearBuilt !== undefined &&
        params.profile.yearBuilt < 1980))
  )
    return blockedResult(
      params,
      "PRO_REQUIRED",
      "Older or unverified wall finishes need appropriate material assessment before disturbing the surface. Arrange qualified inspection.",
    );
  if (slug === "hole-in-wall" && answers.size === "large_wet")
    return blockedResult(
      params,
      "PRO_REQUIRED",
      "Large, damp, or soft wall material needs inspection of the moisture source and structure before any surface work.",
    );
  if (slug === "door-wont-close" && answers.location === "all_around")
    return {
      ...emptyResult(params),
      clarifyingQuestions: [
        "Did the swelling start after moisture or humidity changed?",
        "Are multiple doors affected or are there new cracks? A hinge repair is not established.",
      ],
    };
  if (slug === "ac-not-cooling" && answers.symptom !== "filter_only")
    return blockedResult(
      params,
      "PRO_REQUIRED",
      "A buzzing outdoor unit, blank thermostat, or full drain pan needs an HVAC professional. Do not open equipment covers.",
    );
  if (slug === "water-heater-check")
    return blockedResult(
      params,
      "PRO_REQUIRED",
      "Use a qualified plumber for tank maintenance, unusual sounds, or discharge leaks. Do not adjust controls, operate valves, or drain the tank.",
    );
  // Non-preset cases still need object-specific confirmation before repair instructions.
  if (!preset)
    return {
      ...emptyResult(params),
      clarifyingQuestions: [
        "What is the equipment model and the exact symptom?",
        "Have you checked the manufacturer instructions for this model, and is the area dry and undamaged?",
      ],
    };
  return {
    ...emptyResult(params),
    diagnosisTitle: guide.title,
    whatHappened: guide.summary,
    safetyTier:
      highestTier([guide.safetyTier, params.safetyFloor]) ?? guide.safetyTier,
    safetyReason:
      "Only the limited actions below apply to the selected symptoms. Stop if conditions differ.",
    severity: guide.safetyTier === "DIY_SAFE" ? "low" : "moderate",
    canDiy: isDiyAllowed(guide.safetyTier),
    toolsNeeded: [...guide.toolsNeeded],
    steps: [...guide.steps],
    clarifyingQuestions: [],
    benchmark: buildMatchedBenchmark(slug),
    recommendedGuideSlug: guide.slug,
    recommendedDiagram: guide.diagram,
  };
}

/** Model text is untrusted: scan every field, then rebuild instructions from deterministic authority. */
export function enforceDiagnosisPostGate(
  raw: DiagnosisResult,
  userText: string,
  params?: Omit<DiagnosticParams, "symptomText">,
): DiagnosisResult {
  const baseline = diagnoseDeterministic({ ...params, symptomText: userText });
  const out = scanText(JSON.stringify(raw));
  const floor = highestTier([baseline.safetyTier, out.tier, raw.safetyTier]);
  if (floor === "EMERGENCY" || floor === "PRO_REQUIRED") {
    const result = blockedResult(
      { ...params, symptomText: userText },
      floor,
      out.matches[0]?.reason ?? baseline.safetyReason,
    );
    return {
      ...result,
      redLineMatches: [
        ...baseline.redLineMatches,
        ...out.matches.map(({ category, matched, reason }) => ({
          category,
          matched,
          reason,
        })),
      ],
    };
  }
  return {
    ...baseline,
    safetyTier: floor ?? baseline.safetyTier,
    severity: floor === "DIY_CAUTION" ? "moderate" : baseline.severity,
  };
}
