"use client";
import Link from "next/link";
import { useState } from "react";
import {
  useFixdeedState,
  useHydrated,
  usePersistenceStatus,
  openSampleHome,
  switchToPersonalHome,
  clearHomeData,
  getExportData,
} from "@/lib/homeClientStore";
import {
  calculateSavingsSummary,
  HVAC_LABELS,
  DEFAULT_STATE,
} from "@/lib/homeStore";
import { filterTasksForProfile } from "@/content/preventive";
import { getMaintenanceCoverage, getTaskStatus } from "@/lib/scheduling";
import { Icon } from "@/components/Icon";
import {
  PageIntro,
  EmptyState,
  Notice,
  ToolLinks,
} from "@/components/Workspace";
import { ModalDialog } from "@/components/ModalDialog";
import { HomeProfileForm } from "@/components/HomeProfileForm";
import { RepairLogForm } from "@/components/RepairLogForm";
const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
export default function MyHome() {
  const state = useFixdeedState();
  const hydrated = useHydrated();
  const storage = usePersistenceStatus();
  const [edit, setEdit] = useState(false);
  const [log, setLog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [status, setStatus] = useState("");
  const tasks = filterTasksForProfile(state.profile, state.profileConfigured);
  const due = tasks
    .map((t) => ({
      task: t,
      ...getTaskStatus(t, state.completedPreventive[t.id]),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
  const activeDue = due.filter((t) => t.status !== "upcoming");
  const coverage = getMaintenanceCoverage(tasks, state.completedPreventive);
  const savings = calculateSavingsSummary(state);
  const demo = state.dataMode === "demo";
  const currentYear = new Date().getFullYear();
  function download() {
    const url = URL.createObjectURL(
      new Blob([getExportData()], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "fixdeed-my-home.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Personal home data exported.");
  }
  if (!hydrated)
    return (
      <div className="workspace container" aria-busy="true">
        <PageIntro
          eyebrow="YOUR HOME, WITH A PLAN"
          title="A little more under control."
          description="Loading your home record from this browser…"
        />
        <div className="surface">
          <div className="loading-line" />
        </div>
      </div>
    );
  return (
    <div className="workspace container">
      <PageIntro
        eyebrow="YOUR HOME, WITH A PLAN"
        title="A little more under control."
        description="The tasks you completed. The skills you practiced. The repairs you recorded. One place to keep building on them."
        action={
          <button
            className="button button-primary button-small"
            onClick={() => setLog(true)}
          >
            <Icon name="plus" size={16} />
            Log a completed repair
          </button>
        }
      />
      {hydrated && demo && (
        <div className="demo-banner">
          <Icon name="layers" size={17} />
          <span>
            <strong>Sample home.</strong> All history and dollar amounts below
            are illustrative. Your personal records are stored separately.
          </span>
          <button
            className="button button-small button-outline"
            onClick={() => {
              switchToPersonalHome();
              setStatus("Returned to your personal home.");
            }}
          >
            Back to my home
          </button>
        </div>
      )}
      {storage === "unavailable" && (
        <div className="mb-20">
          <Notice tone="warning">
            Browser storage is unavailable. Changes are held in this session and
            may disappear when you leave. Export your data before closing.
          </Notice>
        </div>
      )}
      <section className="home-overview">
        <div>
          <p className="eyebrow">
            {demo
              ? "ILLUSTRATIVE HOME PROFILE"
              : state.profileConfigured
                ? "YOUR HOME PROFILE"
                : "START WITH THE BASICS"}
          </p>
          <h2>
            {state.profileConfigured
              ? state.profile.homeName
              : "Make this place your own."}
          </h2>
          <p>
            {state.profileConfigured
              ? `${state.profile.housingType === "house" ? "Single-family house" : state.profile.housingType === "apartment" ? "Apartment" : "Townhome / condo"} · Built ${state.profile.yearBuilt} · ${HVAC_LABELS[state.profile.hvacType]}`
              : "Tell us the home type and equipment. We’ll tailor the maintenance list."}
          </p>
        </div>
        <Icon className="home-outline" name="home" />
        <button
          className="button button-small"
          onClick={() => {
            if (demo) switchToPersonalHome();
            setEdit(true);
          }}
        >
          {state.profileConfigured ? "Edit home profile" : "Set up my home"}
          <Icon name="arrow" size={16} />
        </button>
      </section>
      <div className="stats-grid">
        <section className="stat-card highlight">
          <span className="stat-label">
            <Icon name="receipt" size={16} />
            {demo ? "Example avoided cost" : "Self-reported avoided cost"}
          </span>
          <strong>{hydrated ? money(savings.savedThisYear) : "$0"}</strong>
          <small>
            {currentYear} · Quote minus actual spend
            <br />
            Not independently verified savings
          </small>
        </section>
        <section className="stat-card">
          <span className="stat-label">
            <Icon name="calendar" size={16} />
            Maintenance coverage
          </span>
          <strong>
            {hydrated ? coverage : 0}
            <span style={{ fontSize: 23 }}>%</span>
          </strong>
          <small>
            Current, unexpired task completions
            <br />
            Not a home condition or safety score
          </small>
          <div
            className="coverage-meter"
            role="progressbar"
            aria-label="Maintenance coverage"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={coverage}
          >
            <span style={{ width: `${coverage}%` }} />
          </div>
        </section>
        <section className="stat-card">
          <span className="stat-label">
            <Icon name="book" size={16} />
            Skills practiced
          </span>
          <strong>
            {hydrated ? state.unlockedSkills.length : 0}
            <span
              style={{ fontSize: 20, color: "var(--muted)", letterSpacing: 0 }}
            >
              {" "}
              / 12
            </span>
          </strong>
          <small>
            Passed a new scenario
            <br />
            No repair or savings automatically logged
          </small>
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="surface">
          <div className="surface-header">
            <div>
              <h2>Next on the list.</h2>
              <p>
                {activeDue.length} checks due · Dates repeat after completion
              </p>
            </div>
            <Link className="text-link" href="/prevent">
              Full plan
              <Icon name="arrow" size={15} />
            </Link>
          </div>
          {!state.profileConfigured && (
            <p className="small muted mb-20">
              A general starter checklist is shown until you set up your home.
            </p>
          )}
          {activeDue.length ? (
            activeDue.slice(0, 4).map(({ task, status: taskStatus }) => (
              <div className="due-row" key={task.id}>
                <span className={`due-marker ${taskStatus}`} />
                <div>
                  <h4>{task.title}</h4>
                  <p>
                    {task.cadence} · {task.minutes} min ·{" "}
                    {taskStatus === "overdue" ? "Overdue" : "Due now"}
                  </p>
                </div>
                <Link
                  href="/prevent"
                  className="button button-outline button-small"
                >
                  Review
                  <Icon name="chevron" size={13} />
                </Link>
              </div>
            ))
          ) : (
            <EmptyState
              icon="check"
              title="You're up to date."
              description={
                due[0]
                  ? `Your next check is due ${due[0].nextDue}. The plan will bring it back when it's time.`
                  : "Add your equipment to build a checklist."
              }
            />
          )}
        </section>
        <section className="surface">
          <div className="surface-header">
            <div>
              <h2>Know-how that stays.</h2>
              <p>Awarded after a different scenario</p>
            </div>
            <Link href="/guides" className="text-link">
              Learn
              <Icon name="arrow" size={15} />
            </Link>
          </div>
          {state.unlockedSkills.length ? (
            state.unlockedSkills.slice(0, 4).map((skill) => (
              <Link
                href={`/guides/${skill.id}`}
                key={skill.id}
                className="skill-row"
              >
                <span>
                  <Icon name="check" size={15} />
                </span>
                <div>
                  <h4>{skill.title.replace(/Mastery/g, "Practice")}</h4>
                  <p>
                    {skill.category} · {skill.unlockedAt}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              icon="book"
              title="Start with one useful skill."
              description="Explore the parts, learn the difference and try a fresh scenario. Reading alone doesn't unlock a skill."
              href="/guides"
              label="Find a skill to practice"
            />
          )}
        </section>
      </div>
      <section className="surface mt-30">
        <div className="surface-header">
          <div>
            <h2>Your repair ledger.</h2>
            <p>
              {demo
                ? "Illustrative sample entries"
                : "Only repairs you explicitly confirm"}{" "}
              · {state.repairHistory.length} records
            </p>
          </div>
          <button className="text-link" onClick={() => setLog(true)}>
            <Icon name="plus" size={15} />
            Add a repair
          </button>
        </div>
        {state.repairHistory.length ? (
          <div className="ledger-list">
            {state.repairHistory.map((record) => (
              <article className="ledger-entry" key={record.id}>
                <div>
                  <h4>{record.title}</h4>
                  <p>
                    {record.date} · {record.category} · Quote{" "}
                    {money(record.proEstimate)} · Spent {money(record.diySpent)}
                    {demo ? " · Sample data" : " · Self-reported"}
                  </p>
                </div>
                <strong>{money(record.savedAmount)}</strong>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="receipt"
            title="Your first repair starts at $0."
            description="When you've completed suitable work, record your real quote and actual costs. Lessons and estimated prices never add dollars here."
          />
        )}
      </section>
      <ToolLinks />
      <section className="surface mt-30">
        <div className="surface-header">
          <div>
            <h3>Your data. Your browser.</h3>
            <p>
              Export personal records or clear this browser's Fixdeed data. No
              account or cloud backup.
            </p>
          </div>
          <Icon name="lock" size={21} />
        </div>
        <div className="data-controls">
          <button
            className="button button-outline button-small"
            onClick={download}
          >
            <Icon name="download" size={15} />
            Export personal data
          </button>
          <button
            className="button button-outline button-small"
            onClick={() => {
              openSampleHome();
              setStatus("Sample home opened. Your personal home is preserved.");
            }}
          >
            <Icon name="layers" size={15} />
            Explore sample home
          </button>
          <Link href="/privacy" className="button button-outline button-small">
            Privacy details
            <Icon name="arrow-up" size={14} />
          </Link>
          <button
            className="button button-plain button-small"
            onClick={() => setDeleting(true)}
          >
            <Icon name="trash" size={14} />
            Clear browser data
          </button>
        </div>
        <p role="status" className="success-inline">
          {status}
        </p>
      </section>
      <ModalDialog
        open={edit}
        onClose={() => setEdit(false)}
        title={
          state.profileConfigured && !demo
            ? "Edit your home"
            : "Set up your home"
        }
      >
        {edit && (
          <HomeProfileForm
            profile={demo ? DEFAULT_STATE.profile : state.profile}
            onDone={() => {
              setEdit(false);
              setStatus("Home profile saved. Your checklist has been updated.");
            }}
          />
        )}
      </ModalDialog>
      <ModalDialog
        open={log}
        onClose={() => setLog(false)}
        title="Record a completed repair"
      >
        {log && (
          <RepairLogForm
            onDone={() => {
              setLog(false);
              setStatus("Completed repair recorded.");
            }}
          />
        )}
      </ModalDialog>
      <ModalDialog
        open={deleting}
        onClose={() => {
          setDeleting(false);
          setDeleteConfirmed(false);
        }}
        title="Clear Fixdeed browser data?"
      >
        <div className="form-stack">
          <Notice tone="warning">
            This removes your profile, repair ledger, checklist, skills and
            sample data from this browser. There is no cloud copy to recover.
          </Notice>
          <button className="button button-outline" onClick={download}>
            <Icon name="download" size={17} />
            Export my personal data first
          </button>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={deleteConfirmed}
              onChange={(e) => setDeleteConfirmed(e.target.checked)}
            />
            <span>
              I understand this permanently clears the Fixdeed data saved in
              this browser.
            </span>
          </label>
          {deleteError && (
            <div role="alert">
              <Notice tone="danger">{deleteError}</Notice>
            </div>
          )}
          <div className="form-actions">
            <button
              className="button button-outline"
              onClick={() => setDeleting(false)}
            >
              Keep my data
            </button>
            <button
              className="button button-danger"
              disabled={!deleteConfirmed}
              onClick={() => {
                if (clearHomeData()) {
                  setDeleting(false);
                  setDeleteConfirmed(false);
                  setDeleteError("");
                  setStatus("Fixdeed browser data cleared.");
                } else {
                  setDeleteError(
                    "We couldn't confirm that every record was removed. Some data may remain in this browser. Export your records, retry, or use your browser's site-data settings to remove Fixdeed data.",
                  );
                }
              }}
            >
              Clear my data
            </button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
