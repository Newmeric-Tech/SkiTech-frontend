"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  alert?: boolean;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  alert = false,
  trend,
  trendUp,
  onClick,
  loading = false,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={onClick ? { y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" } : undefined}
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-black/10 shadow-sm p-4 
        flex flex-col gap-3 transition-all
        ${onClick ? "cursor-pointer hover:border-black/30" : ""}
        ${alert ? "border-l-4 border-l-red-500 bg-red-50/20" : ""}
      `}
    >
      {/* Header: Icon + Alert Badge */}
      <div className="flex items-start justify-between">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center border
          ${alert ? "bg-red-50 border-red-200 text-red-600" : "bg-neutral-50 border-black/5 text-black"}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        {alert && (
          <span className="text-[9px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-lg uppercase tracking-wider">
            Alert
          </span>
        )}
      </div>

      {/* Label */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase mb-1">
          {label}
        </p>

        {/* Value + Trend */}
        <div className="flex items-end gap-2">
          {loading ? (
            <div className="h-8 w-16 bg-neutral-200 rounded-lg animate-pulse" />
          ) : (
            <span className="text-2xl font-black text-black font-serif">{value}</span>
          )}
          {trend && (
            <span className={`text-xs font-bold ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {trendUp ? "↑" : "↓"} {trend}
            </span>
          )}
        </div>
      </div>

      {/* Footer Accent */}
      <div className={`
        h-1 rounded-full mt-auto
        ${alert ? "bg-gradient-to-r from-red-500 to-transparent" : "bg-gradient-to-r from-black/10 to-transparent"}
      `} />
    </motion.div>
  );
}
