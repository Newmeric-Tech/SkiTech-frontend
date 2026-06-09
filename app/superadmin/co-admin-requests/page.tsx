"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, Loader2,
  Building2, Mail, User, X, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { superadminAPI, CoAdminRequest } from "@/lib/api/superadmin";

const STATUS_TABS = ["pending", "approved", "rejected"] as const;
type StatusTab = typeof STATUS_TABS[number];

function statusBadge(status: string) {
  if (status === "pending")
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>;
  if (status === "approved")
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><XCircle className="w-3 h-3" /> Rejected</span>;
}

export default function CoAdminRequestsPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>("pending");
  const [requests, setRequests] = useState<CoAdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<CoAdminRequest | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await superadminAPI.listCoAdminRequests(activeTab);
      setRequests(res.data);
    } catch {
      toast.error("Failed to load co-admin requests");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (req: CoAdminRequest) => {
    if (!confirm(`Approve co-admin access for ${req.proposed_name} (${req.proposed_email})?\n\nAn invite email will be sent immediately.`)) return;
    try {
      setActionId(req.id);
      await superadminAPI.approveCoAdminRequest(req.id);
      toast.success(`Approved — invite sent to ${req.proposed_email}`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to approve request");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      setActionId(rejectModal.id);
      await superadminAPI.rejectCoAdminRequest(rejectModal.id, rejectNote);
      toast.success("Request rejected");
      setRejectModal(null);
      setRejectNote("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to reject request");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          Co-Admin Requests
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">
          Review and approve property co-administrator access requests from tenant owners
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/5 p-1 rounded-lg w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-2">
            <ShieldCheck className="w-10 h-10 opacity-30" />
            <p className="text-sm">No {activeTab} co-admin requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  {["Requested For", "Property", "Tenant", "Requested By", "Date", "Status", ...(activeTab === "pending" ? ["Actions"] : [])].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {requests.map((req, i) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-black/[0.02] transition-colors"
                  >
                    {/* Proposed user */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black">{req.proposed_name}</p>
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {req.proposed_email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Property */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-700">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                        {req.property_name || <span className="text-neutral-400 italic">Unknown</span>}
                      </div>
                    </td>

                    {/* Tenant */}
                    <td className="p-4">
                      <span className="text-sm text-neutral-700">{req.tenant_name || "—"}</span>
                    </td>

                    {/* Requester */}
                    <td className="p-4">
                      <p className="text-sm text-neutral-700">{req.requester_name || "—"}</p>
                      <p className="text-xs text-neutral-400">{req.requester_email}</p>
                    </td>

                    {/* Date */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-500">
                        {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">{statusBadge(req.status)}</td>

                    {/* Actions (pending only) */}
                    {activeTab === "pending" && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={actionId === req.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            {actionId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectModal(req); setRejectNote(""); }}
                            disabled={actionId === req.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Rejection note for rejected tab */}
                    {activeTab === "rejected" && req.superadmin_note && (
                      <td className="p-4">
                        <div className="flex items-start gap-1.5 text-xs text-neutral-500">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-400" />
                          {req.superadmin_note}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-black/10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-black font-bold">Reject Request</h2>
                </div>
                <button onClick={() => setRejectModal(null)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-neutral-600">
                  Rejecting co-admin access for <span className="font-semibold text-black">{rejectModal.proposed_name}</span> ({rejectModal.proposed_email}).
                </p>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Reason (optional)</label>
                  <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    placeholder="e.g. Insufficient information provided"
                    rows={3}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-black/10 flex gap-3">
                <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!!actionId}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
