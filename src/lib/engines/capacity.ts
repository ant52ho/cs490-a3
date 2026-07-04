import { datesOverlap, getWeekStart } from "@/lib/utils";
import type { WeeklyCapacity } from "@/types";

type AbsenceInput = {
  startDate: Date;
  endDate: Date;
  hours: number;
  status: string;
  type: string;
};

type HolidayInput = {
  date: Date;
  hours: number;
};

export function getUtilizationStatus(
  utilizationPct: number
): "green" | "yellow" | "red" {
  if (utilizationPct > 100) return "red";
  if (utilizationPct >= 75) return "yellow";
  return "green";
}

export function computeWeeklyCapacity(
  weekStart: Date,
  weeklyCapacityHours: number,
  absences: AbsenceInput[],
  holidays: HolidayInput[]
): WeeklyCapacity {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  let blockedHours = 0;

  for (const absence of absences) {
    if (absence.status !== "APPROVED") continue;
    if (
      datesOverlap(absence.startDate, absence.endDate, weekStart, weekEnd)
    ) {
      blockedHours += absence.hours;
    }
  }

  for (const holiday of holidays) {
    const holidayStart = getWeekStart(holiday.date);
    if (holidayStart.getTime() === weekStart.getTime()) {
      blockedHours += holiday.hours;
    }
  }

  const availableHours = Math.max(0, weeklyCapacityHours - blockedHours);

  return {
    weekStart,
    totalHours: weeklyCapacityHours,
    availableHours,
    blockedHours,
  };
}

export function computeAssignmentHoursInWeek(
  weekStart: Date,
  assignmentStart: Date,
  assignmentEnd: Date,
  plannedHoursPerWeek: number
): number {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  if (!datesOverlap(assignmentStart, assignmentEnd, weekStart, weekEnd)) {
    return 0;
  }

  return plannedHoursPerWeek;
}
