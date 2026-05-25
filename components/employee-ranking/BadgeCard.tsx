"use client";

import { motion } from "framer-motion";
import { Badge } from "@/types/employee-ranking";

interface BadgeCardProps {
  badge: Badge;
  index?: number;
}

export default function BadgeCard({ badge, index = 0 }: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/60 bg-white hover:shadow-sm hover:border-slate-300/80 transition-all duration-300 cursor-default"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: `${badge.color}15`, color: badge.color }}
      >
        {badge.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-900 truncate leading-tight mb-0.5">{badge.name}</h4>
        <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">{badge.description}</p>
      </div>
    </motion.div>
  );
}
