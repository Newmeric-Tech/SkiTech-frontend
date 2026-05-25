"use client";

import { motion } from "framer-motion";
import { Send, Eye, CheckCircle2, XCircle, Calendar, Bell, Zap } from "lucide-react";
import { TimelineEvent } from "@/store/SchedulingStore";

interface TimelineActivityProps {
  events: TimelineEvent[];
}

const eventConfig = {
  "request-sent": { icon: Send, color: "#3B82F6", bg: "bg-blue-50", label: "Request Sent" },
  "request-viewed": { icon: Eye, color: "#8B5CF6", bg: "bg-purple-50", label: "Request Viewed" },
  "staff-accepted": { icon: CheckCircle2, color: "#10B981", bg: "bg-emerald-50", label: "Accepted" },
  "staff-rejected": { icon: XCircle, color: "#EF4444", bg: "bg-red-50", label: "Rejected" },
  "shift-assigned": { icon: Calendar, color: "#6366F1", bg: "bg-indigo-50", label: "Shift Assigned" },
  "notification-dispatched": { icon: Bell, color: "#F59E0B", bg: "bg-amber-50", label: "Notification" },
  "auto-assign-triggered": { icon: Zap, color: "#EC4899", bg: "bg-pink-50", label: "Auto Assign" },
};

export function TimelineActivity({ events }: TimelineActivityProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Timeline Activity</h3>
        <p className="text-sm text-gray-500 mt-0.5">{events.length} recent activities</p>
      </div>

      <div className="p-4 space-y-1 max-h-[400px] overflow-y-auto">
        {events.slice(0, 10).map((event, index) => {
          const config = eventConfig[event.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{event.message}</p>
                <p className="text-xs text-gray-400 mt-1">{event.timestamp}</p>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                {config.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}