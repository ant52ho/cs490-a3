import {
  PrismaClient,
  Proficiency,
  ProjectPriority,
  ProjectStatus,
  Role,
  AbsenceType,
  AbsenceStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.alert.deleteMany();
  await prisma.timesheetEntry.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectSkillRequirement.deleteMany();
  await prisma.project.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.employeeSkill.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.companyCalendar.deleteMany();
  await prisma.placeholderRole.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.department.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const engineering = await prisma.department.create({
    data: { name: "Engineering" },
  });
  const design = await prisma.department.create({ data: { name: "Design" } });
  const product = await prisma.department.create({ data: { name: "Product" } });

  const skills = await Promise.all(
    [
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Figma",
      "Project Management",
      "AWS",
      "Python",
    ].map((name) => prisma.skill.create({ data: { name } }))
  );

  const skillMap = Object.fromEntries(skills.map((s) => [s.name, s]));

  const placeholders = await Promise.all(
    [
      "Unassigned Senior React Dev",
      "Unassigned Backend Engineer",
      "Unassigned UX Designer",
    ].map((title) => prisma.placeholderRole.create({ data: { title } }))
  );

  const calendar = await prisma.companyCalendar.create({
    data: { name: "Company Calendar 2026" },
  });

  const holidays = [
    { name: "New Year's Day", date: new Date("2026-01-01") },
    { name: "Independence Day", date: new Date("2026-07-04") },
    { name: "Thanksgiving", date: new Date("2026-11-26") },
    { name: "Christmas", date: new Date("2026-12-25") },
  ];

  for (const h of holidays) {
    await prisma.calendarEvent.create({
      data: { calendarId: calendar.id, name: h.name, date: h.date, hours: 8 },
    });
  }

  const employeesData = [
    {
      name: "Alice Chen",
      email: "alice@company.com",
      departmentId: engineering.id,
      skills: [
        { skill: "React", proficiency: Proficiency.EXPERT },
        { skill: "TypeScript", proficiency: Proficiency.EXPERT },
      ],
    },
    {
      name: "Bob Martinez",
      email: "bob@company.com",
      departmentId: engineering.id,
      skills: [
        { skill: "Node.js", proficiency: Proficiency.ADVANCED },
        { skill: "PostgreSQL", proficiency: Proficiency.ADVANCED },
      ],
    },
    {
      name: "Carol Johnson",
      email: "carol@company.com",
      departmentId: design.id,
      skills: [
        { skill: "Figma", proficiency: Proficiency.EXPERT },
        { skill: "React", proficiency: Proficiency.INTERMEDIATE },
      ],
    },
    {
      name: "David Kim",
      email: "david@company.com",
      departmentId: engineering.id,
      skills: [
        { skill: "Python", proficiency: Proficiency.ADVANCED },
        { skill: "AWS", proficiency: Proficiency.INTERMEDIATE },
      ],
    },
    {
      name: "Eva Williams",
      email: "eva@company.com",
      departmentId: product.id,
      skills: [
        { skill: "Project Management", proficiency: Proficiency.EXPERT },
        { skill: "Figma", proficiency: Proficiency.BEGINNER },
      ],
    },
    {
      name: "Frank Lopez",
      email: "frank@company.com",
      departmentId: engineering.id,
      skills: [
        { skill: "React", proficiency: Proficiency.ADVANCED },
        { skill: "Node.js", proficiency: Proficiency.INTERMEDIATE },
      ],
    },
    {
      name: "Grace Patel",
      email: "grace@company.com",
      departmentId: engineering.id,
      skills: [
        { skill: "TypeScript", proficiency: Proficiency.ADVANCED },
        { skill: "AWS", proficiency: Proficiency.ADVANCED },
      ],
    },
    {
      name: "Henry Brown",
      email: "henry@company.com",
      departmentId: design.id,
      skills: [{ skill: "Figma", proficiency: Proficiency.ADVANCED }],
      weeklyCapacityHours: 32,
    },
    {
      name: "Ivy Nguyen",
      email: "ivy@company.com",
      departmentId: engineering.id,
      skills: [
        { skill: "React", proficiency: Proficiency.EXPERT },
        { skill: "Node.js", proficiency: Proficiency.EXPERT },
      ],
    },
    {
      name: "Jack Turner",
      email: "jack@company.com",
      departmentId: product.id,
      skills: [
        { skill: "Project Management", proficiency: Proficiency.ADVANCED },
      ],
    },
  ];

  const employees = [];
  for (const e of employeesData) {
    const employee = await prisma.employee.create({
      data: {
        name: e.name,
        email: e.email,
        departmentId: e.departmentId,
        weeklyCapacityHours: e.weeklyCapacityHours ?? 40,
        skills: {
          create: e.skills.map((s) => ({
            skillId: skillMap[s.skill].id,
            proficiency: s.proficiency,
          })),
        },
        certifications: {
          create:
            e.name === "Alice Chen"
              ? [{ name: "AWS Solutions Architect", issuer: "Amazon" }]
              : [],
        },
      },
    });
    employees.push(employee);
  }

  await prisma.user.create({
    data: {
      email: "admin@company.com",
      name: "Admin User",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: "manager@company.com",
      name: "Manager User",
      passwordHash,
      role: Role.MANAGER,
    },
  });

  await prisma.user.create({
    data: {
      email: "alice@company.com",
      name: "Alice Chen",
      passwordHash,
      role: Role.EMPLOYEE,
      employeeId: employees[0].id,
    },
  });

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  await prisma.absence.create({
    data: {
      employeeId: employees[2].id,
      type: AbsenceType.PTO,
      status: AbsenceStatus.APPROVED,
      startDate: new Date(weekStart.getTime() + 7 * 86400000),
      endDate: new Date(weekStart.getTime() + 9 * 86400000),
      hours: 16,
      notes: "Family vacation",
    },
  });

  await prisma.absence.create({
    data: {
      employeeId: employees[7].id,
      type: AbsenceType.TRAINING,
      status: AbsenceStatus.APPROVED,
      startDate: weekStart,
      endDate: new Date(weekStart.getTime() + 2 * 86400000),
      hours: 8,
      notes: "Design systems workshop",
    },
  });

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Customer Portal Redesign",
        description: "Modernize the customer-facing portal",
        estimatedHours: 480,
        deadline: new Date("2026-08-15"),
        priority: ProjectPriority.HIGH,
        status: ProjectStatus.ACTIVE,
        skillRequirements: {
          create: [
            {
              skillId: skillMap["React"].id,
              minProficiency: Proficiency.ADVANCED,
            },
            {
              skillId: skillMap["TypeScript"].id,
              minProficiency: Proficiency.INTERMEDIATE,
            },
            { skillId: skillMap["Figma"].id, minProficiency: Proficiency.ADVANCED },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "API Platform v2",
        description: "Next generation API infrastructure",
        estimatedHours: 640,
        deadline: new Date("2026-09-30"),
        priority: ProjectPriority.CRITICAL,
        status: ProjectStatus.ACTIVE,
        skillRequirements: {
          create: [
            {
              skillId: skillMap["Node.js"].id,
              minProficiency: Proficiency.ADVANCED,
            },
            {
              skillId: skillMap["PostgreSQL"].id,
              minProficiency: Proficiency.ADVANCED,
            },
            { skillId: skillMap["AWS"].id, minProficiency: Proficiency.INTERMEDIATE },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Mobile App MVP",
        estimatedHours: 320,
        deadline: new Date("2026-07-31"),
        priority: ProjectPriority.MEDIUM,
        status: ProjectStatus.ACTIVE,
        skillRequirements: {
          create: [
            {
              skillId: skillMap["React"].id,
              minProficiency: Proficiency.INTERMEDIATE,
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Data Analytics Dashboard",
        estimatedHours: 400,
        deadline: new Date("2026-10-15"),
        priority: ProjectPriority.MEDIUM,
        status: ProjectStatus.PLANNING,
        skillRequirements: {
          create: [
            {
              skillId: skillMap["Python"].id,
              minProficiency: Proficiency.ADVANCED,
            },
            {
              skillId: skillMap["React"].id,
              minProficiency: Proficiency.INTERMEDIATE,
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Q4 Pipeline Initiative",
        estimatedHours: 200,
        deadline: new Date("2026-12-01"),
        priority: ProjectPriority.LOW,
        status: ProjectStatus.PLANNING,
        skillRequirements: {
          create: [
            {
              skillId: skillMap["Project Management"].id,
              minProficiency: Proficiency.ADVANCED,
            },
          ],
        },
      },
    }),
  ]);

  const taskData = [
    {
      projectId: projects[0].id,
      name: "UI Component Library",
      start: 0,
      duration: 28,
      hours: 120,
      employeeIdx: 0,
      hoursPerWeek: 20,
    },
    {
      projectId: projects[0].id,
      name: "Design System",
      start: 0,
      duration: 21,
      hours: 80,
      employeeIdx: 2,
      hoursPerWeek: 15,
    },
    {
      projectId: projects[0].id,
      name: "Auth Integration",
      start: 14,
      duration: 21,
      hours: 60,
      employeeIdx: 5,
      hoursPerWeek: 25,
    },
    {
      projectId: projects[1].id,
      name: "API Gateway Setup",
      start: 0,
      duration: 35,
      hours: 140,
      employeeIdx: 1,
      hoursPerWeek: 30,
    },
    {
      projectId: projects[1].id,
      name: "Database Migration",
      start: 7,
      duration: 28,
      hours: 100,
      employeeIdx: 3,
      hoursPerWeek: 20,
    },
    {
      projectId: projects[1].id,
      name: "Cloud Infrastructure",
      start: 14,
      duration: 42,
      hours: 160,
      employeeIdx: 6,
      hoursPerWeek: 25,
    },
    {
      projectId: projects[2].id,
      name: "Mobile UI Screens",
      start: 0,
      duration: 21,
      hours: 80,
      employeeIdx: 8,
      hoursPerWeek: 35,
    },
    {
      projectId: projects[4].id,
      name: "Future React Feature",
      start: 56,
      duration: 28,
      hours: 100,
      placeholderIdx: 0,
      hoursPerWeek: 20,
    },
  ];

  for (const t of taskData) {
    const startDate = new Date(weekStart.getTime() + t.start * 86400000);
    const endDate = new Date(
      weekStart.getTime() + (t.start + t.duration) * 86400000
    );

    const task = await prisma.task.create({
      data: {
        projectId: t.projectId,
        name: t.name,
        startDate,
        endDate,
        estimatedHours: t.hours,
        priority: ProjectPriority.MEDIUM,
      },
    });

    if ("employeeIdx" in t && t.employeeIdx !== undefined) {
      await prisma.assignment.create({
        data: {
          taskId: task.id,
          employeeId: employees[t.employeeIdx].id,
          startDate,
          endDate,
          plannedHoursPerWeek: t.hoursPerWeek,
        },
      });

      const varianceFactor = 0.7 + Math.random() * 0.6;
      const actualHours = Math.round(t.hours * varianceFactor);
      const numWeeks = Math.max(1, Math.ceil(t.duration / 7));
      const hoursPerWeek = actualHours / numWeeks;

      for (let w = 0; w < numWeeks; w++) {
        await prisma.timesheetEntry.create({
          data: {
            employeeId: employees[t.employeeIdx].id,
            taskId: task.id,
            weekStartDate: new Date(weekStart.getTime() + (t.start / 7 + w) * 7 * 86400000),
            hours: hoursPerWeek,
          },
        });
      }
    } else if ("placeholderIdx" in t && t.placeholderIdx !== undefined) {
      await prisma.assignment.create({
        data: {
          taskId: task.id,
          placeholderRoleId: placeholders[t.placeholderIdx].id,
          startDate,
          endDate,
          plannedHoursPerWeek: t.hoursPerWeek,
        },
      });
    }
  }

  console.log("Seed completed successfully");
  console.log("Login: admin@company.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
