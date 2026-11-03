"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Bell, BellOff, CheckCheck, ChevronDown, Loader2, X } from "lucide-react";
import { inboxAPI, InboxItem, InboxPortal, resolveInboxLink } from "@/lib/api/inbox";
import { fmtInboxDate } from "@/components/inbox/InboxCard";
import { TodayAtAGlance } from "@/components/dashboard/NotificationPanel";
import { useAuthStore } from "@/store/authStore";

// "Real time" is polling: the free Render plan has no websockets.
const POLL_MS = 30_000;
const MAX_POLL_MS = 5 * 60_000;   // after repeated errors the interval doubles up to this
const PANEL_LIMIT = 10;

type NotificationBellProps = {
  /** Which portal's pages the items link to. */
  portal: InboxPortal;
  /** The full inbox page, when the portal has a real one. */
  viewAllHref?: string;
  /** Show the attendance/rooms snapshot as a collapsed section below the items. */
  showTodayAtAGlance?: boolean;
  /** Changes of this value (e.g. the pathname) refetch the count. */
  refreshKey?: string;
  onCountChange?: (count: number) => void;
};

// Header bell with the unread inbox count, and a panel with the latest items.
// Shared by the dashboard and superadmin layouts.
export function NotificationBell({
  portal, viewAllHref, showTodayAtAGlance = false, refreshKey, onCountChange,
}: NotificationBellProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InboxItem[] | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(false);
  const [actionError, setActionError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [glanceOpen, setGlanceOpen] = useState(false);
  const [domReady, setDomReady] = useState(false);

  const countInFlight = useRef(false);
  const listInFlight = useRef(false);
  const failures = useRef(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDomReady(true); }, []);

  // One count request at a time, and none while the list is loading (the
  // list load refreshes the count when it finishes).
  const refreshCount = useCallback(async () => {
    if (countInFlight.current || listInFlight.current) return;
    countInFlight.current = true;
    try {
      setCount(await inboxAPI.unreadCount());
      failures.current = 0;
    } catch {
      failures.current += 1;
    } finally {
      countInFlight.current = false;
    }
  }, []);

  // Poll every 30 s while the tab is visible; paused while hidden; refetched
  // on focus and on return to the tab; stopped on sign-out (isAuthenticated
  // false) and unmount. The next poll is scheduled only after the previous
  // one ends, so requests never stack.
  useEffect(() => {
    if (!isAuthenticated) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    const schedule = () => {
      clear();
      if (stopped || document.visibilityState !== "visible") return;
      const delay = Math.min(POLL_MS * 2 ** failures.current, MAX_POLL_MS);
      timer = setTimeout(async () => {
        await refreshCount();
        schedule();
      }, delay);
    };
    const now = async () => {
      await refreshCount();
      schedule();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") now();
      else clear();
    };
    now();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", now);
    return () => {
      stopped = true;
      clear();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", now);
    };
  }, [isAuthenticated, refreshCount]);

  useEffect(() => {
    if (refreshKey !== undefined && isAuthenticated) refreshCount();
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { onCountChange?.(count); }, [count, onCountChange]);

  const loadList = useCallback(async () => {
    if (listInFlight.current) return;
    listInFlight.current = true;
    setListLoading(true);
    try {
      const res = await inboxAPI.list({ limit: PANEL_LIMIT });
      setItems(res.items);
      setListError(false);
    } catch {
      setListError(true);
    } finally {
      listInFlight.current = false;
      setListLoading(false);
    }
    refreshCount();
  }, [refreshCount]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    setActionError("");
    setOpen(true);
    loadList();
  };

  // Focus moves into the portalled panel; Escape closes it
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const openItem = async (item: InboxItem) => {
    if (item.status === "unread") {
      try {
        await inboxAPI.markRead(item.id);
      } catch {
        // Still go to the page; the item stays unread
      }
      refreshCount();
    }
    setOpen(false);
    router.push(resolveInboxLink(item, portal));
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setActionError("");
    try {
      await inboxAPI.markAllRead();
      setItems((prev) => prev && prev.map((i) => (i.status === "unread" ? { ...i, status: "read" } : i)));
    } catch {
      setActionError("Couldn't mark them as read. Try again.");
    } finally {
      setMarkingAll(false);
      refreshCount();
    }
  };

  const badge = count > 99 ? "99+" : String(count);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
        className="relative text-neutral-500 dark:text-[#a0a0a0] hover:text-black dark:hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-[18px] text-center border-2 border-white dark:border-[#111111] box-content">
            {badge}
          </span>
        )}
      </button>

      {domReady && createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop — captures click-outside */}
              <div className="fixed inset-0 z-[9998]" onClick={close} />

              <motion.div
                ref={panelRef}
                role="dialog"
                aria-label="Notifications"
                tabIndex={-1}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="fixed top-[88px] right-4 w-[360px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-104px)] flex flex-col bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/8 z-[9999] overflow-hidden outline-none"
              >
                {/* ── Header ── */}
                <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100 dark:border-white/6 shrink-0">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Notifications</p>
                    <p className="text-[11px] text-slate-400 mt-1">{count > 0 ? `${count} unread` : "No unread notifications"}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={markAllRead}
                      disabled={count === 0 || markingAll}
                      className="flex items-center gap-1 px-2 h-7 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                      Mark all as read
                    </button>
                    <button
                      onClick={close}
                      aria-label="Close notifications"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto min-h-0">
                  {actionError && (
                    <p role="alert" className="mx-4 mt-3 text-[11px] text-red-600 dark:text-red-400">{actionError}</p>
                  )}

                  {/* ── Items ── */}
                  {listLoading && !items ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                      <p className="text-xs text-slate-400">Loading notifications…</p>
                    </div>
                  ) : listError && !items ? (
                    <div className="flex flex-col items-center py-10 gap-2 px-6 text-center">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Couldn&apos;t load notifications</p>
                      <button
                        onClick={loadList}
                        className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : items && items.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2 px-6 text-center">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                        <BellOff className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">You&apos;re all caught up</p>
                      <p className="text-xs text-slate-400">New assignments and updates will show up here.</p>
                    </div>
                  ) : (
                    <ul className="py-1">
                      {(items ?? []).map((item) => {
                        const unread = item.status === "unread";
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => openItem(item)}
                              className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/4 focus-visible:bg-slate-50 dark:focus-visible:bg-white/4 outline-none transition-colors"
                            >
                              <span
                                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${unread ? "bg-blue-500" : "bg-transparent"}`}
                                aria-label={unread ? "Unread" : undefined}
                              />
                              <span className="min-w-0 flex-1">
                                <span className={`block text-xs leading-snug ${unread
                                  ? "font-semibold text-slate-900 dark:text-white"
                                  : "font-medium text-slate-600 dark:text-slate-300"}`}>
                                  {item.title}
                                </span>
                                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                                  {item.body}
                                </span>
                                <span className="block text-[10px] text-slate-400 mt-1">{fmtInboxDate(item.created_at)}</span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {viewAllHref && (
                    <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/6 text-center">
                      <Link
                        href={viewAllHref}
                        onClick={() => setOpen(false)}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                  )}

                  {/* ── Today at a glance (the former bell panel) ── */}
                  {showTodayAtAGlance && (
                    <div className="border-t border-slate-100 dark:border-white/6">
                      <button
                        onClick={() => setGlanceOpen((o) => !o)}
                        aria-expanded={glanceOpen}
                        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
                      >
                        Today at a glance
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${glanceOpen ? "rotate-180" : ""}`} />
                      </button>
                      {glanceOpen && (
                        <div className="pb-3">
                          <TodayAtAGlance />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
