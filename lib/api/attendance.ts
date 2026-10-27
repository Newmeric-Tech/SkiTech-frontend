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
  punch_out_acc?: number | null;
  punch_out_within_fence?: boolean | null;
  punch_out_distance_meters?: number | null;
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
  current_status?: string | null;
  punch_in_location?: { latitude: number; longitude: number };
  /** An open record older than 16 h: not a running shift; closed without hours on the next punch. */
  stale_shift?: { attendance_id: string; punch_in_time: string };
}

// GET /attendance/totals
export interface AttendanceTotals {
  day_start: string;
  week_start: string;
  hours_today: number;
  hours_this_week: number;
  open_shift_hours: number;
  needs_review_this_week: number;
}

/** Completed records above this many hours are data errors (backend MAX_PLAUSIBLE_HOURS). */
export const MAX_PLAUSIBLE_HOURS = 24;

// ── Shared display helpers (staff + manager punch pages) ───

/** A record whose hours can't be trusted: auto-closed, or an absurd completed duration. */
export function needsReview(r: Pick<AttendanceRecord, "status" | "hours_worked">) {
  return r.status === "auto_closed" || (r.hours_worked != null && r.hours_worked > MAX_PLAUSIBLE_HOURS);
}

export function fmtHours(h: number | null | undefined) {
  if (!h) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

/** Local midnight today and local Monday 00:00 this week (the user's own day, not UTC). */
export function localDayAndWeekStart() {
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  const week = new Date(day);
  week.setDate(week.getDate() - ((week.getDay() + 6) % 7));
  return { day, week };
}

const RECORD_STATUS: Record<string, { label: string; className: string }> = {
  completed:   { label: "Complete",    className: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
  auto_closed: { label: "Auto-closed", className: "bg-slate-100 text-slate-600 border border-slate-200/60" },
};
const ACTIVE_STATUS = { label: "Active", className: "bg-blue-50 text-blue-700 border border-blue-200/60" };
export const recordStatus = (status: string) => RECORD_STATUS[status] ?? ACTIVE_STATUS;

/** The API's error detail, else the fallback. */
export function apiErrorDetail(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  return typeof detail === "string" && detail ? detail : fallback;
}

export type PunchOutcome =
  | { ok: true; punchedOut: boolean; hoursWorked: number | null; warning: string | null }
  // "location": the browser could not give a usable position, nothing was sent.
  // "rejected": the server refused the punch, nothing was recorded.
  | { ok: false; kind: "location" | "rejected"; message: string };

/** Get the position and punch in (or out). Never throws. */
export async function submitPunch(propertyId: string, punchOut: boolean): Promise<PunchOutcome> {
  let coords: GeolocationPayload;
  try {
    coords = await getCurrentPosition();
  } catch (err) {
    return { ok: false, kind: "location", message: err instanceof Error ? err.message : "Location unavailable" };
  }
  try {
    if (punchOut) {
      const res = await attendanceAPI.punchOut(propertyId, coords);
      return { ok: true, punchedOut: true, hoursWorked: res.hours_worked, warning: res.warning };
    }
    const res = await attendanceAPI.punchIn(propertyId, coords);
    return { ok: true, punchedOut: false, hoursWorked: null, warning: res.warning };
  } catch (err) {
    return { ok: false, kind: "rejected", message: apiErrorDetail(err, "Punch failed. Please try again.") };
  }
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
  current_status?: string | null;
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

  /** Hours since the browser's local midnight and since its local Monday 00:00. */
  getTotals: async (propertyId: string, dayStart: Date, weekStart: Date): Promise<AttendanceTotals> => {
    const { data } = await api.get<AttendanceTotals>("/v1/attendance/totals", {
      params: {
        property_id: propertyId,
        day_start: dayStart.toISOString(),
        week_start: weekStart.toISOString(),
      },
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

  getPropertyAttendanceWeek: async (propertyId: string): Promise<{
    property_id: string;
    records: PropertyAttendanceEntry[];
  }> => {
    const { data } = await api.get(`/v1/attendance/property/${propertyId}/week`);
    return data;
  },

  updateCurrentStatus: async (
    propertyId: string,
    currentStatus: string | null,
  ): Promise<{ success: boolean; current_status: string | null; message: string }> => {
    const { data } = await api.patch(
      "/v1/attendance/current-status",
      { current_status: currentStatus },
      { params: { property_id: propertyId } },
    );
    return data;
  },
};
