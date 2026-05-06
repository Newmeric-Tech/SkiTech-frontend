"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

interface LocationData {
  latitude: number;
  longitude: number;
  name?: string;
}

interface LocationDisplayProps {
  onLocationCapture: (location: LocationData | null) => void;
  disabled?: boolean;
}

export function LocationDisplay({ onLocationCapture, disabled }: LocationDisplayProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Here we could add reverse geocoding to get "Ahmedabad, Gujarat"
        // For now using placeholder or just passing coords
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          name: "Ahmedabad, Gujarat" // Mock reverse geocode
        };
        setLocation(newLocation);
        onLocationCapture(newLocation);
        setIsLoading(false);
      },
      (err) => {
        setError("Failed to get location");
        onLocationCapture(null);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationCapture]);

  useEffect(() => {
    if (!disabled) {
      fetchLocation();
    }
  }, [disabled, fetchLocation]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-slate-900 rounded-full" />
        <h3 className="text-lg font-bold text-slate-900">Geotag Data</h3>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900">Location</h4>
          {isLoading ? (
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Fetching coords...
            </p>
          ) : error ? (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          ) : location ? (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Coord: {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}