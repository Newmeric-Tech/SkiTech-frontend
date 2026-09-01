import api from "@/lib/config/app";

export type ChannelManagerProvider = "channex" | "mews" | "cloudbeds" | "siteminder" | "little_hotelier";

export type ConnectionStatus = "active" | "error" | "pending" | "disconnected";

export interface Integration {
  id: string;
  provider_name: ChannelManagerProvider | string;
  property_id: string;
  property_name: string | null;
  connection_status: ConnectionStatus;
  last_sync_at: string | null;
  error_message: string | null;
}

export interface TestConnectionPayload {
  provider_name: string;
  credentials: Record<string, unknown>;
}

export interface CreateIntegrationPayload {
  provider_name: string;
  property_id: string;
  credentials: Record<string, unknown>;
}

export const channelManagerAPI = {
  list: () => api.get<Integration[]>("/v1/channel-manager/integrations"),

  testConnection: (data: TestConnectionPayload) =>
    api.post<{ success: boolean; message: string }>("/v1/channel-manager/integrations/test", data),

  create: (data: CreateIntegrationPayload) =>
    api.post<Integration>("/v1/channel-manager/integrations", data),

  disconnect: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/v1/channel-manager/integrations/${id}`),

  syncNow: (id: string) =>
    api.post<{ success: boolean; message: string }>(`/v1/channel-manager/integrations/${id}/sync`),
};
