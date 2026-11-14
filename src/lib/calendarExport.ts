import type { HomeProfile } from "@/lib/homeStore";
import { filterTasksForProfile } from "@/content/preventive";
import { getTaskStatus } from "@/lib/scheduling";
export function escapeCalendarText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
function foldLine(line: string): string {
  let result = "",
    current = "",
    bytes = 0;
  const encoder = new TextEncoder();
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > 74) {
      result += current + "\r\n ";
      current = "";
      bytes = 1;
    }
    current += ch;
    bytes += size;
  }
  return result + current;
}
export function buildMaintenanceCalendar(
  profile: HomeProfile,
  completed: Record<string, string>,
  now = new Date(),
): string {
  const cadence = {
    Monthly: 1,
    "Every 3 Months": 3,
    "Every 6 Months": 6,
    Annual: 12,
  };
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fixdeed//Home Care//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Fixdeed home care",
  ];
  for (const task of filterTasksForProfile(profile)) {
    const { nextDue } = getTaskStatus(task, completed[task.id], now);
    const date = new Date(nextDue + "T12:00:00");
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    const dateText = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const anchorDay = Number((completed[task.id] ?? nextDue).slice(8, 10));
    const byDay =
      anchorDay > 28
        ? `;BYMONTHDAY=${Array.from({ length: anchorDay - 27 }, (_, i) => 28 + i).join(",")};BYSETPOS=-1`
        : `;BYMONTHDAY=${anchorDay}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${task.id}@fixdeed.local`,
      `DTSTAMP:${now
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}`,
      `DTSTART;VALUE=DATE:${nextDue.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${dateText(end)}`,
      `RRULE:FREQ=MONTHLY;INTERVAL=${cadence[task.cadence]}${byDay}`,
      `SUMMARY:${escapeCalendarText(task.title)}`,
      `DESCRIPTION:${escapeCalendarText(task.quickSteps.join("\n") + "\nFollow your equipment manual. This exported schedule does not sync with Fixdeed. Re-import after changing completion dates.")}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT9H",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeCalendarText(task.title)}`,
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
