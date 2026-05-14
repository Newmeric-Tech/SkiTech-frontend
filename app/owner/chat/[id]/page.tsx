"use client";

import { useParams } from "next/navigation";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { initialChats } from "@/components/chat/ChatSidebar";

export default function ChatIdPage() {
  const params = useParams();
  const chatId = params.id as string;
  
  const chat = initialChats.find(c => c.id === chatId);
  
  if (!chat) {
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
        <h2 style={{ fontFamily: "'Merriweather', serif", fontWeight: 700, fontSize: 20, color: "#111", marginBottom: 8 }}>
          Chat not found
        </h2>
        <p style={{ fontFamily: "'Merriweather', serif", fontSize: 14, color: "#6b7280" }}>
          The conversation you're looking for doesn't exist.
        </p>
      </div>
    );
  }
  
  return <ChatWindow chat={chat} />;
}