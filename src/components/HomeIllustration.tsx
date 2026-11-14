"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
const ROOMS = [
  {
    name: "Kitchen",
    issue: "A drip under the sink?",
    detail: "Find the source before reaching for a wrench.",
    href: "/fix?problem=sink-leaking",
    label: "Check the leak",
    position: { left: "29%", top: "53%" },
  },
  {
    name: "Bathroom",
    issue: "Toilet running again?",
    detail: "Understand the tank, then choose your next step.",
    href: "/fix?problem=toilet-wont-flush",
    label: "Check the toilet",
    position: { left: "53%", top: "65%" },
  },
  {
    name: "Laundry",
    issue: "Washer won't drain?",
    detail: "Start with the right checks for your machine.",
    href: "/fix?problem=washer-not-draining",
    label: "Check the washer",
    position: { left: "72%", top: "48%" },
  },
];
export function HomeIllustration() {
  const [room, setRoom] = useState(0);
  const selected = ROOMS[room];
  return (
    <div className="home-visual">
      <div className="visual-heading">
        <span className="status-dot" />
        <span>A LITTLE KNOW-HOW GOES A LONG WAY</span>
        <span className="visual-index">01—03</span>
      </div>
      <div className="house-stage">
        <div className="stage-grid" />
        <svg
          viewBox="0 0 640 500"
          role="img"
          aria-label="An illustrated cutaway home with a kitchen, bathroom and laundry room"
          className="house-svg"
        >
          <defs>
            <pattern
              id="floor-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
              patternTransform="matrix(1 .58 -1 .58 0 0)"
            >
              <path
                d="M32 0H0V32"
                fill="none"
                stroke="#ada2e1"
                strokeWidth=".8"
              />
            </pattern>
          </defs>
          <ellipse
            cx="326"
            cy="411"
            rx="232"
            ry="43"
            fill="#0c0921"
            opacity=".32"
          />
          <path d="m85 328 245-143 232 134v22L317 484 85 350Z" fill="#9183bd" />
          <path d="m85 328 245-143 232 134-245 143Z" fill="#ded8ef" />
          <path d="m85 328 245-143 232 134-245 143Z" fill="url(#floor-grid)" />
          <path d="M85 328V176L330 34v151Z" fill="#f7f5fc" />
          <path d="M330 34 562 168v151L330 185Z" fill="#d7d0eb" />
          <path d="m85 176 245-142 232 134-8 5L330 43 93 181Z" fill="white" />
          <path d="M330 43v142" stroke="#afa3cb" strokeWidth="2" />
          <path
            d="M144 162 249 101v73l-105 61Z"
            fill="#b3a3e9"
            stroke="#fff"
            strokeWidth="6"
          />
          <path
            d="m148 209 96-56M194 135v72"
            stroke="#f8f5ff"
            strokeWidth="4"
          />
          <path
            d="m394 100 102 59v65l-102-59Z"
            fill="#a193c2"
            stroke="#f7f5ff"
            strokeWidth="6"
          />
          <path
            d="m445 129 0 66m-48-64 95 56"
            stroke="#eee8fb"
            strokeWidth="4"
          />
          <g className={`room-floor ${room === 0 ? "room-floor-active" : ""}`}>
            <path
              d="m97 328 120 69 124-72-120-69Z"
              fill={room === 0 ? "#c9f360" : "#c9c0e0"}
              opacity=".8"
            />
          </g>
          <path d="m224 256 0-59 118 68v60Z" fill="#f4f0fb" />
          <path d="m224 197 118 68 7-4-118-68Z" fill="white" />
          <g>
            <path d="m106 266 111-64 0 45-111 64Z" fill="#b4a7cc" />
            <path d="m106 266 111-64 48 28-111 64Z" fill="#f7f6fb" />
            <path d="m106 266 48 28v45l-48-28Z" fill="#e2daec" />
            <path d="m154 294 111-64v45l-111 64Z" fill="#d3c8e3" />
            <path
              d="m147 264 47-27 27 16-47 27Z"
              fill="#756789"
              stroke="#a99bbb"
              strokeWidth="4"
            />
            <path
              d="m182 242 0-18q0-15 10-11l8 5v10"
              fill="none"
              stroke="#625771"
              strokeWidth="4"
            />
            <path
              d="m167 295 0 28m38-51v28m38-50v27"
              stroke="#b6a7ca"
              strokeWidth="1.5"
            />
          </g>
          <g className="bathroom-scene">
            <path
              d="m245 405 72 41 105-61-72-41Z"
              fill={room === 1 ? "#c9f360" : "#bab0d1"}
              opacity=".85"
            />
            <path d="m269 329 36-21 44 25-37 22Z" fill="#fff" />
            <path d="m269 329 43 26v44l-43-25Z" fill="#e3dceb" />
            <path d="m312 355 37-22v44l-37 22Z" fill="#c3b6d7" />
            <ellipse cx="310" cy="337" rx="18" ry="9" fill="#aea2c0" />
            <path d="m373 358 20-12 0 23-20 12Z" fill="#f7f5fa" />
            <ellipse
              cx="385"
              cy="380"
              rx="25"
              ry="15"
              fill="#fbfaff"
              transform="rotate(-25 385 380)"
            />
            <ellipse
              cx="384"
              cy="379"
              rx="15"
              ry="8"
              fill="#bab0d2"
              transform="rotate(-25 384 379)"
            />
          </g>
          <g>
            <path d="m407 269 68-40 49 28-68 40Z" fill="#f7f5fb" />
            <path d="m407 269 49 28v70l-49-28Z" fill="#eeeaf5" />
            <path d="m456 297 68-40v70l-68 40Z" fill="#c8bddc" />
            <ellipse
              cx="490"
              cy="312"
              rx="22"
              ry="27"
              fill="#8e7dad"
              transform="rotate(31 490 312)"
            />
            <ellipse
              cx="490"
              cy="312"
              rx="15"
              ry="19"
              fill={room === 2 ? "#c9f360" : "#584874"}
              transform="rotate(31 490 312)"
            />
            <path d="m467 289 43-25" stroke="#9683b0" strokeWidth="4" />
          </g>
          <path
            d="M85 328v22l232 134v-22m0 0 245-143v22L317 484"
            fill="none"
            stroke="#b5a8cd"
            strokeWidth="1.5"
          />
          <path
            d="m97 369-29 17m516-82 27-16M330 15V2"
            stroke="#9d8ac8"
            strokeWidth="1.5"
          />
          <text
            x="52"
            y="409"
            fill="#a79ac0"
            fontSize="10"
            fontFamily="monospace"
            transform="rotate(30 52 409)"
          >
            YOUR HOME, WITH A PLAN.
          </text>
        </svg>
        {ROOMS.map((item, index) => (
          <button
            key={item.name}
            className={`house-hotspot ${room === index ? "selected" : ""}`}
            style={item.position}
            aria-label={`Explore ${item.name.toLowerCase()}`}
            aria-pressed={room === index}
            onClick={() => setRoom(index)}
          >
            <Icon name="plus" size={16} />
          </button>
        ))}
      </div>
      <div className="room-tabs" aria-label="Explore rooms">
        {ROOMS.map((item, index) => (
          <button
            key={item.name}
            className={room === index ? "active" : ""}
            onClick={() => setRoom(index)}
            aria-pressed={room === index}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="visual-caption" key={selected.name}>
        <div>
          <span className="mini-label">{selected.name} / COMMON PROBLEM</span>
          <h3>{selected.issue}</h3>
          <p>{selected.detail}</p>
        </div>
        <Link href={selected.href} aria-label={selected.label}>
          <Icon name="arrow" size={22} />
        </Link>
      </div>
    </div>
  );
}
