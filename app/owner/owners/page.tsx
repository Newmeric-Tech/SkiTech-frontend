"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Building2, Mail, Phone, MapPin, Eye,
  Edit2, X, Loader2, ChevronDown, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { propertiesAPI, OwnerDetails, OwnerDetailsCreate, OwnerDetailsUpdate, Property } from "@/lib/api/properties";
import { coAdminAPI } from "@/lib/api/co-admin";
import { useAuthStore } from "@/store/authStore";

const AVATAR_COLORS = ["#3B82F6", "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function avatarColor(id: string): string {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "OW";
}

const OWNERSHIP_TYPES = ["sole", "partnership", "company", "trust", "other"];

type OwnerWithProperty = OwnerDetails & { propertyName: string };

// ─── Owner Profile Modal ──────────────────────────────────────────────────────
function OwnerProfileModal({ owner, onClose }: { owner: OwnerWithProperty; onClose: () => void }) {
  const color = avatarColor(owner.id);
  const initials = getInitials(owner.owner_name);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-black/10"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur">
          <h2 className="text-black" style={{ fontWeight: 700 }}>Owner Profile</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, fontWeight: 800 }}>
              {initials}
            </div>
            <div className="flex-1">
              <h3 className="text-black" style={{ fontWeight: 800, fontSize: "1.1rem" }}>{owner.owner_name}</h3>
              {owner.ownership_type && (
                <span className="inline-block mt-1 bg-black/[0.04] text-black text-xs px-2.5 py-1 rounded-full capitalize" style={{ fontWeight: 600 }}>
                  {owner.ownership_type}
                </span>
              )}
              <div className="mt-3 space-y-2">
                {owner.email && (
                  <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    {owner.email}
                  </div>
                )}
                {owner.phone && (
                  <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    {owner.phone}
                  </div>
                )}
                {owner.address && (
                  <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    {owner.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-black/[0.03] rounded-xl p-4">
            <p className="text-neutral-500 text-xs mb-1">Associated Property</p>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-neutral-500" />
              <span className="text-black text-sm" style={{ fontWeight: 600 }}>{owner.propertyName}</span>
            </div>
          </div>

          <p className="text-neutral-400 text-xs">
            Added {new Date(owner.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </div>

        <div className="px-6 py-4 border-t border-black/10 bg-white/50">
          <button onClick={onClose} className="w-full px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────
function OwnerFormModal({ owner, properties, onClose, onSaved }: {
  owner: OwnerWithProperty | null;
  properties: Property[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    owner_name: owner?.owner_name ?? "",
    email: owner?.email ?? "",
    phone: owner?.phone ?? "",
    address: owner?.address ?? "",
    ownership_type: owner?.ownership_type ?? "",
    property_id: owner?.property_id ?? (properties[0]?.id ?? ""),
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!form.owner_name.trim() || !form.property_id) return;
    try {
      setSubmitting(true);
      if (owner) {
        const update: OwnerDetailsUpdate = {
          owner_name: form.owner_name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
          ownership_type: form.ownership_type || undefined,
        };
        await propertiesAPI.updateOwner(owner.property_id, owner.id, update);
        toast.success("Owner updated");
      } else {
        const create: OwnerDetailsCreate = {
          owner_name: form.owner_name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
          ownership_type: form.ownership_type || undefined,
        };
        await propertiesAPI.createOwner(form.property_id, create);
        toast.success("Owner added");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save owner");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-black/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur">
          <h2 className="text-black" style={{ fontWeight: 700 }}>{owner ? "Edit Owner" : "Add New Owner"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Full Name *</label>
            <input value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))}
              placeholder="e.g. Shradhdha Maliya"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
          </div>
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Email Address</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              type="email" placeholder="owner@email.com"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
          </div>
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Phone Number</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
          </div>
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Address</label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Street, City, State, Country"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
          </div>
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Ownership Type</label>
            <div className="relative">
              <select value={form.ownership_type} onChange={e => setForm(f => ({ ...f, ownership_type: e.target.value }))}
                className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 appearance-none transition-all">
                <option value="">Select type…</option>
                {OWNERSHIP_TYPES.map(t => (
                  <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          {!owner && (
            <div>
              <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Property *</label>
              <div className="relative">
                <select value={form.property_id} onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))}
                  className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 appearance-none transition-all">
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-black/10 bg-white/50 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={submitting || !form.owner_name.trim() || !form.property_id}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}>
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {owner ? "Save Changes" : "Add Owner"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OwnersPage() {
  const { user } = useAuthStore();
  const [owners, setOwners] = useState<OwnerWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileOwner, setProfileOwner] = useState<OwnerWithProperty | null>(null);
  const [formOwner, setFormOwner] = useState<OwnerWithProperty | null | "new">(null);
  const [grantAccessOwner, setGrantAccessOwner] = useState<OwnerWithProperty | null>(null);
  const [grantingAccess, setGrantingAccess] = useState(false);

  const handleGrantAccess = async () => {
    if (!grantAccessOwner) return;
    if (!grantAccessOwner.email) {
      toast.error("This owner has no email address. Please add one before granting access.");
      return;
    }
    try {
      setGrantingAccess(true);
      await coAdminAPI.submitRequest({
        proposed_email: grantAccessOwner.email,
        proposed_name: grantAccessOwner.owner_name,
        property_id: grantAccessOwner.property_id,
      });
      toast.success(`Co-admin access request sent for ${grantAccessOwner.owner_name}. Awaiting superadmin approval.`);
      setGrantAccessOwner(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to submit request");
    } finally {
      setGrantingAccess(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const propsRes = await propertiesAPI.list();
      const propList = propsRes.data;
      setProperties(propList);

      const ownerResults = await Promise.all(
        propList.map(p =>
          propertiesAPI.getOwner(p.id)
            .then(res => res.data.map(o => ({ ...o, propertyName: p.name })))
            .catch(() => [] as OwnerWithProperty[])
        )
      );
      setOwners(ownerResults.flat());
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load owners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = owners.filter(o =>
    o.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    (o.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    o.propertyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Owner Details</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {loading ? "Loading…" : `${owners.length} property owner${owners.length === 1 ? "" : "s"} in your portfolio`}
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setFormOwner("new")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Add Owner
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Owners", value: owners.length, color: "#3B82F6" },
          { label: "Total Properties", value: properties.length, color: "#6366F1" },
          { label: "Partnership Owners", value: owners.filter(o => o.ownership_type === "partnership").length, color: "#10B981" },
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search owners…"
          className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
      </div>

      {/* Owner Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-sm">{search ? "No owners match your search." : "No owners yet. Add one to get started."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((o, i) => {
            const color = avatarColor(o.id);
            const initials = getInitials(o.owner_name);
            return (
              <motion.div key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3 }}
                className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-6 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, fontWeight: 800 }}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-black text-sm truncate" style={{ fontWeight: 700 }}>{o.owner_name}</h3>
                      {o.ownership_type && (
                        <span className="bg-black/[0.04] text-black text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 capitalize" style={{ fontWeight: 600 }}>
                          {o.ownership_type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <p className="text-neutral-400 text-xs truncate">{o.propertyName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {o.email && (
                    <div className="flex items-center gap-2 text-neutral-600 text-sm">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate text-xs">{o.email}</span>
                    </div>
                  )}
                  {o.phone && (
                    <div className="flex items-center gap-2 text-neutral-600 text-sm">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="text-xs">{o.phone}</span>
                    </div>
                  )}
                  {o.address && (
                    <div className="flex items-center gap-2 text-neutral-600 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="text-xs truncate">{o.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-black/10 flex items-center gap-2">
                  <button onClick={() => setProfileOwner(o)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-black/10 text-neutral-600 text-xs hover:bg-white/50 transition-colors" style={{ fontWeight: 500 }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => setFormOwner(o)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-black/[0.04] text-black text-xs hover:bg-[#DBEAFE] transition-colors" style={{ fontWeight: 500 }}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  {o.ownership_type === "partnership" && user?.role === "Tenant Admin" && (
                    <button onClick={() => setGrantAccessOwner(o)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs hover:bg-purple-100 transition-colors border border-purple-200" style={{ fontWeight: 500 }}>
                      <ShieldCheck className="w-3.5 h-3.5" /> Grant Access
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {profileOwner && <OwnerProfileModal owner={profileOwner} onClose={() => setProfileOwner(null)} />}
        {formOwner && (
          <OwnerFormModal
            owner={formOwner === "new" ? null : formOwner}
            properties={properties}
            onClose={() => setFormOwner(null)}
            onSaved={() => { setFormOwner(null); fetchData(); }}
          />
        )}
        {grantAccessOwner && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-black/10">
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-black text-base" style={{ fontWeight: 700 }}>Grant System Access</h2>
                </div>
                <button onClick={() => setGrantAccessOwner(null)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-neutral-600 text-sm">
                  You are requesting Co-Admin access for <span className="font-semibold text-black">{grantAccessOwner.owner_name}</span> on property <span className="font-semibold text-black">{grantAccessOwner.propertyName}</span>.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800 space-y-1">
                  <p><span className="font-semibold">Email:</span> {grantAccessOwner.email || <span className="text-red-500 italic">No email on file — please add one first</span>}</p>
                  <p className="text-xs text-purple-600 mt-2">A superadmin will review and approve this request. Once approved, an invite will be sent to their email.</p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-black/10 flex gap-3">
                <button onClick={() => setGrantAccessOwner(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors" style={{ fontWeight: 500 }}>
                  Cancel
                </button>
                <button onClick={handleGrantAccess} disabled={grantingAccess || !grantAccessOwner.email}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                  {grantingAccess && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
