"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TeamCapacityChart({
  data,
}: {
  data: {
    name: string;
    available: number;
    allocated: number;
  }[];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="available" fill="#22c55e" name="Available hrs" stackId="a" />
          <Bar dataKey="allocated" fill="#6366f1" name="Allocated hrs" stackId="b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
