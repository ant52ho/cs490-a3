import { notFound } from "next/navigation";
import { EmployeeDetail } from "@/components/employees/employee-detail";
import {
  getDepartments,
  getEmployeeUtilizations,
  getEmployeesFull,
  getSkills,
} from "@/lib/services/data-service";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employees, departments, skills, utilizations] = await Promise.all([
    getEmployeesFull(),
    getDepartments(),
    getSkills(),
    getEmployeeUtilizations(),
  ]);

  const employee = employees.find((e) => e.id === id);
  if (!employee) notFound();

  const utilization = utilizations.find((u) => u.employeeId === id);

  return (
    <EmployeeDetail
      employee={employee}
      departments={departments}
      skills={skills}
      utilization={utilization}
    />
  );
}
