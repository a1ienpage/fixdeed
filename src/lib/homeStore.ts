import { GUIDES } from "@/content/guides";
import { z } from "zod";
import { filterTasksForProfile } from "@/content/preventive";
import { getMaintenanceCoverage } from "@/lib/scheduling";

export type HousingType = "house" | "apartment" | "townhome";
export type HomeEra = "pre1980" | "1980_2000" | "post2000";
export type HvacType =
  | "central_ac_gas"
  | "heat_pump"
  | "window_mini_split"
  | "radiator_no_ac";
export type PlanTier = "free" | "plus" | "family";

export type ApplianceId =
  | "tank_water_heater"
  | "tankless_water_heater"
  | "dishwasher"
  | "washer_dryer"
  | "garbage_disposal"
  | "central_hvac";

export interface HomeProfile {
  homeName: string;
  housingType: HousingType;
  yearBuilt: number;
  homeEra: HomeEra;
  bedrooms: number;
  bathrooms: number;
  hvacType: HvacType;
  appliances: ApplianceId[];
  pastIssues: string[];
  planTier: PlanTier;
}

export interface RepairLogEntry {
  id: string;
  date: string;
  title: string;
  category: "Plumbing" | "Electrical Basics" | "Appliances" | "General & Walls";
  outcome: "diy_fixed" | "pro_routed";
  proEstimate: number;
  diySpent: number;
  savedAmount: number;
  guideSlug?: string;
  confirmationId?: string;
}

export interface UnlockedSkill {
  id: string;
  title: string;
  category:
    | "Plumbing Basics"
    | "Wall & Door Repair"
    | "Appliance Maintenance"
    | "Electrical & Safety Triage";
  unlockedAt: string;
}

export interface FixdeedState {
  dataMode: "personal" | "demo";
  profileConfigured: boolean;
  profile: HomeProfile;
  repairHistory: RepairLogEntry[];
  completedPreventive: Record<string, string>; // taskId -> YYYY-MM-DD
  unlockedSkills: UnlockedSkill[];
  diagnosticsRun: number;
}

export function deriveHomeEra(year: number): HomeEra {
  if (year < 1980) return "pre1980";
  if (year <= 2000) return "1980_2000";
  return "post2000";
}

export const APPLIANCE_LABELS: Record<ApplianceId, string> = {
  tank_water_heater: "Tank Water Heater",
  tankless_water_heater: "Tankless Water Heater",
  dishwasher: "Dishwasher",
  washer_dryer: "Washer & Dryer",
  garbage_disposal: "Garbage Disposal",
  central_hvac: "Central HVAC Air Handler",
};

export const HVAC_LABELS: Record<HvacType, string> = {
  central_ac_gas: "Central AC + Gas Furnace",
  heat_pump: "Electric Heat Pump",
  window_mini_split: "Mini-Split / Window AC",
  radiator_no_ac: "Radiators / Baseboard Heat",
};

export const DEMO_STATE: FixdeedState = {
  dataMode: "demo",
  profileConfigured: true,
  profile: {
    homeName: "1994 Oakridge Craftsman",
    housingType: "house",
    yearBuilt: 1994,
    homeEra: "1980_2000",
    bedrooms: 3,
    bathrooms: 2,
    hvacType: "central_ac_gas",
    appliances: [
      "tank_water_heater",
      "dishwasher",
      "washer_dryer",
      "garbage_disposal",
      "central_hvac",
    ],
    pastIssues: ["Slow bathroom sink drain", "Running hall toilet"],
    planTier: "plus",
  },
  repairHistory: [
    {
      id: "rep_seed_1",
      date: "2026-10-12",
      title: "Replaced worn hall toilet flapper (stopped phantom refills)",
      category: "Plumbing",
      outcome: "diy_fixed",
      proEstimate: 165,
      diySpent: 12,
      savedAmount: 153,
      guideSlug: "toilet-wont-flush",
    },
    {
      id: "rep_seed_2",
      date: "2026-10-28",
      title: "Tightened loose interior bedroom hinge + long strike screws",
      category: "General & Walls",
      outcome: "diy_fixed",
      proEstimate: 215,
      diySpent: 8,
      savedAmount: 207,
      guideSlug: "door-wont-close",
    },
    {
      id: "rep_seed_3",
      date: "2026-11-03",
      title: "Cleaned front-load washer coin trap filter before calling tech",
      category: "Appliances",
      outcome: "diy_fixed",
      proEstimate: 195,
      diySpent: 0,
      savedAmount: 195,
      guideSlug: "washer-not-draining",
    },
  ],
  completedPreventive: {
    prev_hvac_filter: "2026-11-01",
    prev_smoke_co_test: "2026-10-15",
    prev_gfci_test: "2026-11-02",
  },
  unlockedSkills: [
    {
      id: "toilet-wont-flush",
      title: "Toilet Tank & Flapper Anatomy",
      category: "Plumbing Basics",
      unlockedAt: "2026-10-12",
    },
    {
      id: "door-wont-close",
      title: "Door Hinge Alignment & Anchoring",
      category: "Wall & Door Repair",
      unlockedAt: "2026-10-28",
    },
    {
      id: "washer-not-draining",
      title: "Appliance Drain & Coin-Trap Triage",
      category: "Appliance Maintenance",
      unlockedAt: "2026-11-03",
    },
  ],
  diagnosticsRun: 2,
};

