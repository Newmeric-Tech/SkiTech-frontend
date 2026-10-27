"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { GeofenceRequest, geofenceAPI } from "@/lib/api/geofence";
import { propertiesAPI } from "@/lib/api/properties";
import { GeofenceRequestReviewList } from "@/components/attendance/GeofenceRequestReviewList";
import { PunchLocationSection } from "@/components/attendance/PunchLocation";

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
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [propertyId, setPropertyId] = useState("");
  // Bumped after a review so the property section reloads its live location
  const [refreshKey, setRefreshKey] = useState(0);

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

  useEffect(() => {
    let cancelled = false;
    propertiesAPI.list().then((res) => {
      if (cancelled) return;
      let list = (Array.isArray(res.data) ? res.data : []).map((p) => ({ id: p.id, name: p.name }));
      // A Co Admin manages one property (the server enforces it as well)
      if (user?.role === "Co Admin" && user.property_id) list = list.filter((p) => p.id === user.property_id);
      setProperties(list);
      setPropertyId((current) => current || list[0]?.id || "");
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.role, user?.property_id]);

  const afterReview = useCallback(() => {
    loadPending();
    setRefreshKey((n) => n + 1);
  }, [loadPending]);

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
            onChanged={afterReview}
          />
        )}
      </section>

      <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Building2 className="w-4 h-4 text-slate-400" />
          <h2 className="text-slate-950 text-sm font-semibold">Property</h2>
          {properties.length > 1 ? (
            <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}
              className="ml-2 text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          ) : (
            <span className="ml-2 text-sm text-slate-700">{properties[0]?.name ?? "No properties yet"}</span>
          )}
        </div>
        {propertyId && (
          <PunchLocationSection
            propertyId={propertyId}
            mode="direct"
            currentUserId={user?.user_id}
            refreshKey={refreshKey}
            onChanged={loadPending}
          />
        )}
      </section>
    </div>
  );
}
