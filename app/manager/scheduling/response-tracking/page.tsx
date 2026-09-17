"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Activity, Clock, CheckCircle2, XCircle, Loader2, Sparkles, X,
} from "lucide-react";
import {
  schedulingAPI, BackendReplacementRequest, RecommendedEmployee,
} from "@/lib/api/scheduling";
import { workforceAPI } from "@/lib/api/workforce";
import { usersAPI } from "@/lib/api/users";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-50 text-red-700 border-red-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  normal: "bg-slate-50 text-slate-600 border-slate-200",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
        <CheckCircle2 className="w-3 h-3" /> ACCEPTED
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full uppercase tracking-wide border border-red-200">
        <XCircle className="w-3 h-3" /> REJECTED
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full uppercase tracking-wide border border-amber-200">
      <Clock className="w-3 h-3" /> PENDING
    </span>
  );
}

function RequestCard({
  request, employeeName, onAssigned,
}: {
  request: BackendReplacementRequest;
  employeeName: string;
  onAssigned: () => void;
}) {
  const [showRecs, setShowRecs] = useState(false);
  const [recs, setRecs] = useState<RecommendedEmployee[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const handleFindReplacement = async () => {
    setShowRecs(true);
    setLoadingRecs(true);
    try {
      const res = await schedulingAPI.getRecommendations({
        originalEmployeeId: request.original_employee_id,
        shiftDate: request.shift_date,
        shiftStartTime: request.shift_start_time,
        shiftEndTime: request.shift_end_time,
      });
      setRecs(res.recommendations);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load recommendations");
      setShowRecs(false);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAssign = async (employeeId: string) => {
    setAssigningId(employeeId);
    try {
      await schedulingAPI.assignReplacement(request.id, employeeId);
      toast.success("Replacement assigned");
      onAssigned();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to assign replacement");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border transition-shadow hover:shadow-md ${
        request.status === "accepted" ? "border-emerald-200 bg-emerald-50/40" :
        request.status === "rejected" ? "border-red-100 bg-red-50/30" :
        "border-gray-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{employeeName}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {fmtDate(request.shift_date)} · {request.shift_start_time}–{request.shift_end_time}
          </p>
          {request.reason && <p className="text-xs text-gray-500 mt-0.5">{request.reason}</p>}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={request.status} />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${PRIORITY_STYLES[request.priority] ?? PRIORITY_STYLES.normal}`}>
            {request.priority}
          </span>
        </div>
      </div>

      {request.status === "pending" && !showRecs && (
        <button onClick={handleFindReplacement}
          className="mt-3 text-xs font-semibold text-slate-700 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Find Replacement
        </button>
      )}

      <AnimatePresence>
        {showRecs && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Suggested replacements
                </p>
                <button onClick={() => setShowRecs(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {loadingRecs ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                </div>
              ) : recs.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No available employees matched for this shift.</p>
              ) : (
                recs.map((c) => (
                  <div key={c.employee_id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{c.employee_name}</p>
                      <p className="text-xs text-slate-500">{c.department} · {c.position} · {c.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-600">{Math.round(c.compatibility_score)}%</span>
                      <button onClick={() => handleAssign(c.employee_id)} disabled={assigningId === c.employee_id}
                        className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5">
                        {assigningId === c.employee_id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Assign
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ResponseTrackingPage() {
  const [requests, setRequests] = useState<BackendReplacementRequest[]>([]);
  const [employeeNames, setEmployeeNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  const load = useCallback(async () => {
    try {
      const meRes = await usersAPI.me();
      const propertyId = meRes.data.property_id;
      if (!propertyId) { toast.error("No property assigned to your account"); setLoading(false); return; }

      const [reqs, empRes] = await Promise.all([
        schedulingAPI.listReplacementRequests(),
        workforceAPI.listEmployees(propertyId),
      ]);
      setRequests(reqs);
      const names = new Map<string, string>();
      for (const e of empRes.data as any[]) {
        names.set(e.id, `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || e.email || "Unknown");
      }
      setEmployeeNames(names);
    } catch {
      toast.error("Failed to load response tracking data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const pending = requests.filter(r => r.status === "pending");
  const accepted = requests.filter(r => r.status === "accepted");
  const rejected = requests.filter(r => r.status === "rejected");
  const filtered = activeTab === "pending" ? pending : activeTab === "accepted" ? accepted : activeTab === "rejected" ? rejected : requests;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/manager/scheduling" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Schedule
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <h1 className="text-lg font-bold text-gray-900">Replacement Request Tracking</h1>
        </div>
      </div>

      {/* Status Counts */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "PENDING", value: pending.length, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", tab: "pending" as const },
          { label: "ACCEPTED", value: accepted.length, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", tab: "accepted" as const },
          { label: "REJECTED", value: rejected.length, color: "text-red-700", bg: "bg-red-50 border-red-200", tab: "rejected" as const },
        ].map((s) => (
          <button key={s.tab} onClick={() => setActiveTab(activeTab === s.tab ? "all" : s.tab)}
            className={`rounded-xl border p-4 text-center transition-all hover:shadow-sm ${s.bg} ${activeTab === s.tab ? "ring-2 ring-offset-1 ring-slate-900" : ""}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${s.color} opacity-80`}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Requests */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {filtered.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                employeeName={employeeNames.get(r.original_employee_id) ?? "Unknown employee"}
                onAssigned={load}
              />
            ))}
            {filtered.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">No requests in this category.</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
