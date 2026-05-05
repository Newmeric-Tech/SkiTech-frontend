"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Users, CheckCircle2, AlertCircle,
  TrendingUp, TrendingDown, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { dashboardAPI, DashboardSummary, TaskTrend, DashboardAlert } from "@/lib/api/dashboard";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold text-lg">{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
};

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<TaskTrend[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, trendRes, alertsRes] = await Promise.all([
        dashboardAPI.summary(),
        dashboardAPI.tasksTrend(),
        dashboardAPI.alerts(),
      ]);
      setDashboard(summaryRes.data);
      setTrend(trendRes.data);
      setAlerts(alertsRes.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const stats = [
    { icon: ClipboardList, label: "Total SOPs", value: dashboard?.total_sops ?? 0, color: "#3B82F6", trend: "up", positive: true },
    { icon: Users, label: "Total Tasks", value: dashboard?.total_tasks ?? 0, color: "#6366F1", trend: "up", positive: true },
    { icon: CheckCircle2, label: "Completed Tasks", value: dashboard?.completed_tasks ?? 0, color: "#10B981", trend: "up", positive: true },
    { icon: AlertCircle, label: "Pending Tasks", value: dashboard?.pending_tasks ?? 0, color: "#F59E0B", trend: "down", positive: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
            Welcome back, {user?.first_name || user?.email?.split("@")[0] || "User"}
          </h2>
          <p className="text-slate-500 text-sm mt-1">Here's your operations snapshot for today.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    stat.positive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-amber-50 text-amber-700 border border-amber-200/60"
                  }`}>
                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-950 tracking-tight">{stat.value}</p>
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
                />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-950 text-lg">Tasks Trend</h3>
                  <p className="text-slate-500 text-sm mt-0.5">Daily tasks for the past week</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {trend.length > 0 ? (
                    <AreaChart data={trend}>
                      <defs>
                        <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} dy={12} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} width={40} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" }} />
                      <Area type="monotone" dataKey="tasks" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTasks)"
                        dot={{ fill: "#3B82F6", strokeWidth: 0, r: 4 }}
                        activeDot={{ fill: "#3B82F6", r: 6, stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">No task data yet</div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col">
              <div className="mb-6">
                <h3 className="font-bold text-slate-950 text-lg">Recent Alerts</h3>
                <p className="text-slate-500 text-sm mt-0.5">Latest pending tasks</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No pending alerts</p>
                ) : (
                  alerts.map((item, i) => (
                    <div key={i} className="flex gap-3 p-3.5 rounded-xl hover:bg-slate-50/80 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-950">{item.message}</h4>
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
