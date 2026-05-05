"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2, X, ChevronDown,
  Phone, Mail, Building2, MoreHorizontal, Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { workforceAPI } from "@/lib/api/workforce";
import { propertiesAPI, Property } from "@/lib/api/properties";

interface Vendor {
  id: string;
  property_id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

const serviceCategories = [
  "All Categories", "Cleaning", "Maintenance", "Security", "Catering",
  "Electrical", "Plumbing", "Laundry", "Pest Control", "Landscaping",
];

function VendorModal({ vendor, onClose, onSave }: {
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (data: { name: string; contact_person: string; phone: string; email: string; address: string; is_active: boolean }) => Promise<void>;
}) {
  const [name, setName] = useState(vendor?.name ?? "");
  const [contactPerson, setContactPerson] = useState(vendor?.contact_person ?? "");
  const [phone, setPhone] = useState(vendor?.phone ?? "");
  const [email, setEmail] = useState(vendor?.email ?? "");
  const [address, setAddress] = useState(vendor?.address ?? "");
  const [isActive, setIsActive] = useState(vendor?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSave({ name: name.trim(), contact_person: contactPerson.trim(), phone: phone.trim(), email: email.trim(), address: address.trim(), is_active: isActive });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-black/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <h2 className="text-black" style={{ fontWeight: 700 }}>{vendor ? "Edit Vendor" : "Add New Vendor"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Vendor Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Al Noor Cleaning Services"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
          </div>
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Contact Person</label>
            <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="e.g. Ahmed Al Noor"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 4 000 0000"
                className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
            </div>
            <div>
              <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="vendor@email.com" type="email"
                className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-black/10 rounded-xl">
            <div>
              <p className="text-black text-sm" style={{ fontWeight: 500 }}>Vendor Status</p>
              <p className="text-neutral-400 text-xs">Active vendors appear in assignments</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isActive ? "text-black" : "text-neutral-400"}`} style={{ fontWeight: 500 }}>
                {isActive ? "Active" : "Inactive"}
              </span>
              <button onClick={() => setIsActive(v => !v)}
                className={`rounded-full relative flex-shrink-0 ${isActive ? "bg-[#3B82F6]" : "bg-black/[0.06]"}`}
                style={{ height: "22px", width: "40px" }}>
                <span className="absolute top-[2px] w-[18px] h-[18px] bg-white/70 backdrop-blur rounded-full shadow-sm transition-all"
                  style={{ left: isActive ? "calc(100% - 20px)" : "2px" }} />
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-black/10 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim() || submitting}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md disabled:opacity-40 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {vendor ? "Save Changes" : "Add Vendor"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VendorPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [propsLoading, setPropsLoading] = useState(true);

  useEffect(() => {
    propertiesAPI.list().then(res => {
      setProperties(res.data);
      if (res.data.length > 0) setSelectedPropertyId(res.data[0].id);
    }).catch(() => toast.error("Failed to load properties")).finally(() => setPropsLoading(false));
  }, []);

  const fetchVendors = useCallback(async () => {
    if (!selectedPropertyId) return;
    setLoading(true);
    try {
      const res = await workforceAPI.listVendors(selectedPropertyId);
      setVendors(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const filtered = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.email ?? "").toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleCreate = async (data: any) => {
    try {
      const res = await workforceAPI.createVendor(selectedPropertyId, data);
      setVendors(prev => [res.data, ...prev]);
      toast.success("Vendor added");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add vendor");
      throw err;
    }
  };

  const handleUpdate = async (vendorId: string, data: any) => {
    try {
      const res = await workforceAPI.updateVendor(vendorId, data);
      setVendors(prev => prev.map(v => v.id === vendorId ? res.data : v));
      toast.success("Vendor updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update vendor");
      throw err;
    }
  };

  const handleDelete = async (vendorId: string) => {
    try {
      await workforceAPI.deleteVendor(vendorId);
      setVendors(prev => prev.filter(v => v.id !== vendorId));
      setMenuOpen(null);
      toast.success("Vendor deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete vendor");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Vendor Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{vendors.length} vendors</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setEditVendor(null); setModalOpen(true); }} disabled={!selectedPropertyId}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md disabled:opacity-50" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Add Vendor
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
          <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}
            className="bg-white border border-black/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black/20">
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Vendors", value: vendors.length, color: "#3B82F6" },
          { label: "Active", value: vendors.filter(v => v.is_active).length, color: "#10B981" },
          { label: "Inactive", value: vendors.filter(v => !v.is_active).length, color: "#94A3B8" },
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..."
          className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr,1.5fr,1.5fr,1fr,auto,auto] gap-4 px-6 py-3 bg-white/50 border-b border-black/10">
            {["Vendor Name", "Phone", "Email", "Status", "", ""].map((h, i) => (
              <span key={i} className="text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          <div className="divide-y divide-black/5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <Package className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">{search ? "No vendors match your search." : "No vendors yet. Add one to get started."}</p>
              </div>
            ) : filtered.map((v, i) => (
              <motion.div key={v.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex flex-col md:grid md:grid-cols-[2fr,1.5fr,1.5fr,1fr,auto,auto] gap-2 md:gap-4 items-start md:items-center px-6 py-4 hover:bg-white/60 transition-colors">
                <div>
                  <p className="text-black text-sm" style={{ fontWeight: 600 }}>{v.name}</p>
                  {v.contact_person && <p className="text-neutral-400 text-xs">{v.contact_person}</p>}
                </div>
                <div className="flex items-center gap-1.5 text-neutral-600 text-sm">
                  {v.phone ? <><Phone className="w-3.5 h-3.5 text-neutral-400" /><span className="text-xs">{v.phone}</span></> : <span className="text-neutral-300 text-xs">—</span>}
                </div>
                <div className="flex items-center gap-1.5 text-neutral-600 text-sm hidden md:flex">
                  {v.email ? <><Mail className="w-3.5 h-3.5 text-neutral-400" /><span className="text-xs truncate">{v.email}</span></> : <span className="text-neutral-300 text-xs">—</span>}
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full`} style={{ fontWeight: 600, backgroundColor: v.is_active ? "#10B98115" : "#94A3B815", color: v.is_active ? "#10B981" : "#94A3B8" }}>
                    <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: v.is_active ? "#10B981" : "#94A3B8" }} />
                    {v.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <button onClick={() => { setEditVendor(v); setModalOpen(true); }} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === v.id ? null : v.id)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {menuOpen === v.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-8 bg-white border border-black/10 rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden">
                        <button onClick={() => handleDelete(v.id)}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete Vendor
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <VendorModal
            vendor={editVendor}
            onClose={() => { setModalOpen(false); setEditVendor(null); }}
            onSave={editVendor
              ? (data) => handleUpdate(editVendor.id, data)
              : handleCreate
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
