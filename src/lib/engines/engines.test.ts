import { describe, expect, it } from "vitest";
import {
  computeAssignmentHoursInWeek,
  computeWeeklyCapacity,
  getUtilizationStatus,
} from "@/lib/engines/capacity";
import {
  averageUtilization,
  computeEmployeeWeeklyUtilization,
} from "@/lib/engines/workload";
import { computeProjectVariance, computeTaskVariance } from "@/lib/engines/variance";
import { matchEmployeesToProject } from "@/lib/engines/matching";
import { analyzeSkillGaps } from "@/lib/engines/skill-gap";
import { getWeekStart } from "@/lib/utils";

describe("Capacity Engine", () => {
  const weekStart = getWeekStart(new Date("2026-07-06"));

  it("computes available hours minus PTO", () => {
    const result = computeWeeklyCapacity(weekStart, 40, [
      {
        startDate: new Date("2026-07-07"),
        endDate: new Date("2026-07-08"),
        hours: 16,
        status: "APPROVED",
        type: "PTO",
      },
    ], []);

    expect(result.availableHours).toBe(24);
    expect(result.blockedHours).toBe(16);
  });

  it("returns utilization status thresholds", () => {
    expect(getUtilizationStatus(50)).toBe("green");
    expect(getUtilizationStatus(80)).toBe("yellow");
    expect(getUtilizationStatus(110)).toBe("red");
  });

  it("counts assignment hours in overlapping week", () => {
    const hours = computeAssignmentHoursInWeek(
      weekStart,
      new Date("2026-07-01"),
      new Date("2026-07-20"),
      20
    );
    expect(hours).toBe(20);
  });
});

describe("Workload Engine", () => {
  const weekStart = getWeekStart(new Date("2026-07-06"));

  it("computes employee utilization", () => {
    const result = computeEmployeeWeeklyUtilization(
      {
        id: "1",
        name: "Alice",
        departmentName: "Engineering",
        weeklyCapacityHours: 40,
        absences: [],
        assignments: [
          {
            startDate: new Date("2026-07-01"),
            endDate: new Date("2026-07-31"),
            plannedHoursPerWeek: 30,
          },
        ],
      },
      weekStart,
      []
    );

    expect(result.utilizationPct).toBe(75);
    expect(result.status).toBe("yellow");
  });

  it("averages utilization across employees", () => {
    const avg = averageUtilization([
      {
        employeeId: "1",
        employeeName: "A",
        departmentName: "Eng",
        weekStart,
        availableHours: 40,
        plannedHours: 20,
        utilizationPct: 50,
        status: "green",
      },
      {
        employeeId: "2",
        employeeName: "B",
        departmentName: "Eng",
        weekStart,
        availableHours: 40,
        plannedHours: 30,
        utilizationPct: 75,
        status: "yellow",
      },
    ]);
    expect(avg).toBe(62.5);
  });
});

describe("Variance Engine", () => {
  it("flags tasks over variance threshold", () => {
    const result = computeTaskVariance({
      id: "1",
      name: "Task A",
      estimatedHours: 100,
      timesheetHours: 120,
    });
    expect(result.varianceHours).toBe(20);
    expect(result.flagged).toBe(true);
  });

  it("rolls up project variance", () => {
    const result = computeProjectVariance("p1", "Project", [
      { id: "1", name: "T1", estimatedHours: 50, timesheetHours: 50 },
      { id: "2", name: "T2", estimatedHours: 50, timesheetHours: 70 },
    ]);
    expect(result.actualHours).toBe(120);
    expect(result.plannedHours).toBe(100);
  });
});

describe("Matching Engine", () => {
  it("scores employees for a project", () => {
    const matches = matchEmployeesToProject(
      [
        {
          id: "1",
          name: "Alice",
          departmentName: "Eng",
          weeklyCapacityHours: 40,
          skills: [
            { skillId: "react", proficiency: "EXPERT" },
            { skillId: "ts", proficiency: "ADVANCED" },
          ],
          absences: [],
          assignments: [],
        },
        {
          id: "2",
          name: "Bob",
          departmentName: "Eng",
          weeklyCapacityHours: 40,
          skills: [{ skillId: "python", proficiency: "EXPERT" }],
          absences: [],
          assignments: [
            {
              startDate: new Date("2026-07-01"),
              endDate: new Date("2026-12-31"),
              plannedHoursPerWeek: 40,
            },
          ],
        },
      ],
      [
        { skillId: "react", minProficiency: "ADVANCED" },
        { skillId: "ts", minProficiency: "INTERMEDIATE" },
      ],
      new Date("2026-07-01"),
      new Date("2026-12-31"),
      []
    );

    expect(matches[0].employeeName).toBe("Alice");
    expect(matches[0].score).toBeGreaterThan(matches[1].score);
  });
});

describe("Skill Gap Engine", () => {
  it("identifies missing skills", () => {
    const gaps = analyzeSkillGaps(
      [
        {
          skillId: "react",
          skillName: "React",
          minProficiency: "ADVANCED",
          projectId: "p1",
        },
        {
          skillId: "react",
          skillName: "React",
          minProficiency: "ADVANCED",
          projectId: "p2",
        },
        {
          skillId: "rust",
          skillName: "Rust",
          minProficiency: "INTERMEDIATE",
          projectId: "p3",
        },
      ],
      [{ skillId: "react", proficiency: "EXPERT", employeeId: "e1" }]
    );

    const rustGap = gaps.find((g) => g.skillName === "Rust");
    expect(rustGap?.missing).toBe(true);
    expect(rustGap?.gap).toBe(1);
  });
});
