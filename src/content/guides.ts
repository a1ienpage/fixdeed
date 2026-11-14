import type { SafetyTier } from "@/lib/safetyGate";
import type { UnlockedSkill } from "@/lib/homeStore";

export type GuideCategory =
  "Plumbing" | "Electrical Basics" | "Appliances" | "General & Walls";

export type DiagramKind =
  | "sink-ptrap"
  | "toilet-tank"
  | "faucet"
  | "hvac-airflow"
  | "drywall-wall"
  | "water-heater";

export interface AnatomyPart {
  id: string;
  label: string;
  role: string;
  failureSign: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctId: string;
  explanation: string;
}

export interface RepairGuide {
  slug: string;
  title: string;
  shortProblem: string;
  category: GuideCategory;
  skillCategory: UnlockedSkill["category"];
  skillUnlockedTitle: string;
  safetyTier: SafetyTier;
  minutes: number;
  proLow: number;
  proHigh: number;
  diyParts: number;
  sourceUrl: string;
  image: string;
  diagram: DiagramKind;
  summary: string;
  howItWorks: string;
  partsAnatomy: AnatomyPart[];
  whyItHappens: string;
  toolsNeeded: string[];
  rookieMistake: string;
  steps: string[];
  quiz: [QuizQuestion, QuizQuestion];
}

