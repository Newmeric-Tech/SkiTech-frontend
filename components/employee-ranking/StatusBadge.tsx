"use client";

interface StatusBadgeProps {
  status: "Premium Performer" | "High Performer" | "Consistent" | "Needs Attention" | "New" | string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, any> = {
  "Premium Performer": {
    bg: "bg-slate-950",
    text: "text-white",
    border: "border-slate-950",
    dot: "bg-white",
  },
  "High Performer": {
    bg: "bg-white",
    text: "text-emerald-600",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  Consistent: {
    bg: "bg-white",
    text: "text-blue-600",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
  },
  "Needs Attention": {
    bg: "bg-white",
    text: "text-orange-500",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  New: {
    bg: "bg-white",
    text: "text-purple-600",
    border: "border-purple-500/30",
    dot: "bg-purple-500",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config?.bg || 'bg-slate-100'} ${config?.text || 'text-slate-700'} ${config?.border || 'border-slate-200'} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config?.dot || 'bg-slate-500'}`} />
      {status}
    </span>
  );
}
