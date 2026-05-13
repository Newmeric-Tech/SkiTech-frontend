"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Building2, MapPin, Users, Activity, Edit2, Trash2,
  Loader2, X, UserCircle, Phone, Mail, Plus, BedDouble,
} from "lucide-react";
import { toast } from "sonner";
import {
  propertiesAPI,
  Property,
  OwnerDetails,
  PropertyUpdate,
  OwnerDetailsCreate,
} from "@/lib/api/properties";

const FRANCHISE_TYPES = ["owner-operated", "franchise", "managed", "leased"];
const OWNERSHIP_TYPES = ["sole proprietor", "partnership", "corporation", "trust"];

function buildLocation(p: Property): string {
  return [p.address, p.city, p.state, p.country].filter(Boolean).join(", ") || "—";
}

export default function PropertyDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [property, setProperty] = useState<Property | null>(null);
  const [owners, setOwners] = useState<OwnerDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<PropertyUpdate>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [showAddOwner, setShowAddOwner] = useState(false);
  const [ownerForm, setOwnerForm] = useState<OwnerDetailsCreate>({ owner_name: "" });
  const [ownerSubmitting, setOwnerSubmitting] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [propRes, ownerRes] = await Promise.all([
        propertiesAPI.get(id),
        propertiesAPI.getOwner(id),
      ]);
      setProperty(propRes.data);
      setOwners(ownerRes.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load property");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openEdit = () => {
    if (!property) return;
    setEditForm({
      name: property.name,
      address: property.address ?? "",
      city: property.city ?? "",
      state: property.state ?? "",
      country: property.country ?? "",
      postal_code: property.postal_code ?? "",
      franchise_type: property.franchise_type ?? "owner-operated",
      num_rooms: property.num_rooms ?? undefined,
      room_number_start: property.room_number_start ?? 101,
      has_restaurant: property.has_restaurant ?? false,
      is_active: property.is_active,
    });
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    try {
      setEditSubmitting(true);
      const res = await propertiesAPI.update(id, editForm);
      setProperty(res.data);
      setShowEdit(false);
      toast.success("Property updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update property");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!property) return;
    if (!confirm(`Delete "${property.name}"? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      await propertiesAPI.delete(id);
      toast.success("Property deleted");
      router.push("/owner/properties");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete property");
      setDeleting(false);
    }
  };

  const handleAddOwner = async () => {
    if (!ownerForm.owner_name.trim()) return;
    try {
      setOwnerSubmitting(true);
      const res = await propertiesAPI.createOwner(id, ownerForm);
      setOwners(prev => [...prev, res.data]);
      setShowAddOwner(false);
      setOwnerForm({ owner_name: "" });
      toast.success("Owner added");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add owner");
    } finally {
      setOwnerSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-slate-950 mb-2">Property Not Found</h2>
          <p className="text-slate-500 mb-6">This property doesn't exist or was deleted.</p>
          <button
            onClick={() => router.push("/owner/properties")}
            className="px-4 py-2 bg-slate-950 text-white rounded-xl text-sm font-medium"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Building2, label: "Total Rooms", value: property.num_rooms ?? "—", color: "#3B82F6" },
    { icon: Users, label: "Owners", value: owners.length, color: "#6366F1" },
    { icon: Activity, label: "Status", value: property.is_active ? "Active" : "Inactive", color: property.is_active ? "#10B981" : "#EF4444" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/owner/properties")}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-950 tracking-tight">{property.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 text-sm">{buildLocation(property)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            property.is_active
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-red-50 text-red-700 border border-red-200/60"
          }`}>
            {property.is_active ? "Active" : "Inactive"}
          </span>
          <button
            onClick={openEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}18` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{stat.value}</div>
            <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}60)` }} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="font-bold text-slate-950 text-lg mb-5">Property Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Franchise Type", value: property.franchise_type ?? "—" },
                { label: "Num. of Rooms", value: property.num_rooms ?? "—" },
                { label: "Room Numbers Start", value: property.room_number_start ?? 101 },
                { label: "Has Restaurant", value: property.has_restaurant ? "Yes" : "No" },
                { label: "Postal Code", value: property.postal_code ?? "—" },
                { label: "State / Province", value: property.state ?? "—" },
                { label: "Country", value: property.country ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-500 text-xs mb-1">{label}</p>
                  <p className="text-slate-950 text-sm font-semibold capitalize">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Details */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-950 text-lg">Owner Details</h3>
              <button
                onClick={() => setShowAddOwner(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Owner
              </button>
            </div>
            {owners.length === 0 ? (
              <div className="text-center py-8">
                <UserCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No owner details added yet</p>
                <button
                  onClick={() => setShowAddOwner(true)}
                  className="mt-3 text-slate-600 text-sm underline underline-offset-2 hover:text-slate-900"
                >
                  Add owner
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {owners.map(owner => (
                  <div key={owner.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <UserCircle className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-950 text-sm font-semibold">{owner.owner_name}</p>
                      {owner.ownership_type && (
                        <span className="text-xs text-slate-500 capitalize">{owner.ownership_type}</span>
                      )}
                      <div className="mt-2 space-y-1">
                        {owner.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3 h-3" /> {owner.phone}
                          </div>
                        )}
                        {owner.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="w-3 h-3" /> {owner.email}
                          </div>
                        )}
                        {owner.address && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" /> {owner.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="h-36 bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
              <Building2 className="w-14 h-14 text-white/10" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-slate-500 text-xs mb-1">Property Name</p>
                <p className="text-slate-950 text-sm font-semibold">{property.name}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Full Address</p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-950 text-sm font-semibold">{buildLocation(property)}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Franchise Type</p>
                <p className="text-slate-950 text-sm font-semibold capitalize">{property.franchise_type ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Created</p>
                <p className="text-slate-950 text-sm font-semibold">
                  {new Date(property.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="font-bold text-slate-950 text-lg mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push(`/owner/properties/${id}/rooms`)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <BedDouble className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Manage Rooms</span>
              </button>
              <button
                onClick={() => router.push(`/owner/staff?property=${id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">View Staff</span>
              </button>
              <button
                onClick={() => router.push("/owner/reports")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <Activity className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Property Modal */}
      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEdit(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-black/10 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-black font-extrabold text-xl">Edit Property</h2>
                <button onClick={() => setShowEdit(false)} className="text-neutral-400 hover:text-neutral-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Property Name *</label>
                  <input
                    value={editForm.name ?? ""}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">City</label>
                    <input
                      value={editForm.city ?? ""}
                      onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Country</label>
                    <input
                      value={editForm.country ?? ""}
                      onChange={e => setEditForm(f => ({ ...f, country: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Address</label>
                  <input
                    value={editForm.address ?? ""}
                    onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">State</label>
                    <input
                      value={editForm.state ?? ""}
                      onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Postal Code</label>
                    <input
                      value={editForm.postal_code ?? ""}
                      onChange={e => setEditForm(f => ({ ...f, postal_code: e.target.value }))}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Franchise Type</label>
                  <select
                    value={editForm.franchise_type ?? "owner-operated"}
                    onChange={e => setEditForm(f => ({ ...f, franchise_type: e.target.value }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                  >
                    {FRANCHISE_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Number of Rooms</label>
                    <input
                      value={editForm.num_rooms ?? ""}
                      onChange={e => setEditForm(f => ({ ...f, num_rooms: e.target.value ? parseInt(e.target.value) : undefined }))}
                      type="number"
                      min={0}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Room Numbers Start From</label>
                    <input
                      value={editForm.room_number_start ?? 101}
                      onChange={e => setEditForm(f => ({ ...f, room_number_start: e.target.value ? parseInt(e.target.value) : 101 }))}
                      type="number"
                      min={1}
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editForm.has_restaurant ?? false}
                      onChange={e => setEditForm(f => ({ ...f, has_restaurant: e.target.checked }))}
                      className="w-4 h-4 rounded accent-black"
                    />
                    <span className="text-neutral-700 text-sm font-medium">Has Restaurant</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editForm.is_active ?? true}
                      onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded accent-black"
                    />
                    <span className="text-neutral-700 text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.03] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={editSubmitting || !editForm.name?.trim()}
                  className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Owner Modal */}
      <AnimatePresence>
        {showAddOwner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddOwner(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-black/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-black font-extrabold text-xl">Add Owner</h2>
                <button onClick={() => setShowAddOwner(false)} className="text-neutral-400 hover:text-neutral-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Owner Name *</label>
                  <input
                    value={ownerForm.owner_name}
                    onChange={e => setOwnerForm(f => ({ ...f, owner_name: e.target.value }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    placeholder="Al Mansouri Holdings"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Phone</label>
                  <input
                    value={ownerForm.phone ?? ""}
                    onChange={e => setOwnerForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    placeholder="+971 50 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Email</label>
                  <input
                    value={ownerForm.email ?? ""}
                    onChange={e => setOwnerForm(f => ({ ...f, email: e.target.value }))}
                    type="email"
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    placeholder="owner@example.com"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Address</label>
                  <input
                    value={ownerForm.address ?? ""}
                    onChange={e => setOwnerForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                    placeholder="123 Sheikh Zayed Road"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 text-sm mb-1.5 font-medium">Ownership Type</label>
                  <select
                    value={ownerForm.ownership_type ?? ""}
                    onChange={e => setOwnerForm(f => ({ ...f, ownership_type: e.target.value || undefined }))}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30"
                  >
                    <option value="">Select type</option>
                    {OWNERSHIP_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddOwner(false)}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.03] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOwner}
                  disabled={ownerSubmitting || !ownerForm.owner_name.trim()}
                  className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {ownerSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Owner
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
