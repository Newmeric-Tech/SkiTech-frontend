import { AlertTriangle, CheckCircle2, Clock, ClockAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import type { KraDisplayStatus, KraFrequency } from "@/lib/api/kraTasks";
import { formatPeriodLabel } from "./periodLabel";

const STATUS: Record<KraDisplayStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-slate-50 text-slate-700 border-slate-200",
  },
  delayed: {
    label: "Delayed",
    icon: AlertTriangle,
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  completed_delayed: {
    label: "Completed late",
    icon: ClockAlert,
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800",
  },
};

export function KraStatusBadge({ status, className }: { status: KraDisplayStatus; className?: string }) {
  const { label, icon: Icon, className: colours } = STATUS[status];
  return (
    <Badge variant="outline" className={cn("rounded-full", colours, className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}

export const FREQUENCY_LABELS: Record<KraFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};

export function KraFrequencyLabel({ frequency, className }: { frequency: KraFrequency; className?: string }) {
  return (
    <span className={cn("inline-flex items-center text-xs font-medium text-slate-600", className)}>
      {FREQUENCY_LABELS[frequency]}
    </span>
  );
}

export function KraPeriodLabel({ frequency, periodStart, periodEnd, className }: {
  frequency: KraFrequency;
  periodStart: string;
  periodEnd: string;
  className?: string;
}) {
  return (
    <span className={cn("text-xs text-slate-500 whitespace-nowrap", className)}>
      {formatPeriodLabel(frequency, periodStart, periodEnd)}
    </span>
  );
}
