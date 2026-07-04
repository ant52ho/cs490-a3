import Link from "next/link";
import { UtilizationBadge } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/form-elements";
import {
  getEmployeeUtilizations,
  getEmployeesFull,
} from "@/lib/services/data-service";

export default async function EmployeesPage() {
  const [employees, utilizations] = await Promise.all([
    getEmployeesFull(),
    getEmployeeUtilizations(),
  ]);

  const utilMap = new Map(utilizations.map((u) => [u.employeeId, u]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-neutral-500">Manage employee profiles and capacity</p>
        </div>
        <Link href="/employees/new">
          <Button>Add Employee</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => {
                const util = utilMap.get(emp.id);
                return (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.department.name}</TableCell>
                    <TableCell>
                      {emp.skills.slice(0, 3).map((s) => s.skill.name).join(", ")}
                      {emp.skills.length > 3 && "..."}
                    </TableCell>
                    <TableCell>{emp.weeklyCapacityHours}h/wk</TableCell>
                    <TableCell>
                      {util && (
                        <UtilizationBadge
                          utilizationPct={util.utilizationPct}
                          status={util.status}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/employees/${emp.id}`}
                        className="text-sm text-neutral-600 hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
