"use client";

/**
 * Leaflet map for LocationPicker. Client-only: loaded through next/dynamic
 * with ssr: false (Leaflet touches window on import). OpenStreetMap tiles
 * with their required attribution.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export interface LatLng {
  lat: number;
  lng: number;
}

// Neutral world view used only when there is no point and no permitted
// device location; not the location of any place.
const WORLD_VIEW = { center: [20, 0] as [number, number], zoom: 2 };
const POINT_ZOOM = 17;

// CSS-only marker: Leaflet's default icon loads PNGs by relative path, which
// bundlers break.
const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border-radius:9999px;background:#4f46e5;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function ClickToPick({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Keeps the point in view when it changes from the inputs or geolocation. */
function FollowPoint({ point }: { point: LatLng | null }) {
  const map = useMap();
  const hadPoint = useRef(point !== null);
  useEffect(() => {
    if (!point) return;
    const target = L.latLng(point.lat, point.lng);
    if (!hadPoint.current) {
      map.setView(target, POINT_ZOOM);  // first point: zoom in to it
      hadPoint.current = true;
    } else if (!map.getBounds().contains(target)) {
      map.panTo(target);
    }
  }, [map, point]);
  return null;
}

/** With no point yet: centre on the device position, but only if already permitted. */
function CenterOnPermittedLocation({ enabled }: { enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation || !navigator.permissions) return;
    let cancelled = false;
    navigator.permissions.query({ name: "geolocation" }).then((status) => {
      if (cancelled || status.state !== "granted") return;
      navigator.geolocation.getCurrentPosition(
        (pos) => { if (!cancelled) map.setView([pos.coords.latitude, pos.coords.longitude], 15); },
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
      );
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [enabled, map]);
  return null;
}

export default function LocationPickerMap({ point, radius, onPick }: {
  point: LatLng | null;
  radius: number;
  onPick: (p: LatLng) => void;
}) {
  // Initial view only (captured once); later changes go through FollowPoint
  const [initial] = useState(point);
  const isTouch = useMemo(() => L.Browser.mobile || L.Browser.touch, []);

  const markerHandlers = useMemo(() => ({
    dragend(e: L.LeafletEvent) {
      const ll = (e.target as L.Marker).getLatLng();
      onPick({ lat: ll.lat, lng: ll.lng });
    },
  }), [onPick]);

  return (
    <MapContainer
      center={initial ? [initial.lat, initial.lng] : WORLD_VIEW.center}
      zoom={initial ? POINT_ZOOM : WORLD_VIEW.zoom}
      // Don't trap page scrolling: no wheel zoom, and no one-finger map pan
      // on touch screens (tap to set, drag the marker, pinch or +/- to zoom)
      scrollWheelZoom={false}
      dragging={!isTouch}
      className="h-64 w-full rounded-xl border border-slate-200 z-0"
      aria-label="Map: click or tap to set the punch location, or drag the marker"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPick onPick={onPick} />
      <FollowPoint point={point} />
      <CenterOnPermittedLocation enabled={!initial} />
      {point && (
        <>
          <Marker position={[point.lat, point.lng]} icon={markerIcon} draggable eventHandlers={markerHandlers}
            keyboard={false} />
          <Circle center={[point.lat, point.lng]} radius={radius}
            pathOptions={{ color: "#4f46e5", fillColor: "#6366f1", fillOpacity: 0.15, weight: 2 }} />
        </>
      )}
    </MapContainer>
  );
}
