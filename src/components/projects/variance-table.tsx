import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/form-elements";
import type { ProjectVariance } from "@/types";

export function VarianceTable({ variance }: { variance: ProjectVariance }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Time Variance Report</CardTitle>
          {variance.flagged && (
            <Badge variant="red">
              Project over variance threshold ({Math.round(variance.variancePct)}%)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border p-3">
            <p className="text-neutral-500">Planned</p>
            <p className="text-xl font-semibold">{Math.round(variance.plannedHours)}h</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-neutral-500">Actual</p>
            <p className="text-xl font-semibold">{Math.round(variance.actualHours)}h</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-neutral-500">Variance</p>
            <p className="text-xl font-semibold">
              {variance.varianceHours > 0 ? "+" : ""}
              {Math.round(variance.varianceHours)}h
            </p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Planned</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variance.tasks.map((task) => (
              <TableRow key={task.taskId}>
                <TableCell className="font-medium">{task.taskName}</TableCell>
                <TableCell>{Math.round(task.plannedHours)}h</TableCell>
                <TableCell>{Math.round(task.actualHours)}h</TableCell>
                <TableCell>
                  {task.varianceHours > 0 ? "+" : ""}
                  {Math.round(task.varianceHours)}h ({Math.round(task.variancePct)}%)
                </TableCell>
                <TableCell>
                  {task.flagged ? (
                    <Badge variant="red">Flagged</Badge>
                  ) : (
                    <Badge variant="green">On track</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
