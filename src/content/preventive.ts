import { deriveHomeEra, type HomeProfile } from "@/lib/homeStore";

export type Cadence =
  "Monthly" | "Every 3 Months" | "Every 6 Months" | "Annual";
export type Season = "Spring" | "Summer" | "Fall" | "Winter";

export interface PreventiveTask {
  id: string;
  title: string;
  cadence: Cadence;
  season: Season;
  minutes: number;
  preventedBreakdownCost: number;
  whyItMatters: string;
  quickSteps: string[];
  linkedGuideSlug?: string;
  /** Empty means applicable to every home; otherwise requires any matching condition */
  houseOnly?: boolean;
  requiresAppliances?: HomeProfile["appliances"];
  eraHighlight?: Record<HomeProfile["homeEra"], string>;
}

export const PREVENTIVE_TASKS: PreventiveTask[] = [
  {
    id: "prev_hvac_filter",
    title: "Check & replace HVAC air filter",
    cadence: "Monthly",
    season: "Winter",
    minutes: 4,
    preventedBreakdownCost: 350,
    whyItMatters:
      "A clogged filter starves airflow, freezes AC evaporator coils in summer, and overheats gas furnace heat exchangers in winter.",
    quickSteps: [
      "Switch the system off using its normal controls and follow the manufacturer instructions for safe filter access. Do not open electrical or equipment service panels.",
      "Check the exact size, type, and filtration rating specified by the equipment manufacturer; replace only a user-accessible filter with a compatible one.",
      "Match the printed airflow direction. If unsure about fit or access, ask an HVAC professional.",
    ],
    linkedGuideSlug: "ac-not-cooling",
    requiresAppliances: ["central_hvac"],
  },
  {
    id: "prev_gfci_test",
    title: "Press TEST / RESET on bathroom & kitchen GFCI outlets",
    cadence: "Monthly",
    season: "Spring",
    minutes: 3,
    preventedBreakdownCost: 190,
    whyItMatters:
      "GFCI outlets protect wet zones against fatal shock; internal trip springs wear out silently unless tested monthly.",
    quickSteps: [
      "Only test a dry, undamaged, safely accessible outlet using the manufacturer test/reset instructions. Do not remove covers.",
      "If it does not test and reset normally, or if it is hot, damaged, or wet, stop using it and arrange an electrician inspection.",
    ],
    linkedGuideSlug: "dead-gfci-outlet",
  },
  {
    id: "prev_disposal_clean",
    title: "Visually inspect the disposal cabinet for leaks",
    cadence: "Monthly",
    season: "Summer",
    minutes: 4,
    preventedBreakdownCost: 185,
    whyItMatters:
      "Detects early weeping at the bottom housing seal before cabinet bottoms rot and keeps impellers free of grease buildup.",
    quickSteps: [
      "With the disposal off, look at the cabinet floor from a dry position. Keep hands and objects out of the disposal.",
      "If you see moisture, stop using the disposal and arrange service. Follow manufacturer cleaning instructions only.",
    ],
    linkedGuideSlug: "disposal-humming",
    requiresAppliances: ["garbage_disposal"],
  },
  {
    id: "prev_plumbing_tissue",
    title: "Visually inspect accessible plumbing for moisture",
    cadence: "Every 3 Months",
    season: "Spring",
    minutes: 6,
    preventedBreakdownCost: 480,
    whyItMatters:
      "Braided supply lines and PVC P-trap slip nuts fail slowly at first; catching a pinhead drip early prevents warped vanity wood and subfloor mold.",
    quickSteps: [
      "Look for moisture below accessible sinks and around toilet bases from a dry safe position. Do not disturb valves, fittings, or connections.",
      "Record visible moisture and arrange a plumber inspection. Avoid using a leaking fixture.",
    ],
    linkedGuideSlug: "sink-leaking",
    eraHighlight: {
      pre1980:
        "Pre-1980 home note: Inspect oval multi-turn brass angle-stops gently—do not force stiff valves.",
      "1980_2000":
        "1980–2000 home note: Check for green calcium crust around chrome compression stops and braided line ferrules.",
      post2000:
        "Post-2000 home note: Check PEX manifold fittings and hand-tight plastic P-trap nuts for hairline cracks.",
    },
  },
  {
    id: "prev_washer_hoses",
    title: "Visually inspect accessible washer hoses",
    cadence: "Every 3 Months",
    season: "Fall",
    minutes: 8,
    preventedBreakdownCost: 650,
    whyItMatters:
      "Visible hose wear or moisture can be an early reason to arrange service before a leak worsens.",
    quickSteps: [
      "Look at visible hoses without moving the machine or disturbing connections.",
      "If you see bulging, cracks, or moisture, stop using the washer and arrange service. Consult the manufacturer maintenance schedule.",
    ],
    linkedGuideSlug: "washer-not-draining",
    requiresAppliances: ["washer_dryer"],
  },
  {
    id: "prev_dryer_lint",
    title: "Observe the exterior dryer vent from ground level",
    cadence: "Every 3 Months",
    season: "Winter",
    minutes: 10,
    preventedBreakdownCost: 240,
    whyItMatters:
      "A ground-level exterior observation can reveal a blocked or damaged outlet. Clean the accessible lint screen before each load and follow the dryer manual; that separate routine does not complete this quarterly exterior check.",
    quickSteps: [
      "From a dry, safe position at ground level, visually check the exterior dryer vent outlet for visible obstruction or damage without touching the duct or moving the dryer.",
      "If the outlet is blocked, damaged, or cannot be observed safely from ground level, arrange qualified professional service. Do not use ladders, move the dryer, or disturb its connections.",
    ],
    linkedGuideSlug: "dryer-vent-lint",
    requiresAppliances: ["washer_dryer"],
  },
  {
    id: "prev_smoke_co_test",
    title: "Check accessible alarm test instructions and replacement dates",
    cadence: "Every 6 Months",
    season: "Fall",
    minutes: 5,
    preventedBreakdownCost: 300,
    whyItMatters:
      "Alarm testing and replacement schedules depend on the manufacturer and model.",
    quickSteps: [
      "Follow the manufacturer test-button instructions only if the alarm is safely accessible. Arrange help for overhead or inaccessible alarms.",
      "Check recorded model and replacement dates without removing electrical covers. If an alarm is sounding unexpectedly, leave and follow local emergency guidance.",
    ],
  },
  {
    id: "prev_gutter_downspout",
    title: "Inspect gutters and downspouts from ground level",
    cadence: "Every 6 Months",
    season: "Fall",
    minutes: 10,
    preventedBreakdownCost: 1200,
    whyItMatters:
      "Overflowing gutters dump roof runoff straight against basement/slab footings, accelerating fascia rot and foundation settling.",
    quickSteps: [
      "From dry ground, look for gutter overflow, sagging, or visible debris without approaching overhead lines.",
      "Check visible downspout outlets for pooling near the home. Arrange professional service for blocked or inaccessible gutters.",
    ],
    houseOnly: true,
  },
  {
    id: "prev_ac_drain_line",
    title: "Visually check accessible AC drain area",
    cadence: "Every 6 Months",
    season: "Summer",
    minutes: 8,
    preventedBreakdownCost: 275,
    whyItMatters:
      "Algae slime clogs 3/4-inch PVC condensate drains every June, tripping float switches or overflowing hallway ceiling pans.",
    quickSteps: [
      "From a dry position, look for visible water around the indoor unit without opening covers.",
      "If there is standing water or a blocked drain, stop cooling using the normal thermostat control and arrange service. Do not add chemicals or open the drain system.",
    ],
    linkedGuideSlug: "ac-not-cooling",
    requiresAppliances: ["central_hvac"],
  },
  {
    id: "prev_water_heater_annual",
    title: "Ground-level water heater visual check and service review",
    cadence: "Annual",
    season: "Winter",
    minutes: 5,
    preventedBreakdownCost: 900,
    whyItMatters:
      "A visual check can identify visible moisture or damage that needs a qualified plumber inspection.",
    quickSteps: [
      "From a dry safe position, look for visible moisture or damage without touching the tank, controls, pipes, or valves.",
      "Keep the relief discharge unobstructed. Arrange manufacturer-recommended maintenance with a qualified plumber; do not operate valves or drain the tank.",
    ],
    linkedGuideSlug: "water-heater-check",
    requiresAppliances: ["tank_water_heater"],
  },
  {
    id: "prev_exterior_caulk",
    title: "Inspect ground-level hose bibs and exterior seals",
    cadence: "Annual",
    season: "Fall",
    minutes: 20,
    preventedBreakdownCost: 550,
    whyItMatters:
      "A garden hose left connected through one hard freeze splits the copper sillcock inside your wall unnoticed until spring thaw.",
    quickSteps: [
      "Review the manufacturer winterization instructions for your installed hose bib. Disconnect a garden hose only if the tap is off, accessible, and undamaged.",
      "Look from ground level for damaged exterior seals. Arrange help if access or the correct material is uncertain.",
    ],
    houseOnly: true,
  },
  {
    id: "prev_main_shutoff_drill",
    title: "Locate and label the home water shutoff",
    cadence: "Annual",
    season: "Spring",
    minutes: 5,
    preventedBreakdownCost: 1500,
    whyItMatters:
      "Knowing the location of the home water shutoff helps you describe it to emergency responders or a plumber.",
    quickSteps: [
      "Identify the water shutoff location from building records or with a plumber. Keep access clear and label it.",
      "Do not exercise an unknown, corroded, leaking, or stiff valve. Ask a plumber to check its operation.",
    ],
    linkedGuideSlug: "sink-leaking",
  },
];

export function filterTasksForProfile(
  profile: HomeProfile,
  profileConfigured = true,
): PreventiveTask[] {
  const era = profile.homeEra || deriveHomeEra(profile.yearBuilt);
  return PREVENTIVE_TASKS.filter((task) => {
    if (task.houseOnly && profile.housingType === "apartment") return false;
    if (task.requiresAppliances && task.requiresAppliances.length > 0) {
      const hasAny = task.requiresAppliances.some((req) =>
        profile.appliances.includes(req),
      );
      if (!hasAny) return false;
    }
    return true;
  }).map((t) => ({
    ...t,
    whyItMatters: profileConfigured && t.eraHighlight?.[era]
      ? `${t.whyItMatters} ${t.eraHighlight[era]}`
      : t.whyItMatters,
  }));
}
