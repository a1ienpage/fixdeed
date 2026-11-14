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
  expect(calendar).toContain("UID:prev_gfci_test@fixdeed.local");
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
