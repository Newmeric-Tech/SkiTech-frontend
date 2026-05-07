import api from "@/lib/config/app";

// ── Types ──────────────────────────────────────────────────

export interface GeolocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface PunchInResponse {
  success: boolean;
  message: string;
  attendance_id: string;
  is_within_fence: boolean;
  distance_meters: number | null;
  warning: string | null;
}

export interface PunchOutResponse {
  success: boolean;
  message: string;
  attendance_id: string;
  hours_worked: number;
  is_within_fence: boolean;
  distance_meters: number | null;
  warning: string | null;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
  punch_in_time: string;
  punch_in_lat: number;
  punch_in_lon: number;
  punch_in_acc: number | null;
  is_within_fence: boolean;
  distance_meters: number | null;
  punch_out_time: string | null;
  punch_out_lat: number | null;
  punch_out_lon: number | null;
  hours_worked: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PunchStatusResponse {
  punched_in: boolean;
  message?: string;
  attendance_id?: string;
  punch_in_time?: string;
  hours_so_far?: number;
  is_within_fence?: boolean;
  punch_in_location?: { latitude: number; longitude: number };
}

export interface DailySummaryResponse {
  date: string;
  total_records: number;
  total_hours_worked: number;
  within_fence_count: number;
  outside_fence_count: number;
}

export interface AttendanceHistoryResponse {
  total: number;
  count: number;
  records: AttendanceRecord[];
  page_info: { skip: number; limit: number; has_more: boolean };
}

export interface PropertyAttendanceEntry {
  user_id: string;
  user_name: string;
  punch_in_time: string | null;
  punch_out_time: string | null;
  hours_worked: number | null;
  status: string;
  is_within_fence: boolean;
}

export interface PropertyAttendanceTodayResponse {
  property_id: string;
  date: string;
  total_staff: number;
  present: number;
  absent: number;
  records: PropertyAttendanceEntry[];
}

// ── Geolocation helper ─────────────────────────────────────

export function getCurrentPosition(): Promise<GeolocationPayload> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("Location permission denied. Please allow location access to punch in/out."));
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reject(new Error("Location unavailable. Please check your GPS or network."));
        } else {
          reject(new Error("Location request timed out. Please try again."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

// ── API Functions ──────────────────────────────────────────

export const attendanceAPI = {
  punchIn: async (
    propertyId: string,
    geolocation: GeolocationPayload,
    notes?: string,
  ): Promise<PunchInResponse> => {
    const { data } = await api.post<PunchInResponse>(
      "/v1/attendance/punch-in",
      { geolocation, notes: notes ?? null },
      { params: { property_id: propertyId } },
    );
    return data;
  },

  punchOut: async (
    propertyId: string,
    geolocation: GeolocationPayload,
    notes?: string,
  ): Promise<PunchOutResponse> => {
    const { data } = await api.post<PunchOutResponse>(
      "/v1/attendance/punch-out",
      { geolocation, notes: notes ?? null },
      { params: { property_id: propertyId } },
    );
    return data;
  },

  getStatus: async (propertyId: string): Promise<PunchStatusResponse> => {
    const { data } = await api.get<PunchStatusResponse>("/v1/attendance/status", {
      params: { property_id: propertyId },
    });
    return data;
  },

  getHistory: async (params?: {
    property_id?: string;
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<AttendanceHistoryResponse> => {
    const { data } = await api.get<AttendanceHistoryResponse>("/v1/attendance/history", { params });
    return data;
  },

  getDailySummary: async (date?: string): Promise<DailySummaryResponse> => {
    const { data } = await api.get<DailySummaryResponse>("/v1/attendance/daily-summary", {
      params: date ? { date } : undefined,
    });
    return data;
  },

  getPropertyAttendanceToday: async (
    propertyId: string,
  ): Promise<PropertyAttendanceTodayResponse> => {
    const { data } = await api.get<PropertyAttendanceTodayResponse>(
      `/v1/attendance/property/${propertyId}/today`,
    );
    return data;
  },
};
