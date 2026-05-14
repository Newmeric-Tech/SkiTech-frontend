"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, FileText, Eye, Edit3, CheckCircle2,
  X, ChevronRight, Trash2, AlertCircle, Loader2, Building2, Tag,
} from "lucide-react";
import { toast } from "sonner";
import { sopAPI } from "@/lib/api/sop";
import { propertiesAPI, Property } from "@/lib/api/properties";

interface SOPCategory {
  id: string;
  name: string;
  description: string | null;
}

interface SOP {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const priorityColors: Record<string, string> = {
  low: "#10B981", medium: "#F59E0B", high: "#EF4444",
};
const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200/60",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200/60",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
};
const statusLabel: Record<string, string> = {
  pending: "Pending", in_progress: "In Progress", completed: "Completed",
};

function CategoryModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, desc: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try { await onSave(name.trim(), desc.trim()); onClose(); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-black/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <h2 className="text-black font-bold">Add Category</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Category Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Front Desk Procedures"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
          </div>
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 resize-none transition-all" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-black/10 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04]">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim() || submitting}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md disabled:opacity-40 flex items-center justify-center gap-2 font-semibold">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Create Category
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SOPFormPanel({ initial, categories, onClose, onSave }: {
  initial: SOP | null;
  categories: SOPCategory[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? (categories[0]?.id ?? ""));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState(initial?.priority ?? "medium");
  const [status, setStatus] = useState(initial?.status ?? "pending");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!categoryId) e.category = "Select a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSave({ title: title.trim(), description: description.trim() || undefined, category_id: categoryId, priority, status });
      onClose();
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <div>
            <h2 className="text-black font-bold text-lg">{initial ? "Edit SOP" : "Create New SOP"}</h2>
            <p className="text-neutral-400 text-xs mt-0.5">{initial ? "Update procedure details" : "Define a new standard operating procedure"}</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs text-neutral-600 mb-1.5 font-semibold">SOP Title <span className="text-red-400">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Front Desk Check-In Procedure"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${errors.title ? "border-red-300" : "border-black/10 focus:border-black/20"}`} />
            {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs text-neutral-600 mb-1.5 font-semibold">Category <span className="text-red-400">*</span></label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 bg-white ${errors.category ? "border-red-300" : "border-black/10"}`}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5 font-semibold">Priority</label>
              <div className="flex flex-col gap-1.5">
                {["low", "medium", "high"].map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`py-2 rounded-xl text-xs capitalize border transition-all ${priority === p ? "bg-black text-white border-transparent" : "border-black/10 text-neutral-600"}`}
                    style={{ fontWeight: 600 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5 font-semibold">Status</label>
              <div className="flex flex-col gap-1.5">
                {["pending", "in_progress", "completed"].map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`py-2 rounded-xl text-xs border transition-all ${status === s ? "bg-black text-white border-transparent" : "border-black/10 text-neutral-600"}`}
                    style={{ fontWeight: 600 }}>
                    {statusLabel[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-600 mb-1.5 font-semibold">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this SOP's purpose..." rows={4}
              className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 resize-none transition-colors" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-black/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors font-semibold">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md flex items-center justify-center gap-2 font-semibold disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {initial ? "Save Changes" : "Create SOP"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

export default function SOPPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [categories, setCategories] = useState<SOPCategory[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);
  const [loading, setLoading] = useState(false);
  const [propsLoading, setPropsLoading] = useState(true);

  useEffect(() => {
    propertiesAPI.list().then(res => {
      setProperties(res.data);
      if (res.data.length > 0) setSelectedPropertyId(res.data[0].id);
    }).catch(() => toast.error("Failed to load properties")).finally(() => setPropsLoading(false));
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedPropertyId) return;
    setLoading(true);
    try {
      const [catsRes, sopsRes] = await Promise.all([
        sopAPI.listCategories(selectedPropertyId),
        sopAPI.listSOPs(selectedPropertyId),
      ]);
      setCategories(catsRes.data);
      setSops(sopsRes.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load SOPs");
    } finally {
      setLoading(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = sops.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateCategory = async (name: string, desc: string) => {
    try {
      const res = await sopAPI.createCategory(selectedPropertyId, { name, description: desc || undefined });
      setCategories(prev => [...prev, res.data]);
      toast.success("Category created");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create category");
      throw err;
    }
  };

  const handleCreateSOP = async (data: any) => {
    try {
      const res = await sopAPI.createSOP(selectedPropertyId, data);
      setSops(prev => [res.data, ...prev]);
      toast.success("SOP created");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create SOP");
      throw err;
    }
  };

  const handleUpdateSOP = async (sopId: string, data: any) => {
    try {
      const res = await sopAPI.updateSOP(sopId, data);
      setSops(prev => prev.map(s => s.id === sopId ? res.data : s));
      toast.success("SOP updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update SOP");
      throw err;
    }
  };

  const handleDeleteSOP = async (sopId: string) => {
    try {
      await sopAPI.deleteSOP(sopId);
      setSops(prev => prev.filter(s => s.id !== sopId));
      toast.success("SOP deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete SOP");
    }
  };

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>SOP Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{sops.length} SOPs</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCategory(true)} disabled={!selectedPropertyId}
            className="flex items-center gap-2 bg-white border border-black/10 text-neutral-700 px-4 py-2.5 rounded-xl text-sm hover:border-black/20 transition-colors disabled:opacity-50"
            style={{ fontWeight: 600 }}>
            <Tag className="w-4 h-4" /> Category
          </button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)} disabled={!selectedPropertyId || categories.length === 0}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md disabled:opacity-50"
            style={{ fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Create SOP
          </motion.button>
        </div>
      </div>

      {/* Property selector */}
      {propsLoading ? (
        <div className="flex items-center gap-2 text-neutral-400 text-sm mb-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading properties…</div>
      ) : properties.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm flex items-center gap-2 mb-6">
          <Building2 className="w-4 h-4" /> No properties found.
        </div>
      ) : (
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-4 h-4 text-neutral-400" />
          <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}
            className="bg-white border border-black/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black/20">
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* No categories prompt */}
      {!loading && selectedPropertyId && categories.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-blue-800 text-sm font-semibold">No categories yet</p>
              <p className="text-blue-600 text-xs">Create a category first before adding SOPs</p>
            </div>
          </div>
          <button onClick={() => setShowCategory(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            Add Category
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SOPs..."
            className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-colors" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "in_progress", "completed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs transition-all border ${statusFilter === s ? "bg-black text-white border-transparent shadow-sm" : "border-black/10 text-neutral-500 hover:border-black/20 bg-white"}`}
              style={{ fontWeight: 600 }}>
              {s === "all" ? "All" : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Categories quick view */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map(c => (
            <span key={c.id} className="text-xs px-3 py-1.5 rounded-full bg-black/[0.04] text-neutral-600 border border-black/10" style={{ fontWeight: 500 }}>
              {c.name}
            </span>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">{search ? "No SOPs match your search." : "No SOPs yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((sop, i) => (
            <motion.div key={sop.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-black/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="text-black text-sm font-bold leading-snug">{sop.title}</h3>
                    <p className="text-neutral-400 text-xs mt-0.5">{categoryMap[sop.category_id] ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditingSOP(sop)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteSOP(sop.id)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {sop.description && (
                <p className="text-neutral-500 text-xs leading-relaxed mb-3">{sop.description}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusStyles[sop.status] ?? "bg-black/[0.04] text-black"}`}>
                  {statusLabel[sop.status] ?? sop.status}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: (priorityColors[sop.priority] ?? "#94A3B8") + "15", color: priorityColors[sop.priority] ?? "#94A3B8" }}>
                  {sop.priority.charAt(0).toUpperCase() + sop.priority.slice(1)} Priority
                </span>
                <span className="text-xs text-neutral-400 ml-auto">
                  {new Date(sop.updated_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCategory && (
          <CategoryModal onClose={() => setShowCategory(false)} onSave={handleCreateCategory} />
        )}
        {(showCreate || editingSOP) && (
          <SOPFormPanel
            initial={editingSOP}
            categories={categories}
            onClose={() => { setShowCreate(false); setEditingSOP(null); }}
            onSave={editingSOP
              ? (data) => handleUpdateSOP(editingSOP.id, data)
              : handleCreateSOP
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
