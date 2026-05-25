"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, AlertCircle, CheckCircle2, Clock, Eye, X,
  UserPlus, ShieldAlert, Loader2, RefreshCw, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  complaintsAPI, ComplaintListItem, ComplaintDetail,
  ManagerDashboard, ComplaintCategory, ComplaintStatus,
  ComplaintPriority, fmtDate, priorityStyles, statusStyles,
} from "@/lib/api/complaints";

export default function ManagerComplaintsPage() {
  const [dashboard, setDashboard]       = useState<ManagerDashboard | null>(null);
  const [complaints, setComplaints]     = useState<ComplaintListItem[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // filters
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // detail panel
  const [detail, setDetail]             = useState<ComplaintDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // resolve modal
  const [resolveId, setResolveId]       = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  // assign modal
  const [assignId, setAssignId]         = useState<string | null>(null);
  const [assignUserId, setAssignUserId] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const dash = await complaintsAPI.managerDashboard();
      setDashboard(dash);
    } catch { /* silent */ }
  }, []);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const [items, count] = await complaintsAPI.list({
        skip: 0, limit: 100,
        status:   filterStatus   ? filterStatus   as ComplaintStatus   : undefined,
        priority: filterPriority ? filterPriority as ComplaintPriority : undefined,
        category: filterCategory ? filterCategory as ComplaintCategory : undefined,
        search:   search || undefined,
      });
      setComplaints(items);
      setTotal(count);
    } catch { toast.error("Failed to load complaints"); }
    finally { setLoading(false); }
  }, [search, filterStatus, filterPriority, filterCategory]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { loadList(); }, [loadList]);

  const openDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const d = await complaintsAPI.getDetail(id);
      setDetail(d);
    } catch { toast.error("Failed to load complaint details"); }
    finally { setDetailLoading(false); }
  };

  const handleResolve = async () => {
    if (!resolveId || resolveNotes.trim().length < 10) {
      toast.error("Resolution notes must be at least 10 characters"); return;
    }
    try {
      setActionLoading(resolveId);
      await complaintsAPI.resolve(resolveId, { status: "resolved", resolution_notes: resolveNotes });
      toast.success("Complaint resolved");
      setResolveId(null); setResolveNotes("");
      loadList(); loadDashboard(); setDetail(null);
    } catch (err: any) { toast.error(err?.response?.data?.detail || "Failed to resolve"); }
    finally { setActionLoading(null); }
  };

  const handleEscalate = async (id: string) => {
    try {
      setActionLoading(id);
      await complaintsAPI.escalate(id, "Escalated by manager for urgent attention");
      toast.success("Complaint escalated");
      loadList(); loadDashboard(); setDetail(null);
    } catch (err: any) { toast.error(err?.response?.data?.detail || "Failed to escalate"); }
    finally { setActionLoading(null); }
  };

  const handleAssign = async () => {
    if (!assignId || !assignUserId.trim()) { toast.error("Enter the user ID to assign"); return; }
    try {
      setActionLoading(assignId);
      await complaintsAPI.assign(assignId, { assigned_to: assignUserId });
      toast.success("Complaint assigned");
      setAssignId(null); setAssignUserId("");
      loadList(); loadDashboard();
    } catch (err: any) { toast.error(err?.response?.data?.detail || "Failed to assign"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Error &amp; Complaint Log</h2>
          <p className="text-sm text-slate-500 mt-1">Manage, assign, and resolve complaints for your property. ({total} total)</p>
        </div>
        <button onClick={() => { loadList(); loadDashboard(); }}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total",      value: dashboard.total_complaints,  color: "#3B82F6" },
            { label: "Open",       value: dashboard.open_complaints,   color: "#3B82F6" },
            { label: "In Progress",value: dashboard.in_progress_count, color: "#F59E0B" },
            { label: "Escalated",  value: dashboard.escalated_count,   color: "#EF4444" },
            { label: "Resolved Today", value: dashboard.resolved_today, color: "#10B981" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or description…"
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none" />
        </div>
        {[
          { val: filterStatus,   setter: setFilterStatus,   opts: ["open","in_progress","resolved","escalated","closed"], label: "Status" },
          { val: filterPriority, setter: setFilterPriority, opts: ["low","medium","high","critical"],                     label: "Priority" },
          { val: filterCategory, setter: setFilterCategory, opts: ["maintenance","housekeeping","technical","operational","security","safety","other"], label: "Category" },
        ].map(({ val, setter, opts, label }) => (
          <select key={label} value={val} onChange={(e) => setter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none capitalize">
            <option value="">All {label}</option>
            {opts.map((o) => <option key={o} value={o} className="capitalize">{o.replace("_", " ")}</option>)}
          </select>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200 dark:border-white/10">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-[#1c1c1c] rounded-xl border p-5 shadow-sm ${
                c.status === "resolved" ? "border-emerald-200" : c.status === "escalated" ? "border-red-200" : "border-slate-200 dark:border-white/10"}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">{c.complaint_type}</span>
                  <span className="text-xs text-slate-400 font-mono">{c.id.slice(0, 8)}…</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${priorityStyles[c.priority]}`}>{c.priority}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-50 dark:bg-white/5 text-slate-500 capitalize">{c.category}</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusStyles[c.status]}`}>{c.status.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{c.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-2">{c.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{fmtDate(c.created_at)}</span>
                    {c.room_number && <span>Room {c.room_number}</span>}
                    {c.assigned_to && <span className="text-blue-600">Assigned</span>}
                    {c.comment_count > 0 && <span>{c.comment_count} comment{c.comment_count !== 1 ? "s" : ""}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => openDetail(c.id)}
                    className="p-2 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5" title="View detail">
                    <Eye className="w-4 h-4" />
                  </button>
                  {c.status !== "resolved" && c.status !== "closed" && (
                    <>
                      <button onClick={() => setAssignId(c.id)}
                        className="p-2 border border-blue-200 rounded-lg text-blue-500 hover:bg-blue-50" title="Assign">
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button onClick={() => setResolveId(c.id)}
                        className="p-2 border border-emerald-200 rounded-lg text-emerald-500 hover:bg-emerald-50" title="Resolve">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      {c.status !== "escalated" && (
                        <button onClick={() => handleEscalate(c.id)} disabled={actionLoading === c.id}
                          className="p-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50" title="Escalate">
                          {actionLoading === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Side Panel */}
      <AnimatePresence>
        {(detail || detailLoading) && (
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#1c1c1c] shadow-2xl border-l border-slate-200 dark:border-white/10 z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-[#1c1c1c] border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Complaint Detail</h3>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {detailLoading ? (
              <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : detail && (
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${priorityStyles[detail.priority]}`}>{detail.priority}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusStyles[detail.status]}`}>{detail.status.replace("_", " ")}</span>
                  <span className="text-xs capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500">{detail.category}</span>
                </div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{detail.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{detail.description}</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Created: {fmtDate(detail.created_at)}</p>
                  {detail.room_number && <p>Location: Room {detail.room_number}</p>}
                  {detail.resolved_at && <p>Resolved: {fmtDate(detail.resolved_at)}</p>}
                  {detail.resolution_notes && <p className="text-emerald-600">Resolution: {detail.resolution_notes}</p>}
                </div>
                {detail.comments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Comments ({detail.comments.length})</p>
                    <div className="space-y-2">
                      {detail.comments.map((cm) => (
                        <div key={cm.id} className="bg-slate-50 dark:bg-white/5 rounded-lg p-3">
                          <p className="text-sm text-slate-700 dark:text-slate-200">{cm.comment}</p>
                          <p className="text-xs text-slate-400 mt-1">{fmtDate(cm.created_at)} {cm.is_internal && "· Internal"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {detail.status !== "resolved" && detail.status !== "closed" && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setResolveId(detail.id); setDetail(null); }}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                      Resolve
                    </button>
                    {detail.status !== "escalated" && (
                      <button onClick={() => { handleEscalate(detail.id); setDetail(null); }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                        Escalate
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resolve Modal */}
      {resolveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Resolve Complaint</h3>
            <textarea value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="Describe how this was resolved (min 10 characters)…" rows={4}
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] rounded-lg text-sm focus:outline-none resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setResolveId(null); setResolveNotes(""); }}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">Cancel</button>
              <button onClick={handleResolve} disabled={!!actionLoading}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />} Mark Resolved
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Modal */}
      {assignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Assign Complaint</h3>
            <input value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}
              placeholder="Staff User ID (UUID)…"
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] rounded-lg text-sm focus:outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setAssignId(null); setAssignUserId(""); }}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">Cancel</button>
              <button onClick={handleAssign} disabled={!!actionLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />} Assign
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
