import api from "@/lib/config/app";

export interface RevenueProperty {
  property_id: string;
  property_name: string;
  amount: number;
}

export interface RevenueMonth {
  month: string;
  year: number;
  properties: RevenueProperty[];
  total: number;
}

export interface RevenueReport {
  months: number;
  data: RevenueMonth[];
  properties: { id: string; name: string }[];
}

export interface OccupancyTrendPoint {
  month: string;
  year: number;
  occupancy: number;
}

export interface OccupancyTrendReport {
  months: number;
  data: OccupancyTrendPoint[];
}

export const reportsAPI = {
  occupancy: (propertyId?: string) =>
    api.get("/v1/reports/occupancy", { params: { property_id: propertyId } }),

  revenue: (months = 6) =>
    api.get<RevenueReport>("/v1/reports/revenue", { params: { months } }),

  occupancyTrend: (months = 6, propertyId?: string) =>
    api.get<OccupancyTrendReport>("/v1/reports/occupancy-trend", {
      params: { months, property_id: propertyId },
    }),

  audit: (filters?: {
    resource_type?: string;
    action?: string;
    severity?: string;
    page?: number;
    limit?: number;
  }) => api.get("/v1/reports/audit", { params: filters }),
};
