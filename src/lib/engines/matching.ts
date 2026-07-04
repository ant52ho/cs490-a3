import { MATCH_WEIGHTS } from "@/lib/config/scoring";
import {
  computeEmployeeWeeklyUtilization,
  getCurrentWeekUtilization,
} from "@/lib/engines/workload";
import { getWeeksBetween, proficiencyRank, proficiencyWeight } from "@/lib/utils";
import type { EmployeeMatch } from "@/types";

type SkillRequirement = {
  skillId: string;
  minProficiency: string;
};

type EmployeeSkill = {
  skillId: string;
  proficiency: string;
};

type EmployeeInput = {
  id: string;
  name: string;
  departmentName: string;
  weeklyCapacityHours: number;
  skills: EmployeeSkill[];
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

function computeSkillFit(
  requirements: SkillRequirement[],
  skills: EmployeeSkill[]
): number {
  if (requirements.length === 0) return 100;

  let total = 0;
  for (const req of requirements) {
    const match = skills.find((s) => s.skillId === req.skillId);
    if (!match) {
      total += 0;
      continue;
    }
    if (
      proficiencyRank(match.proficiency) <
      proficiencyRank(req.minProficiency)
    ) {
      total += proficiencyWeight(match.proficiency) * 50;
    } else {
      total += proficiencyWeight(match.proficiency) * 100;
    }
  }

  return total / requirements.length;
}

function computeAvailabilityScore(
  employee: EmployeeInput,
  projectStart: Date,
  projectEnd: Date,
  holidays: HolidayInput[]
): number {
  const weeks = getWeeksBetween(projectStart, projectEnd);
  if (weeks.length === 0) return 0;

  let totalScore = 0;
  for (const weekStart of weeks) {
    const util = computeEmployeeWeeklyUtilization(
      employee,
      weekStart,
      holidays
    );
    const remaining =
      util.availableHours > 0
        ? Math.max(0, util.availableHours - util.plannedHours) /
          util.availableHours
        : 0;
    totalScore += remaining * 100;
  }

  return totalScore / weeks.length;
}

function computeWorkloadScore(utilizationPct: number): number {
  if (utilizationPct > 100) return 0;
  if (utilizationPct > 75) return 30;
  if (utilizationPct >= 40 && utilizationPct <= 60) return 100;
  if (utilizationPct < 40) return 70;
  return 60;
}

export function matchEmployeesToProject(
  employees: EmployeeInput[],
  requirements: SkillRequirement[],
  projectStart: Date,
  projectEnd: Date,
  holidays: HolidayInput[],
  excludeOverloaded = false
): EmployeeMatch[] {
  const currentUtil = getCurrentWeekUtilization(employees, holidays);
  const utilMap = new Map(currentUtil.map((u) => [u.employeeId, u]));

  const matches: EmployeeMatch[] = employees
    .map((employee) => {
      const util = utilMap.get(employee.id)!;
      if (excludeOverloaded && util.status === "red") return null;

      const skillFit = computeSkillFit(requirements, employee.skills);
      const availability = computeAvailabilityScore(
        employee,
        projectStart,
        projectEnd,
        holidays
      );
      const workload = computeWorkloadScore(util.utilizationPct);

      const score =
        skillFit * MATCH_WEIGHTS.skillFit +
        availability * MATCH_WEIGHTS.availability +
        workload * MATCH_WEIGHTS.workload;

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        departmentName: employee.departmentName,
        score: Math.round(score),
        breakdown: {
          skillFit: Math.round(skillFit),
          availability: Math.round(availability),
          workload: Math.round(workload),
        },
        utilizationPct: util.utilizationPct,
        status: util.status,
      };
    })
    .filter((m): m is EmployeeMatch => m !== null)
    .sort((a, b) => b.score - a.score);

  return matches;
}
