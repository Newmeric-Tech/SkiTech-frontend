"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { chatAPI, MessageItem } from "@/lib/api/chat";
import { useAuthStore } from "@/store/authStore";
import type { Chat } from "@/components/chat/ChatSidebar";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "??";
}

function formatTs(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapMsg(msg: MessageItem, myId: string) {
  const m = msg.media?.[0];
  return {
    id: msg.id,
    type: (
      m?.media_type === "image" ? "image"
      : m?.media_type === "audio" ? "audio"
      : m ? "file"
      : "text"
    ) as "text" | "image" | "file" | "audio",
    text: msg.content,
    fileName: m?.original_filename,
    fileSize: m ? fmtBytes(m.file_size_bytes) : undefined,
    timestamp: formatTs(msg.created_at),
    isSent: msg.sender.id === myId,
  };
}

export default function ChatIdPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuthStore();

  const [chat, setChat] = useState<Chat | null>(null);
  const [convPropertyId, setConvPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantId = user?.tenant_id ?? null;
  // Tenant Admins have no property_id — pass null and let backend scope to all tenant properties
  const userPropertyId = user?.property_id ?? null;
  const myId = user?.user_id ?? null;

  useEffect(() => {
    if (!tenantId || !myId || !id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      chatAPI.getConversation(tenantId, id, userPropertyId),
      chatAPI.getMessages(id, tenantId, userPropertyId),
    ])
      .then(([convRes, msgsRes]) => {
        const conv = convRes.data;
        const propId = conv.property_id ?? userPropertyId;
        setConvPropertyId(propId);

        let name: string;
        if (conv.type === "direct") {
          const other = conv.participants?.find(p => p.user.id !== myId);
          name = other
            ? `${other.user.first_name ?? ""} ${other.user.last_name ?? ""}`.trim() || "Direct Chat"
            : "Direct Chat";
        } else {
          name = conv.name ?? "Group Chat";
        }

        const messages = msgsRes.data.items.map(m => mapMsg(m, myId));

        setChat({
          id: conv.id,
          name,
          initials: getInitials(name),
          lastMessage: messages[messages.length - 1]?.text ?? "",
          timestamp: "",
          unread: 0,
          isOnline: false,
          type: conv.type === "group" ? "group" : "staff",
          messages,
        });
      })
      .catch((err) => {
        const detail = (err as any)?.response?.data?.detail ?? "Failed to load conversation";
        setError(typeof detail === "string" ? detail : JSON.stringify(detail));
      })
      .finally(() => setLoading(false));
  }, [id, tenantId, myId]);

  const handleSendMessage = (_chatId: string, message: { text?: string }) => {
    if (!tenantId || !myId || !message.text || !convPropertyId) return;
    chatAPI.sendMessage(id, tenantId, convPropertyId, message.text).catch(() => {});
  };

  if (!tenantId || !myId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#f9fafb" }}>
        <p style={{ fontFamily: "'Merriweather', serif", fontSize: 14, color: "#6b7280" }}>
          Not authenticated
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#f9fafb" }}>
        <p style={{ fontFamily: "'Merriweather', serif", fontSize: 14, color: "#6b7280" }}>
          Loading conversation…
        </p>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", background: "#f9fafb", padding: 40, textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Merriweather', serif", fontWeight: 700, fontSize: 20, color: "#111", marginBottom: 8 }}>
          {error ? "Failed to load conversation" : "Conversation not found"}
        </h2>
        <p style={{ fontFamily: "'Merriweather', serif", fontSize: 14, color: "#6b7280" }}>
          {error ?? "The conversation you're looking for doesn't exist."}
        </p>
      </div>
    );
  }

  return <ChatWindow chat={chat} onSendMessage={handleSendMessage} />;
}
