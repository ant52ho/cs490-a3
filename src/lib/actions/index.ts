"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/session";
import type { ActionResult } from "@/types";
import bcrypt from "bcryptjs";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/planner");
  revalidatePath("/employees");
  revalidatePath("/projects");
  revalidatePath("/recommendations");
}

export async function updateTaskDates(
  taskId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResult> {
  await requireRole(["ADMIN", "MANAGER"]);

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { startDate, endDate },
    });

    await prisma.assignment.updateMany({
      where: { taskId },
      data: { startDate, endDate },
    });

    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update task dates" };
  }
}

export async function createEmployee(data: {
  name: string;
  email: string;
  departmentId: string;
  weeklyCapacityHours?: number;
}): Promise<ActionResult<{ id: string }>> {
  await requireRole(["ADMIN", "MANAGER"]);

  try {
    const employee = await prisma.employee.create({
      data: {
        name: data.name,
        email: data.email,
        departmentId: data.departmentId,
        weeklyCapacityHours: data.weeklyCapacityHours ?? 40,
      },
    });
    revalidatePath("/employees");
    return { success: true, data: { id: employee.id } };
  } catch {
    return { success: false, error: "Failed to create employee" };
  }
}

export async function updateEmployee(
  id: string,
  data: {
    name?: string;
    email?: string;
    departmentId?: string;
    weeklyCapacityHours?: number;
  }
): Promise<ActionResult> {
  await requireRole(["ADMIN", "MANAGER"]);

  try {
    await prisma.employee.update({ where: { id }, data });
    revalidatePath(`/employees/${id}`);
    revalidatePath("/employees");
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update employee" };
  }
}

export async function assignSkill(
  employeeId: string,
  skillId: string,
  proficiency: string
): Promise<ActionResult> {
  await requireRole(["ADMIN", "MANAGER"]);

  try {
    await prisma.employeeSkill.upsert({
      where: { employeeId_skillId: { employeeId, skillId } },
      create: {
        employeeId,
        skillId,
        proficiency: proficiency as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
      },
      update: {
        proficiency: proficiency as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
      },
    });
    revalidatePath(`/employees/${employeeId}`);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to assign skill" };
  }
}

export async function addCertification(
  employeeId: string,
  data: { name: string; issuer?: string }
): Promise<ActionResult> {
  await requireRole(["ADMIN", "MANAGER"]);

  try {
    await prisma.certification.create({
      data: { employeeId, name: data.name, issuer: data.issuer },
    });
    revalidatePath(`/employees/${employeeId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add certification" };
  }
}

export async function createProject(data: {
  name: string;
  description?: string;
  estimatedHours: number;
  deadline: string;
  priority: string;
  skillIds: { skillId: string; minProficiency: string }[];
}): Promise<ActionResult<{ id: string }>> {
  await requireRole(["ADMIN", "MANAGER"]);

  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        estimatedHours: data.estimatedHours,
        deadline: new Date(data.deadline),
        priority: data.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        skillRequirements: {
          create: data.skillIds.map((s) => ({
            skillId: s.skillId,
            minProficiency: s.minProficiency as
              | "BEGINNER"
              | "INTERMEDIATE"
              | "ADVANCED"
              | "EXPERT",
          })),
        },
      },
    });
    revalidatePath("/projects");
    return { success: true, data: { id: project.id } };
  } catch {
    return { success: false, error: "Failed to create project" };
  }
}

export async function createTask(data: {
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  priority?: string;
}): Promise<ActionResult> {
  await requireRole(["ADMIN", "MANAGER"]);

  try {
    await prisma.task.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        estimatedHours: data.estimatedHours,
        priority:
          (data.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") ?? "MEDIUM",
      },
    });
    revalidatePath(`/projects/${data.projectId}`);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create task" };
  }
}

export async function assignTask(data: {
  taskId: string;
  employeeId: string;
  plannedHoursPerWeek: number;
  startDate: string;
  endDate: string;
}): Promise<ActionResult> {
  await requireRole(["ADMIN", "MANAGER"]);

  try {
    await prisma.assignment.create({
      data: {
        taskId: data.taskId,
        employeeId: data.employeeId,
        plannedHoursPerWeek: data.plannedHoursPerWeek,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to assign task" };
  }
}

export async function assignPlaceholder(data: {
  taskId: string;
  placeholderRoleId: string;
  plannedHoursPerWeek: number;
  startDate: string;
  endDate: string;
}): Promise<ActionResult> {
  await requireRole(["ADMIN", "MANAGER"]);

  try {
    await prisma.assignment.create({
      data: {
        taskId: data.taskId,
        placeholderRoleId: data.placeholderRoleId,
        plannedHoursPerWeek: data.plannedHoursPerWeek,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to assign placeholder" };
  }
}

export async function createAbsence(data: {
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  hours: number;
  notes?: string;
}): Promise<ActionResult> {
  await requireAuth();

  try {
    await prisma.absence.create({
      data: {
        employeeId: data.employeeId,
        type: data.type as "PTO" | "TRAINING" | "OTHER",
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        hours: data.hours,
        notes: data.notes,
        status: "APPROVED",
      },
    });
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create absence" };
  }
}

export async function createCalendarEvent(data: {
  name: string;
  date: string;
  hours?: number;
}): Promise<ActionResult> {
  await requireRole(["ADMIN"]);

  try {
    let calendar = await prisma.companyCalendar.findFirst();
    if (!calendar) {
      calendar = await prisma.companyCalendar.create({ data: { name: "Default" } });
    }

    await prisma.calendarEvent.create({
      data: {
        calendarId: calendar.id,
        name: data.name,
        date: new Date(data.date),
        hours: data.hours ?? 8,
      },
    });
    revalidatePath("/settings/calendar");
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create calendar event" };
  }
}

export async function deleteCalendarEvent(id: string): Promise<ActionResult> {
  await requireRole(["ADMIN"]);

  try {
    await prisma.calendarEvent.delete({ where: { id } });
    revalidatePath("/settings/calendar");
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete calendar event" };
  }
}

export async function seedDemoPasswordCheck() {
  return bcrypt.hash("password123", 10);
}
