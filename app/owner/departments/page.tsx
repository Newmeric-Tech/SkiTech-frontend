"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2, X, Layers, Users,
  Briefcase, Utensils, Shield, Wrench, Waves, Truck,
  MoreHorizontal, Loader2, Building2,
} from "lucide-react";
import { toast } from "sonner";
import { workforceAPI } from "@/lib/api/workforce";
import { propertiesAPI, Property } from "@/lib/api/properties";

interface Department {
  id: string;
  property_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

const deptIcons: Record<string, React.ElementType> = {
  "Front Office": Briefcase, "Housekeeping": Layers, "Food & Beverage": Utensils,
  "Security": Shield, "Maintenance": Wrench, "Wellness": Waves,
  "Finance": Truck, "Management": Users,
};
const deptColors: Record<string, string> = {
  "Front Office": "#3B82F6", "Housekeeping": "#6366F1", "Food & Beverage": "#10B981",
  "Security": "#EF4444", "Maintenance": "#F59E0B", "Wellness": "#14B8A6",
  "Finance": "#8B5CF6", "Management": "#0EA5E9",
};

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`rounded-full relative flex-shrink-0 ${value ? "bg-[#3B82F6]" : "bg-black/[0.06]"}`}
      style={{ height: "22px", width: "40px" }}>
      <span className="absolute top-[2px] w-[18px] h-[18px] bg-white/70 backdrop-blur rounded-full shadow-sm transition-all"
        style={{ left: value ? "calc(100% - 20px)" : "2px" }} />
    </button>
  );
}

function DeptFormModal({ dept, onClose, onSave }: {
  dept: Department | null;
  onClose: () => void;
  onSave: (name: string, description: string, isActive: boolean) => Promise<void>;
}) {
  const [name, setName] = useState(dept?.name ?? "");
  const [description, setDescription] = useState(dept?.description ?? "");
  const [isActive, setIsActive] = useState(dept?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSave(name.trim(), description.trim(), isActive);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-black/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <h2 className="text-black" style={{ fontWeight: 700 }}>{dept ? "Edit Department" : "Add Department"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Department Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Front Office"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
          </div>
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of department responsibilities..."
              rows={3}
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all resize-none" />
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-black/10 rounded-xl">
            <div>
              <p className="text-black text-sm" style={{ fontWeight: 500 }}>Department Status</p>
              <p className="text-neutral-400 text-xs">Active departments are visible to staff</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isActive ? "text-black" : "text-neutral-400"}`} style={{ fontWeight: 500 }}>
                {isActive ? "Active" : "Inactive"}
              </span>
              <Toggle value={isActive} onChange={() => setIsActive(v => !v)} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-black/10 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim() || submitting}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md disabled:opacity-40 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {dept ? "Save Changes" : "Add Department"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [depts, setDepts] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [formDept, setFormDept] = useState<Department | null | "new">(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [propsLoading, setPropsLoading] = useState(true);

  useEffect(() => {
    propertiesAPI.list().then(res => {
      setProperties(res.data);
      if (res.data.length > 0) setSelectedPropertyId(res.data[0].id);
    }).catch(() => toast.error("Failed to load properties")).finally(() => setPropsLoading(false));
  }, []);

  const fetchDepts = useCallback(async () => {
    if (!selectedPropertyId) return;
    setLoading(true);
    try {
      const res = await workforceAPI.listDepartments(selectedPropertyId);
      setDepts(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);

  const filtered = depts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (name: string, description: string, isActive: boolean) => {
    try {
      const res = await workforceAPI.createDepartment(selectedPropertyId, { name, description });
      setDepts(prev => [res.data, ...prev]);
      toast.success("Department created");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create department");
      throw err;
    }
  };

  const handleUpdate = async (dept: Department, name: string, description: string, isActive: boolean) => {
    try {
      const res = await workforceAPI.updateDepartment(dept.id, { name, description, is_active: isActive });
      setDepts(prev => prev.map(d => d.id === dept.id ? res.data : d));
      toast.success("Department updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update department");
      throw err;
    }
  };

  const handleDelete = async (deptId: string) => {
    try {
      await workforceAPI.deleteDepartment(deptId);
      setDepts(prev => prev.filter(d => d.id !== deptId));
      setMenuOpen(null);
      toast.success("Department deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete department");
    }
  };

  const handleToggleStatus = async (dept: Department) => {
    try {
      const res = await workforceAPI.updateDepartment(dept.id, { is_active: !dept.is_active });
      setDepts(prev => prev.map(d => d.id === dept.id ? res.data : d));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update status");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Department Configuration</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{depts.filter(d => d.is_active).length} active departments</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setFormDept("new")} disabled={!selectedPropertyId}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md disabled:opacity-50" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Add Department
        </motion.button>
      </div>

      {/* Property selector */}
      {propsLoading ? (
        <div className="flex items-center gap-2 text-neutral-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading properties…</div>
      ) : properties.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4" /> No properties found. Create a property first.
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-neutral-400" />
          <select
            value={selectedPropertyId}
            onChange={e => setSelectedPropertyId(e.target.value)}
            className="bg-white border border-black/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black/20"
          >
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Departments", value: depts.length, color: "#3B82F6" },
          { label: "Active", value: depts.filter(d => d.is_active).length, color: "#10B981" },
          { label: "Inactive", value: depts.filter(d => !d.is_active).length, color: "#94A3B8" },
        ].map((s, i) => (
          <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
            <p className="text-neutral-500 text-xs mb-1">{s.label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..."
          className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr,3fr,auto,auto] gap-4 px-6 py-3 bg-white/50 border-b border-black/10">
            {["Department Name", "Description", "Status", "Actions"].map(h => (
              <span key={h} className="text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{search ? "No departments match your search." : "No departments yet. Add one to get started."}</p>
              </div>
            ) : filtered.map((d, i) => {
              const Icon = deptIcons[d.name] ?? Layers;
              const color = deptColors[d.name] ?? "#3B82F6";
              return (
                <motion.div key={d.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex flex-col md:grid md:grid-cols-[2fr,3fr,auto,auto] gap-2 md:gap-4 items-start md:items-center px-6 py-4 hover:bg-white/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "15" }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <span className="text-black text-sm" style={{ fontWeight: 600 }}>{d.name}</span>
                  </div>
                  <p className="text-neutral-500 text-xs leading-relaxed hidden md:block">{d.description || "—"}</p>
                  <div className="flex items-center gap-2">
                    <Toggle value={d.is_active} onChange={() => handleToggleStatus(d)} />
                    <span className={`text-xs ${d.is_active ? "text-black" : "text-neutral-400"}`} style={{ fontWeight: 500 }}>
                      {d.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 relative">
                    <button onClick={() => setFormDept(d)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === d.id ? null : d.id)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {menuOpen === d.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 bg-white border border-black/10 rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden">
                            <button onClick={() => handleDelete(d.id)}
                              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {formDept && (
          <DeptFormModal
            dept={formDept === "new" ? null : formDept}
            onClose={() => setFormDept(null)}
            onSave={formDept === "new"
              ? handleCreate
              : (name, description, isActive) => handleUpdate(formDept as Department, name, description, isActive)
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
