"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface AnalyticsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtext: string;
  change: number;
  color: string;
  index?: number;
  dark?: boolean;
}

export default function AnalyticsCard({
  icon: Icon,
  title,
  value,
  subtext,
  change,
  color,
  index = 0,
  dark = false,
}: AnalyticsCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all duration-300 group ${
        dark 
          ? "bg-slate-950 border-slate-800 text-white hover:border-slate-700" 
          : "bg-white border-slate-200/60 hover:border-slate-300/80"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${dark ? 'bg-white/10' : ''}`}
          style={!dark ? { backgroundColor: `${color}15` } : {}}
        >
          <Icon className="w-5 h-5" style={dark ? { color: '#60A5FA' } : { color }} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
            dark 
              ? (isPositive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30")
              : (isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-amber-50 text-amber-700 border border-amber-200/60")
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositive ? "+" : ""}
          {change}%
        </div>
      </div>
      <p className={`text-sm font-medium mb-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>{title}</p>
      <p className={`text-3xl font-bold tracking-tight ${dark ? "text-white" : "text-slate-950"}`}>{value}</p>
      <p className={`text-xs mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>{subtext}</p>
      <div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
      />
    </motion.div>
  );
}
