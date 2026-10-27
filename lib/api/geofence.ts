/**
 * Punch location (geofence) API — lib/api/geofence.ts
 *
 * Super Admin / Tenant Admin / Co Admin set a property's punch location
 * directly; a Manager can only send a change request that an admin must
 * approve (/v1/attendance/geofence-requests).
 */
import api from "@/lib/config/app";

export interface Geofence {
  id: string;
  property_id: string;
  tenant_id: string;
  property_name: string | null;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  address: string | null;
  city: string | null;
  country: string | null;
  alert_on_breach: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeofenceInput {
  property_id: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  address?: string | null;
}

export type GeofenceRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface GeofenceRequest {
  id: string;
  tenant_id: string;
  property_id: string;
  property_name: string | null;
  requested_by: string | null;
  requested_by_name: string | null;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  address: string | null;
  note: string | null;
  status: GeofenceRequestStatus;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
}

/** Server limits (PropertyGeofenceCreate / GeofenceChangeRequestCreate). */
export const RADIUS_MIN = 20;
export const RADIUS_MAX = 2000;

/** Roles that change the punch location directly (backend GEOFENCE_ADMIN_ROLES). */
export const GEOFENCE_ADMIN_ROLES = ["Super Admin", "Tenant Admin", "Co Admin"];
export const isGeofenceAdmin = (role: string | undefined) => !!role && GEOFENCE_ADMIN_ROLES.includes(role);

export const geofenceAPI = {
  /** The property's live punch location, or null when none is set yet (404). */
  get: async (propertyId: string): Promise<Geofence | null> => {
    try {
      const { data } = await api.get<Geofence>(`/v1/attendance/geofence/${propertyId}`);
      return data;
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
      throw err;
    }
  },

  /** Direct change (admins only): creates the geofence, or updates the existing one. */
  save: async (input: GeofenceInput, existing: Geofence | null): Promise<Geofence> => {
    const payload = { ...input, address: input.address || null };
    const { data } = existing
      ? await api.put<Geofence>(`/v1/attendance/geofence/${existing.id}`, payload)
      : await api.post<Geofence>("/v1/attendance/geofence", payload);
    return data;
  },

  listRequests: async (params: { status?: GeofenceRequestStatus; property_id?: string } = {}) => {
    const { data } = await api.get<GeofenceRequest[]>("/v1/attendance/geofence-requests", { params });
    return data;
  },

  createRequest: async (input: GeofenceInput & { note?: string | null }) => {
    const { data } = await api.post<GeofenceRequest>("/v1/attendance/geofence-requests", {
      ...input, address: input.address || null, note: input.note || null,
    });
    return data;
  },

  approve: async (id: string, reviewNote?: string) =>
    (await api.post<GeofenceRequest>(`/v1/attendance/geofence-requests/${id}/approve`,
      { review_note: reviewNote || null })).data,

  reject: async (id: string, reviewNote?: string) =>
    (await api.post<GeofenceRequest>(`/v1/attendance/geofence-requests/${id}/reject`,
      { review_note: reviewNote || null })).data,

  cancel: async (id: string) =>
    (await api.post<GeofenceRequest>(`/v1/attendance/geofence-requests/${id}/cancel`)).data,
};
