"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, Search, Minimize2, Maximize2, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  MessageCircle
} from "lucide-react";

const filters = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "staff", label: "Staff" },
  { id: "manager", label: "Manager" },
  { id: "group", label: "Group" },
];

interface Message {
  id: string;
  type: "text" | "image" | "file" | "audio";
  text?: string;
  imageUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  audioUrl?: string;
  timestamp: string;
  isSent: boolean;
}

export interface Chat {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  type: "ai" | "staff" | "manager" | "group";
  messages: Message[];
}

const initialChats: Chat[] = [
  {
    id: "1",
    name: "SkiTech AI Assistant",
    initials: "AI",
    lastMessage: "Hello! I'm your SkiTech AI assistant…",
    timestamp: "2:30 PM",
    unread: 2,
    isOnline: true,
    type: "ai",
    messages: [
      {
        id: "m1",
        type: "text",
        text: "Hello! I'm your SkiTech AI assistant. I can help you analyse data, generate reports, or answer property-management questions.",
        timestamp: "2:30 PM",
        isSent: false,
      },
    ],
  },
  {
    id: "2",
    name: "Sarah — Front Desk",
    initials: "SR",
    lastMessage: "Guest check-in is complete",
    timestamp: "1:45 PM",
    unread: 0,
    isOnline: true,
    type: "staff",
    messages: [],
  },
  {
    id: "3",
    name: "John — Housekeeping Manager",
    initials: "JH",
    lastMessage: "Rooms are ready for inspection",
    timestamp: "11:30 AM",
    unread: 1,
    isOnline: false,
    type: "manager",
    messages: [],
  },
  {
    id: "4",
    name: "Evening Shift — Group",
    initials: "ES",
    lastMessage: "Shift briefing at 5 PM",
    timestamp: "Yesterday",
    unread: 0,
    isOnline: true,
    type: "group",
    messages: [],
  },
];

export function ChatSidebar({ 
  collapsed: externalCollapsed, 
  onToggleCollapse,
  activeChatId 
}: { 
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  activeChatId?: string;
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats] = useState<Chat[]>(initialChats);

  const filteredChats = chats.filter((chat) => {
    const matchesFilter = activeFilter === "all" || chat.type === activeFilter;
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const typeGradient: Record<string, string> = {
    ai:      "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    staff:   "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    manager: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    group:   "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100%",
      width: externalCollapsed ? 60 : 280,
      transition: "width 0.3s ease",
      background: "#ffffff",
      borderRight: "1.5px solid #e5e7eb",
    }}>
      {/* Sidebar Header */}
      <div style={{ 
        padding: externalCollapsed ? "12px 8px" : "16px 16px 0", 
        borderBottom: "1.5px solid #f0f0f0" 
      }}>
        {!externalCollapsed && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "#111111", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Merriweather', serif" }}>S</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#111", fontFamily: "'Merriweather', serif", letterSpacing: "-0.3px" }}>
                  SkiTech
                </span>
              </div>
              <button 
                onClick={onToggleCollapse}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
                  background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#555", transition: "background 0.15s",
                }}
                title="Collapse sidebar"
              >
                <ChevronLeft size={15} />
              </button>
            </div>

            <h2 style={{ fontFamily: "'Merriweather', serif", fontWeight: 700, fontSize: 17, color: "#111", margin: "0 0 12px" }}>
              Chats
            </h2>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                placeholder="Search conversations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "8px 12px 8px 32px",
                  borderRadius: 10, border: "1.5px solid #e5e7eb",
                  background: "#f9fafb", fontSize: 13,
                  color: "#111", fontFamily: "'Merriweather', serif",
                  outline: "none",
                }}
              />
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 6, paddingBottom: 12, flexWrap: "wrap" }}>
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    padding: "5px 14px", borderRadius: 99, border: "none", cursor: "pointer",
                    fontFamily: "'Merriweather', serif", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                    background: activeFilter === f.id ? "#111111" : "#f3f4f6",
                    color: activeFilter === f.id ? "#fff" : "#555",
                    transition: "all 0.15s",
                  }}
                >{f.label}</button>
              ))}
            </div>
          </>
        )}

        {externalCollapsed && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <button 
              onClick={onToggleCollapse}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
                background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#555", transition: "background 0.15s",
              }}
              title="Expand sidebar"
            >
              <ChevronRight size={15} />
            </button>
            <MessageCircle size={18} style={{ color: "#555", marginTop: 8 }} />
          </div>
        )}
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {filteredChats.map((chat) => (
          <Link
            key={chat.id}
            href={`/owner/chat/${chat.id}`}
            style={{ textDecoration: "none" }}
          >
            <motion.div
              whileHover={{ background: "#f5f5f7" }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: "11px 14px",
                borderRadius: 14,
                cursor: "pointer",
                background: chat.id === activeChatId ? "#e8e8e8" : "transparent",
                fontFamily: "'Merriweather', serif",
                border: "none",
                width: "100%",
                textAlign: "left",
              }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: externalCollapsed ? 36 : 46,
                  height: externalCollapsed ? 36 : 46,
                  borderRadius: "50%",
                  background: typeGradient[chat.type],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: externalCollapsed ? 11 : 14,
                  fontWeight: 700, color: "#fff",
                  fontFamily: "'Merriweather', serif",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}>{chat.initials}</div>
                <span style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 10, height: 10, borderRadius: "50%",
                  background: chat.isOnline ? "#22c55e" : "#9ca3af",
                  border: "2px solid #fff",
                }} />
              </div>

              {/* Text - hide when collapsed */}
              {!externalCollapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3, gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: chat.unread > 0 ? 700 : 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {chat.type === "ai" && <span style={{ marginRight: 4 }}>✨</span>}
                      {chat.name}
                    </span>
                    <span style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0, whiteSpace: "nowrap" }}>{chat.timestamp}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 12, color: chat.unread > 0 ? "#111" : "#6b7280", fontWeight: chat.unread > 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0, flex: 1 }}>
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span style={{
                        minWidth: 20, height: 20, borderRadius: 99,
                        background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "0 6px", flexShrink: 0,
                      }}>{chat.unread}</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Export the chat data for use in other components
export { initialChats };
