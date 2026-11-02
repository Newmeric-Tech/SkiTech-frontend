/**
 * Assigned KRA tasks API — lib/api/kraTasks.ts
 * Wraps all /v1/kra-tasks/* endpoints
 */
import api from "@/lib/config/app";

// ─── Enums ────────────────────────────────────────────────
export type KraFrequency = "daily" | "weekly" | "monthly" | "quarterly";
export type KraStatus = "pending" | "delayed" | "completed";
export type KraDisplayStatus = "pending" | "delayed" | "completed" | "completed_delayed";

export const KRA_FREQUENCIES: KraFrequency[] = ["daily", "weekly", "monthly", "quarterly"];

// ─── Backend Response Types ───────────────────────────────
export interface KraDefinition {
  id: string;
  tenant_id: string;
  property_id: string;
  title: string;
  description: string | null;
  frequency: KraFrequency;
  value_label: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KraAssignment {
  id: string;
  tenant_id: string;
  property_id: string;
  definition_id: string;
  assignee_id: string;
  assignee_name: string | null;
  assigned_by: string | null;
  start_date: string;
  is_active: boolean;
  ended_at: string | null;
}

export interface KraAssignResult {
  created: KraAssignment[];
  skipped_user_ids: string[];
}

export interface KraOccurrence {
  id: string;
  tenant_id: string;
  property_id: string;
  assignment_id: string;
  definition_id: string;
  assignee_id: string;
  assignee_name: string | null;
  title: string;
  description: string | null;
  frequency: KraFrequency;
  value_label: string | null;
  period_start: string;
  period_end: string;
  status: KraStatus;
  display_status: KraDisplayStatus;
  was_delayed: boolean;
  delayed_at: string | null;
  delay_reason: string | null;
  completed_at: string | null;
  completion_note: string | null;
  completion_value: number | null;
  created_at: string;
  updated_at: string;
}

export interface KraOccurrencePage {
  items: KraOccurrence[];
  total: number;
  skip: number;
  limit: number;
}

export interface KraSummaryCounts {
  pending: number;
  delayed: number;
  completed: number; // includes completed_with_delay
  completed_with_delay: number;
  total: number;
}

export interface KraFrequencySummary extends KraSummaryCounts {
  frequency: KraFrequency;
}

export interface KraSummary {
  property_id: string | null;
  period_from: string | null;
  period_to: string | null;
  by_frequency: KraFrequencySummary[];
  totals: KraSummaryCounts;
}

// ─── Request Types ────────────────────────────────────────
export interface KraDefinitionCreate {
  property_id: string;
  title: string;
  description?: string | null;
  frequency: KraFrequency;
  value_label?: string | null;
}

export interface KraDefinitionUpdate {
  title?: string;
  description?: string | null;
  value_label?: string | null;
  is_active?: boolean;
  frequency?: KraFrequency;
}

export interface KraOccurrenceFilters {
  property_id?: string;
  user_id?: string;
  frequency?: KraFrequency;
  status?: KraDisplayStatus;
  period_from?: string;
  period_to?: string;
  skip?: number;
  limit?: number;
}

// ─── API ──────────────────────────────────────────────────
export const kraTasksAPI = {

  createDefinition: async (payload: KraDefinitionCreate) => {
    const { data } = await api.post<KraDefinition>("/v1/kra-tasks/definitions", payload);
    return data;
  },

  listDefinitions: async (propertyId?: string) => {
    const { data } = await api.get<KraDefinition[]>("/v1/kra-tasks/definitions", {
      params: { property_id: propertyId },
    });
    return data;
  },

  updateDefinition: async (id: string, payload: KraDefinitionUpdate) => {
    const { data } = await api.put<KraDefinition>(`/v1/kra-tasks/definitions/${id}`, payload);
    return data;
  },

  /** One ineligible user fails the whole request, and nothing is saved */
  assign: async (definitionId: string, userIds: string[], today: string) => {
    const { data } = await api.post<KraAssignResult>(
      `/v1/kra-tasks/definitions/${definitionId}/assignments`,
      { user_ids: userIds, today }
    );
    return data;
  },

  endAssignment: async (id: string) => {
    const { data } = await api.delete<KraAssignment>(`/v1/kra-tasks/assignments/${id}`);
    return data;
  },

  /** Includes ended assignments. Without definitionId: everything in the caller's scope */
  listAssignments: async (definitionId?: string) => {
    const { data } = await api.get<KraAssignment[]>("/v1/kra-tasks/assignments", {
      params: { definition_id: definitionId },
    });
    return data;
  },

  /** The signed-in user's own tasks. today is their local date */
  myTasks: async (today: string) => {
    const { data } = await api.get<KraOccurrence[]>("/v1/kra-tasks/my", { params: { today } });
    return data;
  },

  delay: async (occurrenceId: string, reason?: string) => {
    const { data } = await api.post<KraOccurrence>(
      `/v1/kra-tasks/occurrences/${occurrenceId}/delay`,
      { reason }
    );
    return data;
  },

  complete: async (occurrenceId: string, payload: { note?: string; value?: number }) => {
    const { data } = await api.post<KraOccurrence>(
      `/v1/kra-tasks/occurrences/${occurrenceId}/complete`,
      payload
    );
    return data;
  },

  listOccurrences: async (filters: KraOccurrenceFilters) => {
    const { data } = await api.get<KraOccurrencePage>("/v1/kra-tasks/occurrences", { params: filters });
    return data;
  },

  summary: async (params: { property_id?: string; period_from?: string; period_to?: string }) => {
    const { data } = await api.get<KraSummary>("/v1/kra-tasks/summary", { params });
    return data;
  },
};

// ─── Errors ───────────────────────────────────────────────

export const KRA_CONFLICT_MESSAGE = "This task was already updated. Refreshing.";

export function isKraConflict(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 409;
}

/**
 * A short message that is safe to show: never the server's own text.
 * overrides replaces the default for a status where the caller can say more.
 */
export function kraErrorMessage(err: unknown, overrides: Record<number, string> = {}): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === undefined) return "Server is waking up, try again in a moment";
  if (overrides[status]) return overrides[status];
  if (status === 409) return KRA_CONFLICT_MESSAGE;
  if (status === 403 || status === 404) return "You can't do that";
  return "Something went wrong. Please try again.";
}
