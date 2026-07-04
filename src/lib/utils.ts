import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

export function getWeeksBetween(start: Date, end: Date): Date[] {
  const weeks: Date[] = [];
  let current = getWeekStart(start);
  const endWeek = getWeekStart(end);
  while (current <= endWeek) {
    weeks.push(new Date(current));
    current = addWeeks(current, 1);
  }
  return weeks;
}

export function datesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export function proficiencyWeight(proficiency: string): number {
  switch (proficiency) {
    case "BEGINNER":
      return 0.5;
    case "INTERMEDIATE":
      return 0.75;
    case "ADVANCED":
      return 0.9;
    case "EXPERT":
      return 1;
    default:
      return 0.5;
  }
}

export function proficiencyRank(proficiency: string): number {
  switch (proficiency) {
    case "BEGINNER":
      return 1;
    case "INTERMEDIATE":
      return 2;
    case "ADVANCED":
      return 3;
    case "EXPERT":
      return 4;
    default:
      return 0;
  }
}
