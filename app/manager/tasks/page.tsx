"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, CheckCircle2, Clock, AlertCircle, User,
  Calendar, X, ChevronDown, Flag, ChevronRight, Loader2, FileText,
  Camera, MapPin, ThumbsUp, ThumbsDown, Eye, EyeOff, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { sopAPI } from "@/lib/api/sop";
import { usersAPI, User as StaffUser } from "@/lib/api/users";

interface SOPCategory { id: string; name: string; }
interface SOPItem {
  id: string; category_id: string; title: string; description?: string;
  priority: "low" | "medium" | "high"; status: string; due_date?: string;
  assigned_user_id?: string; created_at: string; updated_at: string;
}
interface SOPExecution {
  id: string; sop_id: string; user_id: string;
  status: string; completed_at?: string;
  proof_image?: string; proof_submitted_at?: string;
  proof_location_lat?: number; proof_location_lng?: number;
  proof_location_name?: string; rejection_reason?: string;
  created_at: string; updated_at: string;
}

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: typeof CheckCircle2 }> = {
  pending:     { color: "#F59E0B", bg: "bg-amber-50 text-amber-700 border border-amber-200/60",      label: "Pending",     icon: Clock },
  in_progress: { color: "#3B82F6", bg: "bg-blue-50 text-blue-700 border border-blue-200/60",         label: "In Progress", icon: Clock },
  completed:   { color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", label: "Done",        icon: CheckCircle2 },
  overdue:     { color: "#EF4444", bg: "bg-red-50 text-red-700 border border-red-200/60",             label: "Overdue",     icon: AlertCircle },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  high:   { color: "#EF4444", bg: "bg-red-50 text-red-700 border border-red-200/60" },
  medium: { color: "#F59E0B", bg: "bg-amber-50 text-amber-700 border border-amber-200/60" },
  low:    { color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
};

// ── Proof Approval Card ────────────────────────────────────

function ProofCard({
  execution, sopMap, staffByUserId, onApprove, onReject,
}: {
  execution: SOPExecution;
  sopMap: Map<string, SOPItem>;
  staffByUserId: Map<string, StaffUser>;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}) {
  const [showImage, setShowImage] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const sop = sopMap.get(execution.sop_id);
  const emp = staffByUserId.get(execution.user_id);

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(execution.id);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("Please enter a rejection reason"); return; }
    setLoading(true);
    await onReject(execution.id, rejectReason.trim());
    setLoading(false);
  };

  const submittedAt = execution.proof_submitted_at
    ? new Date(execution.proof_submitted_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-start gap-4 px-5 py-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Camera className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 font-semibold text-sm truncate">
            {sop?.title ?? "Unknown Task"}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {emp ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() || emp.email : "Unknown Staff"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {submittedAt}
            </span>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200/60 flex-shrink-0">
          Awaiting Review
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Location */}
        {(execution.proof_location_name || execution.proof_location_lat) && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              {execution.proof_location_name
                ? execution.proof_location_name
                : `${execution.proof_location_lat?.toFixed(4)}, ${execution.proof_location_lng?.toFixed(4)}`}
            </span>
          </div>
        )}

        {/* Proof image toggle */}
        {execution.proof_image && (
          <div>
            <button
              onClick={() => setShowImage(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {showImage ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showImage ? "Hide proof photo" : "View proof photo"}
            </button>
            <AnimatePresence>
              {showImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                  className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={execution.proof_image}
                    alt="Proof of work"
                    className="w-full object-cover max-h-72"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Rejection reason input */}
        <AnimatePresence>
          {showReject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              className="overflow-hidden">
              <div className="mt-2 space-y-2">
                <label className="text-xs font-semibold text-slate-700">Reason for rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Explain why the proof is insufficient..."
                  rows={2}
                  className="w-full bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-300 resize-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2.5 px-5 pb-4">
        {!showReject ? (
          <>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
              Approve
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 text-sm font-semibold transition-colors disabled:opacity-50">
              <ThumbsDown className="w-4 h-4" />
              Reject
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setShowReject(false); setRejectReason(""); }}
              disabled={loading}
              className="px-4 h-9 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Confirm Rejection
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── New Task Panel ─────────────────────────────────────────

function NewTaskPanel({
  categories, staffUsers, onClose, onSubmit,
}: {
  categories: SOPCategory[]; staffUsers: StaffUser[];
  onClose: () => void; onSubmit: (data: any) => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [staffSearch, setStaffSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredStaff = staffUsers.filter(e =>
    `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase().includes(staffSearch.toLowerCase()) ||
    e.email.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Title is required"); setStep(1); return; }
    if (!categoryId) { setError("Please select a category"); setStep(1); return; }
    setSaving(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      category_id: categoryId,
      priority,
      due_date: dueDate || undefined,
      assigned_user_id: selectedEmployee || undefined,
      status: "pending",
    });
    setSaving(false);
  };

  const priorityOptions: { key: "high" | "medium" | "low"; label: string; color: string }[] = [
    { key: "high", label: "High", color: "#EF4444" },
    { key: "medium", label: "Medium", color: "#F59E0B" },
    { key: "low", label: "Low", color: "#10B981" },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-white z-50 flex flex-col shadow-2xl">

        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-black font-bold text-base">New Task</h2>
              <p className="text-neutral-400 text-xs">Assign to your property's staff</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-black/10 bg-white/50">
          {[{ n: 1 as const, label: "Task Details" }, { n: 2 as const, label: "Assign Staff" }].map(({ n, label }) => (
            <button key={n} onClick={() => setStep(n)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm transition-all relative ${step === n ? "text-black font-semibold" : "text-neutral-400 hover:text-neutral-600"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === n ? "bg-blue-500 text-white" : "bg-black/[0.06] text-neutral-500"}`}>{n}</span>
              {label}
              {step === n && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }} className="p-6 space-y-5">
                <div>
                  <label className="block text-neutral-700 text-sm font-semibold mb-2">Title <span className="text-red-500">*</span></label>
                  <input value={title} onChange={e => { setTitle(e.target.value); setError(""); }}
                    placeholder="e.g. Housekeeping inspection — Floor 1-3"
                    className={`w-full bg-black/[0.03] border rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none transition-all ${error ? "border-red-300" : "border-black/10 focus:border-black/20 focus:ring-2 focus:ring-blue-500/10"}`} />
                  {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
                </div>

                <div>
                  <label className="block text-neutral-700 text-sm font-semibold mb-2">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Add task details or instructions..." rows={3}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none" />
                </div>

                <div>
                  <label className="block text-neutral-700 text-sm font-semibold mb-2">Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                      className="w-full appearance-none bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-blue-500/10 transition-all pr-8">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-neutral-700 text-sm font-semibold mb-2.5">
                    <Flag className="w-3.5 h-3.5 text-neutral-400" /> Priority
                  </label>
                  <div className="flex gap-2.5">
                    {priorityOptions.map(opt => (
                      <button key={opt.key} onClick={() => setPriority(opt.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm transition-all ${priority === opt.key ? "border-current shadow-sm font-bold" : "border-black/10 text-neutral-500 hover:border-black/20"}`}
                        style={{ color: priority === opt.key ? opt.color : undefined }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-neutral-700 text-sm font-semibold mb-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Due Date
                  </label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }} className="p-6 space-y-5">
                <p className="text-neutral-500 text-sm">Optionally assign this task to a staff member. If left unassigned, it will appear as a general SOP.</p>

                {selectedEmployee && (
                  <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                        {staffUsers.find(e => e.id === selectedEmployee)?.first_name?.[0] ?? "?"}
                      </div>
                      <span className="text-blue-900 text-sm font-semibold">
                        {(() => { const e = staffUsers.find(x => x.id === selectedEmployee); return e ? `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() : ""; })()}
                      </span>
                    </div>
                    <button onClick={() => setSelectedEmployee("")} className="text-blue-400 hover:text-blue-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input value={staffSearch} onChange={e => setStaffSearch(e.target.value)}
                    placeholder="Search staff by name or position..."
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl pl-10 pr-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/20 transition-all" />
                </div>

                <div className="space-y-2">
                  <p className="text-neutral-500 text-xs font-medium">{filteredStaff.length} staff member{filteredStaff.length !== 1 ? "s" : ""} available</p>
                  <AnimatePresence>
                    {filteredStaff.map((e, i) => {
                      const isSelected = selectedEmployee === e.id;
                      const initials = `${e.first_name?.[0] ?? ""}${e.last_name?.[0] ?? ""}`.toUpperCase() || "?";
                      return (
                        <motion.button key={e.id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          onClick={() => setSelectedEmployee(isSelected ? "" : e.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${isSelected ? "border-blue-500 bg-blue-50/50" : "border-black/10 bg-black/[0.03] hover:border-black/20"}`}>
                          <div className="w-10 h-10 rounded-xl bg-slate-700 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${isSelected ? "text-black font-bold" : "text-black font-medium"}`}>
                              {`${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || e.email}
                            </p>
                            <p className="text-neutral-500 text-xs mt-0.5">{e.email}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-blue-500 border-blue-500" : "border-slate-300"}`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white fill-white" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 border-t border-black/10 bg-white/50">
          {step === 1 ? (
            <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm font-semibold hover:bg-black/[0.04] transition-colors">Cancel</button>
              <button onClick={() => setStep(2)} disabled={!title.trim() || !categoryId}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                Next: Assign Staff <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm font-semibold hover:bg-black/[0.04] transition-colors">← Back</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-40">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Create Task{selectedEmployee ? " & Assign" : ""}
              </button>
            </div>
          )}
          <p className="text-center text-neutral-400 text-xs mt-2.5">
            {step === 1
              ? `${title.trim() ? "✓ Title set" : "⚠ Title required"}`
              : `${selectedEmployee ? "✓ Staff assigned" : "No assignment (optional)"}`}
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function ManagerTasksPage() {
  const [activeTab, setActiveTab] = useState<"tasks" | "approvals">("tasks");
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<SOPItem[]>([]);
  const [categories, setCategories] = useState<SOPCategory[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [approvals, setApprovals] = useState<SOPExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewTask, setShowNewTask] = useState(false);

  const loadApprovals = useCallback(async () => {
    try {
      const res = await sopAPI.pendingApprovals();
      setApprovals(res.data as SOPExecution[]);
    } catch {
      // silently fail — not critical
    }
  }, []);

  const load = useCallback(async (propId: string) => {
    try {
      const [sopRes, catRes] = await Promise.all([
        sopAPI.listSOPs(propId),
        sopAPI.listCategories(propId),
      ]);
      setTasks(sopRes.data as SOPItem[]);
      setCategories(catRes.data as SOPCategory[]);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load tasks");
    }
    // Load staff separately so a failure here doesn't block task creation
    try {
      const staffRes = await usersAPI.list(propId, "Staff");
      setStaffUsers(staffRes.data as StaffUser[]);
    } catch {
      // Non-critical — staff assignment still optional
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await usersAPI.me();
        const propId = meRes.data.property_id;
        if (!propId) { toast.error("No property assigned to your account"); setLoading(false); return; }
        setPropertyId(propId);
        await Promise.all([load(propId), loadApprovals()]);
      } catch {
        toast.error("Failed to load user info");
      } finally {
        setLoading(false);
      }
    })();
  }, [load, loadApprovals]);

  const handleCreateTask = async (data: any) => {
    if (!propertyId) return;
    try {
      const res = await sopAPI.createSOP(propertyId, data);
      setTasks(prev => [res.data as SOPItem, ...prev]);
      toast.success("Task created");
      setShowNewTask(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create task");
    }
  };

  const updateTaskStatus = async (task: SOPItem, status: string) => {
    try {
      const res = await sopAPI.updateSOP(task.id, { status });
      setTasks(prev => prev.map(t => t.id === task.id ? res.data as SOPItem : t));
      toast.success("Task status updated");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleApprove = async (executionId: string) => {
    try {
      await sopAPI.approveExecution(executionId);
      setApprovals(prev => prev.filter(a => a.id !== executionId));
      toast.success("Task approved and marked as completed");
      if (propertyId) await load(propertyId);
    } catch {
      toast.error("Failed to approve task");
    }
  };

  const handleReject = async (executionId: string, reason: string) => {
    try {
      await sopAPI.rejectExecution(executionId, reason);
      setApprovals(prev => prev.filter(a => a.id !== executionId));
      toast.success("Task rejected. Staff can re-submit proof.");
    } catch {
      toast.error("Failed to reject task");
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Build lookup maps for ProofCard
  const sopMap = new Map(tasks.map(s => [s.id, s]));
  const staffByUserId = new Map(staffUsers.map(u => [u.id, u]));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  const stats = [
    { label: "Total Tasks", value: tasks.length, color: "#3B82F6" },
    { label: "Completed", value: tasks.filter(t => t.status === "completed").length, color: "#10B981" },
    { label: "In Progress", value: tasks.filter(t => t.status === "in_progress").length, color: "#F59E0B" },
    { label: "Pending", value: tasks.filter(t => t.status === "pending").length, color: "#EF4444" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black font-bold" style={{ fontSize: "1.4rem" }}>Task Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Assign, track, and approve operational tasks</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowNewTask(true)} disabled={categories.length === 0}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md disabled:opacity-40"
          title={categories.length === 0 ? "Create a SOP category first" : undefined}>
          <Plus className="w-4 h-4" /> New Task
        </motion.button>
      </div>

      {categories.length === 0 && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">Tasks require a SOP category. Go to <strong>SOP Management</strong> and create a category first.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
            <div className="text-neutral-500 text-sm mb-1">{stat.label}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "tasks" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          All Tasks
        </button>
        <button
          onClick={() => setActiveTab("approvals")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "approvals" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Pending Approvals
          {approvals.length > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-blue-500 text-white flex items-center justify-center">
              {approvals.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "tasks" ? (
          <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Search/filter */}
            <div className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full bg-white/50 border border-black/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/20 transition-all" />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-neutral-500" />
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="bg-white/50 border border-black/10 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black/20 transition-all">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-black/10">
                <h3 className="text-black font-bold">All Tasks ({filteredTasks.length})</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center py-14 text-neutral-400">
                    <FileText className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No tasks found. {tasks.length === 0 ? "Create your first task above." : "Try adjusting filters."}</p>
                  </div>
                ) : (
                  filteredTasks.map((t, i) => {
                    const statusCfg = statusConfig[t.status] ?? statusConfig.pending;
                    const priorityCfg = priorityConfig[t.priority] ?? priorityConfig.medium;
                    const StatusIcon = statusCfg.icon;
                    const assignedEmp = t.assigned_user_id ? staffByUserId.get(t.assigned_user_id) : undefined;

                    return (
                      <motion.div key={t.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-white/60 transition-colors group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: statusCfg.color + "15" }}>
                          <StatusIcon className="w-5 h-5" style={{ color: statusCfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-black text-sm font-semibold">{t.title}</p>
                          <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                            {assignedEmp && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {`${assignedEmp.first_name ?? ""} ${assignedEmp.last_name ?? ""}`.trim() || assignedEmp.email}
                              </span>
                            )}
                            {t.due_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${priorityCfg.bg}`}>{t.priority}</span>
                          <div className="relative">
                            <select value={t.status}
                              onChange={e => updateTaskStatus(t, e.target.value)}
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold border appearance-none cursor-pointer ${statusCfg.bg}`}
                              style={{ paddingRight: "1.5rem" }}>
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Done</option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none opacity-60" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-sm">
                {approvals.length === 0
                  ? "No pending approvals"
                  : `${approvals.length} submission${approvals.length !== 1 ? "s" : ""} waiting for your review`}
              </p>
              <button
                onClick={loadApprovals}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                Refresh
              </button>
            </div>

            {approvals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center py-16 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-1">No proof submissions waiting for approval.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                  {approvals.map(execution => (
                    <ProofCard
                      key={execution.id}
                      execution={execution}
                      sopMap={sopMap}
                      staffByUserId={staffByUserId}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewTask && (
          <NewTaskPanel
            categories={categories}
            staffUsers={staffUsers}
            onClose={() => setShowNewTask(false)}
            onSubmit={handleCreateTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
