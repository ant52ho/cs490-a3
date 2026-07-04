"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addCertification,
  assignSkill,
  createAbsence,
  updateEmployee,
} from "@/lib/actions";
import { UtilizationBadge } from "@/components/dashboard/metric-card";
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
import type { WeeklyUtilization } from "@/types";
import { format } from "date-fns";

type Employee = {
  id: string;
  name: string;
  email: string;
  weeklyCapacityHours: number;
  department: { id: string; name: string };
  skills: { skillId: string; proficiency: string; skill: { name: string } }[];
  certifications: { id: string; name: string; issuer: string | null }[];
  assignments: {
    id: string;
    plannedHoursPerWeek: number;
    startDate: Date;
    endDate: Date;
    task: { name: string; project: { name: string } };
    placeholderRole: { title: string } | null;
  }[];
  absences: {
    id: string;
    type: string;
    startDate: Date;
    endDate: Date;
    hours: number;
    notes: string | null;
  }[];
};

export function EmployeeDetail({
  employee,
  departments,
  skills,
  utilization,
}: {
  employee: Employee;
  departments: { id: string; name: string }[];
  skills: { id: string; name: string }[];
  utilization: WeeklyUtilization | undefined;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [message, setMessage] = useState("");

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await updateEmployee(employee.id, {
      name: form.get("name") as string,
      email: form.get("email") as string,
      departmentId: form.get("departmentId") as string,
      weeklyCapacityHours: Number(form.get("weeklyCapacityHours")),
    });
    setMessage(result.success ? "Saved" : result.error ?? "Error");
    router.refresh();
  }

  async function handleAssignSkill(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await assignSkill(
      employee.id,
      form.get("skillId") as string,
      form.get("proficiency") as string
    );
    router.refresh();
  }

  async function handleAddCert(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await addCertification(employee.id, {
      name: form.get("certName") as string,
      issuer: (form.get("issuer") as string) || undefined,
    });
    router.refresh();
  }

  async function handleAddAbsence(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await createAbsence({
      employeeId: employee.id,
      type: form.get("type") as string,
      startDate: form.get("startDate") as string,
      endDate: form.get("endDate") as string,
      hours: Number(form.get("hours")),
      notes: (form.get("notes") as string) || undefined,
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{employee.name}</h1>
          <p className="text-neutral-500">{employee.department.name}</p>
        </div>
        {utilization && (
          <UtilizationBadge
            utilizationPct={utilization.utilizationPct}
            status={utilization.status}
          />
        )}
      </div>

      <Tabs
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "assignments", label: "Assignments" },
          { id: "absences", label: "Absences" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={employee.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" defaultValue={employee.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department</Label>
                  <Select
                    id="departmentId"
                    name="departmentId"
                    defaultValue={employee.department.id}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyCapacityHours">Weekly Capacity</Label>
                  <Input
                    id="weeklyCapacityHours"
                    name="weeklyCapacityHours"
                    type="number"
                    defaultValue={employee.weeklyCapacityHours}
                  />
                </div>
                {message && <p className="text-sm text-green-600">{message}</p>}
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((s) => (
                    <Badge key={s.skillId} variant="outline">
                      {s.skill.name} · {s.proficiency}
                    </Badge>
                  ))}
                </div>
                <form onSubmit={handleAssignSkill} className="flex gap-2">
                  <Select name="skillId" className="flex-1">
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                  <Select name="proficiency" defaultValue="INTERMEDIATE">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </Select>
                  <Button type="submit" size="sm">
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.certifications.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-medium">{c.name}</span>
                    {c.issuer && (
                      <span className="text-neutral-500"> · {c.issuer}</span>
                    )}
                  </div>
                ))}
                <form onSubmit={handleAddCert} className="flex gap-2">
                  <Input name="certName" placeholder="Certification name" required />
                  <Input name="issuer" placeholder="Issuer" />
                  <Button type="submit" size="sm">
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "assignments" && (
        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Hours/Week</TableHead>
                  <TableHead>Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.task.project.name}</TableCell>
                    <TableCell>
                      {a.task.name}
                      {a.placeholderRole && (
                        <Badge variant="outline" className="ml-2">
                          Placeholder
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{a.plannedHoursPerWeek}h</TableCell>
                    <TableCell>
                      {format(new Date(a.startDate), "MMM d")} –{" "}
                      {format(new Date(a.endDate), "MMM d")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "absences" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Absence History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {employee.absences.map((a) => (
                <div key={a.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex justify-between">
                    <Badge variant="outline">{a.type}</Badge>
                    <span>{a.hours}h</span>
                  </div>
                  <p className="mt-1 text-neutral-500">
                    {format(new Date(a.startDate), "MMM d")} –{" "}
                    {format(new Date(a.endDate), "MMM d")}
                  </p>
                  {a.notes && <p className="mt-1">{a.notes}</p>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Absence</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAbsence} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="type" defaultValue="PTO">
                    <option value="PTO">PTO</option>
                    <option value="TRAINING">Training</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start</Label>
                    <Input name="startDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>End</Label>
                    <Input name="endDate" type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hours</Label>
                  <Input name="hours" type="number" defaultValue={8} required />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input name="notes" />
                </div>
                <Button type="submit">Add Absence</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
