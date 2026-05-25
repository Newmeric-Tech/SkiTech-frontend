"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, Clock, Eye, ShieldAlert, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  complaintsAPI, ComplaintListItem, OwnerDashboard,
  ComplaintCategory, ComplaintStatus, ComplaintPriority,
  fmtDate, priorityStyles, statusStyles,
} from "@/lib/api/complaints";

export default function OwnerComplaintsPage() {
  const [dashboard, setDashboard]       = useState<OwnerDashboard | null>(null);
  const [complaints, setComplaints]     = useState<ComplaintListItem[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded]         = useState<string | null>(null);

  // filters
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [dash, [items, count]] = await Promise.all([
        complaintsAPI.ownerDashboard(),
        complaintsAPI.list({
          skip: 0, limit: 100,
          status:   filterStatus   ? filterStatus   as ComplaintStatus   : undefined,
          priority: filterPriority ? filterPriority as ComplaintPriority : undefined,
          category: filterCategory ? filterCategory as ComplaintCategory : undefined,
          search:   search || undefined,
        }),
      ]);
      setDashboard(dash);
      setComplaints(items);
      setTotal(count);
    } catch { toast.error("Failed to load complaints"); }
    finally { setLoading(false); }
  }, [search, filterStatus, filterPriority, filterCategory]);

  useEffect(() => { load(); }, [load]);

  const handleEscalate = async (id: string) => {
    try {
      setActionLoading(id);
      await complaintsAPI.escalate(id, "Escalated by owner for urgent attention");
      toast.success("Complaint escalated");
      load();
    } catch (err: any) { toast.error(err?.response?.data?.detail || "Failed to escalate"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Error &amp; Complaint Log</h2>
          <p className="text-sm text-slate-500 mt-1">Organisation-wide overview of all complaints and errors. ({total} total)</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Owner Dashboard Stats */}
      {dashboard && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total",          value: dashboard.total_complaints, color: "#3B82F6" },
              { label: "Critical",       value: dashboard.total_critical,   color: "#DC2626" },
              { label: "High Priority",  value: dashboard.total_high,       color: "#F97316" },
              { label: "Resolved",       value: dashboard.total_resolved,   color: "#10B981" },
              { label: "Resolution Rate",value: `${dashboard.resolution_rate.toFixed(1)}%`, color: "#8B5CF6" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* By Category breakdown */}
          {Object.keys(dashboard.by_category).length > 0 && (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Breakdown by Category</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(dashboard.by_category).map(([cat, count]) => (
                  <div key={cat} className="text-center p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{count as number}</p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{cat}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaints…"
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
          {complaints.map((c) => {
            const isExpanded = expanded === c.id;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-[#1c1c1c] rounded-xl border p-5 shadow-sm ${
                  c.status === "resolved" ? "border-emerald-200" : c.status === "escalated" ? "border-red-200" : "border-slate-200 dark:border-white/10"}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">{c.complaint_type}</span>
                    <span className="text-xs text-slate-400 font-mono">{c.id.slice(0, 8)}…</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${priorityStyles[c.priority]}`}>{c.priority}</span>
                    <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-slate-50 dark:bg-white/5 text-slate-500">{c.category}</span>
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
                      {c.assigned_to && <span className="text-blue-500">Assigned</span>}
                      {c.resolved_at && <span className="text-emerald-500">Resolved {fmtDate(c.resolved_at)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button onClick={() => setExpanded(isExpanded ? null : c.id)}
                      className="p-2 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">
                      <Eye className="w-4 h-4" />
                    </button>
                    {c.status !== "escalated" && c.status !== "resolved" && c.status !== "closed" && (
                      <button onClick={() => handleEscalate(c.id)} disabled={actionLoading === c.id}
                        className="p-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50">
                        {actionLoading === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Description</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{c.description}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <span>Type: <span className="capitalize font-medium">{c.complaint_type}</span></span>
                      <span>Category: <span className="capitalize font-medium">{c.category}</span></span>
                      <span>Attachments: <span className="font-medium">{c.attachment_count}</span></span>
                      <span>Comments: <span className="font-medium">{c.comment_count}</span></span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
