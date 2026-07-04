import {
  BENCH_RISK_THRESHOLD,
  BENCH_RISK_WEEKS,
  BURNOUT_THRESHOLD,
  BURNOUT_WEEKS,
} from "@/lib/config/scoring";
import { computeTeamUtilization } from "@/lib/engines/workload";
import { addWeeks, getWeekStart } from "@/lib/utils";
import type { AlertDto } from "@/types";

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

export function detectBenchRisk(
  employees: EmployeeInput[],
  holidays: HolidayInput[],
  weeksToCheck = BENCH_RISK_WEEKS
): Omit<AlertDto, "id">[] {
  const alerts: Omit<AlertDto, "id">[] = [];
  const startWeek = getWeekStart(new Date());
  const weekStarts = Array.from({ length: weeksToCheck }, (_, i) =>
    addWeeks(startWeek, i)
  );

  for (const employee of employees) {
    const utils = computeTeamUtilization([employee], weekStarts, holidays);
    const allLow = utils.every(
      (u) => u.utilizationPct < BENCH_RISK_THRESHOLD
    );
    if (allLow && utils.length >= weeksToCheck) {
      alerts.push({
        type: "BENCH_RISK",
        title: "Bench risk detected",
        message: `${employee.name} has been under ${BENCH_RISK_THRESHOLD}% utilization for ${weeksToCheck} consecutive weeks`,
        severity: "warning",
        createdAt: new Date(),
      });
    }
  }

  return alerts;
}

export function detectBurnoutRisk(
  employees: EmployeeInput[],
  holidays: HolidayInput[],
  weeksToCheck = BURNOUT_WEEKS
): Omit<AlertDto, "id">[] {
  const alerts: Omit<AlertDto, "id">[] = [];
  const startWeek = getWeekStart(new Date());
  const weekStarts = Array.from({ length: weeksToCheck }, (_, i) =>
    addWeeks(startWeek, i)
  );

  for (const employee of employees) {
    const utils = computeTeamUtilization([employee], weekStarts, holidays);
    const allHigh = utils.every(
      (u) => u.utilizationPct >= BURNOUT_THRESHOLD
    );
    if (allHigh && utils.length >= weeksToCheck) {
      alerts.push({
        type: "BURNOUT",
        title: "Burnout risk detected",
        message: `${employee.name} has been at or above ${BURNOUT_THRESHOLD}% capacity for ${weeksToCheck} consecutive weeks`,
        severity: "critical",
        createdAt: new Date(),
      });
    }
  }

  return alerts;
}

export function forecastResourceShortages(
  employees: EmployeeInput[],
  placeholderDemandByWeek: Map<string, number>,
  holidays: HolidayInput[],
  weeksForward = 12
): { weekStart: Date; demand: number; supply: number }[] {
  const startWeek = getWeekStart(new Date());
  const shortages: { weekStart: Date; demand: number; supply: number }[] = [];

  for (let i = 0; i < weeksForward; i++) {
    const weekStart = addWeeks(startWeek, i);
    const weekKey = weekStart.toISOString();
    const demand = placeholderDemandByWeek.get(weekKey) ?? 0;

    const utils = computeTeamUtilization(employees, [weekStart], holidays);
    const supply = utils.reduce(
      (sum, u) => sum + Math.max(0, u.availableHours - u.plannedHours),
      0
    );

    if (demand > supply) {
      shortages.push({ weekStart, demand, supply });
    }
  }

  return shortages;
}
