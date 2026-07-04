"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  assignPlaceholder,
  assignTask,
  createTask,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Badge,
  Input,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
} from "@/components/ui/form-elements";
import { format } from "date-fns";

type Project = {
  id: string;
  name: string;
  description: string | null;
  estimatedHours: number;
  deadline: Date;
  priority: string;
  status: string;
  skillRequirements: {
    skill: { name: string };
    minProficiency: string;
  }[];
  tasks: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    estimatedHours: number;
    assignments: {
      id: string;
      plannedHoursPerWeek: number;
      employee: { name: string } | null;
      placeholderRole: { title: string } | null;
    }[];
  }[];
};

export function ProjectDetail({
  project,
  employees,
  placeholders,
}: {
  project: Project;
  employees: { id: string; name: string }[];
  placeholders: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState("tasks");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [assigningTask, setAssigningTask] = useState<string | null>(null);

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await createTask({
      projectId: project.id,
      name: form.get("name") as string,
      startDate: form.get("startDate") as string,
      endDate: form.get("endDate") as string,
      estimatedHours: Number(form.get("estimatedHours")),
    });
    setShowTaskForm(false);
    router.refresh();
  }

  async function handleAssign(e: React.FormEvent<HTMLFormElement>, taskId: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const assignType = form.get("assignType") as string;

    if (assignType === "employee") {
      await assignTask({
        taskId,
        employeeId: form.get("employeeId") as string,
        plannedHoursPerWeek: Number(form.get("plannedHoursPerWeek")),
        startDate: form.get("startDate") as string,
        endDate: form.get("endDate") as string,
      });
    } else {
      await assignPlaceholder({
        taskId,
        placeholderRoleId: form.get("placeholderRoleId") as string,
        plannedHoursPerWeek: Number(form.get("plannedHoursPerWeek")),
        startDate: form.get("startDate") as string,
        endDate: form.get("endDate") as string,
      });
    }
    setAssigningTask(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/projects" className="text-sm text-neutral-500 hover:underline">
            ← Back to projects
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-neutral-500">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{project.status}</Badge>
          <Badge variant={project.priority === "CRITICAL" ? "red" : "outline"}>
            {project.priority}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg border p-3">
          <p className="text-neutral-500">Estimated Hours</p>
          <p className="text-xl font-semibold">{project.estimatedHours}h</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-neutral-500">Deadline</p>
          <p className="text-xl font-semibold">
            {format(new Date(project.deadline), "MMM d, yyyy")}
          </p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-neutral-500">Required Skills</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {project.skillRequirements.map((r, i) => (
              <Badge key={i} variant="outline">
                {r.skill.name} ({r.minProficiency})
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "tasks", label: "Tasks & Assignments" },
          { id: "variance", label: "Variance" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "tasks" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <Button size="sm" onClick={() => setShowTaskForm(!showTaskForm)}>
              {showTaskForm ? "Cancel" : "Add Task"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showTaskForm && (
              <form
                onSubmit={handleCreateTask}
                className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
              >
                <div className="space-y-2 sm:col-span-2">
                  <Label>Task Name</Label>
                  <Input name="name" required />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input name="startDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input name="endDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Hours</Label>
                  <Input name="estimatedHours" type="number" required />
                </div>
                <Button type="submit">Create Task</Button>
              </form>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.tasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <TableRow>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>
                        {format(new Date(task.startDate), "MMM d")} –{" "}
                        {format(new Date(task.endDate), "MMM d")}
                      </TableCell>
                      <TableCell>{task.estimatedHours}h</TableCell>
                      <TableCell>
                        {task.assignments.length === 0 ? (
                          <span className="text-neutral-400">Unassigned</span>
                        ) : (
                          task.assignments.map((a) => (
                            <div key={a.id} className="text-sm">
                              {a.employee?.name ?? (
                                <span className="italic text-neutral-500">
                                  {a.placeholderRole?.title}
                                </span>
                              )}{" "}
                              ({a.plannedHoursPerWeek}h/wk)
                            </div>
                          ))
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setAssigningTask(
                              assigningTask === task.id ? null : task.id
                            )
                          }
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                    {assigningTask === task.id && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <form
                            onSubmit={(e) => handleAssign(e, task.id)}
                            className="grid gap-3 rounded-lg bg-neutral-50 p-4 sm:grid-cols-3"
                          >
                            <div className="space-y-2">
                              <Label>Assignment Type</Label>
                              <Select name="assignType" defaultValue="employee">
                                <option value="employee">Employee</option>
                                <option value="placeholder">Shadow Placeholder</option>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Resource</Label>
                              <Select name="employeeId">
                                {employees.map((e) => (
                                  <option key={e.id} value={e.id}>
                                    {e.name}
                                  </option>
                                ))}
                              </Select>
                              <Select name="placeholderRoleId" className="mt-1">
                                {placeholders.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.title}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Hours/Week</Label>
                              <Input
                                name="plannedHoursPerWeek"
                                type="number"
                                defaultValue={20}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Start</Label>
                              <Input
                                name="startDate"
                                type="date"
                                defaultValue={new Date(task.startDate).toISOString().split("T")[0]}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End</Label>
                              <Input
                                name="endDate"
                                type="date"
                                defaultValue={new Date(task.endDate).toISOString().split("T")[0]}
                              />
                            </div>
                            <Button type="submit" className="self-end">
                              Confirm Assignment
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
