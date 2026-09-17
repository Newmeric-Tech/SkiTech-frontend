"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Package, Clock, Loader2, Inbox as InboxIcon,
  CheckCircle2, X, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { inboxAPI, InboxItem, InboxStatus, resolveInboxLink } from "@/lib/api/inbox";

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  complaint_escalated: { icon: ShieldAlert, color: "#EF4444", bg: "bg-red-50" },
  low_stock:           { icon: Package,     color: "#F59E0B", bg: "bg-amber-50" },
};

const TABS: { key: InboxStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "actioned", label: "Actioned" },
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

function InboxCard({ item, onMarkRead, onDismiss, actionLoading }: {
  item: InboxItem;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  actionLoading: string | null;
}) {
  const config = typeConfig[item.item_type] ?? { icon: InboxIcon, color: "#64748B", bg: "bg-slate-50" };
  const Icon = config.icon;
  const isUnread = item.status === "unread";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
        isUnread ? "border-slate-300" : "border-slate-200/60"}`}
    >
      <div className="flex items-start gap-4 p-5">
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-slate-900 font-semibold text-sm">{item.title}</h3>
                {isUnread && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
              </div>
              <p className="text-slate-500 text-sm mt-1">{item.body}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
              item.status === "actioned" ? "bg-emerald-100 text-emerald-700" :
              item.status === "unread"   ? "bg-blue-100 text-blue-700" :
              "bg-slate-100 text-slate-600"}`}>
              {item.status}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" /> {fmtDate(item.created_at)}
            </span>
            <div className="flex items-center gap-2">
              {item.status !== "actioned" && item.status !== "dismissed" && (
                <button
                  onClick={() => onDismiss(item.id)}
                  disabled={actionLoading === item.id}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                >
                  {actionLoading === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  Dismiss
                </button>
              )}
              <Link
                href={resolveInboxLink(item)}
                onClick={() => isUnread && onMarkRead(item.id)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-slate-900 font-semibold text-lg mb-1">You're all caught up</h3>
      <p className="text-slate-500 text-center max-w-sm text-sm">
        Nothing needs your attention right now. Escalated complaints and low-stock alerts will show up here.
      </p>
    </div>
  );
}

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
        <p className="text-slate-500 text-sm mt-1">Escalated complaints and low-stock alerts that need your attention.</p>
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
        <EmptyState />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <InboxCard
                key={item.id}
                item={item}
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
