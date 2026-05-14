"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Building2, MapPin, Users, Activity, Eye, Edit, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { superadminAPI, SuperadminProperty, CreatePropertyPayload } from "@/lib/api/superadmin";

export default function AllProperties() {
  const [properties, setProperties] = useState<SuperadminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<SuperadminProperty | null>(null);
  const [form, setForm] = useState<CreatePropertyPayload>({ name: "", owner: "", location: "", units: 0 });
  const [saving, setSaving] = useState(false);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await superadminAPI.listProperties(params);
      setProperties(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleAdd = async () => {
    if (!form.name || !form.owner) return toast.error("Name and owner are required");
    try {
      setSaving(true);
      await superadminAPI.createProperty(form);
      toast.success("Property added");
      setShowAddModal(false);
      setForm({ name: "", owner: "", location: "", units: 0 });
      fetchProperties();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add property");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    try {
      await superadminAPI.deleteProperty(id);
      toast.success("Property deleted");
      fetchProperties();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete property");
    }
  };

  const getHealthColor = (health: number) => health >= 90 ? "text-emerald-600" : health >= 75 ? "text-amber-600" : "text-red-600";

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "active").length,
    inactive: properties.filter((p) => p.status === "inactive").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>All Properties</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Manage and monitor all platform properties</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Properties", value: stats.total, color: "text-black" },
          { label: "Active", value: stats.active, color: "text-emerald-600" },
          { label: "Inactive", value: stats.inactive, color: "text-red-500" },
          { label: "New This Month", value: "—", color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 flex items-center gap-4 border-b border-black/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Property
          </motion.button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  {["Property Name", "Owner/Tenant", "Location", "# Units", "# Staff", "Occupancy %", "Health Score", "Status", "Actions"].map((h) => (
                    <th key={h} className={`p-4 text-sm font-medium text-neutral-500 ${["# Units", "# Staff", "Occupancy %", "Health Score", "Status", "Actions"].includes(h) ? "text-center" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((property, i) => (
                  <motion.tr key={property.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-black/5 hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-black">{property.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{property.owner}</td>
                    <td className="p-4"><div className="flex items-center gap-1 text-sm text-neutral-600"><MapPin className="w-4 h-4" />{property.location}</div></td>
                    <td className="p-4 text-center text-sm font-medium">{property.units}</td>
                    <td className="p-4 text-center text-sm">{property.staff}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${property.occupancy}%` }} /></div>
                        <span className="text-sm font-medium">{property.occupancy}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Activity className={`w-4 h-4 ${getHealthColor(property.health)}`} />
                        <span className={`text-sm font-medium ${getHealthColor(property.health)}`}>{property.health}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${property.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {property.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedProperty(property)} className="p-2 hover:bg-black/5 rounded-lg transition-colors"><Eye className="w-4 h-4 text-neutral-600" /></button>
                        <button onClick={() => handleDelete(property.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {properties.length === 0 && (
                  <tr><td colSpan={9} className="p-8 text-center text-sm text-neutral-400">No properties found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Add New Property</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Property Name</label>
                <input type="text" placeholder="Enter property name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Owner/Tenant</label>
                <input type="text" placeholder="Enter owner name" value={form.owner} onChange={(e) => setForm(f => ({ ...f, owner: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
                  <input type="text" placeholder="City, State" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1"># Units</label>
                  <input type="number" placeholder="0" value={form.units || ""} onChange={(e) => setForm(f => ({ ...f, units: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">Cancel</button>
                <button onClick={handleAdd} disabled={saving} className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add Property
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProperty(null)} />
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Property Details</h2>
              <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                <Building2 className="w-12 h-12" />
                <div><h3 className="text-lg font-bold">{selectedProperty.name}</h3><p className="text-blue-100 text-sm">{selectedProperty.owner}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Location", value: selectedProperty.location },
                  { label: "Total Units", value: selectedProperty.units },
                  { label: "Staff Count", value: selectedProperty.staff },
                  { label: "Status", value: selectedProperty.status },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-black/5 rounded-lg">
                    <p className="text-xs text-neutral-500">{item.label}</p>
                    <p className="text-sm font-medium mt-0.5 capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
              {[
                { label: "Occupancy", value: selectedProperty.occupancy, color: "bg-emerald-500" },
                { label: "Health Score", value: selectedProperty.health, color: "bg-blue-500" },
              ].map((bar) => (
                <div key={bar.label} className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-neutral-500">{bar.label}</span><span className="font-medium">{bar.value}%</span></div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden"><div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.value}%` }} /></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
