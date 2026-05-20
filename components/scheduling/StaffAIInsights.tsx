"use client";

import { motion } from "framer-motion";
import { Brain, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface StaffAIInsightsProps {
  workloadPrediction: string;
  scheduleConflicts: string;
  workloadIndicator: "low" | "medium" | "high";
  compatibilityStatus: string;
}

const workloadColors = {
  low: { bg: "bg-emerald-500", text: "text-emerald-600", label: "Low" },
  medium: { bg: "bg-amber-500", text: "text-amber-600", label: "Medium" },
  high: { bg: "bg-red-500", text: "text-red-600", label: "High" },
};

export function StaffAIInsights({
  workloadPrediction,
  scheduleConflicts,
  workloadIndicator,
  compatibilityStatus,
}: StaffAIInsightsProps) {
  const workload = workloadColors[workloadIndicator];

  return (
    <div className="bg-gray-900 rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold">AI Insights</h3>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Workload Prediction</p>
          <p className="text-sm text-white">{workloadPrediction}</p>
        </div>

        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Schedule Conflicts</p>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${scheduleConflicts === "None" ? "text-emerald-400" : "text-amber-400"}`} />
            <p className="text-sm text-white">{scheduleConflicts}</p>
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Workload Indicator</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${workload.bg} rounded-full transition-all`}
                style={{ width: workloadIndicator === "low" ? "33%" : workloadIndicator === "medium" ? "66%" : "100%" }}
              />
            </div>
            <span className={`text-xs font-medium ${workload.text}`}>{workload.label}</span>
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Compatibility Status</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <p className="text-sm text-white">{compatibilityStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}