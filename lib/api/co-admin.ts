import api from "@/lib/config/app";

export interface CoAdminRequestPayload {
  proposed_email: string;
  proposed_name: string;
  property_id: string;
}

export interface CoAdminRequestItem {
  id: string;
  status: "pending" | "approved" | "rejected";
  proposed_email: string;
  proposed_name: string;
  property_id: string;
  property_name: string;
  superadmin_note: string | null;
  created_at: string;
}

export const coAdminAPI = {
  submitRequest: (data: CoAdminRequestPayload) =>
    api.post<CoAdminRequestItem>("/v1/co-admin/requests", data),

  listMyRequests: () =>
    api.get<CoAdminRequestItem[]>("/v1/co-admin/requests"),
};
