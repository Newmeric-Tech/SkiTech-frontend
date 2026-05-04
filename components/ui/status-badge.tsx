import { cn } from "./utils";

interface StatusBadgeProps {
  status: "pending" | "verified";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    verified: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const labels = {
    pending: "Pending",
    verified: "Verified",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}