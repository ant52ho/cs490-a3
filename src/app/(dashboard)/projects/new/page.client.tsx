"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProject } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form-elements";

export default function NewProjectPage({
  skills,
}: {
  skills: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<
    { skillId: string; minProficiency: string }[]
  >([]);
  const [error, setError] = useState("");

  function toggleSkill(skillId: string) {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.skillId === skillId);
      if (exists) return prev.filter((s) => s.skillId !== skillId);
      return [...prev, { skillId, minProficiency: "INTERMEDIATE" }];
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await createProject({
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      estimatedHours: Number(form.get("estimatedHours")),
      deadline: form.get("deadline") as string,
      priority: form.get("priority") as string,
      skillIds: selectedSkills,
    });
    if (result.success && result.data) {
      router.push(`/projects/${result.data.id}`);
    } else {
      setError(result.error ?? "Failed to create project");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">New Project</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input id="estimatedHours" name="estimatedHours" type="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" name="deadline" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" name="priority" defaultValue="MEDIUM">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSkill(s.id)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      selectedSkills.some((sk) => sk.skillId === s.id)
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit">Create Project</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
