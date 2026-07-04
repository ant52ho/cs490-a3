import {
  computeAssignmentHoursInWeek,
  computeWeeklyCapacity,
  getUtilizationStatus,
} from "@/lib/engines/capacity";
import { getWeekStart } from "@/lib/utils";
import type { WeeklyUtilization } from "@/types";

type EmployeeInput = {
  id: string;
  name: string;
  departmentName: string;
  weeklyCapacityHours: number;
  absences: {
    startDate: Date;
    endDate: Date;
    hours: number;
    status: string;
    type: string;
  }[];
  assignments: {
    startDate: Date;
    endDate: Date;
    plannedHoursPerWeek: number;
  }[];
};

type HolidayInput = { date: Date; hours: number };

export function computeEmployeeWeeklyUtilization(
  employee: EmployeeInput,
  weekStart: Date,
  holidays: HolidayInput[]
): WeeklyUtilization {
  const capacity = computeWeeklyCapacity(
    weekStart,
    employee.weeklyCapacityHours,
    employee.absences,
    holidays
  );

  const plannedHours = employee.assignments.reduce(
    (sum, assignment) =>
      sum +
      computeAssignmentHoursInWeek(
        weekStart,
        assignment.startDate,
        assignment.endDate,
        assignment.plannedHoursPerWeek
      ),
    0
  );

  const utilizationPct =
    capacity.availableHours > 0
      ? (plannedHours / capacity.availableHours) * 100
      : plannedHours > 0
        ? 100
        : 0;

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    departmentName: employee.departmentName,
    weekStart,
    availableHours: capacity.availableHours,
    plannedHours,
    utilizationPct,
    status: getUtilizationStatus(utilizationPct),
  };
}

export function computeTeamUtilization(
  employees: EmployeeInput[],
  weekStarts: Date[],
  holidays: HolidayInput[]
): WeeklyUtilization[] {
  const results: WeeklyUtilization[] = [];
  for (const employee of employees) {
    for (const weekStart of weekStarts) {
      results.push(
        computeEmployeeWeeklyUtilization(employee, weekStart, holidays)
      );
    }
  }
  return results;
}

export function getCurrentWeekUtilization(
  employees: EmployeeInput[],
  holidays: HolidayInput[]
): WeeklyUtilization[] {
  const weekStart = getWeekStart(new Date());
  return employees.map((employee) =>
    computeEmployeeWeeklyUtilization(employee, weekStart, holidays)
  );
}

export function averageUtilization(utilizations: WeeklyUtilization[]): number {
  if (utilizations.length === 0) return 0;
  return (
    utilizations.reduce((sum, u) => sum + u.utilizationPct, 0) /
    utilizations.length
  );
}
