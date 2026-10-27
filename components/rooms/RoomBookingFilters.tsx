"use client";

import { LiveBooking, LiveSummary } from "@/lib/api/rooms";
import { sourceLabel } from "./roomLive";

export const ALL_SOURCES = "all";
const NO_SOURCE_KEY = "__none__";

export interface BookingFilters {
  source: string; // ALL_SOURCES, a booking_source, or NO_SOURCE_KEY
  specialRequestsOnly: boolean;
}

export const EMPTY_BOOKING_FILTERS: BookingFilters = { source: ALL_SOURCES, specialRequestsOnly: false };

const sourceKey = (source: string | null | undefined) => source?.trim() || NO_SOURCE_KEY;

/** Whether a room with this current booking (or none) passes the booking filters. */
export function matchesBookingFilters(booking: LiveBooking | undefined, filters: BookingFilters) {
  if (filters.specialRequestsOnly && !booking?.special_requests?.trim()) return false;
  if (filters.source !== ALL_SOURCES && (!booking || sourceKey(booking.booking_source) !== filters.source)) return false;
  return true;
}

/** Source (from the sources of current bookings) and "Has special requests" filters. */
export function RoomBookingFilters({ summary, value, onChange }: {
  summary: LiveSummary | null;
  value: BookingFilters;
  onChange: (value: BookingFilters) => void;
}) {
  const sources = (summary?.source_counts ?? []).map(c => c.source);
  // Keep a selected source listed after its last active booking ends, so the
  // active filter stays visible and can be cleared.
  if (value.source !== ALL_SOURCES && !sources.some(s => sourceKey(s) === value.source)) {
    sources.push(value.source === NO_SOURCE_KEY ? null : value.source);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        Source:
        <select
          value={value.source}
          onChange={e => onChange({ ...value, source: e.target.value })}
          className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
        >
          <option value={ALL_SOURCES}>All</option>
          {sources.map(source => (
            <option key={sourceKey(source)} value={sourceKey(source)}>{sourceLabel(source)}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
        <input
          type="checkbox"
          checked={value.specialRequestsOnly}
          onChange={e => onChange({ ...value, specialRequestsOnly: e.target.checked })}
          className="w-3.5 h-3.5 rounded accent-indigo-600"
        />
        Has special requests
      </label>
    </div>
  );
}
