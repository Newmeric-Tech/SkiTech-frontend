import api from "@/lib/config/app";

export const inventoryAPI = {
  list: (propertyId: string, departmentId?: string) =>
    api.get(`/v1/inventory/${propertyId}`, {
      params: { department_id: departmentId },
    }),
  get: (itemId: string) => api.get(`/v1/inventory/item/${itemId}`),
  create: (propertyId: string, data: any) =>
    api.post(`/v1/inventory/${propertyId}`, data),
  update: (itemId: string, data: any) =>
    api.put(`/v1/inventory/item/${itemId}`, data),
  delete: (itemId: string) => api.delete(`/v1/inventory/item/${itemId}`),
  addStock: (itemId: string, data: any) =>
    api.post(`/v1/inventory/item/${itemId}/add-stock`, data),
  removeStock: (itemId: string, data: any) =>
    api.post(`/v1/inventory/item/${itemId}/remove-stock`, data),
  adjustStock: (itemId: string, data: any) =>
    api.post(`/v1/inventory/item/${itemId}/adjust-stock`, data),
};