export const GUIDES: RepairGuide[] = [
  {
    slug: "sink-leaking",
    title: "Sink drain leak: inspect an accessible P-trap",
    shortProblem: "My sink is leaking.",
    category: "Plumbing",
    skillCategory: "Plumbing Basics",
    skillUnlockedTitle: "Under-Sink P-Trap & Angle-Stop Mastery",
    safetyTier: "DIY_SAFE",
    minutes: 25,
    proLow: 100,
    proHigh: 275,
    diyParts: 10,
    sourceUrl: "https://homeguide.com/costs/cost-to-unclog-snake-a-drain",
    image: "/images/hero-sink-repair.png",
    diagram: "sink-ptrap",
    summary:
      "A leak only while draining may involve an accessible drain connection. Confirm the source before touching a fitting; continuous supply leaks need a plumber.",
    howItWorks:
      "Two separate water paths meet under your sink: pressurized hot (left) and cold (right) braided supply lines bringing 50–60 PSI water up to the faucet, and a gravity-fed U-shaped P-trap holding a 2-inch standing water plug to block sewer gas.",
    partsAnatomy: [
      {
        id: "angle_stop",
        label: "Angle-Stop Shutoff Valve",
        role: "Isolates water to this sink alone (cold on right, hot on left).",
        failureSign:
          "Water beads continuously even when faucet is off; stiff oval valves in pre-2000 homes can weep.",
      },
      {
        id: "braided_line",
        label: "Braided Stainless Supply Hose",
        role: "Carries pressurized water via a rubber cone washer inside each brass nut.",
        failureSign:
          "Wet sheen running down mesh or rust at crimp collar (NEVER wrap PTFE tape on these threads).",
      },
      {
        id: "p_trap",
        label: "U-Shaped PVC P-Trap & Slip Nuts",
        role: "Locks out sewer gas while funneling waste water to the wall arm.",
        failureSign: "Drips ONLY while faucet runs or cabinet basin drains.",
      },
      {
        id: "bevel_washer",
        label: "Tapered Nylon Slip-Joint Washer",
        role: "Wedges into the flared mouth of the P-trap when the slip nut turns.",
        failureSign:
          "Put in upside-down (bevel facing up) or hair-crusted—causes immediate weeping at joints.",
      },
    ],
    whyItHappens:
      "Cabinet bumping knocks plastic slip nuts loose by 1/8 turn, cleaning bottles hit thin tubular washers, or novices wrap Teflon tape onto rubber-gasketed compression threads so the nut cannot seat.",
    toolsNeeded: [
      "Dry collection tray",
      "Towels",
      "Compatible manufacturer-specified drain washers, if needed",
    ],
    rookieMistake:
      "Attempting drain repair when the water comes from the supply, a corroded fitting, or a hidden location.",
    steps: [
      "Stop using the sink and dry the cabinet. Only proceed with an accessible plastic slip-joint drain if you have identified the leak there and no chemical cleaner has been used.",
      "Place a collection tray under the drain. Follow the fitting manufacturer instructions for checking and reseating compatible slip-joint washers; do not loosen supply connections or force a corroded fitting.",
      "Reassemble by hand following the fitting instructions. Test briefly with a small amount of water and stop using the sink if any leak remains.",
    ],
    quiz: [
      {
        id: "knowledge_sink-leaking_1",
        prompt:
          "Which leak timing is more consistent with the sink drain path than the pressurized supply?",
        options: [
          {
            id: "a",
            label: "A drip appears only while water empties from the basin.",
          },
          {
            id: "b",
            label:
              "Fresh droplets appear overnight while the faucet stays unused.",
          },
        ],
        correctId: "a",
        explanation:
          "The drain path carries water while the basin empties. A leak while the fixture is unused needs a different supply-side assessment.",
      },
      {
        id: "knowledge_sink-leaking_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "toilet-wont-flush",
    title: "Toilet tank: chain and compatible flapper checks",
    shortProblem: "My toilet won't flush.",
    category: "Plumbing",
    skillCategory: "Plumbing Basics",
    skillUnlockedTitle: "Toilet Tank & Flapper Anatomy",
    safetyTier: "DIY_SAFE",
    minutes: 25,
    proLow: 110,
    proHigh: 250,
    diyParts: 18,
    sourceUrl: "https://homeguide.com/costs/toilet-repair-cost",
    image: "/images/hero-sink-repair.png",
    diagram: "toilet-tank",
    summary:
      "A loose handle may involve a detached chain. Recurring tank refills have several causes; observe the tank before choosing a part. A base leak needs a plumber.",
    howItWorks:
      "The handle and chain lift a model-specific tank seal to release water. The separate fill valve refills the tank; these parts have different failure modes.",
    partsAnatomy: [
      {
        id: "flapper",
        label: "Rubber Flapper & Flush Seat",
        role: "Seals stored tank water until the chain lifts it.",
        failureSign:
          "Ghost-refilling every 10–15 minutes; blue food coloring in tank tints bowl within 15 minutes.",
      },
      {
        id: "chain",
        label: "Lift Chain & Flush Lever",
        role: "Connects handle arm to flapper.",
        failureSign:
          'Unhooked or >2" excess slack wedges under flapper; zero slack holds flapper cracked open.',
      },
      {
        id: "fill_valve",
        label: "Fill Valve & Float Cup",
        role: "Refills tank cleanly after flushing and stops at target waterline.",
        failureSign:
          "Hisses nonstop past the overflow tube rim or takes 5 minutes to refill.",
      },
      {
        id: "overflow_tube",
        label: "Vertical Overflow Tube",
        role: "Built-in flood guard funneling excess fill water into the bowl.",
        failureSign:
          "Water continuously cascading over its rim requires float adjustment or a $14 fill-valve swap.",
      },
    ],
    whyItHappens:
      "A detached chain, damaged seal, or fill-control problem may cause different symptoms. Identify the affected part before attempting a change.",
    toolsNeeded: [
      "Toilet manufacturer instructions",
      "Towel for the tank lid",
      "Exact compatible flapper only if its condition is established",
    ],
    rookieMistake:
      "Treating every toilet problem as a flapper failure or disturbing the pressurized fill valve.",
    steps: [
      "Place the tank lid carefully on a folded towel, and observe the chain without disturbing the supply or fill valve. If the lid is heavy or awkward, arrange help.",
      "For a clearly detached chain, follow the model instructions to reattach it with the specified slack. Do not adjust or remove the pressurized fill valve.",
      "If a damaged flapper is confirmed, use only the model-specific replacement procedure and an accessible, known working shutoff. Stop if the valve is stiff, corroded, leaking, or does not isolate the water. Arrange a plumber if symptoms persist.",
    ],
    quiz: [
      {
        id: "knowledge_toilet-wont-flush_1",
        prompt:
          "Which observation points to the toilet handle-to-flapper connection rather than the floor seal?",
        options: [
          {
            id: "a",
            label: "Water appears around the toilet base after use.",
          },
          {
            id: "b",
            label:
              "The handle moves but a visibly detached chain does not lift the flapper.",
          },
        ],
        correctId: "b",
        explanation:
          "The chain connects the tank handle to the flapper. Water at the floor is a separate symptom and needs inspection rather than a tank-part assumption.",
      },
      {
        id: "knowledge_toilet-wont-flush_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "ac-not-cooling",
    title: "AC airflow: check a user-accessible filter",
    shortProblem: "My AC isn't cooling.",
    category: "Appliances",
    skillCategory: "Appliance Maintenance",
    skillUnlockedTitle: "Airflow & Safe HVAC Triage",
    safetyTier: "DIY_CAUTION",
    minutes: 20,
    proLow: 150,
    proHigh: 400,
    diyParts: 20,
    sourceUrl: "https://homeguide.com/costs/ac-capacitor-replacement-cost",
    image: "/images/hvac-filter-check.png",
    diagram: "hvac-airflow",
    summary:
      "A dirty filter may restrict airflow. A filter check does not establish the cause of poor cooling. Persistent problems, ice, unusual noise, or moisture need an HVAC professional.",
    howItWorks:
      'Your indoor air handler pulls warm house air through a filter and across an ice-cold evaporator coil, dumping humidity out a 3/4" PVC drain pipe while an outdoor condenser unit rejects heat into outdoor air.',
    partsAnatomy: [
      {
        id: "user_access",
        label: "Manufacturer-defined user access",
        role: "The equipment manual identifies controls and maintenance points intended for users.",
        failureSign:
          "Unclear access, damage, or an unexpected symptom calls for qualified service.",
      },
      {
        id: "service_area",
        label: "Service components",
        role: "Internal and pressurized components require the appropriate qualified professional.",
        failureSign:
          "Do not remove equipment covers or disturb connections to investigate.",
      },
    ],
    whyItHappens:
      "More than half of summer 'broken AC' calls come from clogged filters freezing the coil, algae blocking the condensate float switch, or clogged outdoor condenser fins.",
    toolsNeeded: ["Equipment manual", "Manufacturer-compatible filter"],
    rookieMistake:
      "Choosing a higher filter rating without checking whether the system supports it.",
    steps: [
      "Switch cooling off at the normal thermostat control. If there is ice, unusual noise, or standing water, leave cooling off and arrange HVAC service.",
      "Follow the equipment manufacturer instructions to inspect only a user-accessible filter. Do not open equipment service or electrical covers.",
      "Use the exact size, type, and filtration rating specified by the manufacturer, matching the airflow arrow. Arrange service if access, compatibility, or the cooling problem remains uncertain.",
    ],
    quiz: [
      {
        id: "knowledge_ac-not-cooling_1",
        prompt:
          "Which AC observation takes the problem beyond an ordinary user-accessible filter check?",
        options: [
          {
            id: "a",
            label: "Visible ice or frost on the pipe or equipment.",
          },
          {
            id: "b",
            label: "A dusty filter with no ice, moisture, or unusual noise.",
          },
        ],
        correctId: "a",
        explanation:
          "Ice or frost can have causes beyond a dirty filter and requires HVAC assessment without opening equipment.",
      },
      {
        id: "knowledge_ac-not-cooling_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "door-wont-close",
    title: "Interior door: inspect alignment without changing framing",
    shortProblem: "My door won't close.",
    category: "General & Walls",
    skillCategory: "Wall & Door Repair",
    skillUnlockedTitle: "Door Hinge Alignment & Anchoring",
    safetyTier: "DIY_SAFE",
    minutes: 25,
    proLow: 132,
    proHigh: 372,
    diyParts: 12,
    sourceUrl: "https://homeguide.com/costs/door-repair-cost",
    image: "/images/drywall-patch.png",
    diagram: "drywall-wall",
    summary:
      "A sticking door can reflect a loose visible hinge, humidity, or building movement. Observe the pattern before choosing a repair; swelling alone does not establish a hinge fault.",
    howItWorks:
      "Hinges support the door and the latch meets the strike. A change in one visible part can affect alignment, while swelling or movement can change the surrounding gaps.",
    partsAnatomy: [
      {
        id: "hinge",
        label: "Visible hinge",
        role: "Supports the door through installed hardware.",
        failureSign:
          "Visible movement or missing hardware needs a model-appropriate assessment.",
      },
      {
        id: "gap",
        label: "Door-to-frame gap",
        role: "Provides clearance around the door.",
        failureSign:
          "New or uneven gaps can reflect different causes and do not establish where it is safe to fasten.",
      },
    ],
    whyItHappens:
      "Wear, humidity, loose hardware, and building movement have different remedies. New cracks or multiple affected doors need qualified inspection.",
    toolsNeeded: ["Good lighting", "Notes or photos of the visible gaps"],
    rookieMistake:
      "Driving longer screws into an unverified jamb or planing a swollen door before identifying the cause.",
    steps: [
      "Look at the visible door gaps and hinge position without removing hardware. Record whether one corner rubs or the entire door is swollen. Keep fingers clear of closing gaps.",
      "For a loose visible hinge, find the door or hinge manufacturer procedure and confirm the existing hardware and substrate before any adjustment. Do not substitute longer screws, drill into the jamb, or remove hinge pins in this guide.",
      "If the whole door is swollen, several doors changed, there are new cracks, or the cause is unclear, arrange a qualified inspection. Do not force the latch or cut the door.",
    ],
    quiz: [
      {
        id: "knowledge_door-wont-close_1",
        prompt:
          "Which observation calls for investigating more than one interior door hinge?",
        options: [
          {
            id: "a",
            label:
              "One door has a visibly loose hinge while nearby doors are unchanged.",
          },
          {
            id: "b",
            label: "Several doors start sticking and a new wall crack appears.",
          },
        ],
        correctId: "b",
        explanation:
          "A change across several doors and a new crack can reflect building movement. A single hinge adjustment is not established.",
      },
      {
        id: "knowledge_door-wont-close_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "hole-in-wall",
    title: "Small dry wall damage: assess before patching",
    shortProblem: "There's a hole in my wall.",
    category: "General & Walls",
    skillCategory: "Wall & Door Repair",
    skillUnlockedTitle: "Mesh Drywall Patching & Feathering",
    safetyTier: "DIY_SAFE",
    minutes: 45,
    proLow: 300,
    proHigh: 500,
    diyParts: 18,
    sourceUrl: "https://homeguide.com/costs/drywall-repair-cost",
    image: "/images/drywall-patch.png",
    diagram: "drywall-wall",
    summary:
      "Only small, dry damage to a known safe finish is suitable for a surface patch. Dampness, large damage, unknown coatings, or hidden services need assessment first.",
    howItWorks:
      "A compatible surface repair system supports a small opening and feathers material over a sound, dry surface. It does not repair leaks or structural movement.",
    partsAnatomy: [
      {
        id: "gypsum_board",
        label: "1/2-Inch Gypsum Drywall Face",
        role: "Smooth paper-wrapped gypsum panel spanning studs.",
        failureSign:
          "Crushed edges or torn brown paper tabs protruding outward.",
      },
      {
        id: "mesh_patch",
        label: "Aluminum-Reinforced Mesh Patch",
        role: "Rigid perforated center keeps spackle flat over hollow cavities.",
        failureSign:
          'Skipping backing on holes >1" makes spackle slump inside wall.',
      },
      {
        id: "feathered_mud",
        label: "Thin Feathered Joint Compound Coats",
        role: "Tapers outward 2–3 inches wider than patch so edge disappears under paint.",
        failureSign:
          "Thick single ridge leaves visible rectangular bump under angled light.",
      },
    ],
    whyItHappens:
      "Furniture and door handles can damage the face of a wall. Recurring movement or moisture requires a different investigation.",
    toolsNeeded: [
      "Manufacturer-compatible surface patch kit",
      "Application tool specified by the kit",
      "Protective equipment specified by the product",
    ],
    rookieMistake:
      "Disturbing an unknown wall coating, cutting into a cavity, or covering damp material.",
    steps: [
      "Confirm the damage is small, fully dry, and on a known safe wall finish. Do not proceed where old coatings, hidden services, moisture, or the material are uncertain.",
      "Use a surface patch system compatible with the opening and substrate, following its product instructions. Do not cut into the wall or insert screws into an unverified cavity.",
      "Let the material dry for the stated time. Follow the product instructions for finishing without disturbing unknown coatings; ask a qualified professional if preparation would require cutting or abrasive removal.",
    ],
    quiz: [
      {
        id: "knowledge_hole-in-wall_1",
        prompt:
          "What must be resolved before a damp wall area can be treated as a small surface patch?",
        options: [
          {
            id: "a",
            label:
              "The source of moisture and the condition of the underlying material.",
          },
          {
            id: "b",
            label: "Which paint color will hide the damp area most quickly.",
          },
        ],
        correctId: "a",
        explanation:
          "A surface patch does not repair a moisture source or establish that the wall material is sound and safe to disturb.",
      },
      {
        id: "knowledge_hole-in-wall_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "washer-not-draining",
    title: "Washer drain issue: external checks",
    shortProblem: "My washing machine isn't draining.",
    category: "Appliances",
    skillCategory: "Appliance Maintenance",
    skillUnlockedTitle: "Appliance Drain & Coin-Trap Triage",
    safetyTier: "DIY_SAFE",
    minutes: 30,
    proLow: 125,
    proHigh: 325,
    diyParts: 5,
    sourceUrl: "https://homeguide.com/costs/plumber-cost",
    image: "/images/hvac-filter-check.png",
    diagram: "sink-ptrap",
    summary:
      "A visible hose issue or drain error may have several causes. Inspect only from a dry safe position and use the washer manual; do not open internal panels.",
    howItWorks:
      "Before water reaches your house drainpipe, front-load washers route drum water through a coarse plastic catch screen ('coin trap') protecting the spinning pump impeller from coins and lint.",
    partsAnatomy: [
      {
        id: "user_access",
        label: "Manufacturer-defined user access",
        role: "The equipment manual identifies controls and maintenance points intended for users.",
        failureSign:
          "Unclear access, damage, or an unexpected symptom calls for qualified service.",
      },
      {
        id: "service_area",
        label: "Service components",
        role: "Internal and pressurized components require the appropriate qualified professional.",
        failureSign:
          "Do not remove equipment covers or disturb connections to investigate.",
      },
    ],
    whyItHappens:
      "One forgotten collar stay, bobby pin, dime, or dense pet-hair clump jams the pump screen cleanly without breaking anything mechanically.",
    toolsNeeded: ["Washer manual", "Phone to record the error code"],
    rookieMistake:
      "Assuming every washer has a user-serviceable drain filter, or opening one while water is hot or retained.",
    steps: [
      "Stop the wash cycle using the normal controls. Keep clear if water is near a plug or outlet.",
      "Read and record the displayed error code. Look at the visible drain hose without moving the washer or disconnecting hoses.",
      "Follow only the manufacturer external checks for that error. If the hose is inaccessible, water remains, or the issue persists, arrange appliance service.",
    ],
    quiz: [
      {
        id: "knowledge_washer-not-draining_1",
        prompt:
          "What establishes whether a washer drain filter is intended for user maintenance?",
        options: [
          {
            id: "a",
            label:
              "A different washer online has a filter behind a removable panel.",
          },
          {
            id: "b",
            label:
              "The installed model manufacturer instructions identify a user-serviceable filter and its safe procedure.",
          },
        ],
        correctId: "b",
        explanation:
          "Washer designs differ. A panel or filter shown on another model does not establish safe access on the installed machine.",
      },
      {
        id: "knowledge_washer-not-draining_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "dripping-faucet",
    title: "Faucet drip: identify the model before service",
    shortProblem: "Faucet drips non-stop or sprays sideways.",
    category: "Plumbing",
    skillCategory: "Plumbing Basics",
    skillUnlockedTitle: "Faucet Cartridge & Aerator Servicing",
    safetyTier: "DIY_SAFE",
    minutes: 30,
    proLow: 125,
    proHigh: 350,
    diyParts: 20,
    sourceUrl: "https://homeguide.com/costs/plumber-cost",
    image: "/images/faucet-install.png",
    diagram: "faucet",
    summary:
      "An aerator affects the stream; an internal seal can cause a closed faucet to drip. Identify the model and manufacturer procedure before choosing a repair.",
    howItWorks:
      "A faucet controls supply water internally. Its outlet aerator shapes the visible stream but does not act as the internal shutoff.",
    partsAnatomy: [
      {
        id: "user_access",
        label: "Manufacturer-defined user access",
        role: "The equipment manual identifies controls and maintenance points intended for users.",
        failureSign:
          "Unclear access, damage, or an unexpected symptom calls for qualified service.",
      },
      {
        id: "service_area",
        label: "Service components",
        role: "Internal and pressurized components require the appropriate qualified professional.",
        failureSign:
          "Do not remove equipment covers or disturb connections to investigate.",
      },
    ],
    whyItHappens:
      "Mineral deposits or worn model-specific internal parts can produce different symptoms.",
    toolsNeeded: ["Faucet model details", "Manufacturer cleaning instructions"],
    rookieMistake:
      "Assuming the aerator stops a closed-faucet drip or opening internal parts without verified isolation.",
    steps: [
      "Record whether the problem is a distorted stream or a drip while the faucet is fully closed. Find the manufacturer and model.",
      "For stream cleaning, follow only the manufacturer procedure for a hand-removable user-serviceable aerator. Stop if it is stuck or requires unfamiliar tools.",
      "For a persistent closed-faucet drip, unknown model, or deteriorated shutoff, arrange a plumber. Leave supply connections and internal components in place.",
    ],
    quiz: [
      {
        id: "knowledge_dripping-faucet_1",
        prompt:
          "What information comes before choosing an internal replacement part for a dripping faucet?",
        options: [
          {
            id: "a",
            label:
              "The faucet manufacturer, model, and specified compatible part.",
          },
          {
            id: "b",
            label: "Only the outside color and approximate handle shape.",
          },
        ],
        correctId: "a",
        explanation:
          "Similar-looking faucets can use different internal parts and isolation procedures. Model identification comes before a repair decision.",
      },
      {
        id: "knowledge_dripping-faucet_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "dead-gfci-outlet",
    title: "Dead outlet: dry, non-invasive GFCI check",
    shortProblem: "Outlets in bathroom or kitchen have no power.",
    category: "Electrical Basics",
    skillCategory: "Electrical & Safety Triage",
    skillUnlockedTitle: "Safe GFCI & Breaker Triage (Zero Exposed Wiring)",
    safetyTier: "DIY_SAFE",
    minutes: 15,
    proLow: 100,
    proHigh: 200,
    diyParts: 12,
    sourceUrl: "https://homeguide.com/costs/electrician-cost-per-hour",
    image: "/images/faucet-install.png",
    diagram: "drywall-wall",
    summary:
      "A dead outlet may have an upstream protection device or an electrical fault. Only a dry, undamaged user-operable reset is within this guide.",
    howItWorks:
      "A GFCI can interrupt power to itself and downstream outlets. Circuit arrangements and indicator meanings vary by installation and device.",
    partsAnatomy: [
      {
        id: "gfci_reset",
        label: "External reset button",
        role: "User-operated control on some protective outlets.",
        failureSign: "A reset that does not hold needs investigation.",
      },
      {
        id: "indicator",
        label: "Device indicator",
        role: "Shows device-specific information defined in the manual.",
        failureSign:
          "An unexpected light or lack of power requires the model instructions.",
      },
    ],
    whyItHappens:
      "Protection may trip, but a dead outlet alone does not establish the reason. Repeated faults require an electrician.",
    toolsNeeded: ["Device manufacturer instructions"],
    rookieMistake:
      "Treating a repeated trip as an inconvenience or opening a panel or outlet cover.",
    steps: [
      "Look only from a dry safe position. If there is heat, smoke, discoloration, unusual odor, noise, or moisture, leave the outlet alone and arrange appropriate urgent help.",
      "If the device is dry, undamaged, and safely accessible, follow its manufacturer test/reset instructions once using only the external buttons.",
      "If power does not return or the device trips again, stop using it and arrange a licensed electrician. Leave all equipment covers and service panels closed.",
    ],
    quiz: [
      {
        id: "knowledge_dead-gfci-outlet_1",
        prompt:
          "What does a GFCI that trips again after one permitted reset tell you?",
        options: [
          {
            id: "a",
            label: "More resets are needed until the protection stays on.",
          },
          {
            id: "b",
            label:
              "The cause remains unresolved and needs an electrician assessment.",
          },
        ],
        correctId: "b",
        explanation:
          "A repeated trip is a reason to stop using the device and arrange inspection; resetting does not establish that the circuit is safe.",
      },
      {
        id: "knowledge_dead-gfci-outlet_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "disposal-humming",
    title: "Disposal jam: stop and verify the model procedure",
    shortProblem: "Garbage disposal hums loudly or stopped completely.",
    category: "Appliances",
    skillCategory: "Appliance Maintenance",
    skillUnlockedTitle: "Jammed Disposal Recovery",
    safetyTier: "DIY_SAFE",
    minutes: 15,
    proLow: 120,
    proHigh: 275,
    diyParts: 8,
    sourceUrl: "https://homeguide.com/costs/garbage-disposal-installation-cost",
    image: "/images/hero-sink-repair.png",
    diagram: "sink-ptrap",
    summary:
      "A hum may indicate a jam. Switch it off and follow only a model-specific user procedure with safe isolation. Never put hands in the chamber.",
    howItWorks:
      "The motor drives a grinding plate. A jam can prevent movement and an overload control may interrupt operation.",
    partsAnatomy: [
      {
        id: "user_access",
        label: "Manufacturer-defined user access",
        role: "The equipment manual identifies controls and maintenance points intended for users.",
        failureSign:
          "Unclear access, damage, or an unexpected symptom calls for qualified service.",
      },
      {
        id: "service_area",
        label: "Service components",
        role: "Internal and pressurized components require the appropriate qualified professional.",
        failureSign:
          "Do not remove equipment covers or disturb connections to investigate.",
      },
    ],
    whyItHappens:
      "Objects or material can obstruct movement, but a hum alone does not establish a serviceable cause.",
    toolsNeeded: [
      "Disposal manual",
      "Phone to arrange service if safe isolation is uncertain",
    ],
    rookieMistake:
      "Relying on the wall switch as the only isolation or putting fingers into the chamber.",
    steps: [
      "Turn the disposal off using its normal control. Keep hands, tools, and objects out of the opening.",
      "Only consider a user maintenance procedure if the manual explicitly allows it and you can unplug an accessible, dry, undamaged plug. Leave hardwired units and wet or uncertain connections to a professional.",
      "Follow the exact model procedure for external user maintenance. If it is unclear, no external socket exists, or the unit stays jammed, leave it off and arrange service.",
    ],
    quiz: [
      {
        id: "knowledge_disposal-humming_1",
        prompt:
          "Does a disposal wall switch being off establish safe isolation for maintenance?",
        options: [
          {
            id: "a",
            label:
              "No. The model procedure and a safe, verified means of isolation are still required.",
          },
          {
            id: "b",
            label:
              "Yes. A wall switch alone proves the motor cannot become energized.",
          },
        ],
        correctId: "a",
        explanation:
          "The wall switch alone is not verified isolation. Keep hands and tools out when the safe procedure or power isolation is uncertain.",
      },
      {
        id: "knowledge_disposal-humming_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "dryer-vent-lint",
    title: "Dryer: lint screen and ground-level vent check",
    shortProblem: "Clothes take two cycles to dry and laundry room feels hot.",
    category: "Appliances",
    skillCategory: "Appliance Maintenance",
    skillUnlockedTitle: "Fire-Safe Dryer Exhaust Maintenance",
    safetyTier: "DIY_SAFE",
    minutes: 35,
    proLow: 80,
    proHigh: 185,
    diyParts: 25,
    sourceUrl: "https://homeguide.com/costs/dryer-vent-cleaning-cost",
    image: "/images/hvac-filter-check.png",
    diagram: "hvac-airflow",
    summary:
      "Clean only the user-accessible lint screen. View the exterior outlet from ground level and arrange professional duct cleaning if drying remains slow.",
    howItWorks:
      "Moist lint bypasses your removable mesh screen and clings to the corrugated transition hose and exterior damper flap, choking exhaust airflow.",
    partsAnatomy: [
      {
        id: "user_access",
        label: "Manufacturer-defined user access",
        role: "The equipment manual identifies controls and maintenance points intended for users.",
        failureSign:
          "Unclear access, damage, or an unexpected symptom calls for qualified service.",
      },
      {
        id: "service_area",
        label: "Service components",
        role: "Internal and pressurized components require the appropriate qualified professional.",
        failureSign:
          "Do not remove equipment covers or disturb connections to investigate.",
      },
    ],
    whyItHappens:
      "Every ~100 loads deposits fine lint downstream of the lint trap, while pushing the dryer flush back crushes soft foil ducts flat.",
    toolsNeeded: ["Dryer manual"],
    rookieMistake:
      "Moving a gas dryer, disconnecting its exhaust, or reaching an inaccessible exterior outlet.",
    steps: [
      "Turn the dryer off and let it cool. Follow the manufacturer instructions to clean the accessible lint screen.",
      "Look at the exterior outlet only from ground level. Do not move the dryer, disconnect its connections, or use ladders to reach a vent.",
      "If the outlet is blocked, drying remains slow, or the dryer overheats, stop using it and arrange professional service.",
    ],
    quiz: [
      {
        id: "knowledge_dryer-vent-lint_1",
        prompt: "Which dryer maintenance boundary stays within this guide?",
        options: [
          {
            id: "a",
            label:
              "Reaching an upper-story exterior outlet to remove a visible obstruction.",
          },
          {
            id: "b",
            label:
              "Cleaning the user-accessible lint screen according to the manual without moving the dryer.",
          },
        ],
        correctId: "b",
        explanation:
          "A safely accessible lint screen differs from inaccessible vent or connection work. Blocked or elevated ductwork needs professional service.",
      },
      {
        id: "knowledge_dryer-vent-lint_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "water-heater-check",
    title: "Water heater: visual check and professional maintenance",
    shortProblem: "Water heater popping or overdue for annual sediment check.",
    category: "Plumbing",
    skillCategory: "Plumbing Basics",
    skillUnlockedTitle: "Water Heater Shutoff & T&P Valve Inspection",
    safetyTier: "PRO_REQUIRED",
    minutes: 45,
    proLow: 75,
    proHigh: 250,
    diyParts: 15,
    sourceUrl: "https://homeguide.com/costs/water-heater-repair-cost",
    image: "/images/water-heater-check.png",
    diagram: "water-heater",
    summary:
      "Inspect only from a dry safe position. Unusual noises, visible leaks, or relief discharge need a qualified plumber; do not flush the tank or adjust controls.",
    howItWorks:
      "A tank stores heated water and includes pressure and temperature safeguards. Its controls and relief system require model-specific professional care.",
    partsAnatomy: [
      {
        id: "user_access",
        label: "Manufacturer-defined user access",
        role: "The equipment manual identifies controls and maintenance points intended for users.",
        failureSign:
          "Unclear access, damage, or an unexpected symptom calls for qualified service.",
      },
      {
        id: "service_area",
        label: "Service components",
        role: "Internal and pressurized components require the appropriate qualified professional.",
        failureSign:
          "Do not remove equipment covers or disturb connections to investigate.",
      },
    ],
    whyItHappens:
      "Sediment, controls, pressure, and other conditions can cause similar symptoms. A qualified plumber must establish the cause.",
    toolsNeeded: [
      "Equipment maintenance records",
      "Phone to arrange a qualified plumber",
    ],
    rookieMistake:
      "Operating a relief valve, draining the tank, or blocking a discharge pipe without a qualified professional.",
    steps: [
      "Stay at a dry safe distance and note visible moisture or damage without touching the heater, controls, pipes, or valves.",
      "Leave the relief discharge unobstructed. Arrange a qualified plumber inspection and manufacturer-recommended maintenance.",
    ],
    quiz: [
      {
        id: "knowledge_water-heater-check_1",
        prompt:
          "What is the safety purpose of keeping a water heater relief discharge unobstructed?",
        options: [
          {
            id: "a",
            label:
              "It leaves the relief system able to discharge; a leak still needs a qualified plumber assessment.",
          },
          {
            id: "b",
            label:
              "It creates a convenient opening that can be plugged whenever it drips.",
          },
        ],
        correctId: "a",
        explanation:
          "The relief discharge is part of the heater safeguards and must remain open. Its condition does not authorize operating or modifying the valve.",
      },
      {
        id: "knowledge_water-heater-check_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
  {
    slug: "strange-sink-noise",
    title: "Sink noise: record timing and shared-fixture symptoms",
    shortProblem: "My bathroom sink makes a weird noise.",
    category: "Plumbing",
    skillCategory: "Plumbing Basics",
    skillUnlockedTitle: "Acoustic Drain & Pressure Diagnosis",
    safetyTier: "DIY_SAFE",
    minutes: 20,
    proLow: 100,
    proHigh: 275,
    diyParts: 10,
    sourceUrl: "https://homeguide.com/costs/cost-to-unclog-snake-a-drain",
    image: "/images/hero-sink-repair.png",
    diagram: "sink-ptrap",
    summary:
      "Sound alone cannot establish a cause. Record when it happens and whether another fixture is involved before choosing a service path.",
    howItWorks:
      "Faucet flow and drain flow use different parts of the plumbing. Similar sounds can come from different restrictions or pressure conditions.",
    partsAnatomy: [
      {
        id: "aerator",
        label: "Faucet Tip Aerator (If Whistling)",
        role: "Tiny mesh disk inside spout tip.",
        failureSign:
          "High-pitched whistle/squeal ONLY while water flows out of tap.",
      },
      {
        id: "p_trap",
        label: "Bathroom Sink P-Trap & Pop-Up Stopper (If Gurgling)",
        role: "First hair-catching constriction below basin.",
        failureSign: "Glug-glug bubbling sound when THAT sink drains.",
      },
      {
        id: "pro_redline_zone",
        label: "Main Sewer Vent / Stack Warning (If Other Fixtures Back Up)",
        role: "Shared waste drain serving toilets, showers, and washer.",
        failureSign:
          "Sink gurgles EVERY time toilet flushes or shower fills with dark water = PRO_REQUIRED main sewer snake ($200–$650).",
      },
    ],
    whyItHappens:
      "A restricted stream, local drain issue, or shared drainage problem can sound different, but observation is needed to distinguish them.",
    toolsNeeded: ["Notes on symptom timing"],
    rookieMistake:
      "Opening pipework or adding chemical drain cleaner before identifying the system involved.",
    steps: [
      "From a dry safe position, note whether the noise occurs during faucet flow, while the basin drains, or while another fixture is being used. Do not deliberately run a fixture that is leaking or backing up.",
      "If another fixture triggers bubbling, or water backs up, stop using the affected fixtures and arrange a drain professional.",
      "For an isolated faucet stream issue, find the model cleaning instructions. For unclear or persistent noise, arrange inspection without opening pipes or adding chemicals.",
    ],
    quiz: [
      {
        id: "knowledge_strange-sink-noise_1",
        prompt:
          "What does sink bubbling triggered by another fixture suggest you should assess?",
        options: [
          {
            id: "a",
            label: "Only the aerator that shapes water leaving the faucet.",
          },
          {
            id: "b",
            label:
              "The shared drainage system rather than only the faucet outlet.",
          },
        ],
        correctId: "b",
        explanation:
          "A symptom triggered by another fixture involves shared drainage context. Sound alone does not establish the exact cause or authorize pipe work.",
      },
      {
        id: "knowledge_strange-sink-noise_2",
        prompt:
          "What should you do when access or the safe procedure is uncertain?",
        options: [
          {
            id: "a",
            label:
              "Stop and arrange help from the appropriate qualified professional.",
          },
          {
            id: "b",
            label: "Force the part and try an improvised procedure.",
          },
        ],
        correctId: "a",
        explanation:
          "Uncertain access, damage, or a procedure outside the user manual requires qualified help.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string): RepairGuide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
