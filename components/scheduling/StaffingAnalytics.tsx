"use client";

import { motion } from "framer-motion";
import { Users, UserX, UserMinus, TrendingUp } from "lucide-react";

interface StaffingAnalyticsProps {
  presentCount: number;
  onLeaveCount: number;
  shortageCount: number;
  efficiency: number;
}

const statusConfig = {
  present: { icon: Users, color: "#10B981", bg: "bg-emerald-50" },
  onLeave: { icon: UserMinus, color: "#F59E0B", bg: "bg-amber-50" },
  shortage: { icon: UserX, color: "#EF4444", bg: "bg-red-50" },
  efficiency: { icon: TrendingUp, color: "#3B82F6", bg: "bg-blue-50" },
};

export function StaffingAnalytics({ presentCount, onLeaveCount, shortageCount, efficiency }: StaffingAnalyticsProps) {
  const stats = [
    { label: "Present Employees", value: presentCount, subtext: "Active today", type: "present" as const },
    { label: "Employees On Leave", value: onLeaveCount, subtext: "Away today", type: "onLeave" as const },
    { label: "Staff Shortage", value: shortageCount, subtext: "Vacant shifts", type: "shortage" as const },
    { label: "Staffing Efficiency", value: `${efficiency}%`, subtext: "Coverage rate", type: "efficiency" as const },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const config = statusConfig[stat.type];
        const Icon = config.icon;
        
        return (
          <motion.div
            key={stat.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                <Icon className="w-5 h-5" style={{ color: config.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.subtext}</div>
          </motion.div>
        );
      })}
    </div>
  );
}