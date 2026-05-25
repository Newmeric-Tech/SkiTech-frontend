"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, AlertCircle, CheckCircle2, Clock, X, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  complaintsAPI, ComplaintListItem, StaffDashboard,
  CreateComplaintPayload, ComplaintCategory, ComplaintPriority,
  fmtDate, priorityStyles, statusStyles,
} from "@/lib/api/complaints";

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: "maintenance",  label: "Maintenance" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "technical",    label: "Technical" },
  { value: "operational",  label: "Operational" },
  { value: "security",     label: "Security" },
  { value: "safety",       label: "Safety" },
  { value: "other",        label: "Other" },
];

const PRIORITIES: { value: ComplaintPriority; label: string }[] = [
  { value: "low",      label: "Low" },
  { value: "medium",   label: "Medium" },
  { value: "high",     label: "High" },
  { value: "critical", label: "Critical" },
];

const BLANK: CreateComplaintPayload = {
  title: "", description: "", category: "maintenance",
  priority: "medium", complaint_type: "complaint", room_number: "",
};

export default function StaffComplaintsPage() {
  const [dashboard, setDashboard]       = useState<StaffDashboard | null>(null);
  const [complaints, setComplaints]     = useState<ComplaintListItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm]                 = useState<CreateComplaintPayload>(BLANK);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [dash, [items]] = await Promise.all([
        complaintsAPI.staffDashboard(),
        complaintsAPI.myComplaints(0, 100),
      ]);
      setDashboard(dash);
      setComplaints(items);
    } catch { toast.error("Failed to load complaints"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { toast.error("Title and description are required"); return; }
    try {
      setSubmitting(true);
      await complaintsAPI.create({ ...form, room_number: form.room_number || undefined });
      toast.success("Complaint submitted successfully");
      setForm(BLANK);
      setShowForm(false);
      load();
    } catch (err: any) { toast.error(err?.response?.data?.detail || "Failed to submit complaint"); }
    finally { setSubmitting(false); }
  };

  const filtered = complaints.filter((c) =>
    (filterStatus === "all" || c.status === filterStatus) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Complaints</h2>
          <p className="text-sm text-slate-500 mt-1">Create and track your submitted complaints.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white rounded-lg text-sm font-medium text-white dark:text-black hover:bg-slate-800">
            <Plus className="w-4 h-4" /> New Complaint
          </button>
        </div>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "My Complaints", value: dashboard.my_complaints_count, color: "#3B82F6" },
            { label: "Pending",       value: dashboard.pending_resolution,   color: "#F59E0B" },
            { label: "Assigned to Me",value: dashboard.assigned_to_me,      color: "#8B5CF6" },
            { label: "Resolved",      value: dashboard.resolved_by_me,      color: "#10B981" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaints…"
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200 dark:border-white/10">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No complaints found</p>
            <p className="text-slate-400 text-sm mt-1">Submit your first complaint to get started</p>
          </div>
        ) : filtered.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-[#1c1c1c] rounded-xl border p-5 shadow-sm ${c.status === "resolved" ? "border-emerald-200" : "border-slate-200 dark:border-white/10"}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 capitalize">{c.category}</span>
                <span className="text-xs text-slate-400 font-mono">{c.id.slice(0, 8)}…</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${priorityStyles[c.priority]}`}>{c.priority}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusStyles[c.status]}`}>{c.status.replace("_", " ")}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{c.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-3 line-clamp-2">{c.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{fmtDate(c.created_at)}</span>
              {c.room_number && <span>Room {c.room_number}</span>}
              {c.status === "resolved" && <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Resolved {fmtDate(c.resolved_at)}</span>}
              {c.comment_count > 0 && <span>{c.comment_count} comment{c.comment_count !== 1 ? "s" : ""}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-bold text-slate-900 dark:text-white">Submit New Complaint</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief description of the issue"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide detailed information" rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] rounded-lg text-sm focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ComplaintCategory })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] rounded-lg text-sm focus:outline-none">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ComplaintPriority })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] rounded-lg text-sm focus:outline-none">
                    {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room / Location (optional)</label>
                <input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} placeholder="e.g. 305"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] rounded-lg text-sm focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Submitting…" : "Submit Complaint"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
