"use client";

import { cn } from "@/lib/utils";
import type { WeeklyUtilization } from "@/types";
import { format } from "date-fns";

const statusColors = {
  green: "bg-green-400",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
};

export function WorkloadHeatmap({
  data,
  onCellClick,
}: {
  data: WeeklyUtilization[];
  onCellClick?: (item: WeeklyUtilization) => void;
}) {
  const employees = [...new Set(data.map((d) => d.employeeId))];
  const weeks = [
    ...new Set(data.map((d) => d.weekStart.toISOString())),
  ].sort();

  const getCell = (employeeId: string, weekIso: string) =>
    data.find(
      (d) =>
        d.employeeId === employeeId && d.weekStart.toISOString() === weekIso
    );

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white p-2 text-left font-medium">
              Employee
            </th>
            {weeks.map((w) => (
              <th key={w} className="p-2 text-center font-medium text-neutral-500">
                {format(new Date(w), "MMM d")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((empId) => {
            const empName = data.find((d) => d.employeeId === empId)?.employeeName;
            return (
              <tr key={empId} className="border-t">
                <td className="sticky left-0 bg-white p-2 font-medium whitespace-nowrap">
                  {empName}
                </td>
                {weeks.map((w) => {
                  const cell = getCell(empId, w);
                  if (!cell) return <td key={w} className="p-1" />;
                  return (
                    <td key={w} className="p-1">
                      <button
                        type="button"
                        onClick={() => onCellClick?.(cell)}
                        className={cn(
                          "flex h-10 w-full min-w-[48px] flex-col items-center justify-center rounded text-xs font-medium text-white transition-opacity hover:opacity-80",
                          statusColors[cell.status]
                        )}
                        title={`${Math.round(cell.utilizationPct)}% (${cell.plannedHours}h / ${cell.availableHours}h)`}
                      >
                        {Math.round(cell.utilizationPct)}%
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 flex gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-green-400" /> Healthy (&lt;75%)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-yellow-400" /> Approaching (75-100%)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-red-500" /> Overloaded (&gt;100%)
        </span>
      </div>
    </div>
  );
}
