import api from "@/lib/config/app";

// ── Overview / Dashboard ──────────────────────────────────────────────────────
export interface OverviewStats {
  total_properties: number;
  active_users: number;
  open_tickets: number;
  platform_uptime: number;
  properties_change: string;
  users_change: string;
  tickets_change: string;
  uptime_change: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  type: string;
  created_at: string;
}

export interface TopProperty {
  id: string;
  name: string;
  location: string;
  user_count: number;
  health_score: number;
}

export interface OverviewResponse {
  stats: OverviewStats;
  recent_activity: ActivityItem[];
  top_properties: TopProperty[];
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface AnalyticsKPI {
  monthly_revenue: number;
  total_users: number;
  total_properties: number;
  avg_occupancy: number;
  churn_rate: number;
  nps_score: number;
}

export interface RevenuePoint { month: string; revenue: number }
export interface UserGrowthPoint { month: string; users: number }
export interface RegionPoint { region: string; count: number }
export interface TopAnalyticsProperty {
  name: string; owner: string; occupancy: number; revenue: number; growth: number;
}

export interface AnalyticsResponse {
  kpis: AnalyticsKPI;
  revenue_data: RevenuePoint[];
  user_growth: UserGrowthPoint[];
  properties_by_region: RegionPoint[];
  top_properties: TopAnalyticsProperty[];
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export interface AuditEvent {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  severity: "info" | "warning" | "critical";
}

export interface AuditResponse {
  events: AuditEvent[];
  total: number;
  log_size: string;
}

// ── Health ────────────────────────────────────────────────────────────────────
export interface ServiceHealth {
  id: number;
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  last_checked: string;
  latency: number;
}

export interface LatencyPoint { time: string; api: number; db: number; auth: number }
export interface ErrorPoint { time: string; errors: number }
export interface Incident {
  id: number; title: string; status: string; time: string; duration: string; severity: string;
}
export interface ResourceUsage { name: string; value: number }

export interface HealthResponse {
  services: ServiceHealth[];
  latency_data: LatencyPoint[];
  error_rate_data: ErrorPoint[];
  incidents: Incident[];
  resource_usage: ResourceUsage[];
}

// ── Properties ────────────────────────────────────────────────────────────────
export interface SuperadminProperty {
  id: string;
  name: string;
  owner: string;
  location: string;
  units: number;
  staff: number;
  occupancy: number;
  health: number;
  status: "active" | "inactive";
}

export interface CreatePropertyPayload {
  name: string;
  owner: string;
  location: string;
  units: number;
}

// ── Roles ─────────────────────────────────────────────────────────────────────
export interface Role {
  id: string;
  name: string;
  description: string;
  user_count: number;
  permission_count: number;
  color: string;
  is_system: boolean;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  permissions: string[];
}

// ── Settings ──────────────────────────────────────────────────────────────────
export interface PlatformSettings {
  platform_name: string;
  support_email: string;
  timezone: string;
  session_timeout: number;
  two_factor_required: boolean;
  maintenance_mode: boolean;
  email_alerts: boolean;
  slack_webhook: string;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export interface SuperadminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  property: string;
  last_active: string;
  status: "active" | "inactive" | "suspended";
}

export interface InviteUserPayload {
  full_name: string;
  email: string;
  role: string;
  property_id?: string;
}

// ── Demo Requests ─────────────────────────────────────────────────────────────
export interface DemoRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  size: string;
  role: string;
  message: string;
  status: "pending" | "contacted" | "completed";
  created_at: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────
export const superadminAPI = {
  // Dashboard
  overview: () => api.get<OverviewResponse>("/v1/superadmin/overview"),

  // Analytics
  analytics: (period: string) =>
    api.get<AnalyticsResponse>("/v1/superadmin/analytics", { params: { period } }),

  // Audit
  audit: (params: { search?: string; action?: string; severity?: string }) =>
    api.get<AuditResponse>("/v1/superadmin/audit", { params }),
  exportAudit: () => api.get("/v1/superadmin/audit/export", { responseType: "blob" }),

  // Health
  health: () => api.get<HealthResponse>("/v1/superadmin/health"),

  // Properties
  listProperties: (params?: { search?: string; status?: string }) =>
    api.get<SuperadminProperty[]>("/v1/superadmin/properties", { params }),
  createProperty: (data: CreatePropertyPayload) =>
    api.post<SuperadminProperty>("/v1/superadmin/properties", data),
  updateProperty: (id: string, data: Partial<CreatePropertyPayload>) =>
    api.put<SuperadminProperty>(`/v1/superadmin/properties/${id}`, data),
  deleteProperty: (id: string) =>
    api.delete(`/v1/superadmin/properties/${id}`),

  // Roles
  listRoles: () => api.get<Role[]>("/v1/superadmin/roles"),
  createRole: (data: CreateRolePayload) => api.post<Role>("/v1/superadmin/roles", data),
  updateRole: (id: string, data: Partial<CreateRolePayload>) =>
    api.put<Role>(`/v1/superadmin/roles/${id}`, data),
  deleteRole: (id: string) => api.delete(`/v1/superadmin/roles/${id}`),

  // Settings
  getSettings: () => api.get<PlatformSettings>("/v1/superadmin/settings"),
  updateSettings: (data: Partial<PlatformSettings>) =>
    api.put<PlatformSettings>("/v1/superadmin/settings", data),

  // Users
  listUsers: (params?: { search?: string; role?: string; status?: string }) =>
    api.get<SuperadminUser[]>("/v1/superadmin/users", { params }),
  inviteUser: (data: InviteUserPayload) =>
    api.post<SuperadminUser>("/v1/superadmin/users/invite", data),
  suspendUser: (id: string) => api.put(`/v1/superadmin/users/${id}/suspend`),
  activateUser: (id: string) => api.put(`/v1/superadmin/users/${id}/activate`),
  deleteUser: (id: string) => api.delete(`/v1/superadmin/users/${id}`),
  updateUserRole: (id: string, role: string) =>
    api.put(`/v1/superadmin/users/${id}/role`, { role }),

  // Demo Requests
  listDemoRequests: (params?: { search?: string; status?: string }) =>
    api.get<DemoRequest[]>("/v1/superadmin/demo-requests", { params }),
  updateDemoStatus: (id: string, status: "pending" | "contacted" | "completed") =>
    api.put(`/v1/superadmin/demo-requests/${id}/status`, { status }),
};
