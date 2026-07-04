import { Suspense } from "react";
import { RecommendationsView } from "@/components/recommendations/recommendations-view";
import {
  getEmployeeMatches,
  getProjectsWithTasks,
} from "@/lib/services/data-service";

async function RecommendationsContent({
  projectId,
  excludeOverloaded,
}: {
  projectId: string;
  excludeOverloaded: boolean;
}) {
  const projects = await getProjectsWithTasks();
  const activeProjects = projects.filter((p) => p.status !== "COMPLETED");
  const matches = projectId
    ? await getEmployeeMatches(projectId, excludeOverloaded)
    : [];

  return (
    <RecommendationsView
      projects={activeProjects.length > 0 ? activeProjects : projects}
      initialProjectId={projectId}
      initialMatches={matches}
    />
  );
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; excludeOverloaded?: string }>;
}) {
  const params = await searchParams;
  const projects = await getProjectsWithTasks();
  const activeProjects = projects.filter((p) => p.status !== "COMPLETED");
  const projectId =
    params.project ?? activeProjects[0]?.id ?? projects[0]?.id ?? "";
  const excludeOverloaded = params.excludeOverloaded === "1";

  return (
    <Suspense fallback={<div>Loading recommendations...</div>}>
      <RecommendationsContent
        projectId={projectId}
        excludeOverloaded={excludeOverloaded}
      />
    </Suspense>
  );
}
