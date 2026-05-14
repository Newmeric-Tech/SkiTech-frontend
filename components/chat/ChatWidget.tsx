"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Minimize2, Maximize2, ChevronLeft,
  Phone, MoreVertical, Send, Mic, Image as ImageIcon,
  Paperclip, Smile, Search
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

/* ─────────── Types ─────────── */
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

interface Chat {
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

/* ─────────── Seed data ─────────── */
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

/* ─────────── Root widget ─────────── */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowHeight(window.innerHeight);
      const onResize = () => setWindowHeight(window.innerHeight);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  const panelWidth = isMaximized ? window.innerWidth : 360;
  const panelHeight = isMinimized ? 66 : isMaximized ? windowHeight : 600;
  const panelRadius = isMaximized ? 0 : 20;
  const panelShadow = isMaximized
    ? "-8px 0 40px rgba(0,0,0,0.14)"
    : "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)";

  const handleOpen = () => {
    if (!isOpen) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1400);
    }
    setIsOpen(!isOpen);
  };

  const handleMinimize = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsMinimized(true);
      setIsMaximized(false);
    }
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
    } else {
      setIsMaximized(true);
      setIsMinimized(false);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const matchesFilter = activeFilter === "all" || chat.type === activeFilter;
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeChat = selectedChat ? chats.find(c => c.id === selectedChat.id) ?? selectedChat : null;

  const handleSendMessage = (chatId: string, message: Message) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? {
            ...chat,
            messages: [...chat.messages, message],
            lastMessage: message.type === "text" ? (message.text ?? "") : `[${message.type}]`,
            timestamp: message.timestamp,
          }
        : chat
    ));
  };

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        gap: isMaximized ? 0 : 16,
        // Maximized: anchor to full right edge; normal: bottom-right corner
        ...(isMaximized
          ? { top: 0, right: 0, bottom: 0 }
          : { bottom: 24, right: 24 }),
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.97, width: panelWidth, height: panelHeight, borderRadius: panelRadius }}
            animate={{ opacity: 1, x: 0, scale: 1, width: panelWidth, height: panelHeight, borderRadius: panelRadius }}
            exit={{ opacity: 0, x: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            style={{
              background: "#ffffff",
              boxShadow: panelShadow,
              border: isMaximized ? "none" : "1.5px solid #e5e7eb",
              borderLeft: isMaximized ? "1.5px solid #e5e7eb" : undefined,
              overflow: "hidden",
              display: "flex",
              fontFamily: "'Merriweather', Georgia, serif",
              color: "#111111",
            }}
          >
            {isMaximized && activeChat ? (
              <div style={{ display: "flex", width: "100%", height: "100%" }}>
                <div style={{ width: 320, flexShrink: 0, borderRight: "1.5px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
                  <ChatList
                    chats={filteredChats}
                    onSelectChat={setSelectedChat}
                    onClose={() => setIsOpen(false)}
                    onMinimize={handleMinimize}
                    onMaximize={handleMaximize}
                    isMinimized={isMinimized}
                    isMaximized={isMaximized}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isLoading={isLoading}
                    compact
                    selectedChatId={selectedChat?.id}
                  />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <ChatWindow
                  chat={activeChat}
                  onBack={() => setSelectedChat(null)}
                  onSendMessage={handleSendMessage}
                  onClose={() => setIsOpen(false)}
                  onMinimize={handleMinimize}
                  onMaximize={handleMaximize}
                  isMinimized={isMinimized}
                  isMaximized={isMaximized}
                  compact={isMaximized}
                />
                </div>
              </div>
            ) : activeChat ? (
              <ChatWindow
                chat={activeChat}
                onBack={() => setSelectedChat(null)}
                onSendMessage={handleSendMessage}
                onClose={() => setIsOpen(false)}
                onMinimize={handleMinimize}
                onMaximize={handleMaximize}
                isMinimized={isMinimized}
                isMaximized={isMaximized}
              />
            ) : (
              <ChatList
                chats={filteredChats}
                onSelectChat={setSelectedChat}
                onClose={() => setIsOpen(false)}
                onMinimize={handleMinimize}
                onMaximize={handleMaximize}
                isMinimized={isMinimized}
                isMaximized={isMaximized}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoading={isLoading}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* FAB — always visible when not maximized */}
        {!isMaximized && (
          <motion.button
            key="chat-fab"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleOpen}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#111111",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
            flexShrink: 0,
          }}
        >
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {isOpen
              ? <X size={22} color="#ffffff" />
              : <MessageCircle size={22} color="#ffffff" />}
          </motion.div>
        </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── Chat list ─────────── */
interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isMinimized: boolean;
  isMaximized: boolean;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoading: boolean;
  compact?: boolean;
  selectedChatId?: string;
}

/* ─────────── Skeleton loader ─────────── */
function SkeletonChatItem() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 14px", borderRadius: 14 }}>
      {/* Avatar skeleton */}
      <div style={{
        width: 46, height: 46, borderRadius: "50%",
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "skeletonShimmer 1.4s infinite",
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Name row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{
            height: 12, width: "55%", borderRadius: 6,
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "skeletonShimmer 1.4s infinite",
          }} />
          <div style={{
            height: 10, width: 32, borderRadius: 6,
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "skeletonShimmer 1.4s infinite",
          }} />
        </div>
        {/* Message row */}
        <div style={{
          height: 10, width: "75%", borderRadius: 6,
          background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "skeletonShimmer 1.4s infinite",
        }} />
      </div>
    </div>
  );
}

const filters = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "staff", label: "Staff" },
  { id: "manager", label: "Manager" },
  { id: "group", label: "Group" },
];

