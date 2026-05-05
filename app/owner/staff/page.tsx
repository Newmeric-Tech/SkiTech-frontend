"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, X, Users, CheckCircle2, Loader2,
  Building2, AlertCircle, Trash2, MoreHorizontal, User,
} from "lucide-react";
import { toast } from "sonner";
import { workforceAPI } from "@/lib/api/workforce";
import { propertiesAPI, Property } from "@/lib/api/properties";

interface Employee {
  id: string;
  property_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  employee_code: string | null;
  position: string | null;
  is_active: boolean;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  is_active: boolean;
}

const AVATAR_COLORS = ["#3B82F6", "#10B981", "#6366F1", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9", "#14B8A6"];

function avatarColor(id: string): string {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function AddStaffPanel({ departments, onClose, onAdd }: {
  departments: Department[];
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onAdd({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        position: position.trim() || undefined,
        department_id: departmentId || undefined,
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
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-slate-950 font-bold text-lg">Add Staff Member</h2>
              <p className="text-slate-500 text-sm mt-0.5">Register a new team member</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ahmed"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${errors.firstName ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-slate-400"}`} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Khalid"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${errors.lastName ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-slate-400"}`} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="staff@property.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 000 0000"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Position / Job Role</label>
            <input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Front Desk Agent"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors" />
          </div>
          {departments.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
              <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white">
                <option value="">— None —</option>
                {departments.filter(d => d.is_active).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors font-semibold">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-slate-950 text-white text-sm shadow-md flex items-center justify-center gap-2 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Staff Member
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

export default function StaffPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [staff, setStaff] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
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
      const [empRes, deptRes] = await Promise.all([
        workforceAPI.listEmployees(selectedPropertyId),
        workforceAPI.listDepartments(selectedPropertyId),
      ]);
      setStaff(empRes.data);
      setDepartments(deptRes.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = staff.filter(s => {
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || (s.position ?? "").toLowerCase().includes(q) || (s.email ?? "").toLowerCase().includes(q);
  });

  const handleAdd = async (data: any) => {
    try {
      const res = await workforceAPI.createEmployee(selectedPropertyId, data);
      setStaff(prev => [res.data, ...prev]);
      toast.success("Staff member added");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add staff member");
      throw err;
    }
  };

  const handleDelete = async (empId: string) => {
    try {
      await workforceAPI.deleteEmployee(empId);
      setStaff(prev => prev.filter(s => s.id !== empId));
      setMenuOpen(null);
      toast.success("Staff member removed");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to remove staff member");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">{staff.length} staff members</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdd(true)} disabled={!selectedPropertyId}
          className="flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add Staff
        </motion.button>
      </div>

      {/* Property selector */}
      {propsLoading ? (
        <div className="flex items-center gap-2 text-neutral-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading properties…</div>
      ) : properties.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4" /> No properties found.
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-neutral-400" />
          <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}
            className="bg-white border border-black/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black/20">
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { label: "Total Staff", value: staff.length, icon: Users, color: "#3B82F6", bg: "bg-blue-50 border-blue-100" },
          { label: "Active", value: staff.filter(s => s.is_active).length, icon: CheckCircle2, color: "#10B981", bg: "bg-emerald-50 border-emerald-100" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`rounded-2xl p-5 border text-center ${s.bg}`}>
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3">
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-slate-600 text-sm mt-1 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, role, or email..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {["Staff Member", "Position", "Email", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s, i) => {
                const color = avatarColor(s.id);
                const initials = `${s.first_name[0]}${s.last_name[0]}`.toUpperCase();
                return (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)`, fontWeight: 700 }}>
                          {initials}
                        </div>
                        <span className="text-slate-950 text-sm font-semibold">{s.first_name} {s.last_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{s.position || "—"}</td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{s.email || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                        s.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {menuOpen === s.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-8 bg-white border border-black/10 rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden">
                              <button onClick={() => handleDelete(s.id)}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-semibold">
                {search ? "No staff match your search." : "No staff yet. Add a team member to get started."}
              </p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddStaffPanel departments={departments} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        )}
      </AnimatePresence>
    </div>
  );
}
