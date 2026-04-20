import api from "@/lib/config/app";

export const usersAPI = {
  me: () => api.get("/v1/users/me"),
  updateMe: (data: any) => api.put("/v1/users/me", data),
  changePassword: (data: {
    current_password: string;
    new_password: string;
  }) => api.post("/v1/users/me/change-password", data),
  list: (propertyId?: string) =>
    api.get("/v1/users/", { params: { property_id: propertyId } }),
  get: (userId: string) => api.get(`/v1/users/${userId}`),
  updateRole: (userId: string, roleId: string) =>
    api.put(`/v1/users/${userId}/role`, { role_id: roleId }),
  deactivate: (userId: string) =>
    api.put(`/v1/users/${userId}/deactivate`),
  activate: (userId: string) =>
    api.put(`/v1/users/${userId}/activate`),
  invite: (data: any) => api.post("/v1/users/invite", data),
};