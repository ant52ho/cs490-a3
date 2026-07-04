export type UtilizationStatus = "green" | "yellow" | "red";

export type WeeklyCapacity = {
  weekStart: Date;
  totalHours: number;
  availableHours: number;
  blockedHours: number;
};

export type WeeklyUtilization = {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  weekStart: Date;
  availableHours: number;
  plannedHours: number;
  utilizationPct: number;
  status: UtilizationStatus;
};

export type TaskVariance = {
  taskId: string;
  taskName: string;
  plannedHours: number;
  actualHours: number;
  varianceHours: number;
  variancePct: number;
  flagged: boolean;
};

export type ProjectVariance = {
  projectId: string;
  projectName: string;
  plannedHours: number;
  actualHours: number;
  varianceHours: number;
  variancePct: number;
  flagged: boolean;
  tasks: TaskVariance[];
};

export type MatchBreakdown = {
  skillFit: number;
  availability: number;
  workload: number;
};

export type EmployeeMatch = {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  score: number;
  breakdown: MatchBreakdown;
  utilizationPct: number;
  status: UtilizationStatus;
};

export type SkillGap = {
  skillId: string;
  skillName: string;
  demandCount: number;
  supplyCount: number;
  gap: number;
  missing: boolean;
};

export type DashboardMetrics = {
  totalEmployees: number;
  activeProjects: number;
  availableCapacity: number;
  averageUtilization: number;
  overloadedCount: number;
  underutilizedCount: number;
  skillGapCount: number;
  topSkills: { name: string; count: number }[];
  upcomingShortages: { weekStart: Date; demand: number; supply: number }[];
};

export type AlertDto = {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  createdAt: Date;
};

export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
