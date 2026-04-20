import api from "@/lib/config/app";

export const reportsAPI = {
  occupancy: (propertyId?: string) =>
    api.get("/v1/reports/occupancy", { params: { property_id: propertyId } }),
  audit: (filters?: {
    resource_type?: string;
    action?: string;
    severity?: string;
    page?: number;
    limit?: number;
  }) => api.get("/v1/reports/audit", { params: filters }),
};