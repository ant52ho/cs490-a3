import { VARIANCE_THRESHOLD_PCT } from "@/lib/config/scoring";
import type { ProjectVariance, TaskVariance } from "@/types";

type TaskInput = {
  id: string;
  name: string;
  estimatedHours: number;
  timesheetHours: number;
};

export function computeTaskVariance(task: TaskInput): TaskVariance {
  const plannedHours = task.estimatedHours;
  const actualHours = task.timesheetHours;
  const varianceHours = actualHours - plannedHours;
  const variancePct =
    plannedHours > 0 ? (varianceHours / plannedHours) * 100 : 0;

  return {
    taskId: task.id,
    taskName: task.name,
    plannedHours,
    actualHours,
    varianceHours,
    variancePct,
    flagged: Math.abs(variancePct) > VARIANCE_THRESHOLD_PCT,
  };
}

export function computeProjectVariance(
  projectId: string,
  projectName: string,
  tasks: TaskInput[]
): ProjectVariance {
  const taskVariances = tasks.map(computeTaskVariance);
  const plannedHours = taskVariances.reduce((s, t) => s + t.plannedHours, 0);
  const actualHours = taskVariances.reduce((s, t) => s + t.actualHours, 0);
  const varianceHours = actualHours - plannedHours;
  const variancePct =
    plannedHours > 0 ? (varianceHours / plannedHours) * 100 : 0;

  return {
    projectId,
    projectName,
    plannedHours,
    actualHours,
    varianceHours,
    variancePct,
    flagged: Math.abs(variancePct) > VARIANCE_THRESHOLD_PCT,
    tasks: taskVariances,
  };
}
