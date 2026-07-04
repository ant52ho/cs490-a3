import { Sidebar } from "@/components/layout/sidebar";
import { requireAuth } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar userName={session.user?.name} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
