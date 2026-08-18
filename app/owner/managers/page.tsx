
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Mail, Phone, Building2, CheckCircle2,
  Loader2, X, MoreHorizontal, UserX, UserCheck, AlertCircle, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { usersAPI, User, UserInvite } from "@/lib/api/users";
import { propertiesAPI, Property } from "@/lib/api/properties";

const AVATAR_COLORS = ["#3B82F6", "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function avatarColor(id: string): string {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(first?: string | null, last?: string | null): string {
  return [(first?.[0] ?? ""), (last?.[0] ?? "")].join("").toUpperCase() || "?";
}

const EMPTY_INVITE: UserInvite = { email: "", first_name: "", last_name: "", role: "Manager", property_id: undefined };

export default function ManagersPage() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState<UserInvite>(EMPTY_INVITE);
  const [assignTarget, setAssignTarget] = useState<User | null>(null);
  const [assignPropertyId, setAssignPropertyId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, propsRes] = await Promise.all([
        usersAPI.list(undefined, "Manager"),
        propertiesAPI.list(),
      ]);
      setManagers(usersRes.data);
      setProperties(propsRes.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load managers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const propertyMap = Object.fromEntries(properties.map(p => [p.id, p.name]));

  const filtered = managers.filter(m => {
    const name = `${m.first_name ?? ""} ${m.last_name ?? ""}`.toLowerCase();
    const prop = m.property_id ? (propertyMap[m.property_id] ?? "") : "";
    const q = search.toLowerCase();
    return name.includes(q) || m.email.toLowerCase().includes(q) || prop.toLowerCase().includes(q);
  });

  const handleInvite = async () => {
    if (!inviteForm.email.trim()) return;
    try {
      setSubmitting(true);
      const res = await usersAPI.invite(inviteForm);
      setManagers(prev => [res.data, ...prev]);
      setShowInvite(false);
      setInviteForm(EMPTY_INVITE);
      toast.success("Manager invited — a temporary password was sent to their email.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to invite manager");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      const res = await usersAPI.deactivate(userId);
      setManagers(prev => prev.map(m => m.id === userId ? res.data : m));
      toast.success("Manager deactivated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to deactivate");
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      const res = await usersAPI.activate(userId);
      setManagers(prev => prev.map(m => m.id === userId ? res.data : m));
      toast.success("Manager activated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to activate");
    }
  };

  const openAssign = (manager: User) => {
    setAssignTarget(manager);
    setAssignPropertyId(manager.property_id ?? "");
    setMenuOpen(null);
  };

  const handleAssignProperty = async () => {
    if (!assignTarget || !assignPropertyId) return;
    try {
      setAssigning(true);
      const res = await usersAPI.assignProperty(assignTarget.id, assignPropertyId);
      setManagers(prev => prev.map(m => m.id === assignTarget.id ? res.data : m));
      setAssignTarget(null);
      toast.success("Property assigned successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to assign property");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black text-2xl font-bold tracking-tight">Managers</h1>
          <p className="text-neutral-500 text-xs mt-1">
            {loading
              ? "Loading…"
              : `${managers.length} manager${managers.length === 1 ? "" : "s"} across all properties`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Add Manager
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search managers…"
          className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-colors"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-sm">{search ? "No managers match your search." : "No managers yet. Invite one to get started."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filtered.map((m, i) => {
            const color = avatarColor(m.id);
            const initials = getInitials(m.first_name, m.last_name);
            const fullName = [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;
            const propertyName = m.property_id ? (propertyMap[m.property_id] ?? "—") : "—";

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-black/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold border"
                    style={{ background: `${color}1A`, borderColor: `${color}33`, color }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-black font-bold truncate">{fullName}</h3>
                        <p className="text-neutral-400 text-[10px] uppercase font-semibold mt-0.5 tracking-wider">Manager</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          m.is_active
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                            : "text-red-700 bg-red-50 border-red-200/60"
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${m.is_active ? "bg-emerald-500 animate-ping" : "bg-red-500"}`}></span>
                          <span>{m.is_active ? "Active" : "Inactive"}</span>
                        </span>
                        <div className="relative" ref={menuOpen === m.id ? menuRef : null}>
                          <button
                            onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)}
                            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-black/[0.04]"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {menuOpen === m.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 top-8 bg-white border border-black/10 rounded-xl shadow-lg z-10 w-48 overflow-hidden"
                              >
                                <button
                                  onClick={() => openAssign(m)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 text-left"
                                >
                                  <MapPin className="w-3.5 h-3.5" /> Assign Property
                                </button>
                                {m.is_active ? (
                                  <button
                                    onClick={() => { setMenuOpen(null); handleDeactivate(m.id); }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
                                  >
                                    <UserX className="w-3.5 h-3.5" /> Deactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { setMenuOpen(null); handleActivate(m.id); }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 text-left"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" /> Activate
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2.5 text-neutral-600 text-xs">
                    <Building2 className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{propertyName}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-neutral-600 text-xs">
                    <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{m.email}</span>
                  </div>
                  {m.phone_number && (
                    <div className="flex items-center gap-2.5 text-neutral-600 text-xs">
                      <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      <span>{m.phone_number}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-black/10">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500">
                    {m.is_verified ? (
                      <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Email verified</>
                    ) : (
                      <><AlertCircle className="w-4 h-4 text-amber-500" /> Pending verification</>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowInvite(false); setInviteForm(EMPTY_INVITE); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-black/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-black font-extrabold text-xl">Invite Manager</h2>
                <button
                  onClick={() => { setShowInvite(false); setInviteForm(EMPTY_INVITE); }}
                  className="text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-neutral-500 text-sm mb-6">
                A temporary password will be emailed to the manager to complete setup.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">First Name</label>
                    <input
                      value={inviteForm.first_name ?? ""}
                      onChange={e => setInviteForm(f => ({ ...f, first_name: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                      placeholder="Sarah"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Last Name</label>
                    <input
                      value={inviteForm.last_name ?? ""}
                      onChange={e => setInviteForm(f => ({ ...f, last_name: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                      placeholder="Mitchell"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Email Address *</label>
                  <input
                    value={inviteForm.email}
                    onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                    type="email"
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    placeholder="manager@yourproperty.com"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">
                    Assign to Property *
                  </label>
                  {properties.length === 0 ? (
                    <p className="text-amber-600 text-xs mt-1">No properties found. Create a property first.</p>
                  ) : (
                    <select
                      value={inviteForm.property_id ?? ""}
                      onChange={e => setInviteForm(f => ({ ...f, property_id: e.target.value || undefined }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    >
                      <option value="">— Select a property —</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowInvite(false); setInviteForm(EMPTY_INVITE); }}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.03] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={submitting || !inviteForm.email.trim() || !inviteForm.property_id}
                  className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Invite
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Property Modal */}
      <AnimatePresence>
        {assignTarget && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setAssignTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-black/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-black font-extrabold text-xl">Assign Property</h2>
                <button onClick={() => setAssignTarget(null)} className="text-neutral-400 hover:text-neutral-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-neutral-500 text-sm mb-6">
                Assign <span className="font-semibold text-black">{[assignTarget.first_name, assignTarget.last_name].filter(Boolean).join(" ") || assignTarget.email}</span> to a property.
              </p>

              <div>
                <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Property *</label>
                <select
                  value={assignPropertyId}
                  onChange={e => setAssignPropertyId(e.target.value)}
                  className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                >
                  <option value="">— Select a property —</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setAssignTarget(null)}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.03] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignProperty}
                  disabled={assigning || !assignPropertyId}
                  className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign Property
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
