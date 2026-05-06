"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Building2, Users, Shield, AlertTriangle, CheckCircle2, Clock, TrendingUp, Activity, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { superadminAPI, OverviewResponse } from "@/lib/api/superadmin";

const ACTIVITY_ICONS: Record<string, typeof Shield> = {
  security: Shield, property: Building2, user: Users,
  system: CheckCircle2, warning: Clock, growth: TrendingUp,
};
const ACTIVITY_STYLES: Record<string, { bg: string; iconColor: string }> = {
  security: { bg: "bg-blue-50 border border-blue-100", iconColor: "text-blue-600" },
  property: { bg: "bg-emerald-50 border border-emerald-100", iconColor: "text-emerald-600" },
  user: { bg: "bg-rose-50 border border-rose-100", iconColor: "text-rose-600" },
  system: { bg: "bg-emerald-50 border border-emerald-100", iconColor: "text-emerald-600" },
  warning: { bg: "bg-amber-50 border border-amber-100", iconColor: "text-amber-600" },
  growth: { bg: "bg-blue-50 border border-blue-100", iconColor: "text-blue-600" },
};
const PROP_COLORS = ["#3B82F6", "#6366F1", "#10B981", "#F59E0B", "#8B5CF6"];

export default function SuperadminDashboard() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await superadminAPI.overview();
      setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const stats = [
    { label: "Total Properties", value: data?.stats.total_properties?.toString() ?? "—", change: data?.stats.properties_change ?? "", positive: true, icon: Building2, color: "#3B82F6" },
    { label: "Active Users", value: data?.stats.active_users?.toLocaleString() ?? "—", change: data?.stats.users_change ?? "", positive: true, icon: Users, color: "#6366F1" },
    { label: "Open Tickets", value: data?.stats.open_tickets?.toString() ?? "—", change: data?.stats.tickets_change ?? "", positive: false, icon: AlertTriangle, color: "#F59E0B" },
    { label: "Platform Uptime", value: data?.stats.platform_uptime ? `${data.stats.platform_uptime}%` : "—", change: data?.stats.uptime_change ?? "", positive: true, icon: Activity, color: "#10B981" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Platform Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time monitoring across all tenants</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow">Export Report</button>
          <button className="px-4 py-2.5 text-sm font-medium text-white bg-slate-950 rounded-xl hover:bg-slate-900 transition-all duration-200 shadow-lg shadow-slate-950/20">System Alert</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group overflow-hidden">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200/60 group-hover:scale-105 transition-transform" style={{ backgroundColor: stat.color + "15" }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${stat.positive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-amber-50 text-amber-700 border border-amber-200/60"}`}>
                {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-950 tracking-tight">{stat.value}</p>
            <div className={`text-xs mt-2 font-medium ${stat.positive ? "text-emerald-700" : "text-amber-700"}`}>{stat.change}</div>
            <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Recent Platform Activity</h3>
              <p className="text-slate-500 text-sm mt-0.5">Latest events across all properties</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
              Live
            </div>
          </div>
          <div className="space-y-3">
            {(data?.recent_activity ?? []).map((item, i) => {
              const IconComp = ACTIVITY_ICONS[item.type] ?? Activity;
              const style = ACTIVITY_STYLES[item.type] ?? ACTIVITY_STYLES.system;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                    <IconComp className={`w-5 h-5 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-950">{item.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{item.created_at}</span>
                </motion.div>
              );
            })}
            {(!data?.recent_activity || data.recent_activity.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="font-bold text-slate-950 text-lg">Top Properties</h3>
            <p className="text-slate-500 text-sm mt-0.5">Best performing by health score</p>
          </div>
          <div className="space-y-4">
            {(data?.top_properties ?? []).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: PROP_COLORS[i % PROP_COLORS.length] + "15" }}>
                  <Building2 className="w-5 h-5" style={{ color: PROP_COLORS[i % PROP_COLORS.length] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-950 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1.5"><Users className="w-3 h-3 text-slate-400" /><span className="text-xs font-semibold text-slate-700">{p.user_count}</span></div>
                  <div className="flex items-center justify-end gap-1.5 mt-1"><Activity className="w-3 h-3" style={{ color: PROP_COLORS[i % PROP_COLORS.length] }} /><span className="text-xs font-semibold" style={{ color: PROP_COLORS[i % PROP_COLORS.length] }}>{p.health_score}%</span></div>
                </div>
              </div>
            ))}
            {(!data?.top_properties || data.top_properties.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-4">No properties found</p>
            )}
          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60">View All Properties →</button>
        </div>
      </div>
    </div>
  );
}
