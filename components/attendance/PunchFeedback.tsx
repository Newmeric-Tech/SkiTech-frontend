"use client";

import { AlertTriangle, X } from "lucide-react";
import { AttendanceRecord, PunchStatusResponse, fmtShiftHours, needsReview, recordStatus } from "@/lib/api/attendance";

export function NeedsReviewTag() {
  return (
    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md border font-medium bg-amber-50 text-amber-700 border-amber-200/60">
      needs review
    </span>
  );
}

/** Hours of a record; "—" with a needs-review tag when they can't be trusted. */
export function RecordHours({ r }: { r: Pick<AttendanceRecord, "status" | "hours_worked"> }) {
  if (needsReview(r)) return <>—<NeedsReviewTag /></>;
  return <>{fmtShiftHours(r.hours_worked)}</>;
}

export function RecordStatusBadge({ status, className = "px-2 py-1" }: { status: string; className?: string }) {
  const s = recordStatus(status);
  return <span className={`text-xs rounded-full ${className} ${s.className}`}>{s.label}</span>;
}

export interface PunchError {
  title: string;
  message: string;
}

/** A punch the server refused, or a punch-out the status check contradicts. */
export function PunchErrorBox({ error, onDismiss }: { error: PunchError; onDismiss: () => void }) {
  return (
    <div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">{error.title}</p>
        <p className="text-xs text-red-700 mt-0.5">{error.message}</p>
      </div>
      <button onClick={onDismiss} aria-label="Dismiss"
        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors shrink-0">
        <X className="w-3.5 h-3.5 text-red-500" />
      </button>
    </div>
  );
}

/** An open record older than 16 h that the next punch closes without hours. */
export function StaleShiftNotice({ shift, approver }: {
  shift: NonNullable<PunchStatusResponse["stale_shift"]>;
  approver: string;
}) {
  const when = new Date(shift.punch_in_time);
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200/60 rounded-xl p-4">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-800">Open shift needs review</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Your shift from {when.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{" "}
          {when.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} was never punched out.
          It will be closed without hours when you punch in. Ask {approver} to correct it.
        </p>
      </div>
    </div>
  );
}

export const STILL_ON_SHIFT_ERROR: PunchError = {
  title: "Still shown as on shift",
  message: "Your punch-out went through, but the server still shows you on shift. Refresh the page; if it persists, ask your manager to check your attendance.",
};
