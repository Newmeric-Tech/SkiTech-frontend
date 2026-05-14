"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, BedDouble, Plus, Pencil, Trash2,
  Loader2, X, Search, Filter, RefreshCw, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { roomsAPI } from "@/lib/api/rooms";
import { propertiesAPI, Property } from "@/lib/api/properties";

interface Room {
  id: string;
  room_number: string;
  room_type: string | null;
  price_per_night: number | null;
  status: "available" | "occupied" | "maintenance";
}

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Executive"];
const STATUSES = ["available", "occupied", "maintenance"] as const;

const STATUS_STYLES: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  occupied: "bg-blue-50 text-blue-700 border-blue-200/60",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200/60",
};

const EMPTY_FORM = { room_number: "", room_type: "Standard", price_per_night: "", status: "available" };

export default function RoomsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [regenerating, setRegenerating] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [propRes, roomsRes] = await Promise.all([
        propertiesAPI.get(id),
        roomsAPI.list(id),
      ]);
      setProperty(propRes.data);
      const data = roomsRes.data;
      setRooms(Array.isArray(data) ? data : (data as any).rooms ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async () => {
    if (!addForm.room_number.trim()) return;
    try {
      setAddSubmitting(true);
      const res = await roomsAPI.create(id, {
        room_number: addForm.room_number.trim(),
        room_type: addForm.room_type,
        price_per_night: addForm.price_per_night ? parseFloat(addForm.price_per_night) : null,
        status: addForm.status,
      });
      setRooms(prev => [res.data, ...prev]);
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      toast.success("Room added");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add room");
    } finally {
      setAddSubmitting(false);
    }
  };

  const openEdit = (room: Room) => {
    setEditRoom(room);
    setEditForm({
      room_number: room.room_number,
      room_type: room.room_type ?? "Standard",
      price_per_night: room.price_per_night != null ? String(room.price_per_night) : "",
      status: room.status,
    });
  };

  const handleEdit = async () => {
    if (!editRoom) return;
    try {
      setEditSubmitting(true);
      const res = await roomsAPI.update(editRoom.id, {
        room_number: editForm.room_number.trim(),
        room_type: editForm.room_type,
        price_per_night: editForm.price_per_night ? parseFloat(editForm.price_per_night) : null,
        status: editForm.status,
      });
      setRooms(prev => prev.map(r => r.id === editRoom.id ? res.data : r));
      setEditRoom(null);
      toast.success("Room updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update room");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`Delete room #${room.room_number}? This cannot be undone.`)) return;
    try {
      await roomsAPI.delete(room.id);
      setRooms(prev => prev.filter(r => r.id !== room.id));
      toast.success(`Room #${room.room_number} deleted`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete room");
    }
  };

  const handleRegenerate = async () => {
    if (!property) return;
    const expectedStart = property.room_number_start ?? 101;
    const expectedCount = property.num_rooms ?? 0;
    if (!confirm(
      `This will delete all ${rooms.length} existing room(s) and recreate ${expectedCount} room(s) starting from #${expectedStart}.\n\nThis cannot be undone. Active bookings will block this action.\n\nProceed?`
    )) return;
    try {
      setRegenerating(true);
      const res = await roomsAPI.regenerate(id);
      setRooms(Array.isArray(res.data) ? res.data : []);
      toast.success(`Rooms regenerated — ${expectedCount} rooms starting from #${expectedStart}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to regenerate rooms");
    } finally {
      setRegenerating(false);
    }
  };

  const filtered = rooms.filter(r => {
    const matchSearch = r.room_number.toLowerCase().includes(search.toLowerCase())
      || (r.room_type ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = typeFilter === "all" || (r.room_type ?? "").toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchStatus && matchType;
  });

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedRooms.size === 0) return;
    try {
      setBulkSubmitting(true);
      await roomsAPI.bulkUpdateStatus(id, Array.from(selectedRooms), newStatus);
      setRooms(prev => prev.map(r => selectedRooms.has(r.id) ? { ...r, status: newStatus as Room["status"] } : r));
      setSelectedRooms(new Set());
      toast.success(`${selectedRooms.size} room(s) updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Bulk update failed");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const toggleSelect = (roomId: string) => {
    setSelectedRooms(prev => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId); else next.add(roomId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRooms.size === filtered.length) {
      setSelectedRooms(new Set());
    } else {
      setSelectedRooms(new Set(filtered.map(r => r.id)));
    }
  };

  const counts = {
    total: rooms.length,
    available: rooms.filter(r => r.status === "available").length,
    occupied: rooms.filter(r => r.status === "occupied").length,
    maintenance: rooms.filter(r => r.status === "maintenance").length,
  };

  const expectedStart = property?.room_number_start ?? 101;
  const expectedCount = property?.num_rooms ?? 0;
  const actualFirstNumber = rooms.length > 0
    ? Math.min(...rooms.map(r => parseInt(r.room_number) || 0))
    : null;
  const hasMismatch = !loading && rooms.length > 0 && (
    rooms.length !== expectedCount ||
    (actualFirstNumber !== null && actualFirstNumber !== expectedStart)
  );

  const RoomForm = ({ form, onChange }: { form: typeof EMPTY_FORM; onChange: (f: typeof EMPTY_FORM) => void }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Room Number *</label>
          <input
            value={form.room_number}
            onChange={e => onChange({ ...form, room_number: e.target.value })}
            className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
            placeholder="101"
          />
        </div>
        <div>
          <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Room Type</label>
          <select
            value={form.room_type}
            onChange={e => onChange({ ...form, room_type: e.target.value })}
            className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
          >
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Price / Night (₹)</label>
          <input
            value={form.price_per_night}
            onChange={e => onChange({ ...form, price_per_night: e.target.value })}
            type="number"
            min={0}
            className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
            placeholder="2500"
          />
        </div>
        <div>
          <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Status</label>
          <select
            value={form.status}
            onChange={e => onChange({ ...form, status: e.target.value })}
            className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/owner/properties/${id}`)}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
              {property ? `${property.name} — Rooms` : "Rooms"}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{counts.total} rooms total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating || !property?.num_rooms}
            title="Delete all rooms and regenerate from property settings"
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Regenerate
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Room
          </button>
        </div>
      </div>

      {/* Status summary */}
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
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{loading ? "…" : s.value}</div>
            <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}60)` }} />
          </motion.div>
        ))}
      </div>

      {/* Mismatch warning */}
      <AnimatePresence>
        {hasMismatch && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-800 text-sm font-semibold">Room numbering mismatch detected</p>
              <p className="text-amber-700 text-xs mt-0.5">
                Property is set to <strong>{expectedCount} rooms starting from #{expectedStart}</strong>, but currently showing{" "}
                <strong>{rooms.length} rooms starting from #{actualFirstNumber}</strong>.
                {" "}Use <strong>Regenerate</strong> to reset rooms to the correct numbering.
              </p>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Regenerate
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-slate-950 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Type:</span>
          {["all", ...ROOM_TYPES].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectedRooms.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex-wrap"
          >
            <span className="text-indigo-700 text-sm font-semibold">{selectedRooms.size} room(s) selected</span>
            <span className="text-indigo-400 text-xs">Set status to:</span>
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => handleBulkStatus(s)}
                disabled={bulkSubmitting}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  s === "available" ? "bg-emerald-600 text-white hover:bg-emerald-700" :
                  s === "occupied" ? "bg-blue-600 text-white hover:bg-blue-700" :
                  "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                {bulkSubmitting ? "…" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setSelectedRooms(new Set())}
              className="ml-auto text-indigo-500 hover:text-indigo-700 text-xs"
            >
              Clear selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rooms table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <BedDouble className="w-10 h-10 text-slate-200" />
              <p className="text-slate-400 text-sm">
                {rooms.length === 0 ? "No rooms yet — add your first room" : "No rooms match the current filter"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedRooms.size === filtered.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded accent-indigo-600"
                      />
                    </th>
                    {["Room #", "Type", "Price / Night", "Status", "Actions"].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((room, i) => (
                    <motion.tr key={room.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`hover:bg-slate-50/60 transition-colors ${selectedRooms.has(room.id) ? "bg-indigo-50/40" : ""}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRooms.has(room.id)}
                          onChange={() => toggleSelect(room.id)}
                          className="w-4 h-4 rounded accent-indigo-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <BedDouble className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="text-slate-950 text-sm font-bold">{room.room_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{room.room_type ?? "—"}</td>
                      <td className="px-6 py-4 text-slate-700 text-sm font-medium">
                        {room.price_per_night != null ? `₹${Number(room.price_per_night).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[room.status]}`}>
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(room)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(room)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Room Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-black/10"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-black font-extrabold text-xl">Add Room</h2>
                <button onClick={() => setShowAdd(false)} className="text-neutral-400 hover:text-neutral-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <RoomForm form={addForm} onChange={setAddForm} />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.03] transition-colors">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={addSubmitting || !addForm.room_number.trim()}
                  className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                  {addSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Room
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Room Modal */}
      <AnimatePresence>
        {editRoom && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditRoom(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-black/10"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-black font-extrabold text-xl">Edit Room #{editRoom.room_number}</h2>
                <button onClick={() => setEditRoom(null)} className="text-neutral-400 hover:text-neutral-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <RoomForm form={editForm} onChange={setEditForm} />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditRoom(null)}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.03] transition-colors">
                  Cancel
                </button>
                <button onClick={handleEdit} disabled={editSubmitting || !editForm.room_number.trim()}
                  className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                  {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
