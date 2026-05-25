"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ScoreHistory } from "@/types/employee-ranking";

interface PerformanceChartProps {
  data: ScoreHistory[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-white font-semibold text-sm">
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PerformanceChart({ data, title }: PerformanceChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
      {title && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-950 text-lg">{title}</h3>
          <p className="text-slate-500 text-sm mt-0.5">Performance over the last 8 months</p>
        </div>
      )}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }}
              domain={[80, 100]}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="score"
              name="Score"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorScore)"
              dot={{ fill: "#3B82F6", strokeWidth: 0, r: 4 }}
              activeDot={{ fill: "#3B82F6", r: 6, stroke: "#fff", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="attendance"
              name="Attendance"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAttendance)"
              dot={{ fill: "#10B981", strokeWidth: 0, r: 3 }}
              activeDot={{ fill: "#10B981", r: 5, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-slate-500">Overall Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-500">Attendance</span>
        </div>
      </div>
    </div>
  );
}
