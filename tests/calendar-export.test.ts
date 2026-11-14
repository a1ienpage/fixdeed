import { expect, it } from "vitest";
import { buildMaintenanceCalendar } from "@/lib/calendarExport";
import { DEFAULT_STATE } from "@/lib/homeStore";
it("exports all-day recurring tasks with calendar-month intervals and an importable alarm", () => {
  const calendar = buildMaintenanceCalendar(
    DEFAULT_STATE.profile,
    { prev_gfci_test: "2026-11-15" },
    new Date("2026-11-15T12:00:00"),
  );
  expect(calendar).toContain("BEGIN:VCALENDAR\r\n");
  expect(calendar).toContain("DTSTART;VALUE=DATE:20261215");
  expect(calendar).toContain("RRULE:FREQ=MONTHLY;INTERVAL=1");
  expect(calendar).toContain("BEGIN:VALARM");
  expect(calendar).toContain("TRIGGER:-PT9H");
  expect(calendar).toContain("UID:personal-prev_gfci_test@fixdeed.local");
});
it("keeps event identities stable per home without colliding with sample exports", () => {
  const now = new Date("2026-11-15T12:00:00");
  const personal = buildMaintenanceCalendar(
    DEFAULT_STATE.profile,
    {},
    now,
    "personal",
  );
  const sample = buildMaintenanceCalendar(
    DEFAULT_STATE.profile,
    {},
    now,
    "demo",
  );
  expect(personal).toContain("UID:personal-prev_gfci_test@fixdeed.local");
  expect(sample).toContain("UID:demo-prev_gfci_test@fixdeed.local");
  expect(
    buildMaintenanceCalendar(
      DEFAULT_STATE.profile,
      { prev_gfci_test: "2026-11-01" },
      now,
      "personal",
    ),
  ).toContain("UID:personal-prev_gfci_test@fixdeed.local");
});
it("does not anchor a task to a future completion ignored by the scheduler", () => {
  const calendar = buildMaintenanceCalendar(
    DEFAULT_STATE.profile,
    { prev_gfci_test: "2026-12-31" },
    new Date("2026-11-15T12:00:00"),
  );
  expect(calendar).toContain("DTSTART;VALUE=DATE:20261115");
  expect(calendar).not.toContain("BYMONTHDAY=28,29,30,31");
});
it("does not put private home names or notes into the calendar", () => {
  const calendar = buildMaintenanceCalendar(
    {
      ...DEFAULT_STATE.profile,
      homeName: "Private, home;\nBEGIN:VEVENT",
      pastIssues: ["private notes"],
    },
    {},
    new Date("2026-11-15T12:00:00"),
  );
  expect(calendar).not.toContain("Private");
  expect(calendar).not.toContain("private notes");
});
it("retains the month-end anchor even before noon on the completion date",()=>{
 const calendar=buildMaintenanceCalendar(DEFAULT_STATE.profile,{prev_gfci_test:"2026-01-31"},new Date("2026-01-31T03:00:00"));
 expect(calendar).toContain("BYMONTHDAY=28,29,30,31;BYSETPOS=-1");
});
