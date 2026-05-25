"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ScoreCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  index?: number;
}

export default function ScoreCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  index = 0,
}: ScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-950 tracking-tight">{value}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </motion.div>
  );
}
