"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BedDouble, Loader2, Search, Filter, CheckSquare, Square,
} from "lucide-react";
import { toast } from "sonner";
import { roomsAPI } from "@/lib/api/rooms";
import { usersAPI } from "@/lib/api/users";

interface Room {
  id: string;
  room_number: string;
  room_type: string | null;
  price_per_night: number | null;
  status: "available" | "occupied" | "maintenance";
}

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Executive"];
const STATUSES = ["available", "occupied", "maintenance"] as const;

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  available: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60", dot: "bg-emerald-500" },
  occupied:  { badge: "bg-blue-50 text-blue-700 border-blue-200/60",         dot: "bg-blue-500" },
  maintenance:{ badge: "bg-amber-50 text-amber-700 border-amber-200/60",     dot: "bg-amber-500" },
};

export default function ManagerRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const loadRooms = useCallback(async (propId: string) => {
    try {
      const res = await roomsAPI.list(propId);
      const data = res.data;
      setRooms(Array.isArray(data) ? data : (data as any).rooms ?? []);
    } catch {
      toast.error("Failed to load rooms");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const meRes = await usersAPI.me();
        const me = meRes.data;
        const propId = me.property_id;
        if (!propId) {
          toast.error("No property assigned to your account");
          return;
        }
        setPropertyId(propId);

        // Get property name from rooms response meta or just use the id
        const { propertiesAPI } = await import("@/lib/api/properties");
        try {
          const propRes = await propertiesAPI.get(propId);
          setPropertyName(propRes.data.name);
        } catch {}

        await loadRooms(propId);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadRooms]);

  const filtered = rooms.filter(r => {
    const matchSearch = r.room_number.toLowerCase().includes(search.toLowerCase())
      || (r.room_type ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = typeFilter === "all" || (r.room_type ?? "").toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchStatus && matchType;
  });

  const counts = {
    total: rooms.length,
    available: rooms.filter(r => r.status === "available").length,
    occupied: rooms.filter(r => r.status === "occupied").length,
    maintenance: rooms.filter(r => r.status === "maintenance").length,
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id)));
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (!propertyId || selected.size === 0) return;
    try {
      setBulkSubmitting(true);
      await roomsAPI.bulkUpdateStatus(propertyId, Array.from(selected), newStatus);
      setRooms(prev => prev.map(r => selected.has(r.id) ? { ...r, status: newStatus as Room["status"] } : r));
      setSelected(new Set());
      toast.success(`${selected.size} room(s) marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Bulk update failed");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleQuickStatus = async (room: Room, newStatus: string) => {
    try {
      await roomsAPI.update(room.id, { status: newStatus });
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus as Room["status"] } : r));
      toast.success(`Room #${room.room_number} → ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update room");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Room Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {propertyName || "Your Property"} — update room availability
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, color: "#6366F1" },
          { label: "Available", value: counts.available, color: "#10B981" },
          { label: "Occupied", value: counts.occupied, color: "#3B82F6" },
          { label: "Maintenance", value: counts.maintenance, color: "#F59E0B" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{s.value}</div>
            <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            <div className="absolute bottom-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}60)` }} />
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by room number or type…"
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-slate-300"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            {["all", ...STATUSES].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-slate-950 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Type:</span>
          {["all", ...ROOM_TYPES].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex-wrap">
            <span className="text-indigo-700 text-sm font-semibold">{selected.size} selected</span>
            <span className="text-indigo-400 text-xs">Mark as:</span>
            {STATUSES.map(s => (
              <button key={s} onClick={() => handleBulkStatus(s)} disabled={bulkSubmitting}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  s === "available" ? "bg-emerald-600 text-white hover:bg-emerald-700" :
                  s === "occupied" ? "bg-blue-600 text-white hover:bg-blue-700" :
                  "bg-amber-600 text-white hover:bg-amber-700"
                }`}>
                {bulkSubmitting ? "…" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <button onClick={() => setSelected(new Set())} className="ml-auto text-indigo-500 hover:text-indigo-700 text-xs">
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-200/60">
          <BedDouble className="w-10 h-10 text-slate-200" />
          <p className="text-slate-400 text-sm">No rooms match the current filter</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
              {selected.size === filtered.length
                ? <CheckSquare className="w-4 h-4 text-indigo-600" />
                : <Square className="w-4 h-4" />}
              {selected.size === filtered.length ? "Deselect all" : "Select all"}
            </button>
            <span className="text-slate-300 text-xs">({filtered.length} rooms)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.015 }}
                onClick={() => toggleSelect(room.id)}
                className={`relative bg-white rounded-2xl p-4 border cursor-pointer transition-all duration-200 ${
                  selected.has(room.id)
                    ? "border-indigo-400 shadow-md shadow-indigo-100 ring-2 ring-indigo-200"
                    : "border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${STATUS_STYLES[room.status].dot}`} />
                    <span className="text-slate-950 text-sm font-bold">#{room.room_number}</span>
                  </div>
                  {selected.has(room.id) && (
                    <CheckSquare className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-slate-500 text-xs mb-3">{room.room_type ?? "Standard"}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[room.status].badge}`}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </span>

                {/* Quick status buttons */}
                <div
                  className="mt-3 flex gap-1 flex-wrap"
                  onClick={e => e.stopPropagation()}
                >
                  {STATUSES.filter(s => s !== room.status).map(s => (
                    <button
                      key={s}
                      onClick={() => handleQuickStatus(room, s)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                        s === "available" ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50" :
                        s === "occupied" ? "border-blue-200 text-blue-600 hover:bg-blue-50" :
                        "border-amber-200 text-amber-600 hover:bg-amber-50"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
