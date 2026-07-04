import { Badge } from "@/components/ui/form-elements";
import { cn, formatPercent } from "@/lib/utils";
import type { UtilizationStatus } from "@/types";

const statusVariant: Record<UtilizationStatus, "green" | "yellow" | "red"> = {
  green: "green",
  yellow: "yellow",
  red: "red",
};

const statusLabel: Record<UtilizationStatus, string> = {
  green: "Healthy",
  yellow: "Approaching capacity",
  red: "Overloaded",
};

export function UtilizationBadge({
  utilizationPct,
  status,
  showPercent = true,
}: {
  utilizationPct: number;
  status: UtilizationStatus;
  showPercent?: boolean;
}) {
  return (
    <Badge variant={statusVariant[status]}>
      {showPercent ? formatPercent(utilizationPct) : statusLabel[status]}
      {showPercent ? ` · ${statusLabel[status]}` : ""}
    </Badge>
  );
}

export function UtilizationBar({
  utilizationPct,
  status,
  label,
}: {
  utilizationPct: number;
  status: UtilizationStatus;
  label?: string;
}) {
  const colors: Record<UtilizationStatus, string> = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{formatPercent(utilizationPct)}</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-neutral-100">
        <div
          className={cn("h-2 rounded-full transition-all", colors[status])}
          style={{ width: `${Math.min(utilizationPct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>}
    </div>
  );
}
