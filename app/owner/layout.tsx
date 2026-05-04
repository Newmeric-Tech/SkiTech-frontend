"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatSidebarCollapsed, setChatSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on a chat route
  const isChatRoute = pathname.startsWith("/owner/chat");
  
  return (
    <DashboardLayoutClient>
      {isChatRoute ? (
        <div style={{ display: "flex", height: "100%", background: "#fff", borderRadius: 12, overflow: "hidden", border: "1.5px solid #e5e7eb" }}>
          {/* Chat Sidebar - Fixed left */}
          <ChatSidebar 
            collapsed={chatSidebarCollapsed} 
            onToggleCollapse={() => setChatSidebarCollapsed(!chatSidebarCollapsed)}
            activeChatId={pathname.includes("/owner/chat/") ? pathname.split("/owner/chat/")[1] : undefined}
          />
          
          {/* Right Panel - Dynamic content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </DashboardLayoutClient>
  );
}
