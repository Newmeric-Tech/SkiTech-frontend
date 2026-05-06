"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, Minimize2, Maximize2, ChevronLeft,
  Phone, MoreVertical, Send, Mic, Image as ImageIcon,
  Paperclip, Smile
} from "lucide-react";
import { motion } from "framer-motion";
import type { Chat } from "./ChatSidebar";

const EMOJIS = [
  "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😚",
  "😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","😐","😑","😶","😏","😒","🙄","😬","😔",
  "😪","😴","😷","🤒","🤧","🥵","🥶","😵","🤯","🤠","🥸","😎","🧐","😭","😢","😤","😡","🤬",
  "❤️","🧡","💛","💚","💙","💜","🖤","💔","✨","🎉","🎊","🔥","⭐","💯","🎯","🚀","👍","👎",
  "👋","🙏","👏","🤝","💪","✌️","🤞","🤙","👌","🫶","🌟","😎","🥳","👀","💬","📎","📷","🎤",
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

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
  onSendMessage?: (chatId: string, message: Message) => void;
}

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

export function ChatWindow({ chat, onBack, onSendMessage }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [messages, setMessages] = useState<Message[]>(chat.messages);
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
    const newMessage: Message = { id: Date.now().toString(), type: "text", text, timestamp: ts(), isSent: true };
    setMessages(prev => [...prev, newMessage]);
    if (onSendMessage) onSendMessage(chat.id, newMessage);
    setInput("");
    setShowEmoji(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const newMessage: Message = { id: Date.now().toString(), type: "image", imageUrl: URL.createObjectURL(file), fileName: file.name, timestamp: ts(), isSent: true };
    setMessages(prev => [...prev, newMessage]);
    if (onSendMessage) onSendMessage(chat.id, newMessage);
    e.target.value = "";
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const kb = file.size / 1024;
    const size = kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
    const newMessage: Message = { id: Date.now().toString(), type: "file", fileName: file.name, fileSize: size, fileUrl: URL.createObjectURL(file), timestamp: ts(), isSent: true };
    setMessages(prev => [...prev, newMessage]);
    if (onSendMessage) onSendMessage(chat.id, newMessage);
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
        const newMessage: Message = { id: Date.now().toString(), type: "audio", audioUrl: url, timestamp: ts(), isSent: true };
        setMessages(prev => [...prev, newMessage]);
        if (onSendMessage) onSendMessage(chat.id, newMessage);
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
      <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImageChange} />
      <input ref={fileRef} type="file" style={{ display: "none" }} onChange={onFileChange} />

      {/* Header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1.5px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {onBack && (
            <IconBtn onClick={onBack}><ChevronLeft size={16} /></IconBtn>
          )}
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
        {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, fontFamily: "'Merriweather', serif", marginTop: "auto", marginBottom: "auto" }}>
            No messages yet. Start the conversation!
          </div>
        )}
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
          <button onClick={stopRec} style={{ marginLeft: "auto", fontSize: 11, color: "#ef4444", background: "none", border: "1px solid #ef4444", borderRadius: 99, padding: "3px 10px", cursor: "pointer", fontFamily: "'Merriweather', serif" }}>Stop & Send</button>
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

// Empty state component when no chat is selected
export function ChatEmptyState() {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100%", 
      background: "#f9fafb",
      padding: 40,
      textAlign: "center"
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "#111111", display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
      }}>
        <span style={{ color: "#fff", fontSize: 32, fontWeight: 700, fontFamily: "'Merriweather', serif" }}>S</span>
      </div>
      <h2 style={{ fontFamily: "'Merriweather', serif", fontWeight: 700, fontSize: 20, color: "#111", marginBottom: 8 }}>
        Welcome to SkiTech Chat
      </h2>
      <p style={{ fontFamily: "'Merriweather', serif", fontSize: 14, color: "#6b7280", maxWidth: 300 }}>
        Select a conversation from the sidebar to start chatting, or view your existing messages.
      </p>
    </div>
  );
}