import { getGuideBySlug, type QuizQuestion } from "@/content/guides";

const scenarios: Record<string, [string, string, string, string]> = {
  "sink-leaking": [
    "You dried a cabinet, left the faucet unused overnight, and find fresh droplets on a supply hose by morning. Which plan applies?",
    "Stop using the fixture and arrange inspection of the pressurized supply.",
    "Use the drain trap repair steps because all cabinet leaks come from the drain.",
    "A leak that continues without draining water needs a supply-side inspection; drain repair instructions do not apply.",
  ],
  "toilet-wont-flush": [
    "The tank parts look normal, but a towel placed around the toilet base becomes wet after use. What should you do?",
    "Stop using the toilet and request a plumber inspection of the base and floor.",
    "Replace the tank flapper to repair the floor seal.",
    "Water at the floor is a different symptom from a tank flapper issue. The source and floor condition need inspection.",
  ],
  "ac-not-cooling": [
    "After fitting a filter, airflow is still poor and you notice ice returning on the indoor pipe. What next?",
    "Stop cooling and arrange HVAC service without opening equipment covers.",
    "Keep running cooling for several hours to melt the ice.",
    "Recurring ice can have causes beyond a dirty filter and needs professional diagnosis.",
  ],
  "door-wont-close": [
    "Three doors suddenly stick after a nearby wall develops a new diagonal crack. Which response fits?",
    "Arrange an inspection of the building movement before adjusting the doors.",
    "Plane the edges of every door immediately.",
    "A sudden change across multiple doors and a new crack can indicate movement rather than a single loose hinge.",
  ],
  "hole-in-wall": [
    "A dry-looking wall patch softens and discolors again a week after repair. What is the best next step?",
    "Have the moisture source inspected before attempting another surface repair.",
    "Add a thicker coat of compound to seal the stain.",
    "Recurring dampness calls for inspection of its source before patching.",
  ],
  "washer-not-draining": [
    "Your washer has no user-serviceable drain filter listed in its manual. It holds water and the hose is visible without moving it. What is safe?",
    "Record the error code and request service; leave internal panels in place.",
    "Remove the back cover to look for a hidden filter.",
    "Only access parts the manufacturer identifies as user-serviceable. Standing water and internal electrical components require caution.",
  ],
  "dripping-faucet": [
    "You cannot identify the cartridge for an unfamiliar faucet model. Which choice avoids a mismatched repair?",
    "Find the model and manufacturer instructions before ordering or opening anything.",
    "Install any cartridge that looks roughly the same size.",
    "Cartridges and isolation procedures vary by model. Identification comes before disassembly.",
  ],
  "dead-gfci-outlet": [
    "A dry, undamaged outlet remains dead after one reset, and another occupant reports an intermittent burning odor. What now?",
    "Stop using the circuit and have a qualified electrician inspect it.",
    "Keep pressing reset until power returns.",
    "An odor or repeated failure overrides ordinary reset troubleshooting. Active smoke, heat, or fire requires emergency assistance.",
  ],
  "disposal-humming": [
    "A disposal is hardwired, and you cannot reliably identify its isolating circuit. It is jammed. What is the safe decision?",
    "Leave it off and request service; do not put tools into the unit.",
    "The wall switch is enough isolation to work inside.",
    "A wall switch alone is not verified isolation, and hands must stay out of the chamber.",
  ],
  "dryer-vent-lint": [
    "The outside dryer outlet is above an inaccessible upper window. How should you maintain it?",
    "Clean the accessible lint screen and arrange professional vent service.",
    "Lean out the window to pull lint from the outlet.",
    "Exterior access must be safe from ground level; inaccessible vent work needs suitable professional equipment.",
  ],
  "water-heater-check": [
    "You find droplets beneath the water heater relief discharge pipe during a routine visual check. What next?",
    "Keep clear, leave the discharge unobstructed, and arrange a plumber inspection.",
    "Plug the discharge opening to stop the dripping.",
    "The relief discharge must remain open. A qualified plumber must identify the cause of discharge.",
  ],
  "strange-sink-noise": [
    "The kitchen sink starts bubbling whenever the washer drains, although the sink itself empties normally. What is a safe next step?",
    "Arrange a drain professional inspection of the shared drainage system.",
    "Replace the faucet aerator to repair the shared drain.",
    "A symptom triggered by another fixture suggests a shared drainage issue rather than a faucet component.",
  ],
};

export function getTransferCase(slug: string): QuizQuestion {
  const scenario = scenarios[slug];
  if (!scenario || !getGuideBySlug(slug))
    return {
      id: "unknown",
      prompt: "Choose a supported guide first.",
      options: [],
      correctId: "",
      explanation: "No assessment is available for this guide.",
    };
  const options = [
    { id: `${slug}_safe`, label: scenario[1] },
    { id: `${slug}_unsafe`, label: scenario[2] },
  ];
  if (Object.keys(scenarios).indexOf(slug) % 2 === 1) options.reverse();
  return {
    id: `transfer_${slug}`,
    prompt: scenario[0],
    options,
    correctId: `${slug}_safe`,
    explanation: scenario[3],
  };
}
