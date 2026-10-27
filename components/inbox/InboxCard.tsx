"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, ClockAlert, Clock, Eye, Inbox as InboxIcon, Loader2, MapPin, Package, ShieldAlert, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { InboxItem, InboxPortal, resolveInboxLink } from "@/lib/api/inbox";

const typeConfig: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  complaint_escalated: { icon: ShieldAlert, color: "#EF4444", bg: "bg-red-50" },
  low_stock:           { icon: Package,     color: "#F59E0B", bg: "bg-amber-50" },
  geofence_change_request: { icon: MapPin,  color: "#6366F1", bg: "bg-indigo-50" },
  attendance_correction_request: { icon: ClockAlert, color: "#0EA5E9", bg: "bg-sky-50" },
};

export function fmtInboxDate(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

/** One inbox item; "View" opens the page for the underlying record in the given portal. */
export function InboxCard({ item, portal, onMarkRead, onDismiss, actionLoading }: {
  item: InboxItem;
  portal: InboxPortal;
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
              <Clock className="w-3.5 h-3.5" /> {fmtInboxDate(item.created_at)}
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
                href={resolveInboxLink(item, portal)}
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

export function InboxEmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-slate-900 font-semibold text-lg mb-1">You&apos;re all caught up</h3>
      <p className="text-slate-500 text-center max-w-sm text-sm">{text}</p>
    </div>
  );
}
