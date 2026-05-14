import api from "@/lib/config/app";

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role_id: string;
  tenant_id: string;
  property_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  property_id?: string;
}

export interface UserInvite {
  email: string;
  role?: string;
  property_id?: string;
  first_name?: string;
  last_name?: string;
}

export const usersAPI = {
  me: () => api.get<User>("/v1/users/me"),
  updateMe: (data: UserUpdate) => api.put<User>("/v1/users/me", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/v1/users/me/change-password", data),
  list: (propertyId?: string, role?: string) =>
    api.get<User[]>("/v1/users/", { params: { property_id: propertyId, role } }),
  get: (userId: string) => api.get<User>(`/v1/users/${userId}`),
  updateRole: (userId: string, roleId: string) =>
    api.put<User>(`/v1/users/${userId}/role`, { role_id: roleId }),
  deactivate: (userId: string) => api.put<User>(`/v1/users/${userId}/deactivate`),
  activate: (userId: string) => api.put<User>(`/v1/users/${userId}/activate`),
  invite: (data: UserInvite) => api.post<User>("/v1/users/invite", data),
};
