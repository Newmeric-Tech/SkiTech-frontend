"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, LocateFixed, MapPin } from "lucide-react";
import { toast } from "sonner";
import { apiErrorDetail, getCurrentPosition, MAX_GPS_ACCURACY_METERS } from "@/lib/api/attendance";
import {
  Geofence, GeofenceRequest, GeofenceRequestStatus, geofenceAPI, RADIUS_MAX, RADIUS_MIN,
} from "@/lib/api/geofence";
import { fmtCoord, mapsLink } from "./GeofenceRequestReviewList";
import { LocationPicker } from "./LocationPicker";

/** The property's live punch location, or a "not set" notice. */
export function CurrentPunchLocation({ geofence }: { geofence: Geofence | null }) {
  if (!geofence) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-3">
        No punch location is set for this property yet, so punches are refused until one is set.
      </p>
    );
  }
  return (
    <div className="flex items-start gap-3 text-sm">
      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-slate-950 font-medium">
          {fmtCoord(geofence.center_lat)}, {fmtCoord(geofence.center_lng)} · radius {geofence.radius_meters} m
        </p>
        {geofence.address && <p className="text-slate-500 text-xs mt-0.5">{geofence.address}</p>}
        <a href={mapsLink(geofence.center_lat, geofence.center_lng)} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-700 text-xs mt-0.5">
          view on map <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-300";

/**
 * Propose (mode "request") or set (mode "direct", admins only) a property's
 * punch location. No map: coordinates come from the device or are typed in.
 */
type FormProps = {
  propertyId: string;
  current: Geofence | null;
  mode: "direct" | "request";
  onSaved: () => void;
};

export function PunchLocationForm(props: FormProps) {
  // Re-keyed so the inputs reset when the property or its live location changes
  return <PunchLocationFormInner key={`${props.propertyId}:${props.current?.updated_at ?? "none"}`} {...props} />;
}

function PunchLocationFormInner({ propertyId, current, mode, onSaved }: FormProps) {
  const [lat, setLat] = useState(current ? String(current.center_lat) : "");
  const [lng, setLng] = useState(current ? String(current.center_lng) : "");
  const [radius, setRadius] = useState(current?.radius_meters ?? 200);
  const [address, setAddress] = useState(current?.address ?? "");
  const [note, setNote] = useState("");
  const [locating, setLocating] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setLat(pos.latitude.toFixed(6));
      setLng(pos.longitude.toFixed(6));
      setAccuracy(pos.accuracy ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Location unavailable");
    } finally {
      setLocating(false);
    }
  };

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const latOk = lat.trim() !== "" && Number.isFinite(latNum) && latNum >= -90 && latNum <= 90;
  const lngOk = lng.trim() !== "" && Number.isFinite(lngNum) && lngNum >= -180 && lngNum <= 180;
  const radiusOk = radius >= RADIUS_MIN && radius <= RADIUS_MAX;
  const pickOnMap = useCallback((pickedLat: number, pickedLng: number) => {
    setLat(pickedLat.toFixed(6));
    setLng(pickedLng.toFixed(6));
    setAccuracy(null);  // picked by hand, not from the device
  }, []);
  const valid = lat.trim() !== "" && lng.trim() !== "" && Number.isFinite(latNum) && Number.isFinite(lngNum)
    && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180
    && radius >= RADIUS_MIN && radius <= RADIUS_MAX;

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    const input = { property_id: propertyId, center_lat: latNum, center_lng: lngNum, radius_meters: radius,
                    address: address.trim() || null };
    try {
      if (mode === "direct") {
        await geofenceAPI.save(input, current);
        toast.success("Punch location saved");
      } else {
        await geofenceAPI.createRequest({ ...input, note: note.trim() || null });
        toast.success("Request sent to your owner");
        setNote("");
      }
      onSaved();
    } catch (err) {
      toast.error(apiErrorDetail(err, mode === "direct" ? "Could not save the location" : "Could not send the request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <button type="button" onClick={useMyLocation} disabled={locating}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50">
        {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
        Use my current location
      </button>
      {accuracy != null && (
        <p className={`text-xs ${accuracy > MAX_GPS_ACCURACY_METERS ? "text-amber-700" : "text-slate-500"}`}>
          Device accuracy ±{Math.round(accuracy)} m.
          {accuracy > MAX_GPS_ACCURACY_METERS && " That is too imprecise to mark the property: stand at the property with a phone and try again, or type the coordinates."}
        </p>
      )}

      <LocationPicker
        lat={latOk && lngOk ? latNum : null}
        lng={latOk && lngOk ? lngNum : null}
        radius={radiusOk ? radius : RADIUS_MIN}
        onPick={pickOnMap}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-medium text-slate-600 space-y-1">
          <span>Latitude</span>
          <input value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" placeholder="-90 to 90" className={inputClass} />
        </label>
        <label className="text-xs font-medium text-slate-600 space-y-1">
          <span>Longitude</span>
          <input value={lng} onChange={(e) => setLng(e.target.value)} inputMode="decimal" placeholder="-180 to 180" className={inputClass} />
        </label>
      </div>

      <label className="block text-xs font-medium text-slate-600 space-y-1">
        <span>Radius: {radius} m</span>
        <div className="flex items-center gap-3">
          <input type="range" min={RADIUS_MIN} max={RADIUS_MAX} step={10} value={radius}
            onChange={(e) => setRadius(Number(e.target.value))} className="flex-1 accent-indigo-600" />
          <input type="number" min={RADIUS_MIN} max={RADIUS_MAX} value={radius}
            onChange={(e) => setRadius(Number(e.target.value))} className={`${inputClass} w-24`} />
        </div>
        <span className="text-slate-400 font-normal">Between {RADIUS_MIN} and {RADIUS_MAX} m.</span>
      </label>

      <label className="block text-xs font-medium text-slate-600 space-y-1">
        <span>Address (optional)</span>
        <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={255} className={inputClass} />
      </label>

      {mode === "request" && (
        <label className="block text-xs font-medium text-slate-600 space-y-1">
          <span>Note for your owner (optional)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} className={inputClass} />
        </label>
      )}

      {mode === "request" && (
        <p className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200/60 rounded-xl px-3 py-2">
          Your owner must approve before this takes effect. Until then punches use the current location.
        </p>
      )}

      <button onClick={submit} disabled={!valid || saving}
        className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {mode === "direct" ? "Save punch location" : "Send request"}
      </button>
    </div>
  );
}

const STATUS_STYLE: Record<GeofenceRequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  rejected: "bg-red-50 text-red-700 border-red-200/60",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200/60",
};

/** Past and pending requests; the requester can cancel their own pending one. */
export function GeofenceRequestHistory({ requests, currentUserId, onChanged }: {
  requests: GeofenceRequest[];
  currentUserId: string | undefined;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const cancel = async (id: string) => {
    setBusy(id);
    try {
      await geofenceAPI.cancel(id);
      toast.success("Request cancelled");
    } catch (err) {
      toast.error(apiErrorDetail(err, "Could not cancel the request"));
    } finally {
      setBusy(null);
      onChanged();
    }
  };

  if (requests.length === 0) return <p className="text-slate-500 text-sm">No location requests yet.</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {requests.map((r) => (
        <li key={r.id} className="py-3 flex items-start gap-3 text-sm">
          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLE[r.status]}`}>
            {r.status}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900">
              {fmtCoord(r.center_lat)}, {fmtCoord(r.center_lng)} · {r.radius_meters} m
              {r.address && <span className="text-slate-500"> · {r.address}</span>}
            </p>
            <p className="text-slate-400 text-xs">
              {new Date(r.created_at).toLocaleString()}
              {r.requested_by_name && <> · by {r.requested_by_name}</>}
              {r.reviewed_at && <> · {r.status} {new Date(r.reviewed_at).toLocaleString()}{r.reviewed_by_name && <> by {r.reviewed_by_name}</>}</>}
            </p>
            {r.note && <p className="text-slate-600 text-xs break-words">Note: {r.note}</p>}
            {r.review_note && <p className="text-slate-600 text-xs break-words">Reply: {r.review_note}</p>}
          </div>
          {r.status === "pending" && currentUserId && r.requested_by === currentUserId && (
            <button onClick={() => cancel(r.id)} disabled={busy === r.id}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              {busy === r.id ? "…" : "Cancel"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Everything about one property's punch location: the live one, the form
 * (direct for admins, request for managers) and the request history.
 */
export function PunchLocationSection({ propertyId, mode, currentUserId, refreshKey = 0, onChanged }: {
  propertyId: string;
  mode: "direct" | "request";
  currentUserId: string | undefined;
  refreshKey?: number;
  onChanged?: () => void;
}) {
  const [geofence, setGeofence] = useState<Geofence | null>(null);
  const [requests, setRequests] = useState<GeofenceRequest[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([geofenceAPI.get(propertyId), geofenceAPI.listRequests({ property_id: propertyId })])
      .then(([g, rows]) => {
        if (cancelled) return;
        setGeofence(g);
        setRequests(rows);
        setState("ready");
      })
      .catch(() => { if (!cancelled) setState("failed"); });
    return () => { cancelled = true; };
  }, [propertyId, reload, refreshKey]);

  const changed = useCallback(() => {
    setReload((n) => n + 1);
    onChanged?.();
  }, [onChanged]);

  if (state === "loading") return <p className="text-slate-400 text-sm">Loading…</p>;
  if (state === "failed") return <p className="text-red-600 text-sm">Couldn&apos;t load the punch location.</p>;

  const pending = requests.find((r) => r.status === "pending");
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current location</h3>
        <CurrentPunchLocation geofence={geofence} />
        {pending && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-2">
            A change is waiting for approval: {fmtCoord(pending.center_lat)}, {fmtCoord(pending.center_lng)} · {pending.radius_meters} m
            {pending.requested_by_name && <> (requested by {pending.requested_by_name})</>}.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {mode === "direct" ? "Set location" : "Propose a new location"}
        </h3>
        <PunchLocationForm propertyId={propertyId} current={geofence} mode={mode} onSaved={changed} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Requests</h3>
        <GeofenceRequestHistory requests={requests} currentUserId={currentUserId} onChanged={changed} />
      </div>
    </div>
  );
}
