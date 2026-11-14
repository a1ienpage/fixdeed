import { describe, it, expect } from "vitest";
import { PREVENTIVE_TASKS } from "@/content/preventive";

describe("calendar recurrence", () => {
  it.each([
    ["Monthly", "2026-01-31", "2026-02-27", "2026-02-28", 1, "upcoming"],
    ["Monthly", "2026-01-31", "2026-02-28", "2026-02-28", 0, "due"],
    ["Monthly", "2026-01-31", "2026-03-01", "2026-02-28", -1, "overdue"],
    ["Every 3 Months", "2026-11-30", "2027-02-28", "2027-02-28", 0, "due"],
    [
      "Every 6 Months",
      "2026-08-31",
      "2027-02-01",
      "2027-02-28",
      27,
      "upcoming",
    ],
    ["Annual", "2024-02-29", "2025-02-28", "2025-02-28", 0, "due"],
  ] as const)(
    "%s completion %s at %s",
    async (cadence, completed, today, nextDue, daysUntil, status) => {
      const scheduling = await import("@/lib/scheduling");
      expect(
        scheduling.getTaskStatus(
          { ...PREVENTIVE_TASKS[0], cadence },
          completed,
          new Date(today + "T12:00:00"),
        ),
      ).toEqual({ nextDue, daysUntil, status });
    },
  );
  it("has due today without a valid completion and excludes expired tasks from coverage", async () => {
    const { getTaskStatus, getMaintenanceCoverage } = await import(
      "@/lib/scheduling"
    );
    const task = { ...PREVENTIVE_TASKS[0], id: "a" };
    const now = new Date("2026-11-15T12:00:00");
    expect(getTaskStatus(task, undefined, now)).toEqual({
      status: "due",
      nextDue: "2026-11-15",
      daysUntil: 0,
    });
    expect(getTaskStatus(task, "2026-02-31", now).status).toBe("due");
    expect(getTaskStatus(task, "2099-01-01", now).status).toBe("due");
    expect(
      getMaintenanceCoverage(
        [task, { ...task, id: "b" }],
        { a: "2026-11-01", b: "2020-01-01" },
        now,
      ),
    ).toBe(50);
    expect(getMaintenanceCoverage([], {}, now)).toBe(0);
  });
});
