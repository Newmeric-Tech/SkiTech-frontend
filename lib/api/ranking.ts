/**
 * Employee Ranking API — lib/api/ranking.ts
 * Wraps all /v1/rankings/* endpoints
 */
import api from "@/lib/config/app";

// ─── Enums ────────────────────────────────────────────────
export type RankingPeriodType = "weekly" | "monthly" | "yearly";

// ─── Backend Response Types ───────────────────────────────
export interface BackendRankingListItem {
  rank: number;
  employee_id: string;
  employee_name: string;
  department: string | null;
  overall_score: number;
  performance_status: string;
  score_change: number | null;
  attendance_percent: number | null;
  task_completion_percent: number | null;
  task_quality_percent: number | null;
}

export interface BackendRankingsListResponse {
  total: number;
  skip: number;
  limit: number;
  items: BackendRankingListItem[];
  ranking_type: string;
  period_start: string;
  period_end: string;
  property_name: string | null;
}

export interface BackendScoreBreakdown {
  criterion_name: string;
  score: number;
  weightage: number;
  weighted_score: number;
}

export interface BackendEmployeeRanking {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string | null;
  rank: number;
  overall_score: number;
  performance_status: string;
  period_start: string;
  period_end: string;
  ranking_type: string;
  total_active_employees: number;
  scores_breakdown: BackendScoreBreakdown[];
  previous_overall_score: number | null;
  score_change: number | null;
  score_change_percentage: number | null;
}

export interface BackendDashboardInsight {
  title: string;
  description: string;
  type: string;
  priority: number;
}

export interface BackendDashboardStats {
  overall_workforce_score: number;
  active_staff: number;
  top_5_employees: BackendRankingListItem[];
  performance_distribution: {
    promotion_ready: number;
    high_performer: number;
    consistent: number;
    needs_improvement: number;
  };
  insights: BackendDashboardInsight[];
}

export interface BackendRecalculateResult {
  success: boolean;
  message: string;
  employees_processed: number;
  new_rankings_created: number;
  existing_rankings_updated: number;
}

// ─── API ──────────────────────────────────────────────────
export const rankingAPI = {

  /** Initialize default 7 ranking criteria for a property */
  initialize: async (tenantId: string, propertyId: string) => {
    const { data } = await api.post<{ success: boolean; criteria_count: number }>(
      "/v1/rankings/initialize",
      null,
      { params: { tenant_id: tenantId, property_id: propertyId } }
    );
    return data;
  },

  /** Get paginated rankings for a property */
  getPropertyRankings: async (
    propertyId: string,
    tenantId: string,
    rankingType: RankingPeriodType = "weekly",
    skip = 0,
    limit = 50
  ) => {
    const { data } = await api.get<BackendRankingsListResponse>(
      `/v1/rankings/properties/${propertyId}/rankings`,
      { params: { tenant_id: tenantId, ranking_type: rankingType, skip, limit } }
    );
    return data;
  },

  /** Get ranking detail for one employee */
  getEmployeeRanking: async (
    employeeId: string,
    tenantId: string,
    rankingType: RankingPeriodType = "weekly"
  ) => {
    const { data } = await api.get<BackendEmployeeRanking>(
      `/v1/rankings/employees/${employeeId}/ranking`,
      { params: { tenant_id: tenantId, ranking_type: rankingType } }
    );
    return data;
  },

  /** Get dashboard overview stats for a property */
  getDashboard: async (propertyId: string, tenantId: string) => {
    const { data } = await api.get<BackendDashboardStats>(
      `/v1/rankings/properties/${propertyId}/dashboard`,
      { params: { tenant_id: tenantId } }
    );
    return data;
  },

  /** Get the current staff member's own ranking (uses their linked employee record) */
  getMyRanking: async (rankingType: RankingPeriodType = "weekly") => {
    const { data } = await api.get<BackendEmployeeRanking>("/v1/rankings/me", {
      params: { ranking_type: rankingType },
    });
    return data;
  },

  /** Trigger full ranking recalculation for a property + period */
  recalculate: async (
    propertyId: string,
    tenantId: string,
    rankingType: RankingPeriodType,
    periodStart: string,
    periodEnd: string
  ) => {
    const { data } = await api.post<BackendRecalculateResult>(
      `/v1/rankings/properties/${propertyId}/recalculate`,
      { ranking_type: rankingType, period_start: periodStart, period_end: periodEnd, recalculate_all: false },
      { params: { tenant_id: tenantId } }
    );
    return data;
  },
};

// ─── Period helpers ────────────────────────────────────────

/** Returns ISO start/end strings for the current weekly/monthly/yearly period */
export function getPeriodDates(type: RankingPeriodType): { start: string; end: string } {
  const now = new Date();
  let start: Date, end: Date;

  if (type === "weekly") {
    const day = now.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    start = new Date(now);
    start.setDate(now.getDate() + diffToMon);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (type === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

// ─── Mappers ──────────────────────────────────────────────

const PERF_STATUS_LABEL: Record<string, string> = {
  promotion_ready:  "High Performer",
  high_performer:   "High Performer",
  most_improved:    "Consistent",
  consistent:       "Consistent",
  needs_improvement: "Needs Attention",
  smart_ranking:    "Consistent",
};

const INSIGHT_TYPE_MAP: Record<string, "success" | "warning" | "danger" | "info"> = {
  most_improved:       "success",
  top_performer:       "success",
  attendance_champion: "info",
  needs_attention:     "danger",
};

/** Map a BackendRankingListItem → frontend EmployeeRanking shape */
export function mapRankingItem(item: BackendRankingListItem) {
  return {
    employeeId:       item.employee_id,
    employee: {
      id:         item.employee_id,
      name:       item.employee_name,
      avatar:     "",
      department: item.department ?? "—",
      role:       "",
      email:      "",
      phone:      "",
      joinDate:   "",
      status:     "active" as const,
    },
    rank:              item.rank,
    previousRank:      item.rank,
    rankChange:        item.score_change != null ? (item.score_change > 0 ? 1 : item.score_change < 0 ? -1 : 0) : 0,
    attendance:        Math.round(item.attendance_percent ?? 0),
    taskCompletion:    Math.round(item.task_completion_percent ?? 0),
    punctuality:       Math.round(item.task_quality_percent ?? 0),
    teamwork:          0,
    guestSatisfaction: 0,
    standbyHours:      0,
    overtimeHours:     0,
    totalHours:        0,
    finalScore:        Math.round(item.overall_score * 10) / 10,
    streak:            0,
    status: (PERF_STATUS_LABEL[item.performance_status] ?? "Consistent") as
      "High Performer" | "Consistent" | "Needs Attention" | "New",
  };
}

/** Map a BackendDashboardInsight → frontend AIInsight shape */
export function mapInsight(insight: BackendDashboardInsight, index: number) {
  return {
    id:          String(index + 1),
    type:        INSIGHT_TYPE_MAP[insight.type] ?? ("warning" as const),
    title:       insight.title.toUpperCase(),
    description: insight.description,
  };
}
