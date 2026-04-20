import api from "@/lib/config/app";

export const statsAPI = {
  owner: (propertyId?: string) =>
    api.get("/v1/stats/owner", { params: { property_id: propertyId } }),
  manager: (propertyId: string) =>
    api.get(`/v1/stats/manager/${propertyId}`),
  staff: () => api.get("/v1/stats/staff/me"),
};