/**
 * Complaints & Error Log API — lib/api/complaints.ts
 * Wraps all /v1/complaints/* endpoints
 */
import api from "@/lib/config/app";

// ─── Enums (must match backend exactly) ───────────────────
export type ComplaintPriority = "low" | "medium" | "high" | "critical";
export type ComplaintStatus   = "open" | "in_progress" | "resolved" | "escalated" | "closed";
export type ComplaintType     = "complaint" | "error" | "handover";
export type ComplaintCategory = "maintenance" | "housekeeping" | "technical" | "operational" | "security" | "safety" | "other";

// ─── Response Types ────────────────────────────────────────
export interface ComplaintListItem {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  complaint_type: ComplaintType;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  room_number: string | null;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  resolved_at: string | null;
  attachment_count: number;
  comment_count: number;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  user_id: string | null;
  comment: string;
  is_internal: boolean;
  created_at: string;
  attachment_count: number;
}

export interface ComplaintDetail extends ComplaintListItem {
  tenant_id: string;
  property_id: string;
  assigned_by: string | null;
  assigned_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  updated_at: string;
  comments: ComplaintComment[];
  assignments: unknown[];
  attachments: unknown[];
}

// ─── Dashboard Types ───────────────────────────────────────
export interface ManagerDashboard {
  total_complaints: number;
  open_complaints: number;
  in_progress_count: number;
  resolved_today: number;
  escalated_count: number;
  by_priority: Record<string, number>;
  by_status:   Record<string, number>;
  by_category: Record<string, number>;
  by_type:     Record<string, number>;
  recent_complaints:  ComplaintListItem[];
  need_attention:     NeedAttentionItem[];
  daily_events:       DailyEventItem[];
}

export interface NeedAttentionItem {
  id: string;
  title: string;
  category: string;
  complaint_type: string;
  priority: string;
  status: string;
  room_number: string | null;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  days_open: number;
}

export interface DailyEventItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  complaint_type: string;
  category: string;
  room_number: string | null;
  created_at: string;
  assigned_to: string | null;
}

export interface OwnerDashboard {
  total_complaints: number;
  total_critical: number;
  total_high: number;
  total_resolved: number;
  resolution_rate: number;
  by_property: Record<string, number>;
  by_category: Record<string, number>;
  by_status:   Record<string, number>;
  critical_complaints: ComplaintListItem[];
}

export interface StaffDashboard {
  my_complaints_count: number;
  pending_resolution:  number;
  resolved_by_me:      number;
  assigned_to_me:      number;
  my_complaints: ComplaintListItem[];
  complaints_assigned_to_me: ComplaintListItem[];
}

// ─── Request Types ─────────────────────────────────────────
export interface CreateComplaintPayload {
  title: string;
  description: string;
  category: ComplaintCategory;
  complaint_type?: ComplaintType;
  priority?: ComplaintPriority;
  room_number?: string;
  location?: string;
}

export interface ResolveComplaintPayload {
  status: ComplaintStatus;
  resolution_notes: string;
}

export interface AssignComplaintPayload {
  assigned_to: string;
  notes?: string;
}

export interface AddCommentPayload {
  comment: string;
  is_internal?: boolean;
}

// ─── List filters ──────────────────────────────────────────
export interface ListComplaintsParams {
  skip?: number;
  limit?: number;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  category?: ComplaintCategory;
  complaint_type?: ComplaintType;
  search?: string;
}

// ─── API Functions ─────────────────────────────────────────
export const complaintsAPI = {

  /** List complaints (manager sees property-wide, owner sees all) */
  list: async (params: ListComplaintsParams = {}): Promise<[ComplaintListItem[], number]> => {
    const { data } = await api.get<[ComplaintListItem[], number]>("/complaints/", { params });
    return data;
  },

  /** Get complaint detail with comments & attachments */
  getDetail: async (id: string): Promise<ComplaintDetail> => {
    const { data } = await api.get<ComplaintDetail>(`/complaints/${id}`);
    return data;
  },

  /** Create a new complaint (staff / any role) */
  create: async (payload: CreateComplaintPayload): Promise<ComplaintDetail> => {
    const { data } = await api.post<ComplaintDetail>("/complaints/", payload);
    return data;
  },

  /** Resolve or close a complaint (manager / owner) */
  resolve: async (id: string, payload: ResolveComplaintPayload): Promise<ComplaintDetail> => {
    const { data } = await api.post<ComplaintDetail>(`/complaints/${id}/resolve`, payload);
    return data;
  },

  /** Escalate a complaint */
  escalate: async (id: string, reason: string): Promise<ComplaintDetail> => {
    const { data } = await api.post<ComplaintDetail>(`/complaints/${id}/escalate`, null, {
      params: { reason },
    });
    return data;
  },

  /** Assign complaint to a staff member (manager / owner) */
  assign: async (id: string, payload: AssignComplaintPayload): Promise<ComplaintDetail> => {
    const { data } = await api.post<ComplaintDetail>(`/complaints/${id}/assign`, payload);
    return data;
  },

  /** Get complaints created by the current staff user */
  myComplaints: async (skip = 0, limit = 50): Promise<[ComplaintListItem[], number]> => {
    const { data } = await api.get<[ComplaintListItem[], number]>("/complaints/me/my-complaints", {
      params: { skip, limit },
    });
    return data;
  },

  /** Add a comment to a complaint */
  addComment: async (id: string, payload: AddCommentPayload): Promise<ComplaintComment> => {
    const { data } = await api.post<ComplaintComment>(`/complaints/${id}/comments`, payload);
    return data;
  },

  /** Get all comments for a complaint */
  getComments: async (id: string): Promise<ComplaintComment[]> => {
    const { data } = await api.get<ComplaintComment[]>(`/complaints/${id}/comments`);
    return data;
  },

  // ── Dashboards ──────────────────────────────────────────

  managerDashboard: async (): Promise<ManagerDashboard> => {
    const { data } = await api.get<ManagerDashboard>("/complaints/dashboard/manager");
    return data;
  },

  ownerDashboard: async (): Promise<OwnerDashboard> => {
    const { data } = await api.get<OwnerDashboard>("/complaints/dashboard/owner");
    return data;
  },

  staffDashboard: async (): Promise<StaffDashboard> => {
    const { data } = await api.get<StaffDashboard>("/complaints/dashboard/staff");
    return data;
  },
};

// ─── Formatting helpers ────────────────────────────────────
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export const priorityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high:     "bg-orange-100 text-orange-700 border-orange-200",
  medium:   "bg-blue-100 text-blue-700 border-blue-200",
  low:      "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const statusStyles: Record<string, string> = {
  open:        "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved:    "bg-emerald-100 text-emerald-700",
  escalated:   "bg-red-100 text-red-700",
  closed:      "bg-slate-100 text-slate-600",
};
