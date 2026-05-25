"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, CalendarClock, AlertTriangle, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { schedulingAPI, BackendManagerDashboard } from "@/lib/api/scheduling";

export default function OwnerSchedulingPage() {
  const [dashboard, setDashboard] = useState<BackendManagerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await schedulingAPI.managerDashboard();
      setDashboard(data);
    } catch {
      toast.error("Failed to load scheduling data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Scheduling</h2>
          <p className="text-sm text-slate-500 mt-1">Organisation-wide scheduling overview for the current week.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Employees",   value: dashboard?.employee_count    ?? 0, color: "#3B82F6", icon: Users },
              { label: "Scheduled",          value: dashboard?.scheduled_count   ?? 0, color: "#10B981", icon: CalendarClock },
              { label: "Unscheduled",        value: dashboard?.unscheduled_count ?? 0, color: "#F59E0B", icon: AlertTriangle },
              { label: "Scheduling Progress",value: `${(dashboard?.scheduling_progress ?? 0).toFixed(0)}%`, color: "#8B5CF6", icon: TrendingUp },
            ].map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Scheduling Progress Bar */}
          {dashboard && (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Week Coverage — {dashboard.scheduled_count} of {dashboard.employee_count} employees scheduled
              </p>
              <div className="h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dashboard.scheduling_progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{dashboard.scheduling_progress.toFixed(1)}% coverage this week</p>
            </div>
          )}

          {/* Critical Actions */}
          {dashboard && dashboard.critical_actions.length > 0 && (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-red-200 dark:border-red-900/40 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Critical Actions Required ({dashboard.critical_actions.length})
                </p>
              </div>
              <div className="space-y-3">
                {dashboard.critical_actions.map((action, i) => (
                  <div key={i} className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{action.employee_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {action.department} · {action.shift_start_time}–{action.shift_end_time} · {action.reason_off}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
                      {action.urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Replacement Responses */}
          {dashboard && dashboard.pending_responses.length > 0 && (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-amber-200 dark:border-amber-900/40 p-5 shadow-sm">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-4">
                Pending Replacement Requests ({dashboard.pending_responses.length})
              </p>
              <div className="space-y-2">
                {dashboard.pending_responses.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-sm">
                    <span className="text-slate-700 dark:text-slate-300">
                      {req.shift_start_time}–{req.shift_end_time} · {req.priority} priority
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 capitalize">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {dashboard && dashboard.critical_actions.length === 0 && dashboard.pending_responses.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200 dark:border-white/10">
              <CalendarClock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No scheduling issues this week</p>
              <p className="text-slate-400 text-sm mt-1">All shifts are covered and no critical actions pending.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
