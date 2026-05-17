import api from "@/lib/config/app";

export interface ChatContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface LastMessage {
  id: string;
  content: string;
  sender: ChatContact;
  created_at: string;
}

export interface ConversationListItem {
  id: string;
  type: "direct" | "group";
  name: string | null;
  avatar_url: string | null;
  other_participants: ChatContact[];
  last_message: LastMessage | null;
  participant_count: number;
  unread_count: number;
  is_archived: boolean;
  is_muted: boolean;
  updated_at: string;
}

export interface ConversationDetail {
  id: string;
  type: "direct" | "group";
  name: string | null;
  participants: Array<{ user: ChatContact; role: string; joined_at: string }>;
  is_archived: boolean;
  participant_count: number;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  media_type: "image" | "file" | "video" | "audio";
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  storage_key: string;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender: ChatContact;
  content: string;
  media: MediaItem[];
  created_at: string;
  edited_at: string | null;
  delivery_status: string | null;
}

export const chatAPI = {
  contacts: (tenantId: string, propertyId: string) =>
    api.get<ChatContact[]>("/v1/chat/contacts", {
      params: { tenant_id: tenantId, property_id: propertyId },
    }),

  listConversations: (tenantId: string, propertyId: string, skip = 0, limit = 50) =>
    api.get<{ total: number; skip: number; limit: number; items: ConversationListItem[] }>(
      "/v1/chat/conversations",
      { params: { tenant_id: tenantId, property_id: propertyId, skip, limit } }
    ),

  createDirect: (tenantId: string, propertyId: string, otherUserId: string) =>
    api.post<ConversationDetail>(
      "/v1/chat/conversations/direct",
      { other_user_id: otherUserId },
      { params: { tenant_id: tenantId, property_id: propertyId } }
    ),

  getMessages: (
    conversationId: string,
    tenantId: string,
    propertyId: string,
    skip = 0,
    limit = 50
  ) =>
    api.get<{ total: number; items: MessageItem[] }>(
      `/v1/chat/conversations/${conversationId}/messages`,
      { params: { tenant_id: tenantId, property_id: propertyId, skip, limit } }
    ),

  sendMessage: (
    conversationId: string,
    tenantId: string,
    propertyId: string,
    content: string
  ) =>
    api.post<MessageItem>(
      `/v1/chat/conversations/${conversationId}/messages`,
      { conversation_id: conversationId, content },
      { params: { tenant_id: tenantId, property_id: propertyId } }
    ),

  uploadMedia: (
    conversationId: string,
    tenantId: string,
    propertyId: string,
    messageId: string,
    file: File
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<MediaItem>(
      `/v1/chat/conversations/${conversationId}/media/upload`,
      formData,
      {
        params: { tenant_id: tenantId, property_id: propertyId, message_id: messageId },
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};
