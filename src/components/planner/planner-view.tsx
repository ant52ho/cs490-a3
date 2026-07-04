"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { GanttChart } from "@/components/planner/gantt-chart";
import { WorkloadHeatmap } from "@/components/planner/workload-heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/form-elements";
import type { WeeklyUtilization } from "@/types";

type Project = {
  id: string;
  name: string;
  tasks: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    assignments: {
      placeholderRoleId: string | null;
    }[];
  }[];
};

export function PlannerView({
  projects,
  heatmapData,
}: {
  projects: Project[];
  heatmapData: WeeklyUtilization[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProject = searchParams.get("project") ?? projects[0]?.id ?? "";
  const [selectedProject, setSelectedProject] = useState(initialProject);
  const [selectedCell, setSelectedCell] = useState<WeeklyUtilization | null>(
    null
  );

  const project = projects.find((p) => p.id === selectedProject);
  const ganttTasks =
    project?.tasks.map((t) => ({
      id: t.id,
      name: t.name,
      startDate: t.startDate,
      endDate: t.endDate,
      isPlaceholder: t.assignments.some((a) => a.placeholderRoleId),
    })) ?? [];

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    router.push(`/planner?project=${projectId}`);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project / Workload Planner</h1>
          <p className="text-neutral-500">
            Drag tasks above to see capacity shift below in real time
          </p>
        </div>
        <div className="w-64 space-y-1">
          <Label htmlFor="project">Active Project</Label>
          <Select
            id="project"
            value={selectedProject}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="flex flex-1 flex-col min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Project Timeline</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <GanttChart tasks={ganttTasks} />
        </CardContent>
      </Card>

      <Card className="flex flex-1 flex-col min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Employee Workload Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <WorkloadHeatmap data={heatmapData} onCellClick={setSelectedCell} />
          {selectedCell && (
            <div className="mt-4 rounded-lg border bg-neutral-50 p-3 text-sm">
              <strong>{selectedCell.employeeName}</strong>:{" "}
              {Math.round(selectedCell.utilizationPct)}% utilization (
              {selectedCell.plannedHours}h planned /{" "}
              {selectedCell.availableHours}h available)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
