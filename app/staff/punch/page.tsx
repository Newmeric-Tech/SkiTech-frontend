"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Clock, Sun, Moon, Coffee, TrendingUp, TrendingDown,
  UserCheck, UserX, Download, LogIn, LogOut, MapPin, AlertTriangle,
} from "lucide-react";
import {
  attendanceAPI,
  getCurrentPosition,
  AttendanceRecord,
} from "@/lib/api/attendance";
import { usersAPI } from "@/lib/api/users";

function fmt(iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", opts ?? { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function fmtHours(h: number | null) {
  if (!h) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

export default function PunchPage() {
  const [propertyId, setPropertyId] = useState<string>("");
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [hoursSoFar, setHoursSoFar] = useState<number>(0);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [totalHoursWeek, setTotalHoursWeek] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get the staff member's assigned property from their profile
  useEffect(() => {
    usersAPI.me().then((res) => {
      const propId = res.data.property_id;
      if (propId) {
        setPropertyId(propId);
      } else {
        setIsFetching(false); // no property assigned — unlock so error is visible
      }
    }).catch(() => {
      setIsFetching(false);
    });
  }, []);

  // Load punch status + history when property selected
  const loadStatus = useCallback(async () => {
    if (!propertyId) return;
    setIsFetching(true);
    try {
      const [statusRes, histRes] = await Promise.all([
        attendanceAPI.getStatus(propertyId),
        attendanceAPI.getHistory({ property_id: propertyId, limit: 10 }),
      ]);
      setPunchedIn(statusRes.punched_in);
      setPunchInTime(statusRes.punch_in_time ?? null);
      setHoursSoFar(statusRes.hours_so_far ?? 0);
      setHistory(histRes.records);
      const weekTotal = histRes.records.reduce((acc, r) => acc + (r.hours_worked ?? 0), 0);
      setTotalHoursWeek(weekTotal);
    } catch {
      // silently ignore — user may not have punched in yet
    } finally {
      setIsFetching(false);
    }
  }, [propertyId]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handlePunch = async () => {
    if (!propertyId) {
      toast.error("Please select a property first");
      return;
    }
    setLocationError(null);
    setIsLoading(true);
    try {
      const coords = await getCurrentPosition();

      if (punchedIn) {
        const res = await attendanceAPI.punchOut(propertyId, coords);
        setPunchedIn(false);
        setPunchInTime(null);
        toast.success("Punched out successfully", {
          description: `Hours worked: ${fmtHours(res.hours_worked)}`,
        });
        if (res.warning) toast.warning(res.warning);
      } else {
        const res = await attendanceAPI.punchIn(propertyId, coords);
        setPunchedIn(true);
        setPunchInTime(new Date().toISOString());
        setHoursSoFar(0);
        toast.success("Punched in successfully");
        if (res.warning) toast.warning(res.warning);
      }

      await loadStatus();
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? "Action failed";
      if (msg.toLowerCase().includes("location") || msg.toLowerCase().includes("permission")) {
        setLocationError(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const stats = [
    {
      icon: Clock,
      label: "Shift Start",
      value: punchedIn && punchInTime ? fmt(punchInTime) : "—",
      color: "#3B82F6",
    },
    {
      icon: Clock,
      label: "Hours Today",
      value: fmtHours(hoursSoFar),
      color: "#10B981",
    },
    {
      icon: UserCheck,
      label: "This Week",
      value: fmtHours(totalHoursWeek),
      color: "#6366F1",
    },
    {
      icon: UserCheck,
      label: "Status",
      value: punchedIn ? "Working" : "Off",
      color: punchedIn ? "#10B981" : "#EF4444",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Time Clock</h1>
          <p className="text-slate-500 text-sm mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2.5 text-sm text-slate-600 bg-white border border-slate-200/60 px-4 py-2 rounded-xl`}>
            <div className={`w-2 h-2 rounded-full ${punchedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            {punchedIn ? "On Shift" : "Off Shift"}
          </div>
        </div>
      </div>

      {/* Location error banner */}
      {locationError && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200/60 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Location Required</p>
            <p className="text-xs text-amber-600 mt-0.5">{locationError}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{stat.value}</div>
            <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
            <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Punch card */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Current Shift</h3>
              <p className="text-slate-500 text-sm mt-0.5">Tap to punch in or out</p>
            </div>
          </div>
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-slate-950 tracking-tight mb-2">
                {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              {punchedIn && punchInTime && (
                <p className="text-slate-500 text-sm">Since {fmt(punchInTime)}</p>
              )}
            </div>
            <button
              onClick={handlePunch}
              disabled={isLoading || isFetching}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-lg transition-all shadow-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${
                punchedIn ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : punchedIn ? (
                <><LogOut className="w-5 h-5" /> Punch Out</>
              ) : (
                <><LogIn className="w-5 h-5" /> Punch In</>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> Location required for punch
            </p>
          </div>
        </div>

        {/* This week summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-950 text-lg">Recent</h3>
                <p className="text-slate-500 text-sm mt-0.5">Shift summary</p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">
                {fmtHours(totalHoursWeek)} total
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {isFetching ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : history.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">No records yet</div>
            ) : (
              history.slice(0, 4).map((r, i) => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: r.status === "completed" ? "#10B98115" : "#F59E0B15" }}>
                    {r.status === "completed" ? (
                      <UserCheck className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <UserX className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 text-sm font-medium">{fmtDate(r.punch_in_time)}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {fmt(r.punch_in_time)} → {fmt(r.punch_out_time)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-950">{fmtHours(r.hours_worked)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      r.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-amber-50 text-amber-700 border border-amber-200/60"
                    }`}>
                      {r.status === "completed" ? "Complete" : "Active"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Punch history table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Punch History</h3>
              <p className="text-slate-500 text-sm mt-0.5">Recent attendance records</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Hours</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fence</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isFetching ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">Loading…</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">No punch records found</td></tr>
              ) : (
                history.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4"><span className="text-slate-950 text-sm font-medium">{fmtDate(r.punch_in_time)}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-medium text-slate-700">{fmt(r.punch_in_time)}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-slate-500">{fmt(r.punch_out_time)}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-950">{fmtHours(r.hours_worked)}</span></td>
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
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                        r.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : "bg-blue-50 text-blue-700 border border-blue-200/60"
                      }`}>
                        {r.status === "completed" ? "Complete" : "Active"}
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
