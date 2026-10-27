"use client";

import { useState } from "react";
import { Check, ExternalLink, Loader2, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { GeofenceRequest, geofenceAPI } from "@/lib/api/geofence";
import { apiErrorDetail } from "@/lib/api/attendance";

export const fmtCoord = (n: number) => n.toFixed(6);
export const mapsLink = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;

/**
 * Pending punch-location requests with Approve / Reject and an optional
 * note. Approving applies the location immediately (server side). A
 * reviewer's own request can't be reviewed by them.
 */
export function GeofenceRequestReviewList({ requests, currentUserId, highlightId, onChanged }: {
  requests: GeofenceRequest[];
  currentUserId: string | undefined;
  highlightId?: string | null;
  onChanged: () => void;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const review = async (r: GeofenceRequest, action: "approve" | "reject") => {
    setBusy(`${r.id}:${action}`);
    try {
      await (action === "approve" ? geofenceAPI.approve : geofenceAPI.reject)(r.id, notes[r.id]);
      toast.success(action === "approve" ? "Punch location updated" : "Request rejected");
      onChanged();
    } catch (err) {
      toast.error(apiErrorDetail(err, "Could not review the request"));
      onChanged(); // e.g. 409: someone else reviewed it meanwhile
    } finally {
      setBusy(null);
    }
  };

  if (requests.length === 0) {
    return <p className="text-slate-500 text-sm">No pending location requests.</p>;
  }

  return (
    <ul className="space-y-3">
      {requests.map((r) => {
        const own = !!currentUserId && r.requested_by === currentUserId;
        return (
          <li key={r.id}
            className={`rounded-xl border p-4 space-y-3 ${highlightId === r.id ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"}`}>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-slate-950">{r.property_name ?? "Property"}</p>
                <p className="text-slate-500 text-xs">
                  Requested by {r.requested_by_name ?? "a user"} · {new Date(r.created_at).toLocaleString()}
                </p>
                <p className="text-slate-700 mt-1">
                  {fmtCoord(r.center_lat)}, {fmtCoord(r.center_lng)} · radius {r.radius_meters} m
                  {r.address && <> · {r.address}</>}
                  {" "}
                  <a href={mapsLink(r.center_lat, r.center_lng)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-700 text-xs">
                    view on map <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                {r.note && <p className="text-slate-600 text-xs mt-1 whitespace-pre-wrap break-words">Note: {r.note}</p>}
              </div>
            </div>
            {own ? (
              <p className="text-xs text-slate-500">This is your own request; another admin has to review it.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={notes[r.id] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                  maxLength={500}
                  placeholder="Optional note"
                  className="flex-1 min-w-[10rem] text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-300"
                />
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
            )}
          </li>
        );
      })}
    </ul>
  );
}
