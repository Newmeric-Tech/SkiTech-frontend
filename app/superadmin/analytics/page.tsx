"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Activity,
  ThumbsUp,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 245000, mrr: 245000 },
  { month: "Feb", revenue: 258000, mrr: 258000 },
  { month: "Mar", revenue: 267000, mrr: 267000 },
  { month: "Apr", revenue: 279000, mrr: 279000 },
  { month: "May", revenue: 291000, mrr: 291000 },
  { month: "Jun", revenue: 304000, mrr: 304000 },
  { month: "Jul", revenue: 312000, mrr: 312000 },
  { month: "Aug", revenue: 328000, mrr: 328000 },
  { month: "Sep", revenue: 341000, mrr: 341000 },
  { month: "Oct", revenue: 356000, mrr: 356000 },
  { month: "Nov", revenue: 368000, mrr: 368000 },
  { month: "Dec", revenue: 385000, mrr: 385000 },
];

const userGrowthData = [
  { month: "Jan", users: 1240 },
  { month: "Feb", users: 1380 },
  { month: "Mar", users: 1520 },
  { month: "Apr", users: 1690 },
  { month: "May", users: 1840 },
  { month: "Jun", users: 2010 },
  { month: "Jul", users: 2150 },
  { month: "Aug", users: 2340 },
  { month: "Sep", users: 2510 },
  { month: "Oct", users: 2720 },
  { month: "Nov", users: 2890 },
  { month: "Dec", users: 3100 },
];

const propertiesByRegion = [
  { region: "West Coast", count: 89 },
  { region: "Southwest", count: 54 },
  { region: "Southeast", count: 67 },
  { region: "Midwest", count: 48 },
  { region: "Northeast", count: 72 },
  { region: "Mountain", count: 41 },
];

const topProperties = [
  { name: "Summit Ridge Apartments", owner: "Mountain View Holdings", occupancy: 96, revenue: 284000, growth: 12.4 },
  { name: "Riverside Commons", owner: "Pacific Northwest Properties", occupancy: 94, revenue: 267000, growth: 8.7 },
  { name: "Harbor Point Condos", owner: "Coastal Properties Inc", occupancy: 92, revenue: 251000, growth: 6.2 },
  { name: "Pine Valley Estates", owner: "Cascade Management LLC", occupancy: 91, revenue: 238000, growth: 5.1 },
  { name: "Sunset Gardens", owner: "Desert Sun Management", occupancy: 89, revenue: 212000, growth: 4.8 },
];

const periods = ["7d", "30d", "90d", "1y"];

export default function PlatformAnalytics() {
  const [period, setPeriod] = useState("30d");

  const kpis = [
    { label: "Monthly Revenue", value: "$385K", change: "+12.4%", trend: "up", icon: DollarSign },
    { label: "Total Users", value: "3,100", change: "+18.2%", trend: "up", icon: Users },
    { label: "Properties", value: "371", change: "+8.5%", trend: "up", icon: Building2 },
    { label: "Avg Occupancy", value: "87.2%", change: "+2.1%", trend: "up", icon: Activity },
    { label: "Churn Rate", value: "1.8%", change: "-0.4%", trend: "down", icon: TrendingDown },
    { label: "NPS Score", value: "67", change: "+5", trend: "up", icon: ThumbsUp },
  ];

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
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className="w-4 h-4 text-neutral-500" />
              <p className="text-sm text-neutral-500">{kpi.label}</p>
            </div>
            <p className="text-2xl font-bold text-black">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${kpi.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                {kpi.change}
              </span>
              <span className="text-xs text-neutral-400">vs last period</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            Revenue Overview
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
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
              <Area type="monotone" dataKey="tasks" stroke="#18181b" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            User Growth
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={userGrowthData}>
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
            <BarChart data={propertiesByRegion} layout="vertical">
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
                {topProperties.map((prop, i) => (
                  <tr key={prop.name} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-black">{prop.name}</p>
                      <p className="text-sm text-neutral-500">{prop.owner}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-medium">{prop.occupancy}%</span>
                    </td>
                    <td className="p-4 text-right font-medium">${prop.revenue.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <span className="text-emerald-600 font-medium">+{prop.growth}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