function ChatList({ chats, onSelectChat, onClose, onMinimize, onMaximize, isMinimized, isMaximized, activeFilter, setActiveFilter, searchQuery, setSearchQuery, isLoading, compact, selectedChatId }: ChatListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: compact ? "12px 12px 0" : "16px 16px 0", borderBottom: "1.5px solid #f0f0f0" }}>
        {!compact && (
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
          <div style={{ display: "flex", gap: 4 }}>
            <IconBtn onClick={onMaximize} title={isMaximized ? "Restore" : "Expand"}>
              {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </IconBtn>
            <IconBtn onClick={onClose} title="Close"><X size={15} /></IconBtn>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#555", marginLeft: 6,
            }}>JD</div>
          </div>
        </div>
        )}

        {!compact && (
        <h2 style={{ fontFamily: "'Merriweather', serif", fontWeight: 700, fontSize: 17, color: "#111", margin: "0 0 12px" }}>
          Chats
        </h2>
        )}

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
        <div style={{ display: "flex", gap: 6, paddingBottom: 12 }}>
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
      </div>

      {/* Skeleton keyframes — injected once */}
      <style>{`
        @keyframes skeletonShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {isLoading ? (
          <>
            {/* Loading header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px 6px",
              color: "#9ca3af", fontSize: 12, fontFamily: "'Merriweather', serif",
            }}>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#d1d5db" }}
              />
              Loading conversations…
            </div>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonChatItem key={i} />
            ))}
          </>
        ) : (
chats.map((chat) => (
              <ChatItem key={chat.id} chat={chat} onClick={() => onSelectChat(chat)} isSelected={chat.id === selectedChatId} />
            ))
        )}
      </div>
    </div>
  );
}

/* ─────────── Chat item ─────────── */
function ChatItem({ chat, onClick, isSelected }: { chat: Chat; onClick: () => void; isSelected?: boolean }) {
  const [hovered, setHovered] = useState(false);

  const typeGradient: Record<string, string> = {
    ai:      "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    staff:   "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    manager: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    group:   "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  };

  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ background: isSelected ? "#e8e8e8" : hovered ? "#f5f5f7" : "#ffffff" }}
      onClick={onClick}
      style={{
        width: "100%", padding: "11px 14px",
        borderRadius: 14, display: "flex", alignItems: "center",
        gap: 13, border: "none", cursor: "pointer", textAlign: "left",
        fontFamily: "'Merriweather', serif",
      }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 46, height: 46, borderRadius: "50%",
          background: typeGradient[chat.type],
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, color: "#fff",
          fontFamily: "'Merriweather', serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>{chat.initials}</div>
        {/* Online / Offline dot */}
        <span style={{
          position: "absolute", bottom: 2, right: 2,
          width: 12, height: 12, borderRadius: "50%",
          background: chat.isOnline ? "#22c55e" : "#9ca3af",
          border: "2.5px solid #fff",
          boxShadow: chat.isOnline ? "0 0 0 2px rgba(34,197,94,0.25)" : "none",
          transition: "background 0.3s",
        }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: chat.unread > 0 ? 700 : 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {chat.type === "ai" && <span style={{ marginRight: 4 }}>✨</span>}
            {chat.name}
          </span>
          <span style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0, whiteSpace: "nowrap" }}>{chat.timestamp}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {chat.unread === 0 && (
            <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>✓✓</span>
          )}
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
    </motion.button>
  );
}

/* ─────────── Chat window ─────────── */
interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
  onSendMessage: (chatId: string, message: Message) => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isMinimized: boolean;
  isMaximized: boolean;
  compact?: boolean;
}

const EMOJIS = [
  "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😚",
  "😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","😐","😑","😶","😏","😒","🙄","😬","😔",
  "😪","😴","😷","🤒","🤧","🥵","🥶","😵","🤯","🤠","🥸","😎","🧐","😭","😢","😤","😡","🤬",
  "❤️","🧡","💛","💚","💙","💜","🖤","💔","✨","🎉","🎊","🔥","⭐","💯","🎯","🚀","👍","👎",
  "👋","🙏","👏","🤝","💪","✌️","🤞","🤙","👌","🫶","🌟","😎","🥳","👀","💬","📎","📷","🎤",
];

function ChatWindow({ chat, onBack, onSendMessage, onClose, onMinimize, onMaximize, isMinimized, isMaximized, compact }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const ts = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sendText = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage(chat.id, { id: Date.now().toString(), type: "text", text, timestamp: ts(), isSent: true });
    setInput("");
    setShowEmoji(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    onSendMessage(chat.id, { id: Date.now().toString(), type: "image", imageUrl: URL.createObjectURL(file), fileName: file.name, timestamp: ts(), isSent: true });
    e.target.value = "";
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const kb = file.size / 1024;
    const size = kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
    onSendMessage(chat.id, { id: Date.now().toString(), type: "file", fileName: file.name, fileSize: size, fileUrl: URL.createObjectURL(file), timestamp: ts(), isSent: true });
    e.target.value = "";
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec; chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" }));
        stream.getTracks().forEach(t => t.stop());
        onSendMessage(chat.id, { id: Date.now().toString(), type: "audio", audioUrl: url, timestamp: ts(), isSent: true });
      };
      rec.start(); setIsRecording(true);
      let s = 0;
      timerRef.current = setInterval(() => { s++; setRecTime(s); }, 1000);
    } catch { alert("Microphone access denied."); }
  };

  const stopRec = () => {
    recorderRef.current?.stop(); setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecTime(0);
  };

  const fmtRec = (s: number) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff", position: "relative" }}>
      {/* Hidden file inputs */}
      <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImageChange} />
      <input ref={fileRef} type="file" style={{ display: "none" }} onChange={onFileChange} />

      {/* Header with SkiTech branding */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1.5px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <IconBtn onClick={onBack}><ChevronLeft size={16} /></IconBtn>
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
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          <IconBtn onClick={onMaximize} title={isMaximized ? "Restore" : "Expand"}>
            {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </IconBtn>
          <IconBtn onClick={onClose} title="Close"><X size={15} /></IconBtn>
        </div>
      </div>

      {/* Chat info bar */}
      <div style={{ padding: "10px 16px", borderBottom: "1.5px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10, background: "#fff" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#111", fontFamily: "'Merriweather', serif" }}>{chat.initials}</div>
          <span style={{
            position: "absolute", bottom: 1, right: 1,
            width: 10, height: 10, borderRadius: "50%",
            background: chat.isOnline ? "#22c55e" : "#9ca3af",
            border: "2px solid #fff",
            boxShadow: chat.isOnline ? "0 0 0 2px rgba(34,197,94,0.2)" : "none",
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111", fontFamily: "'Merriweather', serif" }}>{chat.name}</div>
          <div style={{ fontSize: 11, color: chat.isOnline ? "#22c55e" : "#9ca3af", fontFamily: "'Merriweather', serif" }}>
            {chat.isOnline ? "Online" : "Offline"}
          </div>
        </div>
        <IconBtn onClick={() => {}}><MoreVertical size={15} /></IconBtn>
      </div>

      <div style={{ background: "#f9fafb", padding: "6px 0", textAlign: "center", fontSize: 11, color: "#9ca3af", fontFamily: "'Merriweather', serif", borderBottom: "1px solid #f0f0f0" }}>Today</div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {chat.messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{ position: "absolute", bottom: 64, left: 8, right: 8, background: "#fff", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1.5px solid #e5e7eb", padding: 10, zIndex: 10, display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 2, maxHeight: 190, overflowY: "auto" }}>
          {EMOJIS.map((em, i) => (
            <button key={i} onClick={() => setInput(p => p + em)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4, borderRadius: 6, lineHeight: 1 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >{em}</button>
          ))}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div style={{ padding: "8px 14px", background: "#fff1f2", borderTop: "1px solid #fecdd3", display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontSize: 13, color: "#ef4444", fontFamily: "'Merriweather', serif", fontWeight: 700 }}>Recording {fmtRec(recTime)}</span>
          <button onClick={stopRec} style={{ marginLeft: "auto", fontSize: 11, color: "#ef4444", background: "none", border: "1px solid #ef4444", borderRadius: 99, padding: "3px 10px", cursor: "pointer", fontFamily: "'Merriweather', serif" }}>Stop &amp; Send</button>
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding: "10px 12px", borderTop: "1.5px solid #f0f0f0", background: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
        <IconBtn onClick={() => setShowEmoji(p => !p)} title="Emoji"><Smile size={15} /></IconBtn>
        <IconBtn onClick={() => fileRef.current?.click()} title="Attach file"><Paperclip size={15} /></IconBtn>
        <IconBtn onClick={() => imageRef.current?.click()} title="Attach image"><ImageIcon size={15} /></IconBtn>
        <input
          placeholder="Type a message…" value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={onKey}
          style={{ flex: 1, padding: "9px 14px", borderRadius: 99, border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 13, color: "#111", fontFamily: "'Merriweather', serif", outline: "none" }}
        />
        <button onClick={input.trim() ? sendText : isRecording ? stopRec : startRec}
          style={{ width: 36, height: 36, borderRadius: "50%", background: isRecording ? "#ef4444" : "#111111", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
          {input.trim() ? <Send size={15} color="#fff" /> : <Mic size={15} color="#fff" />}
        </button>
      </div>
    </div>
  );
}

/* ─────────── Message bubble ─────────── */
function MessageBubble({ message }: { message: Message }) {
  const sent = message.isSent;
  const bubbleStyle: React.CSSProperties = {
    maxWidth: "78%", padding: "10px 14px", borderRadius: 18,
    background: sent ? "#111111" : "#f3f4f6",
    color: sent ? "#ffffff" : "#111111",
    borderBottomRightRadius: sent ? 4 : 18,
    borderBottomLeftRadius: sent ? 18 : 4,
    overflow: "hidden",
  };
  const tsStyle: React.CSSProperties = { fontSize: 10, opacity: 0.6, fontFamily: "'Merriweather', serif", display: "block", marginTop: 4, textAlign: sent ? "right" : "left" };

  return (
    <div style={{ display: "flex", justifyContent: sent ? "flex-end" : "flex-start" }}>
      <div style={bubbleStyle}>
        {message.type === "text" && (
          <p style={{ margin: 0, fontSize: 13, fontFamily: "'Merriweather', serif", lineHeight: 1.5 }}>{message.text}</p>
        )}
        {message.type === "image" && (
          <img src={message.imageUrl} alt={message.fileName ?? "image"} style={{ maxWidth: "100%", borderRadius: 10, display: "block" }} />
        )}
        {message.type === "file" && (
          <a href={message.fileUrl} download={message.fileName} style={{ color: "inherit", textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: sent ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Paperclip size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Merriweather', serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{message.fileName}</div>
                <div style={{ fontSize: 10, opacity: 0.6, fontFamily: "'Merriweather', serif" }}>{message.fileSize} · Tap to download</div>
              </div>
            </div>
          </a>
        )}
        {message.type === "audio" && (
          <audio src={message.audioUrl} controls style={{ width: "100%", minWidth: 180, height: 36, borderRadius: 8 }} />
        )}
        <span style={tsStyle}>{message.timestamp}</span>
      </div>
    </div>
  );
}


/* ─────────── Tiny icon button ─────────── */
function IconBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
        background: hov ? "#f3f4f6" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#555", transition: "background 0.15s",
      }}
    >{children}</button>
  );
}
