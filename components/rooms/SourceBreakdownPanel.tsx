"use client";

import { PieChart } from "lucide-react";
import { LiveSummary } from "@/lib/api/rooms";
import { sourceLabel } from "./roomLive";

/** Active-booking counts per booking_source, whatever sources the bookings carry. */
export function SourceBreakdownPanel({ summary, failed }: { summary: LiveSummary | null; failed: boolean }) {
  const total = summary?.active_bookings ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <PieChart className="w-4 h-4 text-slate-400" />
        <h2 className="text-slate-950 text-sm font-semibold">Active bookings by source</h2>
        {summary && <span className="ml-auto text-slate-400 text-xs">{total} active</span>}
      </div>

      {!summary ? (
        <p className="text-slate-400 text-sm">{failed ? "Couldn't load booking sources." : "Loading…"}</p>
      ) : total === 0 ? (
        <p className="text-slate-500 text-sm">No active bookings right now.</p>
      ) : (
        <ul className="space-y-2.5">
          {summary.source_counts.map(({ source, count }) => (
            <li key={source ?? ""} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={source ? "text-slate-700 font-medium truncate" : "text-slate-400 italic"}>
                  {sourceLabel(source)}
                </span>
                <span className="text-slate-500 tabular-nums">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(count / total) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
