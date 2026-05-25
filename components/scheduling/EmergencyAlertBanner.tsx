"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X, Users } from "lucide-react";
import { EmergencyAlert } from "@/store/SchedulingStore";

interface EmergencyAlertBannerProps {
  alerts: EmergencyAlert[];
  onDismiss: (id: string) => void;
  onAssign: (alert: EmergencyAlert) => void;
}

export function EmergencyAlertBanner({ alerts, onDismiss, onAssign }: EmergencyAlertBannerProps) {
  const activeAlerts = alerts.filter((a) => a.status === "active");

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {activeAlerts.map((alert, index) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden relative"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
          <div className="pl-5 pr-4 py-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase tracking-wide">
                    Critical Action Required: Emergency Shift Vacancy
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {alert.employeeName} Absent — {alert.department} • {alert.shiftTime}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{alert.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onAssign(alert)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Assign Replacement Now
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}