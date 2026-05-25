"use client";

import { motion } from "framer-motion";
import { AIInsight } from "@/types/employee-ranking";
import { TrendingUp, Award, AlertTriangle, BarChart3 } from "lucide-react";

interface AIInsightCardProps {
  insight: AIInsight;
  index?: number;
}

const typeConfig = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200/60",
    icon: TrendingUp,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    titleColor: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200/60",
    icon: Award,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    titleColor: "text-blue-700",
    dot: "bg-blue-500",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200/60",
    icon: BarChart3,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    titleColor: "text-amber-700",
    dot: "bg-amber-500",
  },
  danger: {
    bg: "bg-red-50",
    border: "border-red-200/60",
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    titleColor: "text-red-700",
    dot: "bg-red-500",
  },
};

export default function AIInsightCard({ insight, index = 0 }: AIInsightCardProps) {
  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`p-4 rounded-xl border ${config.bg} ${config.border} hover:shadow-sm transition-all duration-200`}
    >
      <div className="flex gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.iconBg}`}>
          <Icon className={`w-4.5 h-4.5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            <h4 className={`text-xs font-bold tracking-wider uppercase ${config.titleColor}`}>
              {insight.title}
            </h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
