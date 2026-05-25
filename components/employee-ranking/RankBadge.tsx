"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RankBadgeProps {
  rank: number;
  rankChange?: number;
  showChange?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RankBadge({ rank, rankChange = 0, showChange = false, size = "md" }: RankBadgeProps) {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return { bg: "bg-gradient-to-br from-amber-400 to-amber-600", text: "text-white", shadow: "shadow-amber-200" };
    if (rank === 2) return { bg: "bg-gradient-to-br from-slate-300 to-slate-500", text: "text-white", shadow: "shadow-slate-200" };
    if (rank === 3) return { bg: "bg-gradient-to-br from-orange-400 to-orange-600", text: "text-white", shadow: "shadow-orange-200" };
    return { bg: "bg-slate-100", text: "text-slate-700", shadow: "" };
  };

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-lg",
  };

  const medal = getMedalColor(rank);

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold ${medal.bg} ${medal.text} ${medal.shadow} shadow-md`}
      >
        <span>#{rank}</span>
      </motion.div>
      {showChange && rankChange !== 0 && (
        <div
          className={`flex items-center gap-0.5 text-xs font-medium ${
            rankChange > 0 ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {rankChange > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(rankChange)}
        </div>
      )}
      {showChange && rankChange === 0 && (
        <div className="flex items-center gap-0.5 text-xs font-medium text-slate-400">
          <Minus className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
