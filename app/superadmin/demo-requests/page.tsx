"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Mail, Phone, Building2, Users, CheckCircle2, X, Eye, XCircle, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { superadminAPI, DemoRequest } from "@/lib/api/superadmin";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await superadminAPI.listDemoRequests(params);
      setRequests(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load demo requests");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (id: string, status: "pending" | "contacted" | "completed") => {
    try {
      setSaving(true);
      await superadminAPI.updateDemoStatus(id, status);
      toast.success("Status updated");
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const filtered = requests.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.company?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  const statusData = [
    { name: "Pending", value: stats.pending },
    { name: "Contacted", value: stats.contacted },
    { name: "Completed", value: stats.completed },
  ].filter((d) => d.value > 0);

  const sizeData = Object.entries(
    requests.reduce((acc, r) => { acc[r.size] = (acc[r.size] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "contacted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Demo Requests</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Manage inbound demo and trial requests</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: stats.total, color: "text-black" },
          { label: "Pending", value: stats.pending, color: "text-amber-600" },
          { label: "Contacted", value: stats.contacted, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {requests.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>By Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>By Company Size</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sizeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#737373" />
                <YAxis tick={{ fontSize: 11 }} stroke="#737373" />
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }} />
                <Bar dataKey="value" fill="#18181b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 flex items-center gap-4 border-b border-black/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search by name, email, or company..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
            {["all", "pending", "contacted", "completed"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${statusFilter === s ? "bg-white text-black shadow-sm" : "text-neutral-600 hover:text-black"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
        ) : (
          <div className="divide-y divide-black/5">
            {filtered.map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-4 hover:bg-black/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-black">{req.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(req.status)}`}>{req.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-neutral-600">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{req.email}</span>
                      <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{req.company || "—"}</span>
                      {req.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{req.phone}</span>}
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{req.size || "—"}</span>
                    </div>
                    {req.message && <p className="text-sm text-neutral-500 mt-2 line-clamp-1">{req.message}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-neutral-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(req.created_at).toLocaleDateString()}</span>
                    <button onClick={() => setSelectedRequest(req)} className="p-2 hover:bg-black/10 rounded-lg transition-colors"><Eye className="w-4 h-4 text-neutral-600" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-neutral-400">No demo requests found</div>
            )}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRequest(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Demo Request</h2>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { label: "Name", value: selectedRequest.name },
                { label: "Email", value: selectedRequest.email },
                { label: "Company", value: selectedRequest.company || "—" },
                { label: "Phone", value: selectedRequest.phone || "—" },
                { label: "Company Size", value: selectedRequest.size || "—" },
                { label: "Role", value: selectedRequest.role || "—" },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <span className="w-28 text-sm text-neutral-500 shrink-0">{item.label}</span>
                  <span className="text-sm font-medium text-black">{item.value}</span>
                </div>
              ))}
              {selectedRequest.message && (
                <div className="flex gap-4">
                  <span className="w-28 text-sm text-neutral-500 shrink-0">Message</span>
                  <span className="text-sm text-black">{selectedRequest.message}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => updateStatus(selectedRequest.id, "contacted")} disabled={saving || selectedRequest.status === "contacted"}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Mark Contacted
              </button>
              <button onClick={() => updateStatus(selectedRequest.id, "completed")} disabled={saving || selectedRequest.status === "completed"}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Mark Completed
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
