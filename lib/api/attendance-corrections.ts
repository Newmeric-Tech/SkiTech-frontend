/**
 * Missed punch-out corrections — lib/api/attendance-corrections.ts
 *
 * The owner of an auto_closed shift claims when they left; a Manager of the
 * property (staff requests) or an owner/admin approves, which completes the
 * shift with hours from the approved time.
 */
import api from "@/lib/config/app";

export type CorrectionStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface CorrectionRequest {
  id: string;
  tenant_id: string;
  property_id: string;
  property_name: string | null;
  attendance_id: string;
  punch_in_time: string | null;
  requested_by: string | null;
  requested_by_name: string | null;
  requester_role: string;
  claimed_punch_out_time: string;
  claimed_hours: number | null;
  reason: string;
  status: CorrectionStatus;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
}

/** Same limit as the server (STALE_SHIFT_HOURS). */
export const MAX_CORRECTION_HOURS = 16;

export const correctionsAPI = {
  /** Your own requests, plus those you may review (unless mine is true). */
  list: async (params: { status?: CorrectionStatus; mine?: boolean } = {}) =>
    (await api.get<CorrectionRequest[]>("/v1/attendance/correction-requests", { params })).data,

  create: async (attendanceId: string, claimedPunchOut: Date, reason: string) =>
    (await api.post<CorrectionRequest>("/v1/attendance/correction-requests", {
      attendance_id: attendanceId,
      claimed_punch_out_time: claimedPunchOut.toISOString(),
      reason,
    })).data,

  approve: async (id: string, reviewNote?: string) =>
    (await api.post<CorrectionRequest>(`/v1/attendance/correction-requests/${id}/approve`,
      { review_note: reviewNote || null })).data,

  reject: async (id: string, reviewNote?: string) =>
    (await api.post<CorrectionRequest>(`/v1/attendance/correction-requests/${id}/reject`,
      { review_note: reviewNote || null })).data,

  cancel: async (id: string) =>
    (await api.post<CorrectionRequest>(`/v1/attendance/correction-requests/${id}/cancel`)).data,
};
