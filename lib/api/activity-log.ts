/**
 * Master Activity Log API — lib/api/activity-log.ts
 * Wraps /v1/activity-log/* endpoints
 */
import api from "@/lib/config/app";

// ─── Types ─────────────────────────────────────────────────
export type LogSeverityDisplay = "Info" | "Warning" | "Critical";

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  user: string;
  actionType: string;
  resource: string;
  resource_id: string | null;
  details: string;
  severity: LogSeverityDisplay;
  raw_severity: string;
  status: string | null;
  ip_address: string | null;
  property_id: string | null;
}

export interface ActionStat  { action: string;        count: number }
export interface ResourceStat { resource_type: string; count: number }
export interface SeverityStat { severity: string;      count: number }

export interface ActivitySummary {
  total_events: number;
  warnings:     number;
  critical:     number;
  log_size_gb:  number;
  by_action:    ActionStat[];
  by_resource:  ResourceStat[];
  by_severity:  SeverityStat[];
}

export interface ListActivityParams {
  skip?:          number;
  limit?:         number;
  severity?:      string;   // raw: low|medium|high|critical
  action_type?:   string;
  resource_type?: string;
  start_date?:    string;   // ISO datetime string
  end_date?:      string;
}

// ─── API ───────────────────────────────────────────────────
export const activityLogAPI = {

  /** Summary stats for the stats cards */
  summary: async (days = 7): Promise<ActivitySummary> => {
    const { data } = await api.get<ActivitySummary>("/activity-log/summary", {
      params: { days },
    });
    return data;
  },

  /** Paginated list with optional filters */
  list: async (
    params: ListActivityParams = {}
  ): Promise<[ActivityLogItem[], number]> => {
    const { data } = await api.get<[ActivityLogItem[], number]>("/activity-log/", {
      params,
    });
    return data;
  },

  /** Recent critical events */
  critical: async (limit = 10): Promise<ActivityLogItem[]> => {
    const { data } = await api.get<ActivityLogItem[]>("/activity-log/critical", {
      params: { limit },
    });
    return data;
  },
};
