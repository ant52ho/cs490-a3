"use client";

import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateTaskDates } from "@/lib/actions";

type TaskItem = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isPlaceholder?: boolean;
};

export function GanttChart({ tasks }: { tasks: TaskItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const ganttTasks: GanttTask[] = tasks.map((task) => ({
    id: task.id,
    name: task.isPlaceholder ? `[Placeholder] ${task.name}` : task.name,
    start: new Date(task.startDate),
    end: new Date(task.endDate),
    progress: task.isPlaceholder ? 0 : 50,
    type: "task",
    styles: task.isPlaceholder
      ? {
          progressColor: "#94a3b8",
          progressSelectedColor: "#64748b",
          backgroundColor: "#f1f5f9",
          backgroundSelectedColor: "#e2e8f0",
        }
      : undefined,
  }));

  const handleDateChange = (task: GanttTask) => {
    startTransition(async () => {
      await updateTaskDates(task.id, task.start, task.end);
      router.refresh();
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-500">
        No tasks for this project
      </div>
    );
  }

  return (
    <div className={isPending ? "opacity-60" : ""}>
      <Gantt
        tasks={ganttTasks}
        viewMode={ViewMode.Week}
        onDateChange={handleDateChange}
        listCellWidth=""
        columnWidth={65}
      />
    </div>
  );
}
