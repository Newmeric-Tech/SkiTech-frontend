"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { GeofenceRequest, geofenceAPI } from "@/lib/api/geofence";
import { GeofenceRequestReviewList } from "@/components/attendance/GeofenceRequestReviewList";

export default function OwnerPunchLocationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Loading…</div>}>
      <PunchLocations />
    </Suspense>
  );
}

function PunchLocations() {
  const { user } = useAuthStore();
  const highlightId = useSearchParams().get("highlight");
  const [pending, setPending] = useState<GeofenceRequest[] | null>(null);
  const [failed, setFailed] = useState(false);

  const loadPending = useCallback(async () => {
    try {
      setPending(await geofenceAPI.listRequests({ status: "pending" }));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    geofenceAPI.listRequests({ status: "pending" })
      .then((rows) => { if (!cancelled) { setPending(rows); setFailed(false); } })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Punch Locations</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Where staff and managers may punch in and out. Managers can propose a change; it takes effect only once you approve it.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <h2 className="text-slate-950 text-sm font-semibold">Pending location requests</h2>
          {pending && pending.length > 0 && (
            <span className="ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {pending.length}
            </span>
          )}
        </div>
        {pending === null ? (
          <p className="text-slate-400 text-sm">{failed ? "Couldn't load requests." : "Loading…"}</p>
        ) : (
          <GeofenceRequestReviewList
            requests={pending}
            currentUserId={user?.user_id}
            highlightId={highlightId}
            onChanged={loadPending}
          />
        )}
      </section>
    </div>
  );
}
