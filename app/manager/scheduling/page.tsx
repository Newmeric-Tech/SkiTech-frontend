"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Activity, ChevronRight, Users, UserMinus, AlertTriangle,
  TrendingUp, Loader2, Sparkles, Send, X, CheckCircle2,
} from "lucide-react";
import {
  schedulingAPI, BackendManagerDashboard, BackendCriticalAction,
  BackendReplacementRequest, RecommendedEmployee,
} from "@/lib/api/scheduling";
import { workforceAPI } from "@/lib/api/workforce";
import { usersAPI } from "@/lib/api/users";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const URGENCY_STYLES: Record<string, string> = {
  immediate: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-700",
  normal: "bg-slate-100 text-slate-600",
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-50 text-red-700 border-red-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  normal: "bg-slate-50 text-slate-600 border-slate-200",
};

// ── AI recommendation panel — shared by both critical actions and pending requests ──
function RecommendationPanel({
  candidates, loading, onAssign, assigningId, onClose,
}: {
  candidates: RecommendedEmployee[];
  loading: boolean;
  onAssign: (employeeId: string) => void;
  assigningId: string | null;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden">
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Suggested replacements
          </p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No available employees matched for this shift.</p>
        ) : (
          candidates.map((c) => (
            <div key={c.employee_id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{c.employee_name}</p>
                <p className="text-xs text-slate-500">{c.department} · {c.position} · {c.reason}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-indigo-600">{Math.round(c.compatibility_score)}%</span>
                <button
                  onClick={() => onAssign(c.employee_id)}
                  disabled={assigningId === c.employee_id}
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
  );
}

function CriticalActionRow({
  action, onRequested,
}: {
  action: BackendCriticalAction;
  onRequested: () => void;
}) {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await schedulingAPI.createReplacementRequest({
        shiftAssignmentId: action.shift_assignment_id,
        originalEmployeeId: action.employee_id,
        shiftDate: action.shift_date,
        shiftStartTime: action.shift_start_time,
        shiftEndTime: action.shift_end_time,
        reason: action.reason_off,
        priority: action.urgency === "immediate" ? "urgent" : action.urgency === "high" ? "high" : "normal",
      });
      setRequested(true);
      toast.success(`Replacement request sent for ${action.employee_name}`);
      onRequested();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create replacement request");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{action.employee_name}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {action.department} · {action.shift_start_time}–{action.shift_end_time} · {action.reason_off}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${URGENCY_STYLES[action.urgency] ?? URGENCY_STYLES.normal}`}>
          {action.urgency}
        </span>
        {requested ? (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Sent</span>
        ) : (
          <button onClick={handleRequest} disabled={requesting}
            className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0">
            {requesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Request Replacement
          </button>
        )}
      </div>
    </div>
  );
}

function PendingRequestRow({
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
    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{employeeName}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {fmtDate(request.shift_date)} · {request.shift_start_time}–{request.shift_end_time}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${PRIORITY_STYLES[request.priority] ?? PRIORITY_STYLES.normal}`}>
            {request.priority}
          </span>
          {request.status === "pending" && !showRecs && (
            <button onClick={handleFindReplacement}
              className="text-xs font-semibold text-slate-700 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Find Replacement
            </button>
          )}
          {request.status === "accepted" && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Accepted</span>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showRecs && (
          <RecommendationPanel
            candidates={recs}
            loading={loadingRecs}
            onAssign={handleAssign}
            assigningId={assigningId}
            onClose={() => setShowRecs(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ManagerSchedulingPage() {
  const [dashboard, setDashboard] = useState<BackendManagerDashboard | null>(null);
  const [employeeNames, setEmployeeNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const meRes = await usersAPI.me();
      const propertyId = meRes.data.property_id;
      if (!propertyId) { toast.error("No property assigned to your account"); setLoading(false); return; }

      const [dash, empRes] = await Promise.all([
        schedulingAPI.managerDashboard(),
        workforceAPI.listEmployees(propertyId),
      ]);
      setDashboard(dash);
      const names = new Map<string, string>();
      for (const e of empRes.data as any[]) {
        names.set(e.id, `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || e.email || "Unknown");
      }
      setEmployeeNames(names);
    } catch {
      toast.error("Failed to load scheduling data");
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

  const pendingCount = dashboard?.pending_responses.filter(r => r.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Scheduling</h1>
          <p className="text-gray-500 text-sm">Coverage gaps and replacement requests for this week</p>
        </div>
        <Link href="/manager/scheduling/response-tracking">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:bg-slate-800 transition-colors relative">
            <Activity className="w-4 h-4" /> Response Tracking
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {pendingCount}
              </span>
            )}
            <ChevronRight className="w-4 h-4 opacity-60" />
          </motion.button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Employees", value: dashboard?.employee_count ?? 0, color: "#3B82F6" },
          { icon: UserMinus, label: "Scheduled", value: dashboard?.scheduled_count ?? 0, color: "#10B981" },
          { icon: AlertTriangle, label: "Unscheduled", value: dashboard?.unscheduled_count ?? 0, color: "#F59E0B" },
          { icon: TrendingUp, label: "Coverage", value: `${(dashboard?.scheduling_progress ?? 0).toFixed(0)}%`, color: "#8B5CF6" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + "15" }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Critical Actions */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-sm font-semibold text-red-700">
            Critical Actions Required ({dashboard?.critical_actions.length ?? 0})
          </p>
        </div>
        {(dashboard?.critical_actions.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No coverage gaps this week.</p>
        ) : (
          <div className="space-y-3">
            {dashboard!.critical_actions.map((action) => (
              <CriticalActionRow key={action.shift_assignment_id} action={action} onRequested={load} />
            ))}
          </div>
        )}
      </div>

      {/* Pending Replacement Requests */}
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-amber-700 mb-4">
          Pending Replacement Requests ({dashboard?.pending_responses.length ?? 0})
        </p>
        {(dashboard?.pending_responses.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No open replacement requests.</p>
        ) : (
          <div className="space-y-3">
            {dashboard!.pending_responses.map((r) => (
              <PendingRequestRow
                key={r.id}
                request={r}
                employeeName={employeeNames.get(r.original_employee_id) ?? "Unknown employee"}
                onAssigned={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
