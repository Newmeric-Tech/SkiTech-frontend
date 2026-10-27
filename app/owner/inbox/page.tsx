"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inboxAPI, InboxItem, InboxStatus } from "@/lib/api/inbox";
import { InboxCard, InboxEmptyState } from "@/components/inbox/InboxCard";

const TABS: { key: InboxStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "actioned", label: "Actioned" },
];

export default function OwnerInboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InboxStatus | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inboxAPI.list({
        status: activeTab === "all" ? undefined : activeTab,
        limit: 50,
      });
      setItems(res.items);
    } catch {
      toast.error("Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "read" } : i));
    try {
      await inboxAPI.markRead(id);
    } catch {
      // non-fatal — leaving it optimistically marked read is fine even if this call fails
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      setActionLoading(id);
      await inboxAPI.dismiss(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Dismissed");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to dismiss");
    } finally {
      setActionLoading(null);
    }
  };

  const unreadCount = items.filter(i => i.status === "unread").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Inbox</h1>
        <p className="text-slate-500 text-sm mt-1">Escalated complaints, low-stock alerts, punch location requests and punch-out corrections that need your attention.</p>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border border-slate-200/60 shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : items.length === 0 ? (
        <InboxEmptyState text="Nothing needs your attention right now. Escalated complaints, low-stock alerts, punch location requests and punch-out corrections will show up here." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <InboxCard
                key={item.id}
                item={item}
                portal="owner"
                onMarkRead={handleMarkRead}
                onDismiss={handleDismiss}
                actionLoading={actionLoading}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
