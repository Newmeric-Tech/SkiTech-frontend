"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, TrendingUp, TrendingDown, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { reportsAPI } from "@/lib/api/reports";

interface OccupancyReport {
  property_id: string; property_name: string;
  total_rooms: number; occupied_rooms: number;
  available_rooms: number; maintenance_rooms: number;
  occupancy_percentage: number;
}

const revenueData = [
  { month: "Aug", grand: 42000, skyline: 18000, amiras: 21000 },
  { month: "Sep", grand: 48000, skyline: 21000, amiras: 24000 },
  { month: "Oct", grand: 53000, skyline: 19000, amiras: 28000 },
  { month: "Nov", grand: 61000, skyline: 25000, amiras: 31000 },
  { month: "Dec", grand: 72000, skyline: 31000, amiras: 38000 },
  { month: "Jan", grand: 68000, skyline: 28000, amiras: 35000 },
];

const occData = [
  { month: "Aug", occ: 72 },
  { month: "Sep", occ: 78 },
  { month: "Oct", occ: 82 },
  { month: "Nov", occ: 79 },
  { month: "Dec", occ: 91 },
  { month: "Jan", occ: 84 },
];

const deptRevPie = [
  { name: "Rooms", value: 68, color: "#3B82F6" },
  { name: "F&B", value: 18, color: "#6366F1" },
  { name: "Spa", value: 8, color: "#10B981" },
  { name: "Other", value: 6, color: "#F59E0B" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 text-xs">{entry.name}:</span>
            <span className="text-white font-semibold text-sm">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const LineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold text-lg">{payload[0].value}%</p>
        <p className="text-slate-400 text-xs">Occupancy Rate</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
          <span className="text-slate-300 text-xs">{payload[0].name}:</span>
          <span className="text-white font-semibold">{payload[0].value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600 text-xs font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [occupancyReports, setOccupancyReports] = useState<OccupancyReport[]>([]);

  const loadOccupancy = useCallback(async () => {
    try {
      const res = await reportsAPI.occupancy();
      const data = res.data as { period: string; reports: OccupancyReport[] };
      setOccupancyReports(data.reports);
    } catch {
      toast.error("Failed to load occupancy data");
    }
  }, []);

  useEffect(() => { loadOccupancy(); }, [loadOccupancy]);

  const totalRooms = occupancyReports.reduce((s, r) => s + r.total_rooms, 0);
  const totalOccupied = occupancyReports.reduce((s, r) => s + r.occupied_rooms, 0);
  const avgOccupancy = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Performance data across all properties</p>
        </div>
        <button className="flex items-center gap-2.5 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Rooms", value: totalRooms > 0 ? String(totalRooms) : "—", change: "Across all properties", positive: true, color: "#3B82F6" },
          { label: "Live Occupancy", value: totalRooms > 0 ? `${avgOccupancy}%` : "—", change: `${totalOccupied} occupied`, positive: avgOccupancy > 70, color: "#10B981" },
          { label: "Available Rooms", value: totalRooms > 0 ? String(totalRooms - totalOccupied) : "—", change: "Ready for guests", positive: true, color: "#6366F1" },
          { label: "Properties Tracked", value: String(occupancyReports.length), change: "Active properties", positive: true, color: "#F59E0B" },
        ].map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group"
          >
            <div className="flex items-center gap-2 mb-3">
              {k.positive ? (
                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                  <TrendingDown className="w-3 h-3 text-amber-600" />
                </div>
              )}
              <span className={`text-xs font-medium ${k.positive ? "text-emerald-700" : "text-amber-700"}`}>{k.change}</span>
            </div>
            <div className="text-slate-500 text-xs mb-2">{k.label}</div>
            <div className="text-3xl font-bold text-slate-950 tracking-tight">{k.value}</div>
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${k.color}, ${k.color}80)` }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-950 text-lg">Revenue by Property</h3>
            <p className="text-slate-400 text-xs mt-1">6-month revenue breakdown by property</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} barGap={8}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} width={60} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="grand" name="Grand Horizon" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="skyline" name="Skyline" fill="#6366F1" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="amiras" name="Amiras" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Legend content={renderLegend} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-950 text-lg">Revenue Mix</h3>
            <p className="text-slate-400 text-xs mt-1">Revenue distribution by department</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie 
                data={deptRevPie} 
                innerRadius={55} 
                outerRadius={85} 
                paddingAngle={3} 
                dataKey="value"
                stroke="none"
              >
                {deptRevPie.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span className="text-slate-600 text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="mb-5">
          <h3 className="font-bold text-slate-950 text-lg">Occupancy Trend</h3>
          <p className="text-slate-400 text-xs mt-1">Monthly occupancy rate performance</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={occData}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
            <YAxis tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} domain={[60, 100]} tickFormatter={v => `${v}%`} width={50} />
            <Tooltip content={<LineTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line 
              type="monotone" 
              dataKey="occ" 
              stroke="#3B82F6" 
              strokeWidth={2.5} 
               dot={{ fill: '#3B82F6', strokeWidth: 0, r: 5 }}
               activeDot={{ fill: '#3B82F6', r: 7, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

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
                  {["Property", "Total Rooms", "Occupied", "Available", "Maintenance", "Occupancy %"].map(h => (
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
                            style={{ width: `${r.occupancy_percentage}%`, backgroundColor: r.occupancy_percentage > 70 ? "#10B981" : r.occupancy_percentage > 40 ? "#F59E0B" : "#EF4444" }} />
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
    </div>
  );
}
