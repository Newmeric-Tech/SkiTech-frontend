"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Clock, UserCheck, UserX, LogIn, LogOut, MapPin, AlertTriangle,
  Smile, X, Check,
} from "lucide-react";
import {
  attendanceAPI,
  getCurrentPosition,
  AttendanceRecord,
} from "@/lib/api/attendance";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/config/app";

// ── Status presets (same as staff) ─────────────────────────
const STATUS_PRESETS = [
  { emoji: "🍱", label: "Lunch Break",  value: "lunch_break",  color: "#F59E0B" },
  { emoji: "☕", label: "Tea Break",    value: "tea_break",    color: "#8B5CF6" },
  { emoji: "💬", label: "In Meeting",  value: "in_meeting",   color: "#3B82F6" },
  { emoji: "📱", label: "On a Call",   value: "on_call",      color: "#6366F1" },
  { emoji: "🛒", label: "On Errand",   value: "on_errand",    color: "#10B981" },
  { emoji: "🤒", label: "Sick Leave",  value: "sick_leave",   color: "#EF4444" },
  { emoji: "🌴", label: "On Leave",    value: "on_leave",     color: "#06B6D4" },
  { emoji: "🔨", label: "Maintenance", value: "maintenance",  color: "#94A3B8" },
];

function getPreset(value: string | null | undefined) {
  if (!value) return null;
  return STATUS_PRESETS.find((p) => p.value === value) ?? null;
}

// ── Format helpers ──────────────────────────────────────────
function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
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

