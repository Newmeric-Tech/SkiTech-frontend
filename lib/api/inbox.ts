/**
 * Inbox API — lib/api/inbox.ts
 * Wraps all /v1/inbox/* endpoints
 *
 * v1 sources: complaints (escalated) and inventory (low stock) only.
 * SOP approvals and shift-replacement requests are held back — see
 * DEVELOPMENT_LOG.md ("Architecture Debt") for why.
 */
import api from "@/lib/config/app";

export type InboxStatus = "unread" | "read" | "actioned" | "dismissed";
export type InboxSourceModule = "complaints" | "inventory";
export type InboxItemType = "complaint_escalated" | "low_stock";

export interface InboxItem {
  id: string;
  tenant_id: string;
  property_id: string | null;
  source_module: InboxSourceModule;
  item_type: InboxItemType;
  source_record_id: string;
  recipient_user_id: string | null;
  recipient_role: string | null;
  title: string;
  body: string;
  status: InboxStatus;
  created_at: string;
  read_at: string | null;
}

interface ListInboxParams {
  status?: InboxStatus;
  source_module?: InboxSourceModule;
  item_type?: InboxItemType;
  skip?: number;
  limit?: number;
}

interface PaginatedInboxResponse {
  total: number;
  skip: number;
  limit: number;
  items: InboxItem[];
}

export const inboxAPI = {
  list: async (params: ListInboxParams = {}): Promise<PaginatedInboxResponse> => {
    const { data } = await api.get<PaginatedInboxResponse>("/v1/inbox", { params });
    return data;
  },

  unreadCount: async (): Promise<number> => {
    const { data } = await api.get<{ unread_count: number }>("/v1/inbox/unread-count");
    return data.unread_count;
  },

  markRead: async (id: string): Promise<InboxItem> => {
    const { data } = await api.put<InboxItem>(`/v1/inbox/${id}/read`);
    return data;
  },

  markActioned: async (id: string): Promise<InboxItem> => {
    const { data } = await api.put<InboxItem>(`/v1/inbox/${id}/actioned`);
    return data;
  },

  dismiss: async (id: string): Promise<InboxItem> => {
    const { data } = await api.put<InboxItem>(`/v1/inbox/${id}/dismiss`);
    return data;
  },
};

/** Resolves an inbox item to the real page that shows the underlying record. */
export function resolveInboxLink(item: InboxItem): string {
  if (item.source_module === "complaints") {
    return `/owner/complaints?highlight=${item.source_record_id}`;
  }
  if (item.source_module === "inventory") {
    const propertyParam = item.property_id ? `property=${item.property_id}&` : "";
    return `/owner/inventory?${propertyParam}highlight=${item.source_record_id}`;
  }
  return "/owner";
}
