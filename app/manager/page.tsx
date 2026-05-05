"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, ClipboardList, TrendingUp, TrendingDown, CheckCircle2,
  AlertCircle, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { usersAPI } from "@/lib/api/users";
import { statsAPI } from "@/lib/api/stats";

const statusConfig = {
  done: { color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", label: "Done" },
  pending: { color: "#F59E0B", bg: "bg-amber-50 text-amber-700 border border-amber-200/60", label: "Pending" },
  upcoming: { color: "#3B82F6", bg: "bg-blue-50 text-blue-700 border border-blue-200/60", label: "Upcoming" },
};

const AVATAR_COLORS = ["#3B82F6", "#10B981", "#6366F1", "#F59E0B", "#8B5CF6", "#EF4444"];

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 text-xs">{entry.name}:</span>
            <span className="text-white font-semibold text-sm">{entry.value} tasks</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function ManagerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [propertyName, setPropertyName] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const meRes = await usersAPI.me();
      const propertyId = meRes.data.property_id;
      if (!propertyId) {
        toast.error("No property assigned to your account. Contact your admin.");
        setLoading(false);
        return;
      }
      const statsRes = await statsAPI.manager(propertyId);
      setData(statsRes.data);
      setPropertyName(`Property ${propertyId.slice(0, 8)}…`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 lg:p-8 text-center py-20 text-neutral-400">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No dashboard data available.</p>
      </div>
    );
  }

  const stats = [
    {
      icon: Users, label: "Staff Present",
      value: `${data.staff_present}/${data.staff_total}`,
      change: `${data.staff_total - data.staff_present} absent`,
      positive: data.staff_present === data.staff_total,
      color: "#3B82F6", trend: "up",
    },
    {
      icon: ClipboardList, label: "Tasks Pending",
      value: data.tasks_pending,
      change: data.tasks_overdue > 0 ? `${data.tasks_overdue} overdue` : "On track",
      positive: data.tasks_overdue === 0,
      color: "#F59E0B", trend: "down",
    },
    {
      icon: CheckCircle2, label: "Check-ins Today",
      value: data.checkins_today,
      change: "",
      positive: true,
      color: "#6366F1", trend: "up",
    },
    {
      icon: TrendingUp, label: "Daily Revenue",
      value: `$${Number(data.daily_revenue).toLocaleString()}`,
      change: "",
      positive: true,
      color: "#10B981", trend: "up",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Manager Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">{propertyName} — Today's operations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                s.positive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-amber-50 text-amber-700 border border-amber-200/60"
              }`}>
                {s.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{s.value}</div>
            <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            {s.change && <div className={`text-xs mt-2 font-medium ${s.positive ? "text-emerald-700" : "text-amber-700"}`}>{s.change}</div>}
            <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}80)` }} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-950 text-lg">Today's Tasks</h3>
            <p className="text-slate-500 text-sm mt-0.5">{data.todays_tasks?.length ?? 0} tasks scheduled</p>
          </div>
          <div className="divide-y divide-slate-100">
            {(data.todays_tasks ?? []).length === 0 ? (
              <p className="px-6 py-8 text-slate-400 text-sm text-center">No tasks for today</p>
            ) : (data.todays_tasks ?? []).map((t: any, i: number) => {
              const cfg = statusConfig[t.status as keyof typeof statusConfig] ?? statusConfig.pending;
              return (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 text-sm font-medium truncate">{t.task}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{t.assignee} · Due {t.due}</p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full flex-shrink-0 font-medium ${cfg.bg}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-950 text-lg">Staff Today</h3>
            <p className="text-slate-500 text-sm mt-0.5">{data.staff_present}/{data.staff_total} present</p>
          </div>
          <div className="divide-y divide-slate-100">
            {(data.staff_attendance ?? []).length === 0 ? (
              <p className="px-6 py-8 text-slate-400 text-sm text-center">No attendance data</p>
            ) : (data.staff_attendance ?? []).map((s: any, i: number) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <div key={i} className="flex items-center gap-3.5 px-6 py-4 hover:bg-slate-50/80 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}>
                    {s.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 text-sm font-semibold">{s.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{s.dept}</p>
                  </div>
                  <span className={`text-sm font-semibold ${s.status === "in" ? "text-emerald-700" : "text-red-600"}`}>
                    {s.status === "in" ? `In ${s.check_in}` : "Absent"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="mb-5">
          <h3 className="font-bold text-slate-950 text-lg">Task Completion</h3>
          <p className="text-slate-500 text-sm mt-0.5">Weekly task completion overview</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.weekly_tasks ?? []} barGap={8}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
            <YAxis tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8FAFC" }} />
            <Bar dataKey="total" name="Total" fill="#F1F5F9" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="done" name="Completed" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
