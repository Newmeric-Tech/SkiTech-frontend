import api from "@/lib/config/app";

export const sopAPI = {
  listCategories: (propertyId: string) =>
    api.get(`/v1/sop/categories/${propertyId}`),
  createCategory: (propertyId: string, data: any) =>
    api.post(`/v1/sop/categories`, data, { params: { property_id: propertyId } }),
  listSOPs: (propertyId: string, categoryId?: string, departmentId?: string) =>
    api.get(`/v1/sop/items/${propertyId}`, {
      params: { category_id: categoryId, department_id: departmentId },
    }),
  getSOp: (sopId: string) => api.get(`/v1/sop/items/detail/${sopId}`),
  createSOP: (propertyId: string, data: any) =>
    api.post(`/v1/sop/items`, data, { params: { property_id: propertyId } }),
  updateSOP: (sopId: string, data: any) =>
    api.put(`/v1/sop/items/${sopId}`, data),
  deleteSOP: (sopId: string) => api.delete(`/v1/sop/items/${sopId}`),
  listVersions: (sopId: string) =>
    api.get(`/v1/sop/items/${sopId}/versions`),
  createVersion: (sopId: string, data: any) =>
    api.post(`/v1/sop/items/${sopId}/versions`, data),
};