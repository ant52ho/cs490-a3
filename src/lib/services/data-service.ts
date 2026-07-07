import { prisma } from "@/lib/db";
import {
  detectBenchRisk,
  detectBurnoutRisk,
  forecastResourceShortages,
} from "@/lib/engines/advanced";
import { matchEmployeesToProject } from "@/lib/engines/matching";
import {
  analyzeSkillGaps,
  getTopInDemandSkills,
  getTrainingRecommendations,
} from "@/lib/engines/skill-gap";
import { computeProjectVariance } from "@/lib/engines/variance";
import {
  averageUtilization,
  computeTeamUtilization,
  getCurrentWeekUtilization,
} from "@/lib/engines/workload";
import { addWeeks, getWeekStart } from "@/lib/utils";
import type { DashboardMetrics, EmployeeMatch, ProjectVariance } from "@/types";

async function getHolidays() {
  const events = await prisma.calendarEvent.findMany();
  return events.map((e) => ({ date: e.date, hours: e.hours }));
}

async function getEmployeesForEngine(activeOnly = true) {
  const employees = await prisma.employee.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    include: {
      department: true,
      skills: true,
      absences: true,
      assignments: true,
    },
  });

  return employees.map((e) => ({
    id: e.id,
    name: e.name,
    departmentName: e.department.name,
    weeklyCapacityHours: e.isActive ? e.weeklyCapacityHours : 0,
    isActive: e.isActive,
    skills: e.skills.map((s) => ({
      skillId: s.skillId,
      proficiency: s.proficiency,
    })),
    absences: e.absences.map((a) => ({
      startDate: a.startDate,
      endDate: a.endDate,
      hours: a.hours,
      status: a.status,
      type: a.type,
    })),
    assignments: e.isActive
      ? e.assignments.map((a) => ({
          startDate: a.startDate,
          endDate: a.endDate,
          plannedHoursPerWeek: a.plannedHoursPerWeek,
        }))
      : [],
  }));
}

export async function getActiveEmployees() {
  return prisma.employee.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [employees, projects, requirements, holidays, placeholders] =
    await Promise.all([
      getEmployeesForEngine(),
      prisma.project.findMany({ where: { status: "ACTIVE" } }),
      prisma.projectSkillRequirement.findMany({
        include: { skill: true, project: true },
      }),
      getHolidays(),
      prisma.assignment.findMany({
        where: { placeholderRoleId: { not: null } },
      }),
    ]);

  const currentUtil = getCurrentWeekUtilization(employees, holidays);
  const employeeSkills = await prisma.employeeSkill.findMany();
  const gaps = analyzeSkillGaps(
    requirements.map((r) => ({
      skillId: r.skillId,
      skillName: r.skill.name,
      minProficiency: r.minProficiency,
      projectId: r.projectId,
    })),
    employeeSkills.map((es) => ({
      skillId: es.skillId,
      proficiency: es.proficiency,
      employeeId: es.employeeId,
    }))
  );

  const startWeek = getWeekStart(new Date());
  const weekStarts = Array.from({ length: 12 }, (_, i) => addWeeks(startWeek, i));
  const placeholderDemand = new Map<string, number>();
  for (const weekStart of weekStarts) {
    const weekEnd = addWeeks(weekStart, 1);
    const demand = placeholders
      .filter(
        (p) => p.startDate <= weekEnd && p.endDate >= weekStart
      )
      .reduce((s, p) => s + p.plannedHoursPerWeek, 0);
    placeholderDemand.set(weekStart.toISOString(), demand);
  }

  const shortages = forecastResourceShortages(
    employees,
    placeholderDemand,
    holidays
  );

  return {
    totalEmployees: employees.length,
    activeProjects: projects.length,
    availableCapacity: currentUtil.reduce((s, u) => s + u.availableHours, 0),
    averageUtilization: Math.round(averageUtilization(currentUtil)),
    overloadedCount: currentUtil.filter((u) => u.status === "red").length,
    underutilizedCount: currentUtil.filter((u) => u.utilizationPct < 40).length,
    skillGapCount: gaps.filter((g) => g.gap > 0).length,
    topSkills: getTopInDemandSkills(
      requirements.map((r) => ({
        skillId: r.skillId,
        skillName: r.skill.name,
        minProficiency: r.minProficiency,
        projectId: r.projectId,
      }))
    ),
    upcomingShortages: shortages.slice(0, 5),
  };
}

