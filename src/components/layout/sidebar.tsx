"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  FolderKanban,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Planner", icon: CalendarRange },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/settings/calendar", label: "Calendar", icon: Settings },
];

export function Sidebar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-6">
        <h1 className="text-lg font-bold">Daywise</h1>
        {userName && <p className="text-sm text-neutral-500">{userName}</p>}
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
