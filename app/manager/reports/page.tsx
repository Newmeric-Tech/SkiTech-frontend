"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, TrendingUp, Users, Percent, BedDouble, Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { reportsAPI } from "@/lib/api/reports";
import { usersAPI } from "@/lib/api/users";
import { downloadCSV, todayStr } from "@/lib/utils/export";

interface OccupancyPropertyReport {
  property_id: string; property_name: string;
  total_rooms: number; occupied_rooms: number;
  available_rooms: number; maintenance_rooms: number;
  occupancy_percentage: number;
}

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-slate-300 text-xs">{entry.name}:</span>
            <span className="text-white font-semibold text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ManagerReportsPage() {
  const [occupancy, setOccupancy] = useState<OccupancyPropertyReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const meRes = await usersAPI.me();
      const propId = meRes.data.property_id;

      const res = await reportsAPI.occupancy(propId ?? undefined);
      const data = res.data as { period: string; reports: OccupancyPropertyReport[] };
      if (data.reports.length > 0) {
        setOccupancy(data.reports[0]);
      }
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const roomData = occupancy ? [
    { name: "Occupied", value: occupancy.occupied_rooms, fill: "#3B82F6" },
    { name: "Available", value: occupancy.available_rooms, fill: "#10B981" },
    { name: "Maintenance", value: occupancy.maintenance_rooms, fill: "#F59E0B" },
  ] : [];

  const metrics = occupancy ? [
    { icon: BedDouble, label: "Total Rooms", value: String(occupancy.total_rooms), change: "Across property", positive: true, color: "#3B82F6" },
    { icon: Percent, label: "Occupancy Rate", value: `${occupancy.occupancy_percentage}%`, change: "Current", positive: occupancy.occupancy_percentage > 70, color: "#10B981" },
    { icon: Users, label: "Occupied", value: String(occupancy.occupied_rooms), change: `${occupancy.available_rooms} available`, positive: true, color: "#6366F1" },
    { icon: TrendingUp, label: "Maintenance", value: String(occupancy.maintenance_rooms), change: "Rooms out of service", positive: occupancy.maintenance_rooms === 0, color: "#F59E0B" },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Operational Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Property performance metrics and analytics</p>
        </div>
        {occupancy && (
          <button
            onClick={() => downloadCSV(`occupancy-${todayStr()}.csv`, [{
              Property: occupancy.property_name,
              "Total Rooms": occupancy.total_rooms,
              Occupied: occupancy.occupied_rooms,
              Available: occupancy.available_rooms,
              Maintenance: occupancy.maintenance_rooms,
              "Occupancy %": occupancy.occupancy_percentage,
            }])}
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        )}
      </div>

      {occupancy ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((metric, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: metric.color + "15" }}>
                    <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${metric.positive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-amber-50 text-amber-700 border border-amber-200/60"}`}>
                    <TrendingUp className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-950 tracking-tight">{metric.value}</div>
                <div className="text-slate-500 text-sm mt-1">{metric.label}</div>
                <div className="text-slate-400 text-xs mt-1">{metric.change}</div>
                <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${metric.color}, ${metric.color}80)` }} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
              <div className="mb-5">
                <h3 className="font-bold text-slate-950 text-lg">Room Status Breakdown</h3>
                <p className="text-slate-500 text-sm mt-0.5">{occupancy.property_name} — Current snapshot</p>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={roomData} barGap={8}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
                  <YAxis tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "#F8FAFC" }} />
                  <Bar dataKey="value" name="Rooms" radius={[6, 6, 0, 0]} maxBarSize={40}
                    fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
              <div className="mb-5">
                <h3 className="font-bold text-slate-950 text-lg">Occupancy Gauge</h3>
                <p className="text-slate-500 text-sm mt-0.5">Current occupancy rate</p>
              </div>
              <div className="flex flex-col items-center justify-center h-48">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                    <circle cx="60" cy="60" r="50" fill="none"
                      stroke={occupancy.occupancy_percentage > 70 ? "#10B981" : occupancy.occupancy_percentage > 40 ? "#F59E0B" : "#EF4444"}
                      strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={`${(occupancy.occupancy_percentage / 100) * 314} 314`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-950">{occupancy.occupancy_percentage}%</span>
                    <span className="text-slate-500 text-xs mt-1">Occupancy</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-4">
                  {occupancy.occupied_rooms} of {occupancy.total_rooms} rooms occupied
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-12 text-center">
          <BedDouble className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm">No room data available. Add rooms to your property to see occupancy reports.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: "Daily Operations Summary", desc: "Complete breakdown of today's activities", icon: FileText, color: "#3B82F6" },
          { title: "Staff Performance Report", desc: "Individual and team metrics", icon: Users, color: "#6366F1" },
          { title: "Task Completion Rate", desc: "SOP completion and compliance overview", icon: TrendingUp, color: "#10B981" },
        ].map((report, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-200/60 rounded-2xl p-5 text-left hover:border-slate-300/80 hover:shadow-md transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: report.color + "15" }}>
              <report.icon className="w-5 h-5" style={{ color: report.color }} />
            </div>
            <h4 className="text-slate-950 font-semibold mb-1.5">{report.title}</h4>
            <p className="text-slate-500 text-sm mb-4">{report.desc}</p>
            <span className="text-slate-400 text-sm font-medium">
              Coming soon
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
