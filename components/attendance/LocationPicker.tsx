"use client";

import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import type { LatLng } from "./LocationPickerMap";

// Leaflet needs window: load the map in the browser only.
const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

/**
 * Map picker for a punch location: click/tap or drag the marker to set the
 * point; the circle shows the radius. The latitude/longitude/radius inputs
 * around it stay the source of truth (and the keyboard fallback): pass the
 * parsed values in and update them from onPick.
 */
export function LocationPicker({ lat, lng, radius, onPick }: {
  lat: number | null;
  lng: number | null;
  radius: number;
  onPick: (lat: number, lng: number) => void;
}) {
  const point = useMemo<LatLng | null>(() => (lat != null && lng != null ? { lat, lng } : null), [lat, lng]);
  const pick = useCallback((p: LatLng) => onPick(p.lat, p.lng), [onPick]);
  return (
    <div className="space-y-1">
      <LocationPickerMap point={point} radius={radius} onPick={pick} />
      <p className="text-[11px] text-slate-400">
        Click or tap the map to place the point, or drag the marker. You can also type the coordinates below.
      </p>
    </div>
  );
}