export async function getEmployeeUtilizations() {
  const employees = await getEmployeesForEngine();
  const holidays = await getHolidays();
  return getCurrentWeekUtilization(employees, holidays);
}

export async function getTeamHeatmapData(weekCount = 8) {
  const employees = await getEmployeesForEngine();
  const holidays = await getHolidays();
  const startWeek = getWeekStart(new Date());
  const weekStarts = Array.from({ length: weekCount }, (_, i) =>
    addWeeks(startWeek, i)
  );
  return computeTeamUtilization(employees, weekStarts, holidays);
}

export async function getSkillGaps() {
  const requirements = await prisma.projectSkillRequirement.findMany({
    include: { skill: true },
  });
  const employeeSkills = await prisma.employeeSkill.findMany();
  return analyzeSkillGaps(
    requirements.map((r) => ({
      skillId: r.skillId,
      skillName: r.skill.name,
      minProficiency: r.minProficiency,
      projectId: r.projectId,
    })),
    employeeSkills.map((es) => ({
      skillId: es.skillId,
      proficiency: es.proficiency,
      employeeId: es.employeeId,
    }))
  );
}

export async function getProjectVariances(): Promise<ProjectVariance[]> {
  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        include: {
          timesheetEntries: true,
        },
      },
    },
  });

  return projects.map((project) =>
    computeProjectVariance(
      project.id,
      project.name,
      project.tasks.map((task) => ({
        id: task.id,
        name: task.name,
        estimatedHours: task.estimatedHours,
        timesheetHours: task.timesheetEntries.reduce(
          (s, t) => s + t.hours,
          0
        ),
      }))
    )
  );
}

export async function getProjectVariance(projectId: string) {
  const variances = await getProjectVariances();
  return variances.find((v) => v.projectId === projectId) ?? null;
}

export async function getEmployeeMatches(
  projectId: string,
  excludeOverloaded = false
): Promise<EmployeeMatch[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      skillRequirements: true,
      tasks: true,
    },
  });
  if (!project) return [];

  const employees = await getEmployeesForEngine();
  const holidays = await getHolidays();
  const projectStart =
    project.tasks.length > 0
      ? new Date(Math.min(...project.tasks.map((t) => t.startDate.getTime())))
      : new Date();
  const projectEnd =
    project.tasks.length > 0
      ? new Date(Math.max(...project.tasks.map((t) => t.endDate.getTime())))
      : project.deadline;

  return matchEmployeesToProject(
    employees,
    project.skillRequirements.map((r) => ({
      skillId: r.skillId,
      minProficiency: r.minProficiency,
    })),
    projectStart,
    projectEnd,
    holidays,
    excludeOverloaded
  );
}

export async function getAdvancedAlerts() {
  const employees = await getEmployeesForEngine();
  const holidays = await getHolidays();
  const gaps = await getSkillGaps();
  const employeeSkills = await prisma.employeeSkill.findMany();

  const bench = detectBenchRisk(employees, holidays);
  const burnout = detectBurnoutRisk(employees, holidays);
  const training = getTrainingRecommendations(
    gaps,
    employeeSkills.map((es) => ({
      skillId: es.skillId,
      proficiency: es.proficiency,
      employeeId: es.employeeId,
    })),
    new Map()
  ).map((t) => ({
    type: "TRAINING_RECOMMENDATION" as const,
    title: "Training recommendation",
    message: t.message,
    severity: "info",
    createdAt: new Date(),
  }));

  const stored = await prisma.alert.findMany({
    where: { dismissed: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    generated: [...bench, ...burnout, ...training],
    stored,
  };
}

export async function getProjectsWithTasks() {
  return prisma.project.findMany({
    include: {
      tasks: {
        include: {
          assignments: {
            include: {
              employee: true,
              placeholderRole: true,
            },
          },
        },
        orderBy: { startDate: "asc" },
      },
      skillRequirements: { include: { skill: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getEmployeesFull() {
  return prisma.employee.findMany({
    include: {
      department: true,
      skills: { include: { skill: true } },
      certifications: true,
      assignments: {
        include: {
          task: { include: { project: true } },
          placeholderRole: true,
        },
      },
      absences: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}

export async function getSkills() {
  return prisma.skill.findMany({ orderBy: { name: "asc" } });
}

export async function getPlaceholderRoles() {
  return prisma.placeholderRole.findMany({ orderBy: { title: "asc" } });
}

export async function getCalendarEvents() {
  return prisma.calendarEvent.findMany({
    orderBy: { date: "asc" },
  });
}
