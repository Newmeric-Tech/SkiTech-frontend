"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  showPercent?: boolean;
  animated?: boolean;
  index?: number;
}

export default function ProgressBar({
  label,
  value,
  maxValue = 100,
  color = "#3B82F6",
  showPercent = true,
  animated = true,
  index = 0,
}: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {showPercent && (
          <span className="text-sm font-semibold text-slate-900">{value}%</span>
        )}
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { delay: index * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] } : {}}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
