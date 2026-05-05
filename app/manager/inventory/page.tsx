"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package, AlertTriangle, TrendingDown, Search, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { inventoryAPI } from "@/lib/api/inventory";
import { featuresAPI } from "@/lib/api/features";
import { usersAPI } from "@/lib/api/users";

interface InventoryItem {
  id: string; item_name: string; quantity: number;
  unit: string; reorder_level: number;
}

const computeStatus = (qty: number, reorder: number) => {
  if (qty <= 0) return "critical";
  if (qty <= reorder) return "low";
  return "ok";
};

const statusMap = {
  ok:       { label: "In Stock",  bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", bar: "#10B981" },
  low:      { label: "Low Stock", bg: "bg-amber-50 text-amber-700 border border-amber-200/60",       bar: "#F59E0B" },
  critical: { label: "Critical",  bg: "bg-red-50 text-red-700 border border-red-200/60",             bar: "#EF4444" },
};

export default function ManagerInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureEnabled, setFeatureEnabled] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const meRes = await usersAPI.me();
      const propId = meRes.data.property_id;
      if (!propId) { toast.error("No property assigned to your account"); setLoading(false); return; }

      const [featRes, invRes] = await Promise.all([
        featuresAPI.list(),
        inventoryAPI.list(propId),
      ]);

      const features = featRes.data as Record<string, boolean>;
      setFeatureEnabled(features.inventory === true);
      setItems(invRes.data as InventoryItem[]);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (featureEnabled === false) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-slate-950 font-bold text-xl mb-2">Inventory Not Enabled</h2>
        <p className="text-slate-500 text-sm max-w-sm">The inventory feature is not enabled for this property. Contact the owner to enable it.</p>
      </div>
    );
  }

  const itemsWithStatus = items.map(i => ({ ...i, status: computeStatus(i.quantity, i.reorder_level) as "ok" | "low" | "critical" }));
  const filtered = itemsWithStatus.filter(i => i.item_name.toLowerCase().includes(search.toLowerCase()));
  const lowCount = itemsWithStatus.filter(i => i.status !== "ok").length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black font-bold" style={{ fontSize: "1.4rem" }}>Inventory Overview</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Monitor stock levels for your property</p>
        </div>
        {lowCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200/60 rounded-xl px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 font-semibold">{lowCount} item{lowCount > 1 ? "s" : ""} need restocking</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Package, label: "Total Items", value: items.length, color: "#3B82F6" },
          { icon: AlertTriangle, label: "Low / Critical", value: lowCount, color: "#EF4444" },
          { icon: TrendingDown, label: "In Stock", value: itemsWithStatus.filter(i => i.status === "ok").length, color: "#10B981" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: stat.color + "15" }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div className="text-black font-bold" style={{ fontSize: "1.6rem" }}>{stat.value}</div>
            <div className="text-neutral-500 text-sm mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {lowCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200/50 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-black font-semibold mb-1">Low Stock Alert</h3>
              <p className="text-neutral-600 text-sm">
                {lowCount} item{lowCount > 1 ? "s are" : " is"} below the minimum stock level. Contact the property owner to arrange restocking.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-black/10 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
            className="w-full bg-white/50 border border-black/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10">
          <h3 className="text-black font-bold">Stock Levels</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/50 border-b border-black/10">
                {["Item", "Current Stock", "Min Required", "Status"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs text-neutral-600 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item, i) => {
                const pct = Math.min(100, item.reorder_level > 0 ? (item.quantity / (item.reorder_level * 2)) * 100 : 100);
                const s = statusMap[item.status];
                return (
                  <motion.tr key={item.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-neutral-400" />
                        </div>
                        <span className="text-black text-sm font-semibold">{item.item_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-black/[0.04] rounded-full flex-shrink-0">
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: s.bar }} />
                        </div>
                        <span className="text-black text-sm font-semibold">{item.quantity} {item.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-sm">{item.reorder_level} {item.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.bg}`}>{s.label}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-neutral-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No items found</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">Stock adjustments</span> are managed by the property owner. Contact the owner to update stock levels or arrange restocking.
        </p>
      </div>
    </div>
  );
}
