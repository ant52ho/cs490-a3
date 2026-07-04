"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEmployee } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form-elements";

export default function NewEmployeePage({
  departments,
}: {
  departments: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const result = await createEmployee({
      name: form.get("name") as string,
      email: form.get("email") as string,
      departmentId: form.get("departmentId") as string,
      weeklyCapacityHours: Number(form.get("weeklyCapacityHours") || 40),
    });
    setLoading(false);
    if (result.success && result.data) {
      router.push(`/employees/${result.data.id}`);
    } else {
      setError(result.error ?? "Failed to create employee");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Add Employee</h1>
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select id="departmentId" name="departmentId" required>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyCapacityHours">Weekly Capacity (hours)</Label>
              <Input
                id="weeklyCapacityHours"
                name="weeklyCapacityHours"
                type="number"
                defaultValue={40}
                min={1}
                max={80}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Employee"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
