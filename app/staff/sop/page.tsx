"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText, Search, Clock, CheckCircle2, ChevronRight,
  Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { sopAPI } from "@/lib/api/sop";
import { usersAPI } from "@/lib/api/users";

interface SOPCategory { id: string; name: string; }
interface SOPItem {
  id: string; category_id: string; title: string; description?: string;
  priority: "low" | "medium" | "high"; status: string;
  due_date?: string; created_at: string; updated_at: string;
}

const priorityConfig = {
  high:   { color: "#EF4444", bg: "bg-red-50 text-red-700 border border-red-200",     label: "High" },
  medium: { color: "#F59E0B", bg: "bg-amber-50 text-amber-700 border border-amber-200", label: "Medium" },
  low:    { color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: "Low" },
};

export default function StaffSOPsPage() {
  const [sops, setSOPs] = useState<SOPItem[]>([]);
  const [categories, setCategories] = useState<SOPCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const meRes = await usersAPI.me();
      const propId = meRes.data.property_id;
      if (!propId) { toast.error("No property assigned to your account"); setLoading(false); return; }

      const [catRes, sopRes] = await Promise.all([
        sopAPI.listCategories(propId),
        sopAPI.listSOPs(propId),
      ]);
      setCategories(catRes.data as SOPCategory[]);
      setSOPs(sopRes.data as SOPItem[]);
    } catch {
      toast.error("Failed to load SOPs");
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

  const filtered = sops.filter(sop => {
    const matchSearch = sop.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "all" || sop.category_id === selectedCategory;
    return matchSearch && matchCat;
  });

  const pendingCount = sops.filter(s => s.status === "pending" || s.status === "in_progress").length;
  const completedCount = sops.filter(s => s.status === "completed").length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">SOPs & Guidelines</h1>
          <p className="text-slate-500 text-sm mt-1">Standard operating procedures for your role</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">
            {completedCount} Completed
          </span>
          <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-full">
            {pendingCount} Pending
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search SOPs by title..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-950/10 transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === "all" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat.id ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <FileText className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No SOPs found</p>
          <p className="text-xs mt-1">Try adjusting your search or category filter</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((sop, i) => {
          const priorityCfg = priorityConfig[sop.priority] ?? priorityConfig.medium;
          const catName = categories.find(c => c.id === sop.category_id)?.name ?? "—";
          const isExpanded = expandedId === sop.id;

          return (
            <motion.div key={sop.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : sop.id)}
                className="w-full flex items-center gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${priorityCfg.color}15` }}>
                  <FileText className="w-6 h-6" style={{ color: priorityCfg.color }} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-slate-950">{sop.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="px-2 py-0.5 bg-slate-100 rounded">{catName}</span>
                    {sop.due_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {new Date(sop.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    <span>Updated {new Date(sop.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${priorityCfg.bg}`}>
                    {priorityCfg.label}
                  </span>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${
                    sop.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {sop.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                    {sop.status === "completed" ? "Completed" : sop.status === "in_progress" ? "In Progress" : "Pending"}
                  </span>
                  <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </motion.div>
                </div>
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="border-t border-slate-100 bg-slate-50/50">
                  <div className="p-6">
                    {sop.description ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-600 leading-relaxed">{sop.description}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        No description provided for this SOP.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
