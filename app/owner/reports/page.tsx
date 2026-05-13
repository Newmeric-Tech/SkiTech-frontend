"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download, TrendingUp, TrendingDown, BedDouble, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reportsAPI, RevenueMonth, OccupancyTrendPoint } from "@/lib/api/reports";
import { downloadCSV, todayStr } from "@/lib/utils/export";

interface OccupancyReport {
  property_id: string;
  property_name: string;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  maintenance_rooms: number;
  occupancy_percentage: number;
}

// ── Chart colours cycling list ────────────────────────────────────────────────
const PROP_COLORS = ["#3B82F6", "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// ── Tooltips ──────────────────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300 text-xs">{entry.name}:</span>
          <span className="text-white font-semibold text-sm">
            ₹{Number(entry.value).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
};

const OccTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-lg">{payload[0].value}%</p>
      <p className="text-slate-400 text-xs">Occupancy Rate</p>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [occupancyReports, setOccupancyReports] = useState<OccupancyReport[]>([]);
  const [revenueData, setRevenueData] = useState<Record<string, any>[]>([]);
  const [propertyKeys, setPropertyKeys] = useState<{ id: string; name: string }[]>([]);
  const [occTrend, setOccTrend] = useState<OccupancyTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [occRes, revRes, trendRes] = await Promise.all([
        reportsAPI.occupancy(),
        reportsAPI.revenue(6),
        reportsAPI.occupancyTrend(6),
      ]);

      // Occupancy snapshot
      const occData = (occRes.data as { period: string; reports: OccupancyReport[] }).reports;
      setOccupancyReports(occData);

      // Revenue — transform into flat objects keyed by property name for BarChart
      const rev = revRes.data;
      setPropertyKeys(rev.properties);
      const flat = (rev.data as RevenueMonth[]).map((d) => {
        const row: Record<string, any> = { month: d.month };
        d.properties.forEach((p) => { row[p.property_name] = p.amount; });
        return row;
      });
      setRevenueData(flat);

      // Occupancy trend
      setOccTrend(trendRes.data.data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const totalRooms = occupancyReports.reduce((s, r) => s + r.total_rooms, 0);
  const totalOccupied = occupancyReports.reduce((s, r) => s + r.occupied_rooms, 0);
  const avgOccupancy = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;
  const totalRevenue = revenueData.reduce((s, d) => {
    return s + propertyKeys.reduce((ps, p) => ps + (Number(d[p.name]) || 0), 0);
  }, 0);

  const handleExport = () => {
    if (!revenueData.length && !occupancyReports.length) {
      toast.error("No data to export");
      return;
    }
    if (revenueData.length) {
      downloadCSV(`revenue-report-${todayStr()}.csv`, revenueData);
    }
    if (occupancyReports.length) {
      downloadCSV(`occupancy-report-${todayStr()}.csv`, occupancyReports.map((r) => ({
        Property: r.property_name,
        "Total Rooms": r.total_rooms,
        Occupied: r.occupied_rooms,
        Available: r.available_rooms,
        Maintenance: r.maintenance_rooms,
        "Occupancy %": r.occupancy_percentage,
      })));
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Performance data across all properties</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2.5 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Rooms", value: totalRooms > 0 ? String(totalRooms) : "—", change: "Across all properties", positive: true, color: "#3B82F6" },
              { label: "Live Occupancy", value: totalRooms > 0 ? `${avgOccupancy}%` : "—", change: `${totalOccupied} occupied`, positive: avgOccupancy > 70, color: "#10B981" },
              { label: "6-Month Revenue", value: totalRevenue > 0 ? `₹${(totalRevenue / 1000).toFixed(0)}k` : "—", change: "From bookings", positive: true, color: "#F59E0B" },
              { label: "Properties Tracked", value: String(occupancyReports.length), change: "Active properties", positive: true, color: "#6366F1" },
            ].map((k, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${k.positive ? "bg-emerald-50 border border-emerald-200/60" : "bg-amber-50 border border-amber-200/60"}`}>
                    {k.positive ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-amber-600" />}
                  </div>
                  <span className={`text-xs font-medium ${k.positive ? "text-emerald-700" : "text-amber-700"}`}>{k.change}</span>
                </div>
                <div className="text-slate-500 text-xs mb-2">{k.label}</div>
                <div className="text-3xl font-bold text-slate-950 tracking-tight">{k.value}</div>
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${k.color}, ${k.color}80)` }} />
              </motion.div>
            ))}
          </div>

          {/* Revenue by property */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="mb-5">
              <h3 className="font-bold text-slate-950 text-lg">Revenue by Property</h3>
              <p className="text-slate-400 text-xs mt-1">6-month booking revenue breakdown by property</p>
            </div>
            {revenueData.length > 0 && propertyKeys.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueData} barGap={8}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
                  <YAxis tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={65} />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: "#F8FAFC" }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-slate-600 text-xs">{v}</span>} />
                  {propertyKeys.map((p, i) => (
                    <Bar key={p.id} dataKey={p.name} fill={PROP_COLORS[i % PROP_COLORS.length]} radius={[6, 6, 0, 0]} maxBarSize={32} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">
                No booking revenue data yet
              </div>
            )}
          </div>

          {/* Occupancy trend */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="mb-5">
              <h3 className="font-bold text-slate-950 text-lg">Occupancy Trend</h3>
              <p className="text-slate-400 text-xs mt-1">Monthly occupancy rate — last 6 months</p>
            </div>
            {occTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={occTrend}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
                  <YAxis tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false}
                    domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={50} />
                  <Tooltip content={<OccTooltip />} cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Line type="monotone" dataKey="occupancy" stroke="#3B82F6" strokeWidth={2.5}
                    dot={{ fill: "#3B82F6", strokeWidth: 0, r: 5 }}
                    activeDot={{ fill: "#3B82F6", r: 7, stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
                No occupancy data yet
              </div>
            )}
          </div>

          {/* Live occupancy table */}
          {occupancyReports.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-950 text-lg">Live Occupancy by Property</h3>
                <p className="text-slate-400 text-xs mt-1">Current room status across all properties</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Property", "Total Rooms", "Occupied", "Available", "Maintenance", "Occupancy %"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs text-slate-500 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {occupancyReports.map((r, i) => (
                      <motion.tr key={r.property_id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                              <BedDouble className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-slate-950 text-sm font-semibold">{r.property_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{r.total_rooms}</td>
                        <td className="px-6 py-4 text-blue-600 text-sm font-semibold">{r.occupied_rooms}</td>
                        <td className="px-6 py-4 text-emerald-600 text-sm font-semibold">{r.available_rooms}</td>
                        <td className="px-6 py-4 text-amber-600 text-sm">{r.maintenance_rooms}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-2 rounded-full"
                                style={{
                                  width: `${r.occupancy_percentage}%`,
                                  backgroundColor: r.occupancy_percentage > 70 ? "#10B981" : r.occupancy_percentage > 40 ? "#F59E0B" : "#EF4444",
                                }} />
                            </div>
                            <span className="text-slate-950 text-sm font-bold">{r.occupancy_percentage}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
