"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { roomsAPI, LiveBooking, LiveSummary } from "@/lib/api/rooms";

// Roles the backend accepts for PUT /rooms/{id}, bulk-status and booking
// check-out (require_roles in rooms.py; Co Admin inherits Tenant Admin).
const ROOM_MANAGER_ROLES = ["Super Admin", "Tenant Admin", "Co Admin", "Manager"];

export const canManageRooms = (role: string | undefined) => !!role && ROOM_MANAGER_ROLES.includes(role);

export const NO_SOURCE_LABEL = "No source";

export const sourceLabel = (source: string | null | undefined) => source?.trim() || NO_SOURCE_LABEL;

/** Date part of the API's naive timestamp, formatted without a timezone shift. */
export function formatStayDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** Amount in the booking's own currency; no symbol when the currency is unknown. */
export function formatMoney(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return null;
  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
    } catch {
      return `${amount.toLocaleString()} ${currency}`;
    }
  }
  return amount.toLocaleString();
}

/** Current booking per room from GET /rooms/{id}/live-summary. A failure never blocks the rooms list. */
export function useLiveSummary(propertyId: string | null | undefined) {
  const [summary, setSummary] = useState<LiveSummary | null>(null);
  const [failed, setFailed] = useState(false);

  const reload = useCallback(async () => {
    if (!propertyId) return;
    try {
      const res = await roomsAPI.liveSummary(propertyId);
      setSummary(res.data);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [propertyId]);

  useEffect(() => { reload(); }, [reload]);

  const bookingByRoom = useMemo(() => {
    const map = new Map<string, LiveBooking>();
    summary?.rooms.forEach(r => { if (r.current_booking) map.set(r.room_id, r.current_booking); });
    return map;
  }, [summary]);

  return { summary, failed, reload, bookingByRoom };
}