// ── Status Picker ────────────────────────────────────────────
function StatusPicker({
  propertyId,
  currentStatus,
  onStatusChange,
  disabled,
}: {
  propertyId: string;
  currentStatus: string | null;
  onStatusChange: (v: string | null) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const preset = getPreset(currentStatus);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const select = async (value: string | null) => {
    setSaving(true);
    try {
      await attendanceAPI.updateCurrentStatus(propertyId, value);
      onStatusChange(value);
      setOpen(false);
      toast.success(value ? `Status set: ${getPreset(value)?.label}` : "Status cleared");
    } catch {
      toast.error("Could not update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        title={disabled ? "Punch in first to set a status" : "Set your status"}
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium transition-all
          ${disabled
            ? "border-slate-200/60 text-slate-300 bg-slate-50 cursor-not-allowed"
            : preset
              ? "border-slate-200/60 bg-white text-slate-800 hover:border-slate-300 hover:shadow-sm"
              : "border-slate-200/60 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:shadow-sm"
          }`}
      >
        {preset ? (
          <>
            <span className="text-base leading-none">{preset.emoji}</span>
            <span style={{ color: preset.color }} className="font-semibold">{preset.label}</span>
            {saving && <div className="w-3 h-3 border border-current/40 border-t-current rounded-full animate-spin ml-1" />}
          </>
        ) : (
          <>
            <Smile className="w-4 h-4" />
            <span>Set Status</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full mb-2 left-0 z-50 w-72 bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900">Set a status</p>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

            <div className="p-3 grid grid-cols-1 gap-0.5">
              {STATUS_PRESETS.map((p) => {
                const isActive = currentStatus === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => select(isActive ? null : p.value)}
                    disabled={saving}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                      ${isActive ? "bg-slate-950 text-white" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span className="text-xl leading-none w-7 text-center">{p.emoji}</span>
                    <span className="text-sm font-medium flex-1">{p.label}</span>
                    {isActive && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {currentStatus && (
              <div className="px-3 pb-3">
                <button
                  onClick={() => select(null)}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200/60 text-sm text-red-500 hover:bg-red-50 hover:border-red-200/60 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Clear Status
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function PunchPage() {
  const { user } = useAuthStore();

  // ✅ Initialize propertyId immediately from JWT — don't wait for API
  const [propertyId, setPropertyId] = useState<string>(user?.property_id ?? "");
  const [propertyName, setPropertyName] = useState<string>("");
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [hoursSoFar, setHoursSoFar] = useState<number>(0);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [totalHoursWeek, setTotalHoursWeek] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Resolve property name (non-blocking — doesn't block punch state load)
  useEffect(() => {
    api.get("/v1/properties/").then((res) => {
      const list: { id: string; name: string }[] = res.data?.data ?? res.data ?? [];
      const match = list.find((p) => p.id === propertyId);
      if (match) setPropertyName(match.name);
      // If manager has no property_id in JWT, fall back to first property
      if (!propertyId && list.length > 0) {
        setPropertyId(list[0].id);
        setPropertyName(list[0].name);
      }
    }).catch(() => {});
  }, [propertyId]);

  // Load punch status + history — runs as soon as propertyId is known
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
      setCurrentStatus(statusRes.current_status ?? null);
      setHistory(histRes.records);
      setTotalHoursWeek(histRes.records.reduce((acc, r) => acc + (r.hours_worked ?? 0), 0));
    } catch {
      // user may not have punched in yet
    } finally {
      setIsFetching(false);
    }
  }, [propertyId]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handlePunch = async () => {
    if (!propertyId) { toast.error("No property assigned to your account"); return; }
    setLocationError(null);
    setIsLoading(true);
    try {
      const coords = await getCurrentPosition();
      if (punchedIn) {
        const res = await attendanceAPI.punchOut(propertyId, coords);
        setPunchedIn(false);
        setPunchInTime(null);
        setCurrentStatus(null);
        toast.success("Punched out successfully", { description: `Hours worked: ${fmtHours(res.hours_worked)}` });
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

  const preset = getPreset(currentStatus);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const stats = [
    { icon: Clock,     label: "Shift Start",  value: punchedIn && punchInTime ? fmt(punchInTime) : "—", color: "#3B82F6" },
    { icon: Clock,     label: "Hours Today",  value: fmtHours(hoursSoFar),                               color: "#10B981" },
    { icon: UserCheck, label: "This Week",    value: fmtHours(totalHoursWeek),                            color: "#6366F1" },
    {
      icon: UserCheck, label: "Status",
      value: punchedIn ? (preset?.label ?? "Working") : "Off",
      color: punchedIn ? (preset?.color ?? "#10B981") : "#EF4444",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Time Clock</h1>
          <p className="text-slate-500 text-sm mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status badge — visible in header when on shift */}
          {punchedIn && preset && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border"
              style={{ borderColor: `${preset.color}40`, backgroundColor: `${preset.color}12`, color: preset.color }}
            >
              <span>{preset.emoji}</span>
              <span>{preset.label}</span>
            </motion.div>
          )}
          <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-white border border-slate-200/60 px-4 py-2 rounded-xl">
            <div className={`w-2 h-2 rounded-full ${punchedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            {punchedIn ? "On Shift" : "Off Shift"}
          </div>
        </div>
      </div>

      {/* Property display */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="font-medium">
          {propertyName || (propertyId ? "Loading property…" : "No property assigned")}
        </span>
      </div>

      {/* Location error */}
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
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${stat.color}15` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
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
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Current Shift</h3>
              <p className="text-slate-500 text-sm mt-0.5">Tap to punch in or out</p>
            </div>
          </div>
          <div className="p-8">
            {/* Clock */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-slate-950 tracking-tight mb-2">
                {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              {punchedIn && punchInTime && (
                <p className="text-slate-500 text-sm">Since {fmt(punchInTime)}</p>
              )}
            </div>

            {/* Punch + Status row */}
            <div className="flex gap-3 items-stretch">
              <button
                onClick={handlePunch}
                disabled={isLoading || isFetching}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-lg transition-all shadow-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${
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

              {/* Status picker */}
              <StatusPicker
                propertyId={propertyId}
                currentStatus={currentStatus}
                onStatusChange={setCurrentStatus}
                disabled={!punchedIn || isFetching}
              />
            </div>

            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> Location required for punch
            </p>

            {/* Active status strip */}
            <AnimatePresence>
              {punchedIn && preset && (
                <motion.div
                  key={preset.value}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                    style={{ borderColor: `${preset.color}30`, backgroundColor: `${preset.color}10` }}
                  >
                    <span className="text-xl">{preset.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: preset.color }}>{preset.label}</p>
                      <p className="text-xs text-slate-500">Your current status is visible to your team</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent shifts */}
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
              history.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: r.status === "completed" ? "#10B98115" : "#F59E0B15" }}>
                    {r.status === "completed"
                      ? <UserCheck className="w-5 h-5 text-emerald-600" />
                      : <UserX className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 text-sm font-medium">{fmtDate(r.punch_in_time)}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{fmt(r.punch_in_time)} → {fmt(r.punch_out_time)}</p>
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
          <h3 className="font-bold text-slate-950 text-lg">Punch History</h3>
          <p className="text-slate-500 text-sm mt-0.5">Recent attendance records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {["Date", "Check In", "Check Out", "Total Hours", "Fence", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                ))}
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
                    <td className="px-6 py-4 text-slate-950 text-sm font-medium">{fmtDate(r.punch_in_time)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{fmt(r.punch_in_time)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{fmt(r.punch_out_time)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-950">{fmtHours(r.hours_worked)}</td>
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
