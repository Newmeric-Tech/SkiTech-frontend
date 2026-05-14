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
  myTasks: () => api.get("/v1/sop/my-tasks"),
  completeTask: (executionId: string) =>
    api.post(`/v1/sop/complete/${executionId}`),

  // Proof of work
  submitProof: (executionId: string, data: {
    proof_image: string;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
  }) => api.post(`/v1/sop/executions/${executionId}/submit-proof`, data),

  pendingApprovals: () =>
    api.get("/v1/sop/executions/pending-approval"),

  approveExecution: (executionId: string) =>
    api.post(`/v1/sop/executions/${executionId}/approve`),

  rejectExecution: (executionId: string, reason: string) =>
    api.post(`/v1/sop/executions/${executionId}/reject`, { reason }),
};