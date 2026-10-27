"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LiveBooking } from "@/lib/api/rooms";
import { formatMoney, formatStayDate } from "./roomLive";
import { SourceBadge } from "./RoomBookingInfo";

export type RoomStatus = "available" | "occupied" | "maintenance";

export interface DrawerRoom {
  id: string;
  room_number: string;
  room_type: string | null;
  status: RoomStatus;
}

const STATUSES: RoomStatus[] = ["available", "occupied", "maintenance"];

const STATUS_BUTTON: Record<RoomStatus, string> = {
  available: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
  occupied: "border-blue-200 text-blue-700 hover:bg-blue-50",
  maintenance: "border-amber-200 text-amber-700 hover:bg-amber-50",
};

const BOOKING_STATUS_LABEL: Record<string, string> = { booked: "Booked (not checked in)", checked_in: "Checked in" };

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Props {
  room: DrawerRoom | null;
  booking: LiveBooking | null;
  /** Provider label when the room is managed by a channel manager. */
  syncedWith?: string | null;
  canManage: boolean;
  onClose: () => void;
  onStatusChange: (room: DrawerRoom, status: RoomStatus) => Promise<void>;
  onCheckout: (booking: LiveBooking) => Promise<void>;
}

/**
 * Room details and the current booking. Offers only actions with working
 * endpoints: status change (PUT /rooms/{id}, allowed for synced rooms too)
 * and check-out of a checked-in booking. Hidden for roles that can't use them.
 */
export function RoomDetailDrawer({ room, booking, syncedWith, canManage, onClose, onStatusChange, onCheckout }: Props) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    try { await action(); } finally { setBusy(null); }
  };

  const amount = booking ? formatMoney(booking.total_amount, booking.currency) : null;

  return (
    <Sheet open={!!room} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        {room && (
          <>
            <SheetHeader>
              <SheetTitle>Room {room.room_number}</SheetTitle>
              <SheetDescription>
                {room.room_type ?? "No type"} · {capitalize(room.status)}
                {syncedWith && <> · Synced with {syncedWith}</>}
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-6 space-y-6">
              <section className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current booking</h3>
                {booking ? (
                  <div className="rounded-xl border border-slate-200 p-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-slate-950 truncate">{booking.guest_name || "Guest"}</span>
                      <SourceBadge source={booking.booking_source} />
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <dt className="text-slate-500">Check-in</dt>
                      <dd className="text-slate-900">{formatStayDate(booking.check_in)}</dd>
                      <dt className="text-slate-500">Check-out</dt>
                      <dd className="text-slate-900">{formatStayDate(booking.check_out)}</dd>
                      <dt className="text-slate-500">Status</dt>
                      <dd className="text-slate-900">{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</dd>
                      {amount && (
                        <>
                          <dt className="text-slate-500">Total</dt>
                          <dd className="text-slate-900">{amount}</dd>
                        </>
                      )}
                    </dl>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Stay progress</span>
                        <span>{Math.round(booking.stay_progress_pct)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${booking.stay_progress_pct}%` }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No guest is staying in this room right now.</p>
                )}
              </section>

              {booking && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Special requests</h3>
                  {booking.special_requests?.trim() ? (
                    <p className="text-sm text-slate-800 whitespace-pre-wrap break-words rounded-xl bg-slate-50 border border-slate-200 p-3">
                      {booking.special_requests}
                    </p>
                  ) : (
                    <p className="text-slate-500 text-sm">None</p>
                  )}
                </section>
              )}

              {canManage && (
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.filter(s => s !== room.status).map(s => (
                      <button
                        key={s}
                        onClick={() => run(s, () => onStatusChange(room, s))}
                        disabled={!!busy}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50 ${STATUS_BUTTON[s]}`}
                      >
                        {busy === s && <Loader2 className="w-3 h-3 animate-spin" />}
                        Mark {s}
                      </button>
                    ))}
                  </div>
                  {booking?.status === "checked_in" && (
                    <button
                      onClick={() => run("checkout", () => onCheckout(booking))}
                      disabled={!!busy}
                      className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {busy === "checkout" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                      Check out guest
                    </button>
                  )}
                  {syncedWith && (
                    <p className="text-slate-500 text-xs">
                      Room number and type are managed in {syncedWith}; status can still be changed here.
                    </p>
                  )}
                </section>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
