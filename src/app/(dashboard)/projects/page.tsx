import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/form-elements";
import { getProjectsWithTasks } from "@/lib/services/data-service";
import { format } from "date-fns";

export default async function ProjectsPage() {
  const projects = await getProjectsWithTasks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-neutral-500">Manage projects, tasks, and assignments</p>
        </div>
        <Link href="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Skills Required</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.priority === "CRITICAL" || p.priority === "HIGH"
                          ? "red"
                          : "outline"
                      }
                    >
                      {p.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(p.deadline, "MMM d, yyyy")}</TableCell>
                  <TableCell>{p.tasks.length}</TableCell>
                  <TableCell>
                    {p.skillRequirements
                      .map((r) => r.skill.name)
                      .slice(0, 2)
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-sm hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
