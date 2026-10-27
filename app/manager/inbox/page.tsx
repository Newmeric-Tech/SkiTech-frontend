"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inboxAPI, InboxItem, InboxStatus } from "@/lib/api/inbox";
import { apiErrorDetail } from "@/lib/api/attendance";
import { InboxCard, InboxEmptyState } from "@/components/inbox/InboxCard";

// "all" is the server default: everything except dismissed items
const TABS: { key: InboxStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
  { key: "dismissed", label: "Dismissed" },
];

/**
 * Manager inbox: real items from GET /v1/inbox, scoped server-side to the
 * manager's property — low-stock alerts, escalated complaints and staff
 * punch-out correction requests, plus anything addressed to them personally.
 */
export default function ManagerInboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InboxStatus | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(() => {
    inboxAPI.unreadCount().then(setUnreadCount).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    inboxAPI.list({ status: activeTab === "all" ? undefined : activeTab, limit: 50 })
      .then((res) => { if (!cancelled) setItems(res.items); })
      .catch(() => { if (!cancelled) toast.error("Failed to load inbox"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    inboxAPI.unreadCount().then((n) => { if (!cancelled) setUnreadCount(n); }).catch(() => {});
    return () => { cancelled = true; };
  }, [activeTab]);

  const selectTab = (tab: InboxStatus | "all") => {
    if (tab === activeTab) return;
    setLoading(true);
    setActiveTab(tab);
  };

  const handleMarkRead = async (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "read" } : i)));
    try {
      await inboxAPI.markRead(id);
    } catch {
      // non-fatal: the item just stays unread on the server
    }
    refreshUnread();
  };

  const handleDismiss = async (id: string) => {
    try {
      setActionLoading(id);
      await inboxAPI.dismiss(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Dismissed");
      refreshUnread();
    } catch (err) {
      toast.error(apiErrorDetail(err, "Failed to dismiss"));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Inbox</h1>
        <p className="text-slate-500 text-sm mt-1">
          Low-stock alerts, escalated complaints and staff punch-out corrections for your property.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border border-slate-200/60 shadow-sm w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => selectTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : items.length === 0 ? (
        <InboxEmptyState text="Nothing needs your attention right now. Low-stock alerts, escalated complaints and staff punch-out corrections for your property will show up here." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <InboxCard
                key={item.id}
                item={item}
                portal="manager"
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
