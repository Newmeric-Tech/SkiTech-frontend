"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Clock, Download, MapPin } from "lucide-react";

const STATUS_MAP: Record<string, { emoji: string; label: string; color: string }> = {
  lunch_break: { emoji: "🍱", label: "Lunch Break", color: "#F59E0B" },
  tea_break:   { emoji: "☕", label: "Tea Break",   color: "#8B5CF6" },
  in_meeting:  { emoji: "💬", label: "In Meeting",  color: "#3B82F6" },
  on_call:     { emoji: "📱", label: "On a Call",   color: "#6366F1" },
  on_errand:   { emoji: "🛒", label: "On Errand",   color: "#10B981" },
  sick_leave:  { emoji: "🤒", label: "Sick Leave",  color: "#EF4444" },
  on_leave:    { emoji: "🌴", label: "On Leave",    color: "#06B6D4" },
  maintenance: { emoji: "🔨", label: "Maintenance", color: "#94A3B8" },
};
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { attendanceAPI, PropertyAttendanceEntry, AttendanceRecord } from "@/lib/api/attendance";
import api from "@/lib/config/app";
import { usersAPI } from "@/lib/api/users";
import { downloadCSV, todayStr } from "@/lib/utils/export";

interface Property {
  id: string;
  name: string;
}

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function fmtHours(h: number | null) {
  if (!h) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 text-xs">{entry.name}:</span>
            <span className="text-white font-semibold text-sm">{entry.value} staff</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeeklyTrend(records: AttendanceRecord[], staffTotal: number) {
  const today = new Date();
  const buckets: Record<string, Set<string>> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets[d.toDateString()] = new Set();
  }
  for (const r of records) {
    if (!r.punch_in_time) continue;
    const key = new Date(r.punch_in_time).toDateString();
    if (key in buckets) buckets[key].add(r.user_id);
  }
  return Object.entries(buckets).map(([dateStr, userSet]) => {
    const present = userSet.size;
    return {
      day: DAY_LABELS[new Date(dateStr).getDay()],
      present,
      absent: Math.max(0, staffTotal - present),
    };
  });
}

export default function AttendancePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>("");
  const [records, setRecords] = useState<PropertyAttendanceEntry[]>([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [weeklyAttendance, setWeeklyAttendance] = useState(
    DAY_LABELS.map((day) => ({ day, present: 0, absent: 0 }))
  );

  // Load properties and default to the manager's own assigned property
  useEffect(() => {
    Promise.all([
      api.get("/v1/properties/"),
      usersAPI.me(),
    ]).then(([propsRes, meRes]) => {
      const list: Property[] = propsRes.data?.data ?? propsRes.data ?? [];
      setProperties(list);
      if (list.length === 0) return;
      // Prefer the manager's own property_id; fall back to first in list
      const myPropId = meRes.data?.property_id;
      const matched = myPropId && list.find((p) => p.id === myPropId);
      setPropertyId(matched ? myPropId : list[0].id);
    }).catch(() => {
      // If properties fail, try to at least get the manager's property from their profile
      usersAPI.me().then((r) => {
        if (r.data?.property_id) setPropertyId(r.data.property_id);
      }).catch(() => {});
    });
  }, []);

  // Load today's attendance independently from weekly trend
  useEffect(() => {
    if (!propertyId) return;
    setIsFetching(true);
    attendanceAPI.getPropertyAttendanceToday(propertyId)
      .then((res) => {
        setRecords(res.records);
        setTotalStaff(res.total_staff);
      })
      .catch(() => { setRecords([]); setTotalStaff(0); })
      .finally(() => setIsFetching(false));
  }, [propertyId]);

  // Load weekly trend independently (uses all staff records for property)
  useEffect(() => {
    if (!propertyId) return;
    attendanceAPI.getPropertyAttendanceWeek(propertyId)
      .then((res) => {
        setWeeklyAttendance(buildWeeklyTrend(res.records as AttendanceRecord[], totalStaff));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const presentCount = records.filter((r) => r.status === "active" || r.status === "completed").length;
  const absentCount = totalStaff - presentCount;
  const attendanceRate = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0;

  const handleExport = () => {
    if (!records.length) { return; }
    downloadCSV(`attendance-${todayStr()}.csv`, records.map((r) => ({
      Name: r.user_name,
      "Check In": r.punch_in_time ? new Date(r.punch_in_time).toLocaleTimeString() : "—",
      "Check Out": r.punch_out_time ? new Date(r.punch_out_time).toLocaleTimeString() : "—",
      "Hours Worked": r.hours_worked ?? "",
      "Within Fence": r.is_within_fence ? "Yes" : "No",
      Status: r.status,
    })));
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Attendance Monitoring</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track staff attendance — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {properties.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-slate-200/60 px-3 py-2 rounded-xl">
              <MapPin className="w-4 h-4 text-slate-400" />
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="text-sm focus:outline-none bg-transparent"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Users, label: "Total Staff", value: isFetching ? "…" : totalStaff, color: "#3B82F6" },
          { icon: UserCheck, label: "Present Today", value: isFetching ? "…" : presentCount, color: "#10B981" },
          { icon: UserX, label: "Absent", value: isFetching ? "…" : absentCount, color: "#EF4444" },
          { icon: Clock, label: "Attendance Rate", value: isFetching ? "…" : `${attendanceRate}%`, color: "#6366F1" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group overflow-hidden">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: stat.color + "15" }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{stat.value}</div>
            <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
            <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }} />
          </motion.div>
        ))}
      </div>

      {/* Weekly trend chart — last 7 days from attendance history */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-950 text-lg">Weekly Attendance Trend</h3>
            <p className="text-slate-500 text-sm mt-0.5">Staff attendance over the past week</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-slate-600 text-sm font-medium">Present</span></div>
            <div className="flex items-center gap-2.5"><div className="w-3 h-3 rounded bg-rose-500" /><span className="text-slate-600 text-sm font-medium">Absent</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyAttendance} barGap={8}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
            <YAxis tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8FAFC" }} />
            <Bar dataKey="present" name="Present" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Today's attendance table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Today's Attendance</h3>
              <p className="text-slate-500 text-sm mt-0.5">Live punch-in data for this property</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">{presentCount} Present</span>
              <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200/60 px-3 py-1.5 rounded-full">{absentCount} Absent</span>
              <button onClick={handleExport} disabled={records.length === 0}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200/60 px-3 py-1.5 rounded-full hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fence</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isFetching ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">Loading attendance data…</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">No punch-in records for today</td></tr>
              ) : (
                records.map((r, i) => (
                  <motion.tr key={r.user_id + i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-slate-950 text-sm font-semibold">{r.user_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">{fmt(r.punch_in_time)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-sm">{fmt(r.punch_out_time)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 text-sm font-medium">{fmtHours(r.hours_worked)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        r.is_within_fence
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : "bg-amber-50 text-amber-700 border border-amber-200/60"
                      }`}>
                        {r.is_within_fence ? "Inside" : "Outside"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {r.current_status && STATUS_MAP[r.current_status] ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium"
                          style={{
                            borderColor: `${STATUS_MAP[r.current_status].color}40`,
                            backgroundColor: `${STATUS_MAP[r.current_status].color}12`,
                            color: STATUS_MAP[r.current_status].color,
                          }}
                        >
                          <span>{STATUS_MAP[r.current_status].emoji}</span>
                          {STATUS_MAP[r.current_status].label}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                        r.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : r.status === "completed"
                          ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                          : "bg-red-50 text-red-700 border border-red-200/60"
                      }`}>
                        {r.status === "active" ? "Present" : r.status === "completed" ? "Completed" : "Absent"}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
