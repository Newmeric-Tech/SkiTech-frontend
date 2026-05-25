/**
 * Employee Scheduling API — lib/api/scheduling.ts
 * Wraps /v1/scheduling/* endpoints
 */
import api from "@/lib/config/app";

// ─── Backend types ─────────────────────────────────────────
export type BackendRequestStatus =
  | "pending" | "accepted" | "rejected" | "assigned" | "cancelled";

export type BackendRequestPriority = "normal" | "high" | "urgent";

export interface BackendShiftAssignment {
  id: string;
  schedule_id: string;
  employee_id: string;
  shift_date: string;          // ISO datetime
  shift_start_time: string;    // "HH:MM"
  shift_end_time: string;      // "HH:MM"
  shift_type: string | null;
  status: string;
}

export interface BackendWeeklySchedule {
  id: string;
  employee_id: string;
  week_start_date: string;
  week_end_date: string;
  status: string;
  shift_assignments: BackendShiftAssignment[];
}

export interface BackendReplacementRequest {
  id: string;
  shift_assignment_id: string;
  original_employee_id: string;
  replacement_employee_id: string | null;
  shift_date: string;
  shift_start_time: string;
  shift_end_time: string;
  reason: string | null;
  priority: BackendRequestPriority;
  status: BackendRequestStatus;
  ai_recommended: boolean;
  responded_at: string | null;
  created_at: string;
}

export interface BackendCriticalAction {
  shift_assignment_id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  shift_date: string;
  shift_start_time: string;
  shift_end_time: string;
  reason_off: string;
  urgency: string;
}

export interface BackendStaffDashboard {
  emergency_shift_requests: BackendReplacementRequest[];
  pending_requests_count: number;
  accepted_requests_count: number;
  rejected_requests_count: number;
  current_week_schedule: BackendWeeklySchedule | null;
}

export interface BackendManagerDashboard {
  scheduling_progress: number;
  employee_count: number;
  scheduled_count: number;
  unscheduled_count: number;
  critical_actions: BackendCriticalAction[];
  pending_responses: BackendReplacementRequest[];
  weekly_schedule_count: number;
}

// ─── Mapping helpers ──────────────────────────────────────
/** Day name from ISO date string */
function dateToDayName(iso: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(iso).getDay()];
}

// ─── API ──────────────────────────────────────────────────
export const schedulingAPI = {

  /** Current user's staff dashboard (schedule + replacement requests) */
  myDashboard: async (): Promise<BackendStaffDashboard> => {
    const { data } = await api.get<BackendStaffDashboard>("/scheduling/me");
    return data;
  },

  /** Manager dashboard — defaults to current week on backend */
  managerDashboard: async (): Promise<BackendManagerDashboard> => {
    const { data } = await api.get<BackendManagerDashboard>("/scheduling/dashboard/manager");
    return data;
  },

  /** Accept a replacement request (as a staff member) */
  acceptReplacement: async (requestId: string, employeeId: string): Promise<void> => {
    await api.post(`/scheduling/replacement-requests/${requestId}/accept`, null, {
      params: { employee_id: employeeId },
    });
  },

  /** Reject a replacement request (as a staff member) */
  rejectReplacement: async (requestId: string, employeeId: string, reason?: string): Promise<void> => {
    await api.post(`/scheduling/replacement-requests/${requestId}/reject`, null, {
      params: { employee_id: employeeId, reason },
    });
  },

  /** Direct-assign a replacement (manager) */
  assignReplacement: async (requestId: string, replacementEmployeeId: string): Promise<void> => {
    await api.post(`/scheduling/replacement-requests/${requestId}/assign`, null, {
      params: { replacement_employee_id: replacementEmployeeId },
    });
  },
};

/** Convert a backend shift to the simplified frontend Shift shape */
export function mapBackendShift(
  s: BackendShiftAssignment,
  employeeId?: string
) {
  return {
    id:          s.id,
    employeeId:  employeeId ?? s.employee_id,
    day:         dateToDayName(s.shift_date),
    startTime:   s.shift_start_time,
    endTime:     s.shift_end_time,
    department:  s.shift_type ?? "General",
    status:      (s.status === "scheduled" ? "scheduled"
                : s.status === "covered"   ? "completed"
                                           : "vacant") as "scheduled" | "completed" | "vacant",
    isVacant:    s.status === "conflict",
  };
}

/** Convert a backend replacement request to the frontend ReplacementRequest shape */
export function mapBackendRequest(r: BackendReplacementRequest) {
  return {
    id:               r.id,
    emergencyAlertId: r.shift_assignment_id,
    shiftId:          r.shift_assignment_id,
    fromEmployee:     "System",
    toEmployeeId:     r.replacement_employee_id ?? "",
    toEmployeeName:   r.replacement_employee_id ? `Employee ${r.replacement_employee_id.slice(0,6)}` : "Unassigned",
    toEmployeeDept:   "Unknown",
    shiftTime:        `${r.shift_start_time} - ${r.shift_end_time}`,
    department:       "General",
    status:           r.status as any,
    incentive:        r.priority === "urgent" ? 200 : r.priority === "high" ? 150 : 100,
    overtimeEligible: r.priority !== "normal",
    sentAt:           r.created_at,
    respondedAt:      r.responded_at ?? undefined,
  };
}
