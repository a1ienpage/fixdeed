import type { PreventiveTask } from "@/content/preventive";

function dateOnly(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function validDate(value?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isFinite(parsed.getTime()) && dateOnly(parsed) === value
    ? parsed
    : null;
}
const interval: Record<PreventiveTask["cadence"], number> = {
  Monthly: 1,
  "Every 3 Months": 3,
  "Every 6 Months": 6,
  Annual: 12,
};
export function getTaskStatus(
  task: PreventiveTask,
  lastCompleted?: string,
  now = new Date(),
): {
  status: "due" | "upcoming" | "overdue";
  nextDue: string;
  daysUntil: number;
} {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const completed = validDate(lastCompleted);
  if (!completed || completed > today)
    return { status: "due", nextDue: dateOnly(today), daysUntil: 0 };
  const due = new Date(
    completed.getFullYear(),
    completed.getMonth() + interval[task.cadence],
    1,
    12,
  );
  due.setDate(
    Math.min(
      completed.getDate(),
      new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate(),
    ),
  );
  const utcDay = (d: Date) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000;
  const daysUntil = utcDay(due) - utcDay(today);
  return {
    status: daysUntil < 0 ? "overdue" : daysUntil === 0 ? "due" : "upcoming",
    nextDue: dateOnly(due),
    daysUntil,
  };
}
/** Percentage of tasks whose current completion cycle is still valid. */
export function getMaintenanceCoverage(
  tasks: PreventiveTask[],
  completed: Record<string, string>,
  now = new Date(),
): number {
  return tasks.length
    ? Math.round(
        (tasks.filter(
          (task) =>
            getTaskStatus(task, completed[task.id], now).status === "upcoming",
        ).length /
          tasks.length) *
          100,
      )
    : 0;
}
