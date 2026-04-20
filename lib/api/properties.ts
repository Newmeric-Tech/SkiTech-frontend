import api from "@/lib/config/app";

export const propertiesAPI = {
  list: () => api.get("/v1/properties/"),
  get: (id: string) => api.get(`/v1/properties/${id}`),
  create: (data: any) => api.post("/v1/properties/", data),
  update: (id: string, data: any) => api.put(`/v1/properties/${id}`, data),
  delete: (id: string) => api.delete(`/v1/properties/${id}`),
  getOwner: (propertyId: string) => api.get(`/v1/properties/${propertyId}/owner`),
  createOwner: (propertyId: string, data: any) =>
    api.post(`/v1/properties/${propertyId}/owner`, data),
  updateOwner: (propertyId: string, ownerId: string, data: any) =>
    api.put(`/v1/properties/${propertyId}/owner/${ownerId}`, data),
};