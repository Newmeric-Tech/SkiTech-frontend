"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Search, Plus, X, ChevronDown, AlertCircle,
  CheckCircle2, Clock, Archive, Eye, Edit3, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { sopAPI } from "@/lib/api/sop";
import { usersAPI } from "@/lib/api/users";

interface SOPCategory { id: string; name: string; description?: string; }
interface SOPItem {
  id: string; category_id: string; title: string; description?: string;
  priority: "low" | "medium" | "high"; status: string;
  due_date?: string; created_at: string; updated_at: string;
}

const statusConfig: Record<string, { bg: string; icon: typeof CheckCircle2; color: string; label: string }> = {
  pending:     { bg: "bg-amber-50 text-amber-700 border border-amber-200/60",   icon: Clock,        color: "#F59E0B", label: "Pending" },
  in_progress: { bg: "bg-blue-50 text-blue-700 border border-blue-200/60",      icon: Clock,        color: "#3B82F6", label: "In Progress" },
  completed:   { bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", icon: CheckCircle2, color: "#10B981", label: "Completed" },
  archived:    { bg: "bg-slate-100 text-slate-600 border border-slate-200",     icon: Archive,      color: "#94A3B8", label: "Archived" },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  low:    { color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
  medium: { color: "#F59E0B", bg: "bg-amber-50 text-amber-700 border border-amber-200/60" },
  high:   { color: "#EF4444", bg: "bg-red-50 text-red-700 border border-red-200/60" },
};

function CategoryModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, desc: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), desc.trim());
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-black/10 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <h2 className="text-black font-bold">New Category</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Front Desk Procedures"
              className="w-full bg-slate-50 border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
          </div>
          <div>
            <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description..." rows={2}
              className="w-full bg-slate-50 border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-black/10 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm font-semibold hover:bg-black/[0.04] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SOPModal({
  sop, categories, onClose, onSave,
}: {
  sop: SOPItem | null; categories: SOPCategory[];
  onClose: () => void; onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: sop?.title ?? "",
    description: sop?.description ?? "",
    category_id: sop?.category_id ?? (categories[0]?.id ?? ""),
    priority: (sop?.priority ?? "medium") as "low" | "medium" | "high",
    status: sop?.status ?? "pending",
    due_date: sop?.due_date ? sop.due_date.split("T")[0] : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.category_id) { setError("Please select a category"); return; }
    setSaving(true);
    await onSave({ ...form, due_date: form.due_date || undefined });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-black/10 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <h2 className="text-black font-bold">{sop ? "Edit SOP" : "Create SOP"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError(""); }}
              placeholder="SOP title..."
              className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${error && !form.title ? "border-red-300" : "border-black/10 focus:border-black/20"}`} />
            {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
          </div>
          <div>
            <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Category <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="w-full appearance-none bg-slate-50 border border-black/10 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 transition-all">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Priority</label>
              <div className="relative">
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
                  className="w-full appearance-none bg-slate-50 border border-black/10 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 transition-all capitalize">
                  {["low", "medium", "high"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full appearance-none bg-slate-50 border border-black/10 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 transition-all">
                  {["pending", "in_progress", "completed"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              className="w-full bg-slate-50 border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
          </div>
          <div>
            <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe this SOP..." rows={3}
              className="w-full bg-slate-50 border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-black/10 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm font-semibold hover:bg-black/[0.04] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {sop ? "Save Changes" : "Create SOP"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ManagerSOPPage() {
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [categories, setCategories] = useState<SOPCategory[]>([]);
  const [sops, setSOPs] = useState<SOPItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modal, setModal] = useState<SOPItem | null | "new">(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [viewingSOP, setViewingSOP] = useState<SOPItem | null>(null);

  const load = useCallback(async (propId: string) => {
    try {
      const [catRes, sopRes] = await Promise.all([
        sopAPI.listCategories(propId),
        sopAPI.listSOPs(propId),
      ]);
      setCategories(catRes.data as SOPCategory[]);
      setSOPs(sopRes.data as SOPItem[]);
    } catch {
      toast.error("Failed to load SOPs");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await usersAPI.me();
        const propId = meRes.data.property_id;
        if (!propId) { toast.error("No property assigned to your account"); setLoading(false); return; }
        setPropertyId(propId);
        await load(propId);
      } catch {
        toast.error("Failed to load user info");
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const handleCreateCategory = async (name: string, desc: string) => {
    if (!propertyId) return;
    try {
      const res = await sopAPI.createCategory(propertyId, { name, description: desc });
      setCategories(prev => [...prev, res.data as SOPCategory]);
      toast.success("Category created");
      setShowCategoryModal(false);
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleSaveSOP = async (data: any) => {
    if (!propertyId) return;
    try {
      if (modal && modal !== "new") {
        const res = await sopAPI.updateSOP((modal as SOPItem).id, data);
        setSOPs(prev => prev.map(s => s.id === (modal as SOPItem).id ? res.data as SOPItem : s));
        toast.success("SOP updated");
      } else {
        const res = await sopAPI.createSOP(propertyId, data);
        setSOPs(prev => [res.data as SOPItem, ...prev]);
        toast.success("SOP created");
      }
      setModal(null);
    } catch {
      toast.error("Failed to save SOP");
    }
  };

  const handleDelete = async (sop: SOPItem) => {
    try {
      await sopAPI.deleteSOP(sop.id);
      setSOPs(prev => prev.filter(s => s.id !== sop.id));
      toast.success("SOP deleted");
    } catch {
      toast.error("Failed to delete SOP");
    }
  };

  const filtered = sops.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchCat = categoryFilter === "all" || s.category_id === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black font-bold" style={{ fontSize: "1.4rem" }}>SOP Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{sops.filter(s => s.status !== "archived").length} active SOPs for your property</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 bg-white border border-black/10 text-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Category
          </button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setModal("new")} disabled={categories.length === 0}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md disabled:opacity-40">
            <Plus className="w-4 h-4" /> Create SOP
          </motion.button>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-semibold text-sm">Create a category first</p>
            <p className="text-blue-700 text-sm mt-0.5">SOPs must belong to a category. Click "New Category" to get started.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total SOPs", value: sops.length, color: "#3B82F6" },
          { label: "Pending", value: sops.filter(s => s.status === "pending").length, color: "#F59E0B" },
          { label: "In Progress", value: sops.filter(s => s.status === "in_progress").length, color: "#6366F1" },
          { label: "Completed", value: sops.filter(s => s.status === "completed").length, color: "#10B981" },
        ].map((s, i) => (
          <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
            <p className="text-neutral-500 text-xs mb-1">{s.label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-black/10 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SOPs..."
            className="w-full bg-white/50 border border-black/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="appearance-none bg-white/50 border border-black/10 rounded-lg px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 transition-all">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-white/50 border border-black/10 rounded-lg px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 transition-all">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 px-6 py-3 bg-white/50 border-b border-black/10">
          {["SOP Title", "Category", "Priority", "Status", "Actions"].map(h => (
            <span key={h} className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">{h}</span>
          ))}
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.map((sop, i) => {
            const statusCfg = statusConfig[sop.status] ?? statusConfig.pending;
            const priorityCfg = priorityConfig[sop.priority] ?? priorityConfig.medium;
            const catName = categories.find(c => c.id === sop.category_id)?.name ?? "—";
            const StatusIcon = statusCfg.icon;
            return (
              <motion.div key={sop.id}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex flex-col md:grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-2 md:gap-4 items-start md:items-center px-6 py-4 hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-black text-sm font-semibold">{sop.title}</p>
                    {sop.due_date && (
                      <p className="text-neutral-400 text-xs mt-0.5">
                        Due {new Date(sop.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-neutral-600 text-xs bg-black/[0.04] px-2.5 py-1 rounded-full font-medium">{catName}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize w-fit ${priorityCfg.bg}`}>{sop.priority}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 w-fit ${statusCfg.bg}`}>
                  <StatusIcon className="w-3 h-3" />{statusCfg.label}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setViewingSOP(sop)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => setModal(sop)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(sop)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-14 text-neutral-400">
              <FileText className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No SOPs match your filters</p>
            </div>
          )}
        </div>
      </div>

      {viewingSOP && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingSOP(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-black/10 overflow-hidden max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
              <h2 className="font-bold text-black">{viewingSOP.title}</h2>
              <div className="flex gap-2">
                <button onClick={() => { setModal(viewingSOP); setViewingSOP(null); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => setViewingSOP(null)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${priorityConfig[viewingSOP.priority]?.bg ?? ""}`}>{viewingSOP.priority} priority</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusConfig[viewingSOP.status]?.bg ?? ""}`}>{statusConfig[viewingSOP.status]?.label ?? viewingSOP.status}</span>
              </div>
              <p className="text-neutral-600 text-sm">{categories.find(c => c.id === viewingSOP.category_id)?.name}</p>
              {viewingSOP.due_date && (
                <p className="text-neutral-500 text-sm">Due: {new Date(viewingSOP.due_date).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
              )}
              {viewingSOP.description && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-neutral-700 text-sm leading-relaxed">{viewingSOP.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showCategoryModal && (
          <CategoryModal onClose={() => setShowCategoryModal(false)} onSave={handleCreateCategory} />
        )}
        {modal !== null && (
          <SOPModal sop={modal === "new" ? null : modal as SOPItem} categories={categories}
            onClose={() => setModal(null)} onSave={handleSaveSOP} />
        )}
      </AnimatePresence>
    </div>
  );
}
