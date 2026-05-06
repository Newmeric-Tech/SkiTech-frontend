"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, Users, Building2, TrendingDown, Activity, ThumbsUp, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, BarChart, Bar,
} from "recharts";
import { toast } from "sonner";
import { superadminAPI, AnalyticsResponse } from "@/lib/api/superadmin";

const periods = ["7d", "30d", "90d", "1y"];

export default function PlatformAnalytics() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await superadminAPI.analytics(period);
      setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const kpis = data ? [
    { label: "Monthly Revenue", value: `$${(data.kpis.monthly_revenue / 1000).toFixed(0)}K`, icon: DollarSign },
    { label: "Total Users", value: data.kpis.total_users.toLocaleString(), icon: Users },
    { label: "Properties", value: data.kpis.total_properties.toString(), icon: Building2 },
    { label: "Avg Occupancy", value: `${data.kpis.avg_occupancy}%`, icon: Activity },
    { label: "Churn Rate", value: `${data.kpis.churn_rate}%`, icon: TrendingDown },
    { label: "NPS Score", value: data.kpis.nps_score.toString(), icon: ThumbsUp },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            Platform Analytics
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">Insights and metrics across the entire platform</p>
        </div>
        <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
          {periods.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p ? "bg-white text-black shadow-sm" : "text-neutral-600 hover:text-black"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-6 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className="w-4 h-4 text-neutral-500" />
                  <p className="text-sm text-neutral-500">{kpi.label}</p>
                </div>
                <p className="text-2xl font-bold text-black">{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
              <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                Revenue Overview
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data?.revenue_data ?? []}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18181b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#737373" tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                    contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
              <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                User Growth
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data?.user_growth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#737373" />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), "Users"]}
                    contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#18181b" strokeWidth={2} dot={{ fill: "#18181b", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
              <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                Properties by Region
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data?.properties_by_region ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis dataKey="region" type="category" tick={{ fontSize: 11 }} width={80} stroke="#737373" />
                  <Tooltip
                    formatter={(value: number) => [value, "Properties"]}
                    contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                  />
                  <Bar dataKey="count" fill="#18181b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-2 bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
              <div className="p-5 border-b border-black/10">
                <h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                  Top Performing Properties
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/10">
                      <th className="text-left p-4 text-sm font-medium text-neutral-500">Property</th>
                      <th className="text-center p-4 text-sm font-medium text-neutral-500">Occupancy</th>
                      <th className="text-right p-4 text-sm font-medium text-neutral-500">Monthly Revenue</th>
                      <th className="text-right p-4 text-sm font-medium text-neutral-500">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.top_properties ?? []).map((prop) => (
                      <tr key={prop.name} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-black">{prop.name}</p>
                          <p className="text-sm text-neutral-500">{prop.owner}</p>
                        </td>
                        <td className="p-4 text-center"><span className="font-medium">{prop.occupancy}%</span></td>
                        <td className="p-4 text-right font-medium">${prop.revenue.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className="text-emerald-600 font-medium">+{prop.growth}%</span>
                        </td>
                      </tr>
                    ))}
                    {(!data?.top_properties || data.top_properties.length === 0) && (
                      <tr><td colSpan={4} className="p-8 text-center text-sm text-neutral-400">No data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
