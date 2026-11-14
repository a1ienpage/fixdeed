"use client";
import type { AnatomyPart, DiagramKind } from "@/content/guides";
export function AnatomyDiagram({
  guideSlug,
  kind,
  parts,
  selectedId,
  onSelect,
}: {
  guideSlug: string;
  kind: DiagramKind;
  parts: AnatomyPart[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const index = Math.max(
    0,
    parts.findIndex((p) => p.id === selectedId),
  );
  const active = parts[index];
  const fixtures: Record<string, string> = {
    "sink-leaking": "sink-ptrap",
    "toilet-wont-flush": "toilet-tank",
    "ac-not-cooling": "hvac-airflow",
    "door-wont-close": "door",
    "hole-in-wall": "drywall-wall",
    "washer-not-draining": "washer",
    "dripping-faucet": "faucet",
    "dead-gfci-outlet": "outlet",
    "disposal-humming": "disposal",
    "dryer-vent-lint": "dryer",
    "water-heater-check": "water-heater",
    "strange-sink-noise": "sink-noise",
  };
  const variant = fixtures[guideSlug] ?? kind;
  const coordinates: Record<string, [number, number][]> = {
    "sink-ptrap": [
      [66, 131],
      [104, 80],
      [220, 170],
      [182, 113],
    ],
    "toilet-tank": [
      [180, 174],
      [153, 77],
      [91, 125],
      [233, 112],
    ],
    faucet: [
      [253, 116],
      [127, 142],
    ],
    "hvac-airflow": [
      [66, 113],
      [286, 156],
    ],
    "drywall-wall": [
      [64, 63],
      [181, 107],
      [261, 163],
    ],
    "water-heater": [
      [153, 158],
      [245, 82],
      [129, 184],
    ],
    door: [
      [89, 62],
      [247, 128],
      [280, 58],
    ],
    outlet: [
      [144, 116],
      [172, 151],
    ],
    washer: [
      [127, 174],
      [269, 79],
    ],
    disposal: [
      [212, 176],
      [158, 112],
    ],
    dryer: [
      [70, 64],
      [268, 86],
    ],
    "sink-noise": [
      [126, 72],
      [150, 158],
      [279, 121],
    ],
  };
  const points = coordinates[variant] ?? coordinates["sink-ptrap"];
  return (
    <div className="anatomy">
      <div className="anatomy-canvas">
        <svg
          viewBox="0 0 360 230"
          role="img"
          aria-label={`Concept diagram of ${variant}: ${parts.map((p) => p.label.split("(")[0]).join(", ")}`}
        >
          <defs>
            <pattern
              id={`dots-${variant}`}
              width="18"
              height="18"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r=".8" fill="#ded7ea" />
            </pattern>
          </defs>
          <rect
            width="360"
            height="230"
            rx="8"
            fill={`url(#dots-${variant})`}
          />
          <g
            fill="#f1edf8"
            stroke="#9989b3"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {variant === "sink-noise" && (
              <>
                <path d="M32 94h194v16H32Z" fill="#dcd3ea" />
                <path
                  d="M82 94V53a22 22 0 0 1 44 0v19"
                  fill="none"
                  stroke="#b7a6cf"
                  strokeWidth="12"
                />
                <path
                  d="M83 109v40a29 29 0 0 0 58 0v-24h72v56h66V37"
                  fill="none"
                  stroke="#c7b9d9"
                  strokeWidth="17"
                />
                <path
                  d="M83 109v40a29 29 0 0 0 58 0v-24h72v56h66V37"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="10"
                />
                <path
                  d="M279 66h43m-43 71h43m-43 44h43"
                  fill="none"
                  stroke="#c7b9d9"
                  strokeWidth="12"
                />
                <path
                  d="M36 139q-10 9 0 18m-9-23q-17 17 0 30"
                  fill="none"
                  stroke="#a692be"
                  strokeWidth="2"
                />
              </>
            )}
            {variant === "sink-ptrap" && (
              <>
                <path d="M42 27h276v18H42Z" fill="#dcd3ea" />
                <path
                  d="M174 45v109a38 38 0 0 0 76 0v-48h65"
                  fill="none"
                  stroke="#c8bddb"
                  strokeWidth="22"
                />
                <path
                  d="M174 45v109a38 38 0 0 0 76 0v-48h65"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="13"
                />
                <path
                  d="M65 153V97q0-46 74-46"
                  fill="none"
                  stroke="#a695bf"
                  strokeWidth="5"
                  strokeDasharray="4 3"
                />
                <path
                  d="M42 132h34m-12-12v25"
                  stroke="#8c77aa"
                  strokeWidth="7"
                />
                <rect
                  x="158"
                  y="105"
                  width="32"
                  height="13"
                  rx="2"
                  fill="#b4a5d0"
                />
                <path
                  d="M187 165q25 27 50 0"
                  stroke="#a8a7d6"
                  strokeWidth="6"
                  fill="none"
                />
              </>
            )}
            {variant === "toilet-tank" && (
              <>
                <rect
                  x="49"
                  y="37"
                  width="263"
                  height="163"
                  rx="12"
                  fill="#fff"
                />
                <path d="M57 106h247v82H57Z" fill="#e4e0f3" stroke="none" />
                <rect
                  x="80"
                  y="59"
                  width="23"
                  height="129"
                  rx="5"
                  fill="#a89abf"
                />
                <path
                  d="M57 59h101v105"
                  fill="none"
                  strokeDasharray="4 4"
                  strokeWidth="4"
                />
                <path d="M159 175q21-24 42 0Z" fill="#9175c6" />
                <rect x="223" y="78" width="18" height="110" fill="#d0c5e4" />
                <path d="M172 188h29" strokeWidth="5" />
              </>
            )}
            {variant === "faucet" && (
              <>
                <path d="M42 180h276v16H42Z" fill="#dcd3ea" />
                <path
                  d="M137 180V81a57 57 0 0 1 114 0v35"
                  fill="none"
                  stroke="#c5b9d8"
                  strokeWidth="22"
                />
                <path
                  d="M137 180V81a57 57 0 0 1 114 0v35"
                  fill="none"
                  stroke="#f7f4fc"
                  strokeWidth="13"
                />
                <rect x="120" y="118" width="34" height="57" rx="5" />
                <rect
                  x="239"
                  y="111"
                  width="25"
                  height="15"
                  rx="3"
                  fill="#aa98c5"
                />
                <path d="m138 62-46-25" strokeWidth="8" />
              </>
            )}
            {variant === "hvac-airflow" && (
              <>
                <rect
                  x="32"
                  y="50"
                  width="161"
                  height="137"
                  rx="8"
                  fill="#fff"
                />
                <rect x="57" y="71" width="22" height="94" fill="#d7cbea" />
                <path d="M60 76 76 91m-16 0 16 15m-16 0 16 15m-16 0 16 15m-16 0 16 15" />
                <path
                  d="M91 101h74m-7-5 7 5-7 5M91 129h74"
                  strokeDasharray="5 5"
                />
                <rect
                  x="228"
                  y="69"
                  width="103"
                  height="118"
                  rx="8"
                  fill="#e5deee"
                />
                <circle cx="279" cy="112" r="27" fill="#c5b5da" />
                <path d="M279 89v46m-23-23h46" />
                <path d="M245 151h69v21h-69Z" fill="#e5ccd2" stroke="#ae7b8b" />
                <path d="M118 184v18h77" />
              </>
            )}
            {variant === "drywall-wall" && (
              <>
                <rect
                  x="37"
                  y="27"
                  width="285"
                  height="176"
                  rx="5"
                  fill="#eeebe4"
                />
                <path
                  d="M60 27v176m226-176v176"
                  stroke="#baa589"
                  strokeWidth="17"
                />
                <rect
                  x="140"
                  y="66"
                  width="88"
                  height="86"
                  rx="4"
                  fill="#f7f3fc"
                  strokeDasharray="5 3"
                />
                <path
                  d="M148 77h72m-72 15h72m-72 15h72m-72 15h72m-72 15h72M158 74v73m18-73v73m18-73v73m18-73v73"
                  stroke="#c5b5d8"
                  strokeWidth="1"
                />
                <path
                  d="M121 158q63 28 124 0"
                  fill="none"
                  stroke="#d4c7e4"
                  strokeWidth="14"
                />
              </>
            )}
            {variant === "water-heater" && (
              <>
                <rect
                  x="115"
                  y="52"
                  width="122"
                  height="150"
                  rx="19"
                  fill="#fff"
                />
                <path
                  d="M131 52V22m85 30V22"
                  strokeWidth="9"
                  stroke="#c4b6d9"
                />
                <path
                  d="M236 82h27v110"
                  fill="none"
                  stroke="#b8a3ce"
                  strokeWidth="7"
                />
                <path d="M124 184h-22" strokeWidth="7" />
                <path
                  d="M130 92h91m-91 12h91m-91 12h91"
                  stroke="#e1d7ed"
                  strokeWidth="3"
                />
                <rect
                  x="149"
                  y="151"
                  width="52"
                  height="25"
                  rx="3"
                  fill="#e8e1f1"
                />
              </>
            )}
            {variant === "door" && (
              <>
                <rect
                  x="72"
                  y="27"
                  width="210"
                  height="176"
                  rx="3"
                  fill="#d8cee9"
                />
                <path d="M94 203V42l151-12v173Z" fill="#fff" />
                <path d="M103 54h125v136H103Z" fill="#f4f0fa" />
                <path
                  d="M80 60h22m-22 96h22"
                  strokeWidth="9"
                  stroke="#a991ca"
                />
                <path d="M230 124h13" strokeWidth="5" />
              </>
            )}
            {variant === "outlet" && (
              <>
                <rect
                  x="88"
                  y="30"
                  width="111"
                  height="176"
                  rx="10"
                  fill="#fff"
                />
                <circle cx="143" cy="45" r="2" />
                <circle cx="143" cy="192" r="2" />
                <rect x="109" y="60" width="69" height="111" rx="16" />
                <path
                  d="M128 80v15m30-15v15m-30 46v15m30-15v15"
                  strokeWidth="4"
                />
                <rect
                  x="127"
                  y="104"
                  width="32"
                  height="16"
                  rx="2"
                  fill="#c8b8e1"
                />
                <rect x="127" y="124" width="32" height="12" rx="2" />
                <circle cx="172" cy="151" r="4" fill="#a7b987" />
              </>
            )}
            {variant === "washer" && (
              <>
                <rect
                  x="68"
                  y="31"
                  width="174"
                  height="176"
                  rx="9"
                  fill="#fff"
                />
                <path d="M69 65h171" />
                <circle cx="153" cy="119" r="43" fill="#e5ddee" />
                <circle cx="153" cy="119" r="31" fill="#c4b4da" />
                <path
                  d="M130 118q23 17 46-2"
                  fill="none"
                  stroke="#f6f1fc"
                  strokeWidth="7"
                />
                <circle cx="97" cy="48" r="7" />
                <path d="M117 48h82" strokeWidth="5" />
                <rect x="112" y="174" width="49" height="22" rx="3" />
                <path
                  d="M242 172h32V78h36"
                  fill="none"
                  strokeDasharray="5 3"
                  strokeWidth="8"
                />
              </>
            )}
            {variant === "disposal" && (
              <>
                <path d="M112 36h127v20H112Z" fill="#e5deee" />
                <path d="M134 57v26h83V57" fill="#d4c7e4" />
                <rect
                  x="115"
                  y="83"
                  width="118"
                  height="92"
                  rx="13"
                  fill="#fff"
                />
                <path
                  d="M139 94v64m17-64v64m18-64v64m18-64v64m18-64v64"
                  stroke="#e5dbee"
                  strokeWidth="4"
                />
                <path d="M233 107h38v39" fill="none" strokeWidth="15" />
                <path d="M136 175h78l-8 18h-62Z" fill="#c6b5dc" />
              </>
            )}
            {variant === "dryer" && (
              <>
                <rect
                  x="38"
                  y="45"
                  width="124"
                  height="155"
                  rx="9"
                  fill="#fff"
                />
                <circle cx="100" cy="119" r="38" fill="#e4dced" />
                <path
                  d="M164 146h43V85h84"
                  fill="none"
                  stroke="#c6b5d8"
                  strokeWidth="24"
                />
                <path
                  d="M164 146h43V85h84"
                  fill="none"
                  stroke="#eae3f3"
                  strokeWidth="15"
                  strokeDasharray="2 5"
                />
                <rect
                  x="276"
                  y="59"
                  width="43"
                  height="55"
                  rx="4"
                  fill="#d2c4e2"
                />
                <path
                  d="M285 69h24m-24 10h24m-24 10h24m-24 10h24"
                  stroke="#a38bbb"
                />
                <path d="M53 64h93" strokeWidth="4" />
              </>
            )}
          </g>
          {parts.map((part, i) => {
            const point = points[i % points.length];
            return (
              <g key={part.id}>
                <circle
                  cx={point[0]}
                  cy={point[1]}
                  r="13"
                  fill={i === index ? "#6747d8" : "#fff"}
                  stroke={i === index ? "#6747d8" : "#b5a5cc"}
                  strokeWidth="2"
                />
                <text
                  x={point[0]}
                  y={point[1] + 3.5}
                  textAnchor="middle"
                  fill={i === index ? "#fff" : "#806696"}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
          <text
            x="180"
            y="222"
            textAnchor="middle"
            fill="#9b8aac"
            fontSize="7"
            letterSpacing="1.5"
            fontFamily="monospace"
          >
            CONCEPT DIAGRAM / MODELS AND PARTS VARY
          </text>
        </svg>
        {active && (
          <div className="anatomy-detail">
            <p className="eyebrow">
              COMPONENT {String(index + 1).padStart(2, "0")}
            </p>
            <h3>{active.label}</h3>
            <p>{active.role}</p>
            <p className="anatomy-cue">What to notice: {active.failureSign}</p>
          </div>
        )}
      </div>
      <div className="anatomy-buttons" aria-label="Explore components">
        {parts.map((part, i) => (
          <button
            key={part.id}
            onClick={() => onSelect(part.id)}
            className={index === i ? "active" : ""}
            aria-pressed={index === i}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {part.label.split("(")[0].trim()}
          </button>
        ))}
      </div>
    </div>
  );
}
