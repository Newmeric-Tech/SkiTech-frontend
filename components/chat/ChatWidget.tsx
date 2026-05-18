"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Minimize2, Maximize2, ChevronLeft,
  MoreVertical, Send, Mic, Image as ImageIcon,
  Paperclip, Smile, Search, UserPlus, ArrowLeft, Users, Check,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { usersAPI } from "@/lib/api/users";
import { propertiesAPI } from "@/lib/api/properties";
import { chatAPI, ChatContact, ConversationListItem as APIConversation, MessageItem } from "@/lib/api/chat";

/* ─────────── Local types ─────────── */
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
  type: "direct" | "group";
  otherParticipantId?: string;
  messages: Message[];
}

/* ─────────── Helpers ─────────── */
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
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapConv(conv: APIConversation, myId: string): Chat {
  let name: string, otherParticipantId: string | undefined;
  if (conv.type === "direct") {
    const other = conv.other_participants?.[0];
    if (other) {
      name = `${other.first_name ?? ""} ${other.last_name ?? ""}`.trim() || other.email;
      otherParticipantId = other.id;
    } else { name = "Direct Chat"; }
  } else {
    name = conv.name ?? "Group Chat";
  }
  return {
    id: conv.id,
    name,
    initials: getInitials(name),
    lastMessage: conv.last_message?.content ?? "Tap to start chatting",
    timestamp: formatTs(conv.updated_at),
    unread: conv.unread_count,
    isOnline: false,
    type: conv.type,
    otherParticipantId,
    messages: [],
  };
}

function mapMsg(msg: MessageItem, myId: string): Message {
  const m = msg.media?.[0];
  return {
    id: msg.id,
    type: m?.media_type === "image" ? "image" : m?.media_type === "audio" ? "audio" : m ? "file" : "text",
    text: msg.content,
    fileName: m?.original_filename,
    fileSize: m ? fmtBytes(m.file_size_bytes) : undefined,
    timestamp: formatTs(msg.created_at),
    isSent: msg.sender.id === myId,
  };
}

