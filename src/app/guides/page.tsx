"use client";
import Link from "next/link";
import { useState } from "react";
import { GUIDES } from "@/content/guides";
import { useFixdeedState } from "@/lib/homeClientStore";
import { Icon, type IconName } from "@/components/Icon";
import { PageIntro, EmptyState } from "@/components/Workspace";
const CARD_ICONS: Record<string, IconName> = {
  "sink-leaking": "drop",
  "toilet-wont-flush": "layers",
  "ac-not-cooling": "wind",
  "door-wont-close": "door",
  "hole-in-wall": "layers",
  "washer-not-draining": "washer",
  "dripping-faucet": "drop",
  "dead-gfci-outlet": "shield",
  "disposal-humming": "tool",
  "dryer-vent-lint": "wind",
  "water-heater-check": "home",
  "strange-sink-noise": "drop",
};
const SHORT: Record<string, string> = {
  "sink-leaking": "Find the source of a sink leak",
  "toilet-wont-flush": "Understand a running toilet",
  "ac-not-cooling": "Start with airflow, not guesswork",
  "door-wont-close": "Read the signs of a sticking door",
  "hole-in-wall": "Know when a wall can be patched",
  "washer-not-draining": "Check a washer that won’t drain",
  "dripping-faucet": "Understand that dripping faucet",
  "dead-gfci-outlet": "Learn what a GFCI actually does",
  "disposal-humming": "Know why a disposal hums",
  "dryer-vent-lint": "Give your dryer room to breathe",
  "water-heater-check": "Know the water-heater red flags",
  "strange-sink-noise": "Make sense of a noisy sink",
};
export default function GuidesPage() {
  const state = useFixdeedState();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "practiced">("all");
  const categories = [
    "All",
    "Plumbing",
    "Appliances",
    "General & Walls",
    "Electrical Basics",
  ];
  const guides = GUIDES.filter(
    (g) =>
      (category === "All" || g.category === category) &&
      (!query ||
        `${g.title} ${g.summary} ${SHORT[g.slug]}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (view === "all" || state.unlockedSkills.some((s) => s.id === g.slug)),
  );
  return (
    <div className="workspace container">
      <PageIntro
        eyebrow="A LITTLE KNOW-HOW GOES A LONG WAY"
        title="Get to know your home."
        description="Explore the parts. Understand the cause. Then try a different situation to see what you learned."
        action={
          <span className="pill">
            <Icon name="book" size={15} />
            {state.unlockedSkills.length} of 12 skills practiced
          </span>
        }
      />
      <div className="toolbar">
        <div className="search-field">
          <Icon name="search" size={17} />
          <label className="sr-only" htmlFor="guide-search">
            Search practical guides
          </label>
          <input
            id="guide-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a problem or a component"
          />
        </div>
        <div className="filters">
          <label className="sr-only" htmlFor="guide-category">
            Guide category
          </label>
          <select
            id="guide-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "Every category" : c}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="guide-progress">
            Guide progress
          </label>
          <select
            id="guide-progress"
            value={view}
            onChange={(e) => setView(e.target.value as typeof view)}
          >
            <option value="all">All guides</option>
            <option value="practiced">My practiced skills</option>
          </select>
        </div>
      </div>
      <div className="guide-grid">
        {guides.map((guide, i) => {
          const earned = state.unlockedSkills.some((s) => s.id === guide.slug);
          return (
            <Link
              className="guide-card"
              href={`/guides/${guide.slug}`}
              key={guide.slug}
            >
              <div className={`guide-art art-${i % 3}`}>
                <Icon name={CARD_ICONS[guide.slug] ?? "tool"} size={80} />
                {earned && (
                  <span className="earned-tag">
                    <Icon name="check" size={12} />
                    Scenario passed
                  </span>
                )}
              </div>
              <div className="guide-body">
                <span className="guide-category">{guide.category}</span>
                <h3>{SHORT[guide.slug] ?? guide.shortProblem}</h3>
                <p>{guide.summary}</p>
                <div className="guide-footer">
                  <span>
                    <Icon name="book" size={13} />
                    Learn · Explore · Practice
                  </span>
                  <Icon name="arrow" size={19} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {guides.length === 0 && (
        <section className="surface">
          <EmptyState
            icon="search"
            title="No guides in this view."
            description="Try a broader search or another category. Your practiced skills appear after you pass a new scenario."
          />
        </section>
      )}
      <section className="surface mt-30">
        <div className="surface-header" style={{ marginBottom: 0 }}>
          <div>
            <h3>Something happening right now?</h3>
            <p>
              Start with the guided checks before applying a repair instruction
              to your own home.
            </p>
          </div>
          <Link className="button button-primary button-small" href="/fix">
            Find my next step
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
