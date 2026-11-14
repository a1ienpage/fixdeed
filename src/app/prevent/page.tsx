"use client";
import Link from "next/link";
import { useState } from "react";
import {
  useFixdeedState,
  completePreventiveTask,
  uncompletePreventiveTask,
  usePersistenceStatus,
  useHydrated,
} from "@/lib/homeClientStore";
import { localDate } from "@/lib/homeStore";
import { filterTasksForProfile } from "@/content/preventive";
import { getTaskStatus, getMaintenanceCoverage } from "@/lib/scheduling";
import { Icon } from "@/components/Icon";
import { PageIntro, Notice, EmptyState } from "@/components/Workspace";
import { PlusPaywall } from "@/components/PlusPaywall";
import { hasPlusAccess } from "@/lib/plans";
import { buildMaintenanceCalendar } from "@/lib/calendarExport";
import { downloadText } from "@/lib/download";
const dateLabel = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
export default function PreventPage() {
  const state = useFixdeedState();
  const hydrated = useHydrated();
  const persistence = usePersistenceStatus();
  const [status, setStatus] = useState<"all" | "due" | "upcoming">("all");
  const [cadence, setCadence] = useState("All");
  const [season, setSeason] = useState("All");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [day, setDay] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [calendarPaywall, setCalendarPaywall] = useState(false);
  const [calendarMessage, setCalendarMessage] = useState("");
  function exportCalendar() {
    downloadText(
      "fixdeed-maintenance.ics",
      buildMaintenanceCalendar(state.profile, state.completedPreventive),
      "text/calendar;charset=utf-8",
    );
    setCalendarMessage(
      "Calendar file downloaded. Import it into your calendar app and allow its reminders. Re-import after changing completion dates; this file does not sync automatically.",
    );
  }
  const tasks = filterTasksForProfile(state.profile)
    .map((task) => ({
      task,
      ...getTaskStatus(task, state.completedPreventive[task.id]),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
  const due = tasks.filter((t) => t.status !== "upcoming");
  const upcoming = tasks.filter((t) => t.status === "upcoming");
  const coverage = getMaintenanceCoverage(
    tasks.map((t) => t.task),
    state.completedPreventive,
  );
  const filtered = tasks.filter(
    (t) =>
      (status === "all" ||
        (status === "due"
          ? t.status !== "upcoming"
          : t.status === "upcoming")) &&
      (cadence === "All" || t.task.cadence === cadence) &&
      (season === "All" || t.task.season === season) &&
      (!day || t.nextDue === day),
  );
  function complete(id: string, title: string) {
    completePreventiveTask(id);
    const task = tasks.find((t) => t.task.id === id)!.task;
    const next = getTaskStatus(task, localDate());
    setMessage(`Completed: ${title}. Next due ${dateLabel(next.nextDue)}.`);
  }
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekday = month.getDay();
  if (!hydrated)
    return (
      <div className="workspace container" aria-busy="true">
        <PageIntro
          eyebrow="SMALL TASKS. LESS LAST-MINUTE PANIC."
          title="A plan that comes back around."
          description="Loading your current schedule from this browser…"
        />
        <div className="surface">
          <div className="loading-line" />
        </div>
      </div>
    );
  return (
    <div className="workspace container">
      <PageIntro
        eyebrow="SMALL TASKS. LESS LAST-MINUTE PANIC."
        title="A plan that comes back around."
        description="Practical upkeep for your home, with real repeat dates. Complete a task today and see when it's due again."
        action={
          <Link className="button button-outline button-small" href="/my-home">
            My home profile
            <Icon name="home" size={16} />
          </Link>
        }
      />
      {state.dataMode === "demo" && (
        <div className="demo-banner">
          <Icon name="layers" size={16} />
          Sample home schedule. Completions here do not change your personal
          home.
        </div>
      )}
      {!state.profileConfigured && (
        <div className="mb-20">
          <Notice>
            This is a general starter checklist.{" "}
            <Link href="/my-home">Set up your home</Link> to tailor it to your
            property and equipment.
          </Notice>
        </div>
      )}
      {persistence === "unavailable" && (
        <div className="mb-20">
          <Notice tone="warning">
            Changes may not survive closing this browser. Export your home data
            before leaving.
          </Notice>
        </div>
      )}
      <section className="calendar-summary">
        <div>
          <h3>One check at a time.</h3>
          <p>
            Maintenance coverage is a schedule measure.
            <br />
            It is not an inspection of your home.
          </p>
        </div>
        <div>
          <strong>{due.length}</strong>
          <span>Due or overdue</span>
        </div>
        <div>
          <strong>{upcoming.length}</strong>
          <span>Up to date</span>
        </div>
        <div>
          <strong>{coverage}%</strong>
          <span>Current coverage</span>
        </div>
      </section>
      <div className="toolbar">
        <div className="segment-bar" aria-label="Task status filter">
          {(["all", "due", "upcoming"] as const).map((s) => (
            <button
              key={s}
              className={status === s ? "active" : ""}
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s);
                setDay(null);
              }}
            >
              {s === "all" ? "All tasks" : s === "due" ? "Due now" : "Upcoming"}
            </button>
          ))}
        </div>
        <div className="filters">
          <label className="sr-only" htmlFor="cadence-filter">
            Repeat interval
          </label>
          <select
            id="cadence-filter"
            value={cadence}
            onChange={(e) => setCadence(e.target.value)}
          >
            {[
              "All",
              "Monthly",
              "Every 3 Months",
              "Every 6 Months",
              "Annual",
            ].map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "Every interval" : c}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="season-filter">
            Season
          </label>
          <select
            id="season-filter"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            {["All", "Spring", "Summer", "Fall", "Winter"].map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "Every season" : s}
              </option>
            ))}
          </select>
          <button
            className="button button-outline button-small"
            onClick={() => {
              setView(view === "list" ? "calendar" : "list");
              setDay(null);
            }}
            aria-pressed={view === "calendar"}
          >
            <Icon name={view === "list" ? "calendar" : "layers"} size={15} />
            {view === "list" ? "Calendar" : "List"}
          </button>
        </div>
      </div>
      <section className="calendar-export-strip">
        <div>
          <h3>Put the next check in your calendar.</h3>
          <p>
            Export recurring tasks with reminder alarms. Import the file into
            Apple Calendar, Google Calendar or Outlook.
          </p>
          <p className="small muted">
            Manual import. Calendar apps control reminder delivery. Re-import
            after updates; no automatic sync.
          </p>
        </div>
        <button
          className="button button-outline"
          onClick={() =>
            hasPlusAccess(state) ? exportCalendar() : setCalendarPaywall(true)
          }
        >
          Export recurring calendar <Icon name="download" size={17} />
        </button>
      </section>
      {calendarMessage && (
        <p className="success-feedback" role="status">
          {calendarMessage}
        </p>
      )}
      <PlusPaywall
        open={calendarPaywall}
        onClose={() => setCalendarPaywall(false)}
        onActivated={exportCalendar}
        reason="Move repeat checks into the calendar you already use, with a reminder before each task."
      />
      {view === "calendar" && (
        <section className="surface month-calendar">
          <div className="surface-header">
            <button
              className="button button-outline button-small"
              aria-label="Previous month"
              onClick={() => {
                setMonth(
                  new Date(month.getFullYear(), month.getMonth() - 1, 1),
                );
                setDay(null);
              }}
            >
              <Icon
                name="chevron"
                size={15}
                style={{ transform: "rotate(180deg)" }}
              />
            </button>
            <h2>
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              className="button button-outline button-small"
              aria-label="Next month"
              onClick={() => {
                setMonth(
                  new Date(month.getFullYear(), month.getMonth() + 1, 1),
                );
                setDay(null);
              }}
            >
              <Icon name="chevron" size={15} />
            </button>
          </div>
          <div className="month-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
              <span className="month-weekday" key={w}>
                {w}
              </span>
            ))}
            {Array.from({ length: firstWeekday }, (_, i) => (
              <span key={"empty" + i} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = localDate(
                new Date(month.getFullYear(), month.getMonth(), i + 1),
              );
              const count = tasks.filter((t) => t.nextDue === date).length;
              return (
                <button
                  key={date}
                  className={`month-day ${day === date ? "selected" : ""} ${date === localDate() ? "today" : ""}`}
                  aria-label={`${dateLabel(date)}, ${count} tasks`}
                  aria-pressed={day === date}
                  onClick={() => {
                    setDay(day === date ? null : date);
                    setStatus("all");
                  }}
                >
                  <span>{i + 1}</span>
                  {count > 0 && (
                    <small>
                      {count}
                      <span className="month-task-word">
                        {" "}
                        task{count === 1 ? "" : "s"}
                      </span>
                    </small>
                  )}
                </button>
              );
            })}
          </div>
          <p className="small muted mt-20">
            Dates show each task's next scheduled check. Climate and
            manufacturer guidance may change when work is appropriate.
          </p>
        </section>
      )}
      <div
        role="status"
        aria-live="polite"
        className={message ? "notice notice-success mb-20" : ""}
      >
        {message && (
          <>
            <Icon name="check" size={18} />
            <span>{message}</span>
          </>
        )}
      </div>
      {day && (
        <div className="surface-header">
          <p className="small">Checks due {dateLabel(day)}</p>
          <button className="text-link" onClick={() => setDay(null)}>
            Show every date
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
      <div className="task-grid">
        {filtered.map(({ task, status: taskStatus, nextDue, daysUntil }) => (
          <article className={`task-card ${taskStatus}`} key={task.id}>
            <div className="task-head">
              <span className="mini-label">
                {task.cadence.toUpperCase()} / {task.minutes} MIN
              </span>
              <span className={`task-status ${taskStatus}`}>
                {taskStatus === "upcoming"
                  ? "Up to date"
                  : taskStatus === "overdue"
                    ? `${Math.abs(daysUntil)}d overdue`
                    : "Due now"}
              </span>
            </div>
            <h3>{task.title}</h3>
            <p>{task.whyItMatters}</p>
            <div className="task-date">
              <Icon name="calendar" size={13} />
              {taskStatus === "upcoming" ? "Next due" : "Due"}{" "}
              {dateLabel(nextDue)}
            </div>
            <details>
              <summary>What to check</summary>
              <ul>
                {task.quickSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </details>
            <div className="task-bottom">
              {taskStatus === "upcoming" ? (
                <button
                  className="button button-outline button-small"
                  onClick={() => {
                    uncompletePreventiveTask(task.id);
                    setMessage(`Completion removed: ${task.title}.`);
                  }}
                >
                  Undo completion
                </button>
              ) : (
                <button
                  className="button button-primary button-small"
                  onClick={() => complete(task.id, task.title)}
                >
                  <Icon name="check" size={14} />
                  Mark as done
                </button>
              )}
              {task.linkedGuideSlug && (
                <Link
                  className="text-link"
                  style={{ fontSize: 10 }}
                  href={`/guides/${task.linkedGuideSlug}`}
                >
                  Learn more
                  <Icon name="arrow-up" size={13} />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <section className="surface">
          <EmptyState
            icon="calendar"
            title="Nothing in this view."
            description="Try another date or filter. Completed tasks stay on your plan with their next due date."
          />
        </section>
      )}
      <div className="mt-30">
        <Notice>
          Schedule intervals are starting points. Follow the equipment manual
          and adapt for your climate and usage. Work at height, internal
          electrical work, gas systems and tank servicing require suitable
          professional help. Completing a task does not certify the condition of
          your home.
        </Notice>
      </div>
    </div>
  );
}