export const DEFAULT_STATE: FixdeedState = {
  dataMode: "personal",
  profileConfigured: false,
  profile: {
    homeName: "My home",
    housingType: "house",
    yearBuilt: 2000,
    homeEra: "1980_2000",
    bedrooms: 1,
    bathrooms: 1,
    hvacType: "central_ac_gas",
    appliances: [],
    pastIssues: [],
    planTier: "free",
  },
  repairHistory: [],
  completedPreventive: {},
  unlockedSkills: [],
  diagnosticsRun: 0,
};

export function localDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T12:00:00`);
    return Number.isFinite(date.getTime()) && localDate(date) === value;
  });
const nonnegative = z.number().finite().nonnegative();
export const HomeProfileSchema = z.object({
  homeName: z.string().trim().min(1).max(100),
  housingType: z.enum(["house", "apartment", "townhome"]),
  yearBuilt: z
    .number()
    .int()
    .min(1600)
    .max(new Date().getFullYear() + 1),
  homeEra: z.enum(["pre1980", "1980_2000", "post2000"]),
  bedrooms: z.number().int().min(0).max(100),
  bathrooms: z.number().min(0).max(100),
  hvacType: z.enum([
    "central_ac_gas",
    "heat_pump",
    "window_mini_split",
    "radiator_no_ac",
  ]),
  appliances: z
    .array(
      z.enum([
        "tank_water_heater",
        "tankless_water_heater",
        "dishwasher",
        "washer_dryer",
        "garbage_disposal",
        "central_hvac",
      ]),
    )
    .max(6),
  pastIssues: z.array(z.string().max(500)).max(100),
  planTier: z.enum(["free", "plus", "family"]),
});
export const RepairLogEntrySchema = z.object({
  id: z.string().min(1),
  date: dateString,
  title: z.string().trim().min(1).max(300),
  category: z.enum([
    "Plumbing",
    "Electrical Basics",
    "Appliances",
    "General & Walls",
  ]),
  outcome: z.enum(["diy_fixed", "pro_routed"]),
  proEstimate: nonnegative,
  diySpent: nonnegative,
  savedAmount: nonnegative,
  guideSlug: z.string().max(100).optional(),
  confirmationId: z.string().trim().min(1).max(200).optional(),
});
export const FixdeedStateSchema = z
  .object({
    dataMode: z.enum(["personal", "demo"]),
    profileConfigured: z.boolean(),
    profile: HomeProfileSchema,
    repairHistory: z.array(RepairLogEntrySchema),
    completedPreventive: z.record(z.string(), dateString),
    unlockedSkills: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        category: z.enum([
          "Plumbing Basics",
          "Wall & Door Repair",
          "Appliance Maintenance",
          "Electrical & Safety Triage",
        ]),
        unlockedAt: dateString,
      }),
    ),
    diagnosticsRun: z.number().int().nonnegative(),
  })
  .superRefine((state, ctx) => {
    if (
      state.dataMode === "personal" &&
      state.repairHistory.some((r) => !r.confirmationId)
    )
      ctx.addIssue({
        code: "custom",
        message: "Personal repair entries require confirmation.",
      });
    const ids = state.repairHistory
      .map((r) => r.confirmationId)
      .filter(Boolean);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: "custom",
        message: "Duplicate repair confirmations.",
      });
  })
  .transform((state) => ({
    ...state,
    profile: {
      ...state.profile,
      homeEra: deriveHomeEra(state.profile.yearBuilt),
    },
    repairHistory: state.repairHistory.map((r) => ({
      ...r,
      savedAmount:
        r.outcome === "diy_fixed" ? Math.max(0, r.proEstimate - r.diySpent) : 0,
    })),
  }));

/** Compatibility alias: now schedule coverage only, never a physical condition assessment. */
export function calculateHomeHealthScore(
  state: FixdeedState,
  _applicableTaskCount: number,
): number {
  return getMaintenanceCoverage(
    filterTasksForProfile(state.profile),
    state.completedPreventive,
  );
}

export function calculateSavingsSummary(
  state: FixdeedState,
  _ignoredPreventedCost = 0,
  currentYearMonth = localDate().slice(0, 7),
) {
  const personalRecords =
    state.dataMode === "personal"
      ? state.repairHistory.filter((r) => Boolean(r.confirmationId))
      : state.repairHistory;
  const amount = (r: RepairLogEntry) =>
    r.outcome === "diy_fixed" &&
    Number.isFinite(r.proEstimate) &&
    Number.isFinite(r.diySpent) &&
    r.proEstimate >= 0 &&
    r.diySpent >= 0
      ? Math.max(0, r.proEstimate - r.diySpent)
      : 0;
  return {
    savedThisMonth: personalRecords
      .filter((r) => r.date.startsWith(currentYearMonth + "-"))
      .reduce((s, r) => s + amount(r), 0),
    savedThisYear: personalRecords
      .filter((r) => r.date.startsWith(currentYearMonth.slice(0, 4) + "-"))
      .reduce((s, r) => s + amount(r), 0),
    totalDiyOutlay: personalRecords.reduce(
      (s, r) =>
        s + (Number.isFinite(r.diySpent) && r.diySpent >= 0 ? r.diySpent : 0),
      0,
    ),
    preventedRiskValue: 0,
  };
}

/** Pure record reducer: caller supplies explicit confirmation and observed costs. */
export function addConfirmedRepair(
  state: FixdeedState,
  entry: Omit<RepairLogEntry, "id" | "date">,
  now = new Date(),
): FixdeedState | null {
  const result = RepairLogEntrySchema.safeParse({
    ...entry,
    id: `rep_${entry.confirmationId ?? ""}`,
    date: localDate(now),
  });
  if (
    !result.success ||
    !result.data.confirmationId ||
    state.repairHistory.some(
      (r) => r.confirmationId === result.data.confirmationId,
    )
  )
    return null;
  const full = {
    ...result.data,
    savedAmount:
      result.data.outcome === "diy_fixed"
        ? Math.max(0, result.data.proEstimate - result.data.diySpent)
        : 0,
  };
  return { ...state, repairHistory: [full, ...state.repairHistory] };
}

export interface SkillDomainProgress {
  category: UnlockedSkill["category"];
  unlocked: number;
  target: number;
  pct: number;
}

export function calculateSkillProgress(
  state: FixdeedState,
): SkillDomainProgress[] {
  const categories: UnlockedSkill["category"][] = [
    "Plumbing Basics",
    "Wall & Door Repair",
    "Appliance Maintenance",
    "Electrical & Safety Triage",
  ];
  return categories.map((category) => {
    const catalog = GUIDES.filter((guide) => guide.skillCategory === category);
    const target = catalog.length;
    const awardedIds = new Set(state.unlockedSkills.map((skill) => skill.id));
    const unlocked = catalog.filter((guide) =>
      awardedIds.has(guide.slug),
    ).length;
    return {
      category,
      unlocked,
      target,
      pct: target ? Math.min(100, Math.round((unlocked / target) * 100)) : 0,
    };
  });
}
