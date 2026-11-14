"use client";
import { useState } from "react";
import {
  APPLIANCE_LABELS,
  HVAC_LABELS,
  type ApplianceId,
  type HomeProfile,
  type HousingType,
  type HvacType,
} from "@/lib/homeStore";
import { updateProfile } from "@/lib/homeClientStore";
import { Icon } from "./Icon";
export function HomeProfileForm({
  profile,
  onDone,
}: {
  profile: HomeProfile;
  onDone?: () => void;
}) {
  const [name, setName] = useState(profile.homeName);
  const [type, setType] = useState<HousingType>(profile.housingType);
  const [year, setYear] = useState(String(profile.yearBuilt));
  const [hvac, setHvac] = useState<HvacType>(profile.hvacType);
  const [appliances, setAppliances] = useState<ApplianceId[]>(
    profile.appliances,
  );
  const [issues, setIssues] = useState(profile.pastIssues.join(", "));
  const [error, setError] = useState("");
  const maxYear = new Date().getFullYear() + 1;
  function save(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(year);
    if (
      !name.trim() ||
      name.trim().length > 100 ||
      !Number.isInteger(n) ||
      n < 1600 ||
      n > maxYear
    ) {
      setError("Enter a home name and a valid build year.");
      return;
    }
    const pastIssues = issues
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (pastIssues.some((x) => x.length > 500) || pastIssues.length > 100) {
      setError("Please shorten the issue notes.");
      return;
    }
    updateProfile({
      homeName: name.trim(),
      housingType: type,
      yearBuilt: n,
      hvacType: hvac,
      appliances,
      pastIssues,
    });
    onDone?.();
  }
  return (
    <form onSubmit={save} className="form-stack">
      <p className="small muted">
        Only the details needed to tailor your checklist. No address, account or
        contact information required.
      </p>
      <div className="field">
        <label htmlFor="home-label">What do you call your home?</label>
        <input
          id="home-label"
          required
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Our first place"
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="home-type">Home type</label>
          <select
            id="home-type"
            value={type}
            onChange={(e) => setType(e.target.value as HousingType)}
          >
            <option value="house">Single-family house</option>
            <option value="townhome">Townhome / condo</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="home-year">Year built</label>
          <input
            id="home-year"
            required
            type="number"
            min="1600"
            max={maxYear}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="home-hvac">Heating & cooling</label>
        <select
          id="home-hvac"
          value={hvac}
          onChange={(e) => setHvac(e.target.value as HvacType)}
        >
          {Object.entries(HVAC_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="question" style={{ margin: 0 }}>
        <legend>Equipment you have</legend>
        <div className="field-row">
          {Object.entries(APPLIANCE_LABELS).map(([id, label]) => (
            <label key={id} className="checkbox-line">
              <input
                type="checkbox"
                checked={appliances.includes(id as ApplianceId)}
                onChange={() =>
                  setAppliances((current) =>
                    current.includes(id as ApplianceId)
                      ? current.filter((x) => x !== id)
                      : [...current, id as ApplianceId],
                  )
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="home-notes">Past issues (optional)</label>
        <input
          id="home-notes"
          maxLength={500}
          value={issues}
          onChange={(e) => setIssues(e.target.value)}
          placeholder="e.g. Slow bathroom drain, sticking bedroom door"
        />
        <small>
          Separate notes with commas. Avoid sensitive personal information.
        </small>
      </div>
      {error && (
        <p role="alert" className="error-feedback">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button className="button button-primary" type="submit">
          Save my home
          <Icon name="arrow" size={17} />
        </button>
      </div>
    </form>
  );
}
