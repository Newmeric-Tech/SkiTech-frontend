"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, UserCheck, UserX, BedDouble, AlertTriangle, Clock,
  Loader2, Users, Building2, CalendarCheck,
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

const TODAY = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [punchIns, setPunchIns] = useState<Alert[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // Get the user, then resolve a property to inspect
        const meRes = await usersAPI.me();
        const me = meRes.data;
        let propertyId: string | null = me.property_id;
        let propertyName = "Your Property";

        if (!propertyId) {
          // Admin/Tenant Admin — pick first property
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
          if (!cancelled) setLoading(false);
          return;
        }

        // Parallel: attendance today + room counts
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
          if (!propertyName || propertyName === "Your Property") propertyName = snap.propertyName;
          const present = today.records.filter(r => r.status === "active" || r.status === "completed");
          snap.present = present.length;
          snap.totalStaff = today.total_staff;
          snap.propertyName = propertyName;

          present.forEach(r => {
            if (r.punch_in_time) {
              newPunchIns.push({
                id: `pi-${r.user_id}`,
                type: "punch_in",
                title: r.user_name ?? "Staff member",
                body: `Punched in at ${new Date(r.punch_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                time: r.punch_in_time,
              });
            }
          });

          const absent = Math.max(0, today.total_staff - present.length);
          if (absent > 0) {
            newAlerts.push({
              id: "absent",
              type: "absent",
              title: `${absent} staff absent today`,
              body: `${present.length} of ${today.total_staff} have punched in`,
            });
          }
        }

        if (allRoomsRes.status === "fulfilled") {
          const roomList: any[] = Array.isArray(allRoomsRes.value.data)
            ? allRoomsRes.value.data
            : (allRoomsRes.value.data as any).rooms ?? [];
          snap.available = roomList.filter(r => r.status === "available").length;
          snap.occupied = roomList.filter(r => r.status === "occupied").length;
          snap.maintenance = roomList.filter(r => r.status === "maintenance").length;

          if (snap.maintenance > 0) {
            const mRooms = roomList.filter(r => r.status === "maintenance");
            newAlerts.push({
              id: "maint",
              type: "maintenance",
              title: `${snap.maintenance} room(s) in maintenance`,
              body: mRooms.slice(0, 4).map(r => `#${r.room_number}`).join(", ")
                + (mRooms.length > 4 ? ` +${mRooms.length - 4} more` : ""),
            });
          }
        }

        if (!cancelled) {
          setSnapshot(snap);
          setAlerts(newAlerts);
          setPunchIns(newPunchIns);
        }
      } catch {}
      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 w-[340px] bg-white dark:bg-[#1c1c1c] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div>
              <p className="text-sm font-bold text-slate-950 dark:text-white">Activity Feed</p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <CalendarCheck className="w-3 h-3" />{TODAY}
              </p>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "480px" }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                <p className="text-xs text-slate-400">Loading today's activity…</p>
              </div>
            ) : (
              <div className="pb-3">
                {/* Snapshot card */}
                {snapshot && (
                  <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-3.5 h-3.5 text-white/60" />
                      <p className="text-xs text-white/70 font-medium truncate">{snapshot.propertyName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Users className="w-3 h-3 text-emerald-300" />
                          <span className="text-xs text-white/60">Staff Today</span>
                        </div>
                        <p className="text-lg font-bold">
                          {snapshot.present}
                          <span className="text-xs font-normal text-white/50 ml-1">/ {snapshot.totalStaff}</span>
                        </p>
                        <p className="text-[10px] text-emerald-300 mt-0.5">
                          {snapshot.totalStaff > 0
                            ? `${Math.round((snapshot.present / snapshot.totalStaff) * 100)}% present`
                            : "No staff assigned"}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <BedDouble className="w-3 h-3 text-blue-300" />
                          <span className="text-xs text-white/60">Rooms</span>
                        </div>
                        <div className="space-y-0.5 mt-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-emerald-300">Available</span>
                            <span className="font-semibold">{snapshot.available}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-300">Occupied</span>
                            <span className="font-semibold">{snapshot.occupied}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-amber-300">Maintenance</span>
                            <span className="font-semibold">{snapshot.maintenance}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {alerts.length > 0 && (
                  <div className="px-3 mb-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Alerts</p>
                    <div className="space-y-1.5">
                      {alerts.map(a => (
                        <div key={a.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border ${
                            a.type === "absent"
                              ? "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
                              : "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30"
                          }`}>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            a.type === "absent" ? "bg-red-100" : "bg-amber-100"
                          }`}>
                            {a.type === "absent"
                              ? <UserX className="w-3.5 h-3.5 text-red-600" />
                              : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{a.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{a.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Punch-in activity */}
                {punchIns.length > 0 && (
                  <div className="px-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Today's Check-ins
                    </p>
                    <div className="space-y-0.5">
                      {punchIns.map(p => (
                        <div key={p.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-950 dark:text-white truncate">{p.title}</p>
                            <p className="text-[11px] text-slate-400">{p.body}</p>
                          </div>
                          {p.time && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-0.5 flex-shrink-0">
                              <Clock className="w-2.5 h-2.5" />{timeAgo(p.time)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All clear */}
                {!snapshot && !loading && (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">No property assigned</p>
                    <p className="text-xs text-slate-400 text-center px-6">
                      Assign a property to your account to see activity here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-black/[0.05] dark:border-white/[0.06]">
            <p className="text-[10px] text-slate-400 text-center">Refreshes each time you open</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
