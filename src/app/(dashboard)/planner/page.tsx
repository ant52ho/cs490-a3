import { Suspense } from "react";
import { PlannerView } from "@/components/planner/planner-view";
import {
  getProjectsWithTasks,
  getTeamHeatmapData,
} from "@/lib/services/data-service";

async function PlannerContent() {
  const [projects, heatmapData] = await Promise.all([
    getProjectsWithTasks(),
    getTeamHeatmapData(8),
  ]);

  const activeProjects = projects.filter((p) => p.status === "ACTIVE");

  return (
    <PlannerView
      projects={activeProjects.length > 0 ? activeProjects : projects}
      heatmapData={heatmapData}
    />
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div>Loading planner...</div>}>
      <PlannerContent />
    </Suspense>
  );
}