/* ─────────── Root widget ─────────── */
export default function ChatWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800);
  const [myProfile, setMyProfile] = useState<{ id: string; property_id: string | null } | null>(null);
  const [effectivePropertyId, setEffectivePropertyId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contactPickerMode, setContactPickerMode] = useState<"direct" | "group">("direct");
  const profileLoaded = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowHeight(window.innerHeight);
      const h = () => setWindowHeight(window.innerHeight);
      window.addEventListener("resize", h);
      return () => window.removeEventListener("resize", h);
    }
  }, []);

  // Load profile + resolve effective property_id on first open
  useEffect(() => {
    if (!isOpen || profileLoaded.current) return;
    profileLoaded.current = true;
    usersAPI.me()
      .then(async res => {
        const profile = { id: res.data.id, property_id: res.data.property_id ?? null };
        setMyProfile(profile);
        if (profile.property_id) {
          setEffectivePropertyId(profile.property_id);
        } else {
          // Tenant Admin with no property assigned — pick first available property
          try {
            const propsRes = await propertiesAPI.list();
            if (propsRes.data.length > 0) {
              setEffectivePropertyId(propsRes.data[0].id);
            }
          } catch { /* no-op */ }
        }
      })
      .catch(() => { profileLoaded.current = false; });
  }, [isOpen]);

  // Load conversations whenever effective property is ready
  useEffect(() => {
    if (!myProfile || !user?.tenant_id || !effectivePropertyId) return;
    setIsLoading(true);
    chatAPI.listConversations(user.tenant_id, effectivePropertyId)
      .then(res => setChats(res.data.items.map(c => mapConv(c, myProfile.id))))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [myProfile, user?.tenant_id, effectivePropertyId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedChat || !myProfile || !user?.tenant_id || !effectivePropertyId) return;
    setMessagesLoading(true);
    setMessages([]);
    chatAPI.getMessages(selectedChat.id, user.tenant_id, effectivePropertyId)
      .then(res => setMessages(res.data.items.map(m => mapMsg(m, myProfile.id))))
      .catch(() => {})
      .finally(() => setMessagesLoading(false));
  }, [selectedChat?.id]);

  const reloadConversations = useCallback(() => {
    if (!myProfile || !user?.tenant_id || !effectivePropertyId) return;
    chatAPI.listConversations(user.tenant_id, effectivePropertyId)
      .then(res => setChats(res.data.items.map(c => mapConv(c, myProfile.id))))
      .catch(() => {});
  }, [myProfile, user?.tenant_id, effectivePropertyId]);

  // Load contacts reactively — fires whenever showNewChat opens AND effectivePropertyId is ready,
  // regardless of which one arrived first.
  useEffect(() => {
    if (!showNewChat || !effectivePropertyId || !user?.tenant_id || contacts.length > 0) return;
    setContactsLoading(true);
    chatAPI.contacts(user.tenant_id, effectivePropertyId)
      .then(res => setContacts(res.data))
      .catch(() => {})
      .finally(() => setContactsLoading(false));
  }, [showNewChat, effectivePropertyId, user?.tenant_id]);

  const handleOpenNewChat = useCallback((mode: "direct" | "group" = "direct") => {
    setContactPickerMode(mode);
    setShowNewChat(true);
  }, []);

  const handleStartDirect = useCallback(async (contact: ChatContact) => {
    if (!effectivePropertyId || !user?.tenant_id) return;
    setShowNewChat(false);
    try {
      const res = await chatAPI.createDirect(user.tenant_id, effectivePropertyId, contact.id);
      reloadConversations();
      const name = `${contact.first_name} ${contact.last_name}`.trim() || contact.email;
      const newChat: Chat = {
        id: res.data.id,
        name,
        initials: getInitials(name),
        lastMessage: "Tap to start chatting",
        timestamp: formatTs(res.data.updated_at),
        unread: 0,
        isOnline: false,
        type: "direct",
        otherParticipantId: contact.id,
        messages: [],
      };
      setChats(prev => prev.some(c => c.id === newChat.id) ? prev : [newChat, ...prev]);
      setSelectedChat(newChat);
    } catch { /* silently ignore */ }
  }, [effectivePropertyId, user?.tenant_id, reloadConversations]);

  const handleCreateGroup = useCallback(async (name: string, participants: ChatContact[]) => {
    if (!effectivePropertyId || !user?.tenant_id || !myProfile) return;
    setShowNewChat(false);
    try {
      const res = await chatAPI.createGroup(
        user.tenant_id,
        effectivePropertyId,
        name,
        participants.map(p => p.id)
      );
      reloadConversations();
      const newChat: Chat = {
        id: res.data.id,
        name: res.data.name ?? name,
        initials: getInitials(name),
        lastMessage: "Group created",
        timestamp: formatTs(res.data.updated_at),
        unread: 0,
        isOnline: false,
        type: "group",
        messages: [],
      };
      setChats(prev => prev.some(c => c.id === newChat.id) ? prev : [newChat, ...prev]);
      setSelectedChat(newChat);
    } catch { /* silently ignore */ }
  }, [effectivePropertyId, user?.tenant_id, myProfile, reloadConversations]);

  const handleSendMessage = useCallback(async (chatId: string, message: Message) => {
    setMessages(prev => [...prev, message]);
    setChats(prev => prev.map(c =>
      c.id === chatId
        ? { ...c, lastMessage: message.type === "text" ? (message.text ?? "") : `[${message.type}]`, timestamp: message.timestamp }
        : c
    ));

    if (message.type === "text" && message.text && effectivePropertyId && user?.tenant_id && myProfile) {
      chatAPI.sendMessage(chatId, user.tenant_id, effectivePropertyId, message.text)
        .then(res => {
          const real = mapMsg(res.data, myProfile.id);
          setMessages(prev => prev.map(m => m.id === message.id ? real : m));
        })
        .catch(() => { /* keep optimistic */ });
    }
  }, [effectivePropertyId, user?.tenant_id, myProfile]);

  const handleSendFile = useCallback(async (chatId: string, file: File, type: "image" | "file", localUrl: string) => {
    if (!effectivePropertyId || !user?.tenant_id || !myProfile) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const tempId = `temp-${Date.now()}`;
    const localMsg: Message = {
      id: tempId, type,
      text: file.name,
      imageUrl: type === "image" ? localUrl : undefined,
      fileName: file.name,
      fileSize: fmtBytes(file.size),
      fileUrl: type === "file" ? localUrl : undefined,
      timestamp: ts,
      isSent: true,
    };
    setMessages(prev => [...prev, localMsg]);
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMessage: `[${type}]`, timestamp: ts } : c));

    chatAPI.sendMessage(chatId, user.tenant_id, effectivePropertyId, file.name)
      .then(msgRes => {
        const msgId = msgRes.data.id;
        setMessages(prev => prev.map(m => m.id === tempId ? { ...localMsg, id: msgId } : m));
        return chatAPI.uploadMedia(chatId, user.tenant_id!, effectivePropertyId!, msgId, file);
      })
      .catch(() => { /* keep local display */ });
  }, [effectivePropertyId, user?.tenant_id, myProfile]);

  const panelWidth = isMaximized ? (typeof window !== "undefined" ? window.innerWidth : 1200) : 360;
  const panelHeight = isMinimized ? 66 : isMaximized ? windowHeight : 600;
  const panelRadius = isMaximized ? 0 : 20;
  const panelShadow = isMaximized
    ? "-8px 0 40px rgba(0,0,0,0.14)"
    : "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)";

  const handleMinimize = () => { setIsMinimized(p => { if (!p) setIsMaximized(false); return !p; }); };
  const handleMaximize = () => { setIsMaximized(p => { if (!p) setIsMinimized(false); return !p; }); };

  const filteredChats = chats.filter(c => {
    const matchesFilter = activeFilter === "all" || c.type === activeFilter;
    return matchesFilter && c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeChat = selectedChat ? (chats.find(c => c.id === selectedChat.id) ?? selectedChat) : null;

  return (
    <div
      style={{
        position: "fixed", zIndex: 50,
        display: "flex", flexDirection: "column",
        alignItems: "flex-end", justifyContent: "flex-end",
        gap: isMaximized ? 0 : 16,
        ...(isMaximized ? { top: 0, right: 0, bottom: 0 } : { bottom: 24, right: 24 }),
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
              background: "#ffffff", boxShadow: panelShadow,
              border: isMaximized ? "none" : "1.5px solid #e5e7eb",
              borderLeft: isMaximized ? "1.5px solid #e5e7eb" : undefined,
              overflow: "hidden", display: "flex",
              fontFamily: "'Merriweather', Georgia, serif", color: "#111111",
            }}
          >
            {isMaximized ? (
              <div style={{ display: "flex", width: "100%", height: "100%" }}>
                {/* Left sidebar — list or contact picker */}
                <div style={{ width: 320, flexShrink: 0, borderRight: "1.5px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
                  {showNewChat ? (
                    <ContactPicker
                      contacts={contacts}
                      loading={contactsLoading}
                      mode={contactPickerMode}
                      onSelectDirect={handleStartDirect}
                      onCreateGroup={handleCreateGroup}
                      onClose={() => setShowNewChat(false)}
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
                      compact
                      selectedChatId={selectedChat?.id}
                      onNewChat={handleOpenNewChat}
                    />
                  )}
                </div>
                {/* Right — active conversation */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {activeChat ? (
                    <ChatWindow
                      chat={activeChat}
                      messages={messages}
                      messagesLoading={messagesLoading}
                      onBack={() => setSelectedChat(null)}
                      onSendMessage={(msg) => handleSendMessage(activeChat.id, msg)}
                      onSendFile={(file, type, url) => handleSendFile(activeChat.id, file, type, url)}
                      onClose={() => setIsOpen(false)}
                      onMinimize={handleMinimize}
                      onMaximize={handleMaximize}
                      isMinimized={isMinimized}
                      isMaximized={isMaximized}
                      compact
                    />
                  ) : (
                    <EmptyConversation />
                  )}
                </div>
              </div>
            ) : showNewChat ? (
              <ContactPicker
                contacts={contacts}
                loading={contactsLoading}
                mode={contactPickerMode}
                onSelectDirect={handleStartDirect}
                onCreateGroup={handleCreateGroup}
                onClose={() => setShowNewChat(false)}
              />
            ) : activeChat ? (
              <ChatWindow
                chat={activeChat}
                messages={messages}
                messagesLoading={messagesLoading}
                onBack={() => setSelectedChat(null)}
                onSendMessage={(msg) => handleSendMessage(activeChat.id, msg)}
                onSendFile={(file, type, url) => handleSendFile(activeChat.id, file, type, url)}
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
                onNewChat={handleOpenNewChat}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isMaximized && (
          <motion.button
            key="chat-fab"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
            onClick={() => setIsOpen(p => !p)}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "#111111", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.22)", flexShrink: 0,
            }}
          >
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {isOpen ? <X size={22} color="#ffffff" /> : <MessageCircle size={22} color="#ffffff" />}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── Empty conversation placeholder ─────────── */
function EmptyConversation() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fafafa", gap: 12 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MessageCircle size={32} color="#9ca3af" />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", fontFamily: "'Merriweather', serif", margin: 0 }}>Select a conversation</p>
      <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Merriweather', serif", margin: 0 }}>Choose a chat from the list to start messaging</p>
    </div>
  );
}

/* ─────────── Contact Picker (Direct + Group) ─────────── */
interface ContactPickerProps {
  contacts: ChatContact[];
  loading: boolean;
  mode: "direct" | "group";
  onSelectDirect: (c: ChatContact) => void;
  onCreateGroup: (name: string, participants: ChatContact[]) => void;
  onClose: () => void;
}

function ContactPicker({ contacts, loading, mode: initialMode, onSelectDirect, onCreateGroup, onClose }: ContactPickerProps) {
  const [q, setQ] = useState("");
  const [activeMode, setActiveMode] = useState<"direct" | "group">(initialMode);
  const [selectedContacts, setSelectedContacts] = useState<ChatContact[]>([]);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = contacts.filter(c => {
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    return name.includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase());
  });

  const toggleContact = (c: ChatContact) => {
    setSelectedContacts(prev =>
      prev.some(p => p.id === c.id) ? prev.filter(p => p.id !== c.id) : [...prev, c]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedContacts.length < 1) return;
    setCreating(true);
    try {
      await onCreateGroup(groupName.trim(), selectedContacts);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "14px 14px 0", borderBottom: "1.5px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <IconBtn onClick={onClose}><ArrowLeft size={15} /></IconBtn>
          <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Merriweather', serif", flex: 1 }}>New Chat</span>
        </div>

        {/* Mode tabs: Direct | Group */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {(["direct", "group"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setActiveMode(m); setSelectedContacts([]); setQ(""); }}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 10, border: "none", cursor: "pointer",
                fontFamily: "'Merriweather', serif", fontSize: 12, fontWeight: 700,
                background: activeMode === m ? "#111111" : "#f3f4f6",
                color: activeMode === m ? "#fff" : "#555",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.15s",
              }}
            >
              {m === "direct" ? <UserPlus size={13} /> : <Users size={13} />}
              {m === "direct" ? "Direct" : "Group"}
            </button>
          ))}
        </div>

        {/* Group name input */}
        {activeMode === "group" && (
          <input
            placeholder="Group name…"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "8px 12px", borderRadius: 10,
              border: "1.5px solid #e5e7eb", background: "#f9fafb",
              fontSize: 13, color: "#111", fontFamily: "'Merriweather', serif", outline: "none",
              marginBottom: 10,
            }}
          />
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            placeholder={activeMode === "group" ? "Add people…" : "Search contacts…"}
            value={q}
            onChange={e => setQ(e.target.value)}
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "8px 12px 8px 32px", borderRadius: 10,
              border: "1.5px solid #e5e7eb", background: "#f9fafb",
              fontSize: 13, color: "#111", fontFamily: "'Merriweather', serif", outline: "none",
            }}
          />
        </div>

        {/* Selected chips for group mode */}
        {activeMode === "group" && selectedContacts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {selectedContacts.map(c => {
              const name = `${c.first_name} ${c.last_name}`.trim() || c.email;
              return (
                <span
                  key={c.id}
                  onClick={() => toggleContact(c)}
                  style={{
                    padding: "3px 10px", borderRadius: 99, background: "#111",
                    color: "#fff", fontSize: 11, fontFamily: "'Merriweather', serif",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  {name} <X size={10} />
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {loading ? (
          <div style={{ padding: "20px 14px", textAlign: "center", color: "#9ca3af", fontSize: 13, fontFamily: "'Merriweather', serif" }}>
            Loading contacts…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "20px 14px", textAlign: "center", color: "#9ca3af", fontSize: 13, fontFamily: "'Merriweather', serif" }}>
            {q ? "No contacts found" : "No contacts available"}
          </div>
        ) : (
          filtered.map(c => {
            const name = `${c.first_name} ${c.last_name}`.trim() || c.email;
            const isChecked = selectedContacts.some(p => p.id === c.id);
            return (
              <button
                key={c.id}
                onClick={() => activeMode === "group" ? toggleContact(c) : onSelectDirect(c)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 14,
                  display: "flex", alignItems: "center", gap: 12,
                  border: "none", cursor: "pointer",
                  background: isChecked ? "#f0fdf4" : "transparent",
                  textAlign: "left", fontFamily: "'Merriweather', serif",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = "#f5f5f7"; }}
                onMouseLeave={e => { e.currentTarget.style.background = isChecked ? "#f0fdf4" : "transparent"; }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>{getInitials(name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</div>
                </div>
                {activeMode === "group" && (
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    border: isChecked ? "none" : "2px solid #d1d5db",
                    background: isChecked ? "#22c55e" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isChecked && <Check size={13} color="#fff" strokeWidth={3} />}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Create Group button */}
      {activeMode === "group" && (
        <div style={{ padding: "12px 14px", borderTop: "1.5px solid #f0f0f0" }}>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedContacts.length < 1 || creating}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 12, border: "none",
              background: groupName.trim() && selectedContacts.length > 0 ? "#111111" : "#e5e7eb",
              color: groupName.trim() && selectedContacts.length > 0 ? "#fff" : "#9ca3af",
              fontSize: 13, fontWeight: 700, fontFamily: "'Merriweather', serif",
              cursor: groupName.trim() && selectedContacts.length > 0 ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {creating ? "Creating…" : selectedContacts.length > 0
              ? `Create Group (${selectedContacts.length} member${selectedContacts.length > 1 ? "s" : ""})`
              : "Select at least 1 person"}
          </button>
        </div>
      )}
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
  onNewChat: (mode?: "direct" | "group") => void;
}

function SkeletonChatItem() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 14px", borderRadius: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "skeletonShimmer 1.4s infinite", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ height: 12, width: "55%", borderRadius: 6, background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "skeletonShimmer 1.4s infinite" }} />
          <div style={{ height: 10, width: 32, borderRadius: 6, background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "skeletonShimmer 1.4s infinite" }} />
        </div>
        <div style={{ height: 10, width: "75%", borderRadius: 6, background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "skeletonShimmer 1.4s infinite" }} />
      </div>
    </div>
  );
}

const filters = [
  { id: "all", label: "All" },
  { id: "direct", label: "Direct" },
  { id: "group", label: "Group" },
];

function ChatList({ chats, onSelectChat, onClose, onMinimize, onMaximize, isMinimized, isMaximized, activeFilter, setActiveFilter, searchQuery, setSearchQuery, isLoading, compact, selectedChatId, onNewChat }: ChatListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: compact ? "12px 12px 0" : "16px 16px 0", borderBottom: "1.5px solid #f0f0f0" }}>
        {!compact && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Merriweather', serif" }}>S</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#111", fontFamily: "'Merriweather', serif", letterSpacing: "-0.3px" }}>SkiTech</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <IconBtn onClick={() => onNewChat("group")} title="New group"><Users size={14} /></IconBtn>
              <IconBtn onClick={() => onNewChat("direct")} title="New chat"><UserPlus size={15} /></IconBtn>
              <IconBtn onClick={onMaximize} title={isMaximized ? "Restore" : "Expand"}>
                {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </IconBtn>
              <IconBtn onClick={onClose} title="Close"><X size={15} /></IconBtn>
            </div>
          </div>
        )}

        {compact && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#111", fontFamily: "'Merriweather', serif" }}>Chats</span>
            <div style={{ display: "flex", gap: 2 }}>
              <IconBtn onClick={() => onNewChat("group")} title="New group"><Users size={13} /></IconBtn>
              <IconBtn onClick={() => onNewChat("direct")} title="New chat"><UserPlus size={14} /></IconBtn>
            </div>
          </div>
        )}

        {!compact && (
          <h2 style={{ fontFamily: "'Merriweather', serif", fontWeight: 700, fontSize: 17, color: "#111", margin: "0 0 12px" }}>Chats</h2>
        )}

        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "8px 12px 8px 32px", borderRadius: 10,
              border: "1.5px solid #e5e7eb", background: "#f9fafb",
              fontSize: 13, color: "#111", fontFamily: "'Merriweather', serif", outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, paddingBottom: 12 }}>
          {filters.map(f => (
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

      <style>{`@keyframes skeletonShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {isLoading ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px 6px", color: "#9ca3af", fontSize: 12, fontFamily: "'Merriweather', serif" }}>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ width: 7, height: 7, borderRadius: "50%", background: "#d1d5db" }} />
              Loading conversations…
            </div>
            {[0, 1, 2, 3].map(i => <SkeletonChatItem key={i} />)}
          </>
        ) : chats.length === 0 ? (
          <div style={{ padding: "40px 14px", textAlign: "center" }}>
            <MessageCircle size={36} color="#d1d5db" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", fontFamily: "'Merriweather', serif", margin: "0 0 6px" }}>No conversations yet</p>
            <p style={{ fontSize: 11, color: "#c4c4c4", fontFamily: "'Merriweather', serif", margin: "0 0 16px" }}>Start by messaging a colleague or creating a group</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={() => onNewChat("direct")}
                style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "'Merriweather', serif", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}
              >
                <UserPlus size={13} /> Direct
              </button>
              <button
                onClick={() => onNewChat("group")}
                style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "#111", cursor: "pointer", fontSize: 12, fontFamily: "'Merriweather', serif", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Users size={13} /> Group
              </button>
            </div>
          </div>
        ) : (
          chats.map(chat => <ChatItem key={chat.id} chat={chat} onClick={() => onSelectChat(chat)} isSelected={chat.id === selectedChatId} />)
        )}
      </div>
    </div>
  );
}

/* ─────────── Chat item ─────────── */
function ChatItem({ chat, onClick, isSelected }: { chat: Chat; onClick: () => void; isSelected?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const gradient = chat.type === "group"
    ? "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
    : "linear-gradient(135deg, #10b981 0%, #34d399 100%)";

  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ background: isSelected ? "#e8e8e8" : hovered ? "#f5f5f7" : "#ffffff" }}
      onClick={onClick}
      style={{ width: "100%", padding: "11px 14px", borderRadius: 14, display: "flex", alignItems: "center", gap: 13, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'Merriweather', serif" }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'Merriweather', serif", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          {chat.type === "group" ? <Users size={18} color="#fff" /> : chat.initials}
        </div>
        {chat.type === "direct" && (
          <span style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: chat.isOnline ? "#22c55e" : "#9ca3af", border: "2.5px solid #fff" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: chat.unread > 0 ? 700 : 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{chat.name}</span>
          <span style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0, whiteSpace: "nowrap" }}>{chat.timestamp}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ fontSize: 12, color: chat.unread > 0 ? "#111" : "#6b7280", fontWeight: chat.unread > 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0, flex: 1 }}>
            {chat.lastMessage}
          </p>
          {chat.unread > 0 && (
            <span style={{ minWidth: 20, height: 20, borderRadius: 99, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", flexShrink: 0 }}>{chat.unread}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* ─────────── Chat window ─────────── */
interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  messagesLoading: boolean;
  onBack: () => void;
  onSendMessage: (message: Message) => void;
  onSendFile: (file: File, type: "image" | "file", localUrl: string) => void;
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

function ChatWindow({ chat, messages, messagesLoading, onBack, onSendMessage, onSendFile, onClose, onMinimize, onMaximize, isMinimized, isMaximized, compact }: ChatWindowProps) {
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
  }, [messages]);

  const ts = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sendText = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage({ id: `local-${Date.now()}`, type: "text", text, timestamp: ts(), isSent: true });
    setInput("");
    setShowEmoji(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    onSendFile(file, "image", URL.createObjectURL(file));
    e.target.value = "";
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    onSendFile(file, "file", URL.createObjectURL(file));
    e.target.value = "";
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec; chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" }));
        stream.getTracks().forEach(t => t.stop());
        onSendMessage({ id: `local-${Date.now()}`, type: "audio", audioUrl: url, timestamp: ts(), isSent: true });
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

  const fmtRec = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const gradient = chat.type === "group"
    ? "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
    : "linear-gradient(135deg, #10b981 0%, #34d399 100%)";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff", position: "relative" }}>
      <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImageChange} />
      <input ref={fileRef} type="file" style={{ display: "none" }} onChange={onFileChange} />

      {/* Header — shows contact/group name, back button, and controls */}
      <div style={{ padding: "12px 14px", borderBottom: "1.5px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10, background: "#fff" }}>
        {/* Back button — always visible for clear navigation */}
        <button
          onClick={onBack}
          title="Back to conversations"
          style={{
            width: 34, height: 34, borderRadius: 10, border: "none", cursor: "pointer",
            background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#374151", flexShrink: 0, transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
          onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
            {chat.type === "group" ? <Users size={16} color="#fff" /> : chat.initials}
          </div>
          {chat.type === "direct" && (
            <span style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: chat.isOnline ? "#22c55e" : "#9ca3af", border: "2px solid #fff" }} />
          )}
        </div>

        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111", fontFamily: "'Merriweather', serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.name}</div>
          <div style={{ fontSize: 11, color: chat.type === "group" ? "#6b7280" : chat.isOnline ? "#22c55e" : "#9ca3af", fontFamily: "'Merriweather', serif" }}>
            {chat.type === "group" ? "Group chat" : chat.isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {!compact && (
            <IconBtn onClick={onMaximize} title={isMaximized ? "Restore" : "Expand"}>
              {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </IconBtn>
          )}
          <IconBtn onClick={onClose} title="Close"><X size={15} /></IconBtn>
        </div>
      </div>

      {/* Date divider */}
      <div style={{ background: "#f9fafb", padding: "5px 0", textAlign: "center", fontSize: 11, color: "#9ca3af", fontFamily: "'Merriweather', serif", borderBottom: "1px solid #f0f0f0" }}>Today</div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messagesLoading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                style={{ width: 8, height: 8, borderRadius: "50%", background: "#d1d5db" }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {chat.type === "group" ? <Users size={22} color="#fff" /> : <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{chat.initials}</span>}
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'Merriweather', serif", margin: 0 }}>{chat.name}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'Merriweather', serif", margin: 0 }}>
              {chat.type === "group" ? "Group conversation started. Say hello!" : "No messages yet. Start the conversation!"}
            </p>
          </div>
        ) : (
          messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{ position: "absolute", bottom: 64, left: 8, right: 8, background: "#fff", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1.5px solid #e5e7eb", padding: 10, zIndex: 10, display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 2, maxHeight: 190, overflowY: "auto" }}>
          {EMOJIS.map((em, i) => (
            <button key={i} onClick={() => setInput(p => p + em)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4, borderRadius: 6, lineHeight: 1 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >{em}</button>
          ))}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div style={{ padding: "8px 14px", background: "#fff1f2", borderTop: "1px solid #fecdd3", display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
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
        <button
          onClick={input.trim() ? sendText : isRecording ? stopRec : startRec}
          style={{ width: 36, height: 36, borderRadius: "50%", background: isRecording ? "#ef4444" : input.trim() ? "#111111" : "#374151", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}
        >
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
        {message.type === "image" && message.imageUrl && (
          <img src={message.imageUrl} alt={message.fileName ?? "image"} style={{ maxWidth: "100%", borderRadius: 10, display: "block" }} />
        )}
        {message.type === "image" && !message.imageUrl && (
          <p style={{ margin: 0, fontSize: 13, fontFamily: "'Merriweather', serif" }}>📷 {message.fileName ?? "Image"}</p>
        )}
        {message.type === "file" && (
          <a href={message.fileUrl ?? "#"} download={message.fileName} style={{ color: "inherit", textDecoration: "none" }}>
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

/* ─────────── Icon button ─────────── */
function IconBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer", background: hov ? "#f3f4f6" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", transition: "background 0.15s" }}
    >{children}</button>
  );
}
