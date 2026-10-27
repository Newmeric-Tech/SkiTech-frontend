"use client";

import { LiveBooking } from "@/lib/api/rooms";
import { formatStayDate, sourceLabel } from "./roomLive";

/** Guest, source and stay dates for a room card; progress bar only for an occupied room. */
export function RoomBookingInfo({ booking, occupied }: { booking: LiveBooking; occupied: boolean }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-slate-900 text-xs font-semibold truncate" title={booking.guest_name ?? undefined}>
          {booking.guest_name || "Guest"}
        </span>
        <SourceBadge source={booking.booking_source} />
      </div>
      <p className="text-slate-500 text-[11px]">
        {formatStayDate(booking.check_in)} → {formatStayDate(booking.check_out)}
      </p>
      {occupied && (
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" title={`${booking.stay_progress_pct}% of stay elapsed`}>
          <div className="h-full rounded-full bg-blue-500" style={{ width: `${booking.stay_progress_pct}%` }} />
        </div>
      )}
    </div>
  );
}

export function SourceBadge({ source }: { source: string | null }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-md border font-medium bg-slate-50 text-slate-600 border-slate-200 whitespace-nowrap max-w-[8rem] truncate">
      {sourceLabel(source)}
    </span>
  );
}
