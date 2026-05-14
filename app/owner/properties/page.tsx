"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Building2, Utensils, MapPin, MoreHorizontal,
  Loader2, X, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { propertiesAPI, Property, PropertyCreate } from "@/lib/api/properties";

const FRANCHISE_TYPES = ["owner-operated", "franchise", "managed", "leased"];

function buildLocation(p: Property): string {
  return [p.city, p.country].filter(Boolean).join(", ") || p.address || "—";
}

const EMPTY_FORM: PropertyCreate = {
  name: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  franchise_type: "owner-operated",
  num_rooms: undefined,
  room_number_start: 101,
  has_restaurant: false,
};

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PropertyCreate>(EMPTY_FORM);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await propertiesAPI.list();
      setProperties(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    try {
      setSubmitting(true);
      const res = await propertiesAPI.create(formData);
      setProperties(prev => [res.data, ...prev]);
      setShowAdd(false);
      setFormData(EMPTY_FORM);
      toast.success("Property created successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create property");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await propertiesAPI.delete(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success("Property deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete property");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Properties</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {loading ? "Loading…" : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} in your portfolio`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Add Property
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search properties…"
          className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm overflow-hidden group"
            >
              {/* Card header */}
              <div className="relative h-36 bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
                <Building2 className="w-14 h-14 text-white/10" />
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    p.is_active ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
                  }`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-12">
                  <p className="text-white text-sm font-bold truncate">{p.name}</p>
                  <div className="flex items-center gap-1 text-white/60 text-xs mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{buildLocation(p)}</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 bg-black/[0.04] px-2.5 py-1 rounded-full capitalize">
                    {p.franchise_type ?? "Standard"}
                  </span>
                  {/* Overflow menu */}
                  <div className="relative" ref={menuOpen === p.id ? menuRef : null}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                      className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-black/[0.04]"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {menuOpen === p.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-8 bg-white border border-black/10 rounded-xl shadow-lg z-10 w-40 overflow-hidden"
                        >
                          <button
                            onClick={() => { setMenuOpen(null); router.push(`/owner/properties/${p.id}`); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-700 hover:bg-black/[0.04] text-left"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => { setMenuOpen(null); handleDelete(p.id, p.name); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-white/50 rounded-xl">
                    <Building2 className="w-3.5 h-3.5 mx-auto mb-1 text-blue-500" />
                    <div className="text-black text-sm font-bold">{p.num_rooms ?? "—"}</div>
                    <div className="text-neutral-400 text-[10px]">Rooms</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded-xl">
                    <Utensils className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-500" />
                    <div className="text-black text-sm font-bold">{p.has_restaurant ? "Yes" : "No"}</div>
                    <div className="text-neutral-400 text-[10px]">Restaurant</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                  <span className="text-neutral-500 text-xs truncate max-w-[60%]">
                    {[p.address, p.city].filter(Boolean).join(", ") || "No address set"}
                  </span>
                  <button
                    onClick={() => router.push(`/owner/properties/${p.id}`)}
                    className="text-black text-xs hover:underline flex-shrink-0"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add card */}
          <motion.button
            whileHover={{ y: -4 }}
            onClick={() => setShowAdd(true)}
            className="bg-white/50 border-2 border-dashed border-black/10 rounded-2xl min-h-[280px] flex flex-col items-center justify-center gap-3 text-neutral-400 hover:text-neutral-600 hover:border-black/20 hover:bg-black/[0.02] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-black/[0.04] flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Add New Property</span>
          </motion.button>
        </div>
      )}

      {/* Add Property Modal */}
      <AnimatePresence>
        {showAdd && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowAdd(false); setFormData(EMPTY_FORM); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-black/10 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-black font-extrabold text-xl">Add New Property</h2>
                <button
                  onClick={() => { setShowAdd(false); setFormData(EMPTY_FORM); }}
                  className="text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Property Name *</label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    placeholder="Grand Horizon Hotel"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">City</label>
                    <input
                      value={formData.city ?? ""}
                      onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                      placeholder="Dubai"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Country</label>
                    <input
                      value={formData.country ?? ""}
                      onChange={e => setFormData(f => ({ ...f, country: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                      placeholder="UAE"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Address</label>
                  <input
                    value={formData.address ?? ""}
                    onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    placeholder="123 Marina Walk"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">State / Province</label>
                    <input
                      value={formData.state ?? ""}
                      onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                      placeholder="Dubai"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Postal Code</label>
                    <input
                      value={formData.postal_code ?? ""}
                      onChange={e => setFormData(f => ({ ...f, postal_code: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                      placeholder="00000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Franchise Type</label>
                  <select
                    value={formData.franchise_type ?? "owner-operated"}
                    onChange={e => setFormData(f => ({ ...f, franchise_type: e.target.value }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                  >
                    {FRANCHISE_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Number of Rooms</label>
                    <input
                      value={formData.num_rooms ?? ""}
                      onChange={e => setFormData(f => ({ ...f, num_rooms: e.target.value ? parseInt(e.target.value) : undefined }))}
                      type="number"
                      min={0}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Room Numbers Start From</label>
                    <input
                      value={formData.room_number_start ?? 101}
                      onChange={e => setFormData(f => ({ ...f, room_number_start: e.target.value ? parseInt(e.target.value) : 101 }))}
                      type="number"
                      min={1}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                      placeholder="101"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.has_restaurant ?? false}
                    onChange={e => setFormData(f => ({ ...f, has_restaurant: e.target.checked }))}
                    className="w-4 h-4 rounded accent-black"
                  />
                  <span className="text-neutral-700 text-sm font-medium">Has Restaurant</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowAdd(false); setFormData(EMPTY_FORM); }}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.03] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={submitting || !formData.name.trim()}
                  className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Property
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
