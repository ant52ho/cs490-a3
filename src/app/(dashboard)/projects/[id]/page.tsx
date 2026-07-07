import { VarianceTable } from "@/components/projects/variance-table";
import { ProjectDetail } from "@/components/projects/project-detail";
import { notFound } from "next/navigation";
import {
  getActiveEmployees,
  getPlaceholderRoles,
  getProjectVariance,
  getProjectsWithTasks,
} from "@/lib/services/data-service";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [projects, employees, placeholders, variance] = await Promise.all([
    getProjectsWithTasks(),
    getActiveEmployees(),
    getPlaceholderRoles(),
    getProjectVariance(id),
  ]);

  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <ProjectDetail
        project={project}
        employees={employees}
        placeholders={placeholders}
      />
      {variance && <VarianceTable variance={variance} />}
    </div>
  );
}
