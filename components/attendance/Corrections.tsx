"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { AttendanceRecord, apiErrorDetail, fmtShiftHours } from "@/lib/api/attendance";
import { CorrectionRequest, MAX_CORRECTION_HOURS, correctionsAPI } from "@/lib/api/attendance-corrections";

/** A Date as the value of an <input type="datetime-local"> (local time, minutes). */
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * On a shift that was closed without a punch-out: "Request correction"
 * (or the pending request's state). Renders nothing for other shifts.
 */
export function CorrectionAction({ record, pending, onChanged }: {
  record: AttendanceRecord;
  pending: CorrectionRequest | undefined;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  if (record.status !== "auto_closed") return null;
  if (pending) {
    return (
      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md border font-medium bg-indigo-50 text-indigo-700 border-indigo-200/60"
        title={`Claimed punch-out ${fmtDateTime(pending.claimed_punch_out_time)}`}>
        correction pending
      </span>
    );
  }

  const punchIn = new Date(record.punch_in_time);
  const latest = new Date(Math.min(punchIn.getTime() + MAX_CORRECTION_HOURS * 3600_000, Date.now()));
  const chosen = when ? new Date(when) : null;
  const valid = !!chosen && chosen > punchIn && chosen <= latest && reason.trim().length >= 3;

  const submit = async () => {
    if (!chosen || !valid) return;
    setSaving(true);
    try {
      await correctionsAPI.create(record.id, chosen, reason.trim());
      toast.success("Correction sent for approval");
      setOpen(false);
      setReason("");
      setWhen("");
      onChanged();
    } catch (err) {
      toast.error(apiErrorDetail(err, "Could not send the correction"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md border font-medium bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50">
        Request correction
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a punch-out correction</DialogTitle>
            <DialogDescription>
              You punched in {fmtDateTime(record.punch_in_time)} but no punch-out was recorded.
              Enter when you actually left (within {MAX_CORRECTION_HOURS} hours of punching in).
              It counts only after approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-600 space-y-1">
              <span>Punch-out time</span>
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)}
                min={toLocalInput(punchIn)} max={toLocalInput(latest)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            {chosen && chosen > punchIn && (
              <p className="text-xs text-slate-500">
                That is {fmtShiftHours(Math.round(((chosen.getTime() - punchIn.getTime()) / 3600_000) * 100) / 100)}.
              </p>
            )}
            <label className="block text-xs font-medium text-slate-600 space-y-1">
              <span>Reason</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={3}
                placeholder="e.g. Phone battery died before I could punch out"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
          </div>
          <DialogFooter>
            <button onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={submit} disabled={!valid || saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white text-sm font-semibold disabled:opacity-50">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Send for approval
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Pending corrections the viewer may review, with Approve / Reject + optional note. */
export function CorrectionReviewList({ requests, currentUserId, highlightId, onChanged }: {
  requests: CorrectionRequest[];
  currentUserId: string | undefined;
  highlightId?: string | null;
  onChanged: () => void;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const reviewable = requests.filter((r) => r.status === "pending" && r.requested_by !== currentUserId);

  const review = async (r: CorrectionRequest, action: "approve" | "reject") => {
    setBusy(`${r.id}:${action}`);
    try {
      await (action === "approve" ? correctionsAPI.approve : correctionsAPI.reject)(r.id, notes[r.id]);
      toast.success(action === "approve" ? "Shift corrected" : "Correction rejected");
    } catch (err) {
      toast.error(apiErrorDetail(err, "Could not review the correction"));
    } finally {
      setBusy(null);
      onChanged();
    }
  };

  if (reviewable.length === 0) return <p className="text-slate-500 text-sm">No pending punch-out corrections.</p>;
  return (
    <ul className="space-y-3">
      {reviewable.map((r) => (
        <li key={r.id}
          className={`rounded-xl border p-4 space-y-3 ${highlightId === r.id ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"}`}>
          <div className="text-sm">
            <p className="font-semibold text-slate-950">
              {r.requested_by_name ?? "A user"} <span className="text-slate-400 font-normal">({r.requester_role})</span>
              {r.property_name && <span className="text-slate-500 font-normal"> · {r.property_name}</span>}
            </p>
            <p className="text-slate-700">
              {r.punch_in_time ? fmtDateTime(r.punch_in_time) : "Punch-in"} → {fmtDateTime(r.claimed_punch_out_time)}
              {r.claimed_hours != null && <span className="text-slate-500"> · {fmtShiftHours(r.claimed_hours)}</span>}
            </p>
            <p className="text-slate-600 text-xs mt-1 whitespace-pre-wrap break-words">Reason: {r.reason}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input value={notes[r.id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
              maxLength={500} placeholder="Optional note"
              className="flex-1 min-w-[10rem] text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-300" />
            <button onClick={() => review(r, "approve")} disabled={!!busy}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy === `${r.id}:approve` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Approve
            </button>
            <button onClick={() => review(r, "reject")} disabled={!!busy}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50">
              {busy === `${r.id}:reject` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
