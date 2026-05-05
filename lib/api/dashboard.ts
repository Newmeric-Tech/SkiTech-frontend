import api from "@/lib/config/app";

export interface DashboardSummary {
  total_sops: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  completion_rate: number;
}

export interface TaskTrend {
  day: string;
  tasks: number;
}

export interface DashboardAlert {
  id: string;
  message: string;
  created_at: string;
}

export const dashboardAPI = {
  summary: () => api.get<DashboardSummary>("/v1/dashboard/"),
  tasksTrend: () => api.get<TaskTrend[]>("/v1/dashboard/tasks-trend"),
  alerts: () => api.get<DashboardAlert[]>("/v1/dashboard/alerts"),
};
