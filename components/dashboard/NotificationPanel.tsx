"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, BedDouble, AlertTriangle, Clock,
  Loader2, Users, Building2, CalendarCheck,
  UserX, RefreshCw, TrendingUp,
} from "lucide-react";
import { attendanceAPI } from "@/lib/api/attendance";
import { roomsAPI } from "@/lib/api/rooms";
import { usersAPI } from "@/lib/api/users";
import { propertiesAPI } from "@/lib/api/properties";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

interface Snapshot {
  propertyName: string;
  present: number;
  totalStaff: number;
  available: number;
  occupied: number;
  maintenance: number;
}

interface Alert {
  id: string;
  type: "absent" | "maintenance" | "punch_in";
  title: string;
  body: string;
  time?: string;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const TODAY = new Date().toLocaleDateString("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [punchIns, setPunchIns] = useState<Alert[]>([]);
  const [domReady, setDomReady] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDomReady(true); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const meRes = await usersAPI.me();
      const me = meRes.data;
      let propertyId: string | null = me.property_id;
      let propertyName = "Your Property";

      if (!propertyId) {
        try {
          const propsRes = await propertiesAPI.list();
          const props = propsRes.data;
          if (props.length > 0) {
            propertyId = props[0].id;
            propertyName = props[0].name;
          }
        } catch {}
      }

      if (!propertyId) {
        setLoading(false);
        return;
      }

      const [attRes, allRoomsRes] = await Promise.allSettled([
        attendanceAPI.getPropertyAttendanceToday(propertyId),
        roomsAPI.list(propertyId),
      ]);

      const snap: Snapshot = {
        propertyName,
        present: 0,
        totalStaff: 0,
        available: 0,
        occupied: 0,
        maintenance: 0,
      };
      const newAlerts: Alert[] = [];
      const newPunchIns: Alert[] = [];

      if (attRes.status === "fulfilled") {
        const today = attRes.value;
        const present = today.records.filter(
          (r: any) => r.status === "active" || r.status === "completed"
        );
        snap.present = present.length;
        snap.totalStaff = today.total_staff;
        snap.propertyName = propertyName;

        present.forEach((r: any) => {
          if (r.punch_in_time) {
            newPunchIns.push({
              id: `pi-${r.user_id}`,
              type: "punch_in",
              title: r.user_name ?? "Staff member",
              body: `Punched in at ${new Date(r.punch_in_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
              time: r.punch_in_time,
            });
          }
        });

        const absent = Math.max(0, today.total_staff - present.length);
        if (absent > 0) {
          newAlerts.push({
            id: "absent",
            type: "absent",
            title: `${absent} staff member${absent > 1 ? "s" : ""} absent`,
            body: `${present.length} of ${today.total_staff} have punched in today`,
          });
        }
      }

      if (allRoomsRes.status === "fulfilled") {
        const roomList: any[] = Array.isArray(allRoomsRes.value.data)
          ? allRoomsRes.value.data
          : (allRoomsRes.value.data as any).rooms ?? [];
        snap.available = roomList.filter((r) => r.status === "available").length;
        snap.occupied = roomList.filter((r) => r.status === "occupied").length;
        snap.maintenance = roomList.filter((r) => r.status === "maintenance").length;

        if (snap.maintenance > 0) {
          const mRooms = roomList.filter((r) => r.status === "maintenance");
          newAlerts.push({
            id: "maint",
            type: "maintenance",
            title: `${snap.maintenance} room${snap.maintenance > 1 ? "s" : ""} in maintenance`,
            body:
              mRooms
                .slice(0, 4)
                .map((r) => `#${r.room_number}`)
                .join(", ") + (mRooms.length > 4 ? ` +${mRooms.length - 4} more` : ""),
          });
        }
      }

      setSnapshot(snap);
      setAlerts(newAlerts);
      setPunchIns(newPunchIns);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    load();
  }, [open]);


  const attendancePct =
    snapshot && snapshot.totalStaff > 0
      ? Math.round((snapshot.present / snapshot.totalStaff) * 100)
      : 0;

  if (!domReady) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — captures click-outside */}
          <div className="fixed inset-0 z-[9998]" onClick={onClose} />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-[88px] right-4 w-[360px] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/8 z-[9999] overflow-hidden"
          >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white dark:text-slate-950" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                  Activity Feed
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <CalendarCheck className="w-3 h-3" />
                  {TODAY}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={load}
                disabled={loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="overflow-y-auto" style={{ maxHeight: "460px" }}>
            {loading && !snapshot ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                <p className="text-xs text-slate-400">Loading today's activity…</p>
              </div>
            ) : !snapshot ? (
              <div className="flex flex-col items-center py-12 gap-3 px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No property assigned
                </p>
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Assign a property to your account to see today's activity here.
                </p>
              </div>
            ) : (
              <div className="py-3 space-y-4">

                {/* ── Property snapshot ── */}
                <div className="px-4">
                  <div className="rounded-2xl border border-slate-100 dark:border-white/8 overflow-hidden">
                    {/* Property header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-white/4 border-b border-slate-100 dark:border-white/6">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                        {snapshot.propertyName}
                      </p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-white/6">
                      {/* Staff */}
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-[11px] text-slate-400 font-medium">Staff Today</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                          {snapshot.present}
                          <span className="text-sm font-normal text-slate-400 ml-1">
                            / {snapshot.totalStaff}
                          </span>
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400">Attendance</span>
                            <span className="text-[10px] font-semibold text-emerald-600">
                              {attendancePct}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/8 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${attendancePct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Rooms */}
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-[11px] text-slate-400 font-medium">Rooms</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                              <span className="text-xs text-slate-500 dark:text-slate-400">Available</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {snapshot.available}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                              <span className="text-xs text-slate-500 dark:text-slate-400">Occupied</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {snapshot.occupied}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                              <span className="text-xs text-slate-500 dark:text-slate-400">Maintenance</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {snapshot.maintenance}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Alerts ── */}
                {alerts.length > 0 && (
                  <div className="px-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Alerts
                    </p>
                    <div className="space-y-2">
                      {alerts.map((a) => (
                        <div
                          key={a.id}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border-l-4 ${
                            a.type === "absent"
                              ? "bg-red-50 dark:bg-red-950/20 border-l-red-500"
                              : "bg-amber-50 dark:bg-amber-950/20 border-l-amber-500"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              a.type === "absent" ? "bg-red-100" : "bg-amber-100"
                            }`}
                          >
                            {a.type === "absent" ? (
                              <UserX className="w-3.5 h-3.5 text-red-600" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                              {a.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                              {a.body}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Check-ins ── */}
                {punchIns.length > 0 && (
                  <div className="px-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Today's Check-ins
                    </p>
                    <div className="space-y-1">
                      {punchIns.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/4 transition-colors group"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${avatarColor(
                              p.title
                            )}`}
                          >
                            {getInitials(p.title)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">
                              {p.title}
                            </p>
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              {p.body}
                            </p>
                          </div>
                          {p.time && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0 bg-slate-100 dark:bg-white/6 px-2 py-1 rounded-full">
                              <Clock className="w-2.5 h-2.5" />
                              {timeAgo(p.time)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All clear state */}
                {alerts.length === 0 && punchIns.length === 0 && (
                  <div className="px-4">
                    <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-base">✓</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          All clear
                        </p>
                        <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                          No alerts for today
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-white/6 flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-slate-300" />
            <p className="text-[10px] text-slate-400">Refreshes each time you open</p>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
