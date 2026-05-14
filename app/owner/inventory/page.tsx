"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, AlertTriangle, Package, X, Edit2,
  ChevronRight, AlertCircle, Minus, Loader2, Building2,
} from "lucide-react";
import { toast } from "sonner";
import { inventoryAPI } from "@/lib/api/inventory";
import { propertiesAPI, Property } from "@/lib/api/properties";
import { FeatureGate } from "@/components/ui/FeatureGate";

interface InventoryItem {
  id: string;
  property_id: string;
  item_name: string;
  quantity: number;
  unit: string | null;
  reorder_level: number | null;
  created_at: string;
}

const UNITS = ["pcs", "sets", "rolls", "boxes", "bottles", "kg", "liters", "bags"];

function computeStatus(qty: number, reorder: number | null): "ok" | "low" | "critical" {
  if (reorder === null || reorder === 0) return "ok";
  if (qty === 0) return "critical";
  if (qty <= reorder) return "low";
  return "ok";
}

const statusMap = {
  ok: { label: "In Stock", bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
  low: { label: "Low Stock", bg: "bg-amber-50 text-amber-700 border border-amber-200/60" },
  critical: { label: "Critical", bg: "bg-red-50 text-red-700 border border-red-200/60" },
};

function AddItemModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: any) => Promise<void> }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [unit, setUnit] = useState(UNITS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Item name is required";
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) e.quantity = "Valid quantity required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onAdd({
        item_name: name.trim(),
        quantity: Number(quantity),
        unit,
        reorder_level: reorderLevel ? Number(reorderLevel) : null,
      });
      onClose();
    } catch {
      // error shown by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-black/10" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center">
                <Package className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-black" style={{ fontWeight: 800, fontSize: "1rem" }}>Add Inventory Item</h2>
                <p className="text-neutral-400 text-xs">Add a new item to track</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Item Name <span className="text-red-400">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bath Towels"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${errors.name ? "border-red-300" : "border-black/10 focus:border-black/20"}`} />
              {errors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Quantity <span className="text-red-400">*</span></label>
                <input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors ${errors.quantity ? "border-red-300" : "border-black/10 focus:border-black/20"}`} />
                {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Reorder Level</label>
                <input type="number" min="0" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} placeholder="0"
                  className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/20" />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Unit</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/20 bg-white">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="px-6 pb-5 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors" style={{ fontWeight: 600 }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Item
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function EditStockModal({ item, onClose, onSave }: { item: InventoryItem; onClose: () => void; onSave: (newQty: number) => Promise<void> }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await onSave(quantity);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-black/10" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
            <div>
              <h2 className="text-black" style={{ fontWeight: 800, fontSize: "1rem" }}>Edit Stock</h2>
              <p className="text-neutral-400 text-xs mt-0.5">{item.item_name}</p>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400" style={{ fontWeight: 600 }}>Current Quantity</p>
                <p className="text-2xl mt-0.5" style={{ fontWeight: 800, color: "#3B82F6" }}>{item.quantity} <span className="text-sm text-neutral-400">{item.unit ?? ""}</span></p>
              </div>
              {item.reorder_level !== null && (
                <div className="text-right">
                  <p className="text-xs text-neutral-400" style={{ fontWeight: 600 }}>Reorder At</p>
                  <p className="text-lg mt-0.5 text-neutral-600" style={{ fontWeight: 700 }}>{item.reorder_level} {item.unit ?? ""}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>New Quantity ({item.unit ?? "pcs"})</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(q => Math.max(0, q - 1))} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg border border-black/10 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <input type="number" min="0" value={quantity} onChange={e => setQuantity(Math.max(0, Number(e.target.value)))}
                  className="flex-1 border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 text-center" style={{ fontWeight: 700 }} />
                <button onClick={() => setQuantity(q => q + 1)} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg border border-black/10 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 pb-5 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors" style={{ fontWeight: 600 }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />} Update Stock
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function InventoryPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [propsLoading, setPropsLoading] = useState(true);

  useEffect(() => {
    propertiesAPI.list()
      .then((propsRes) => {
        setProperties(propsRes.data);
        if (propsRes.data.length > 0) setSelectedPropertyId(propsRes.data[0].id);
      })
      .catch(() => toast.error("Failed to load properties"))
      .finally(() => setPropsLoading(false));
  }, []);

  const fetchItems = useCallback(async () => {
    if (!selectedPropertyId) return;
    setLoading(true);
    try {
      const res = await inventoryAPI.list(selectedPropertyId);
      setItems(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter(i =>
    i.item_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (data: any) => {
    try {
      const res = await inventoryAPI.create(selectedPropertyId, data);
      setItems(prev => [res.data, ...prev]);
      toast.success("Item added");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add item");
      throw err;
    }
  };

  const handleUpdateStock = async (item: InventoryItem, newQty: number) => {
    try {
      const res = await inventoryAPI.adjustStock(item.id, { new_quantity: newQty });
      setItems(prev => prev.map(i => i.id === item.id ? res.data : i));
      toast.success("Stock updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update stock");
      throw err;
    }
  };

  if (propsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <FeatureGate feature="inventory">
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Inventory</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{items.length} items tracked</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAdd(true)} disabled={!selectedPropertyId}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md disabled:opacity-50" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Add Item
        </motion.button>
      </div>

      {/* Property selector */}
      {properties.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-4 h-4 text-neutral-400" />
          <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}
            className="bg-white border border-black/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black/20">
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      <>
          {/* Alert banner */}
          {items.filter(i => computeStatus(i.quantity, i.reorder_level) !== "ok").length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-amber-50 border border-amber-200/60 rounded-xl px-5 py-4 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <span style={{ fontWeight: 600 }}>{items.filter(i => computeStatus(i.quantity, i.reorder_level) !== "ok").length} items</span> are below minimum stock level.
              </p>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Items", value: items.length, color: "#3B82F6", icon: Package },
              { label: "Low Stock", value: items.filter(i => computeStatus(i.quantity, i.reorder_level) === "low").length, color: "#F59E0B", icon: AlertTriangle },
              { label: "Critical", value: items.filter(i => computeStatus(i.quantity, i.reorder_level) === "critical").length, color: "#EF4444", icon: AlertTriangle },
            ].map((s, i) => (
              <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-4 border border-black/10 shadow-sm">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: s.color + "15" }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div className="text-2xl" style={{ fontWeight: 800, color: s.color }}>{s.value}</div>
                <div className="text-neutral-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-5 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..."
              className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-colors" />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/50">
                      {["Item", "Quantity", "Reorder Level", "Status", ""].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => {
                      const status = computeStatus(item.quantity, item.reorder_level);
                      const s = statusMap[status];
                      const pct = item.reorder_level ? Math.min(100, (item.quantity / item.reorder_level) * 100) : 100;
                      return (
                        <tr key={item.id} className="border-t border-black/5 hover:bg-white/50 transition-colors">
                          <td className="px-5 py-4 text-black text-sm" style={{ fontWeight: 600 }}>{item.item_name}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full max-w-20">
                                <div className="h-1.5 rounded-full transition-all"
                                  style={{ width: `${pct}%`, backgroundColor: status === "ok" ? "#10B981" : status === "low" ? "#F59E0B" : "#EF4444" }} />
                              </div>
                              <span className="text-sm text-neutral-700">{item.quantity} {item.unit ?? ""}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-neutral-500 text-sm">{item.reorder_level ?? "—"} {item.unit ?? ""}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full border ${s.bg}`} style={{ fontWeight: 600 }}>{s.label}</span>
                          </td>
                          <td className="px-5 py-4">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setEditingItem(item)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-black/10 text-neutral-500 hover:border-[#3B82F6] hover:text-black transition-colors" style={{ fontWeight: 600 }}>
                              <Edit2 className="w-3 h-3" /> Edit Stock
                            </motion.button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="py-12 text-center text-neutral-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm" style={{ fontWeight: 600 }}>
                    {search ? "No items match your search." : "No inventory items yet. Add an item to get started."}
                  </p>
                </div>
              )}
            </div>
          )}
      </>

      <AnimatePresence>
        {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
        {editingItem && <EditStockModal item={editingItem} onClose={() => setEditingItem(null)} onSave={(qty) => handleUpdateStock(editingItem, qty)} />}
      </AnimatePresence>
    </div>
    </FeatureGate>
  );
}
