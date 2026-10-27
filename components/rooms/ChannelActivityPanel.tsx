"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Pause, Play } from "lucide-react";
import { channelManagerAPI, providerLabel, ChannelActivity, ChannelActivityItem } from "@/lib/api/channel-manager";

const POLL_OPTIONS = [8000, 15000];
const DEFAULT_POLL_MS = 15000;

type SyncState = "loading" | "not_connected" | "never_synced" | "connected" | "syncing" | "error" | "interrupted";

const STATE_STYLE: Record<SyncState, { label: string; className: string }> = {
  loading: { label: "Loading…", className: "bg-slate-50 text-slate-500 border-slate-200" },
  not_connected: { label: "Not connected", className: "bg-slate-50 text-slate-600 border-slate-200" },
  never_synced: { label: "Connected · not synced yet", className: "bg-slate-50 text-slate-700 border-slate-200" },
  connected: { label: "Connected · last sync succeeded", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  syncing: { label: "Syncing", className: "bg-blue-50 text-blue-700 border-blue-200" },
  error: { label: "Last sync failed", className: "bg-red-50 text-red-700 border-red-200" },
  interrupted: { label: "Last sync interrupted", className: "bg-amber-50 text-amber-800 border-amber-200" },
};

const ITEM_DOT: Record<string, string> = {
  success: "bg-emerald-500",
  syncing: "bg-blue-500",
  error: "bg-red-500",
  interrupted: "bg-amber-500",
};

/** State of the newest run of a still-connected integration; "connected" only if it succeeded. */
function syncState(data: ChannelActivity | null): { state: SyncState; latest?: ChannelActivityItem } {
  if (!data) return { state: "loading" };
  if (!data.connected) return { state: "not_connected" };
  const latest = data.items.find(i => i.connection_status !== "disconnected");
  if (!latest) return { state: "never_synced" };
  switch (latest.status) {
    case "success": return { state: "connected", latest };
    case "syncing": return { state: "syncing", latest };
    case "interrupted": return { state: "interrupted", latest };
    default: return { state: "error", latest };
  }
}

const formatTime = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");

/**
 * Sync runs from GET /properties/{id}/channel-activity. Polls while the tab
 * is visible and not paused; one request at a time; stops on unmount.
 */
export function ChannelActivityPanel({ propertyId }: { propertyId: string | null | undefined }) {
  const [data, setData] = useState<ChannelActivity | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pollMs, setPollMs] = useState(DEFAULT_POLL_MS);
  // Shared across effect runs so a restart (interval change, resume) waits
  // for a request that is still in flight instead of overlapping it.
  const inFlight = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!propertyId || paused) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      clearTimeout(timer);
      timer = undefined;
      while (inFlight.current) {
        await inFlight.current;
        if (cancelled) return;
      }
      if (cancelled || document.hidden) return; // visibilitychange restarts it
      const request = channelManagerAPI.channelActivity(propertyId)
        .then(res => {
          if (cancelled) return;
          setData(res.data);
          setUpdatedAt(new Date());
          setFailed(false);
        })
        .catch(() => { if (!cancelled) setFailed(true); });
      inFlight.current = request;
      await request;
      if (inFlight.current === request) inFlight.current = null;
      if (!cancelled && !document.hidden) timer = setTimeout(tick, pollMs);
    };

    const onVisibility = () => {
      if (document.hidden) {
        clearTimeout(timer);
        timer = undefined;
      } else if (!timer && !inFlight.current) {
        tick();
      }
    };

    tick();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [propertyId, paused, pollMs]);

  const { state, latest } = syncState(data);
  const style = STATE_STYLE[state];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Activity className="w-4 h-4 text-slate-400" />
        <h2 className="text-slate-950 text-sm font-semibold">Channel activity</h2>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${style.className}`}>
          {style.label}
          {latest && state !== "syncing" && ` · ${providerLabel(latest.provider_name)}`}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={pollMs}
            onChange={e => setPollMs(Number(e.target.value))}
            aria-label="Refresh interval"
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none"
          >
            {POLL_OPTIONS.map(ms => <option key={ms} value={ms}>Every {ms / 1000}s</option>)}
          </select>
          <button
            onClick={() => setPaused(p => !p)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>

      <p className="text-slate-400 text-xs">
        {updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : "Not loaded yet"}
        {paused && " · paused"}
        {failed && <span className="text-red-600"> · couldn&apos;t refresh</span>}
      </p>

      {data && data.items.length === 0 ? (
        <p className="text-slate-500 text-sm">
          {data.connected ? "No sync runs yet." : "No channel manager is connected to this property."}
        </p>
      ) : data ? (
        <ul className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {data.items.map(item => (
            <li key={item.id} className="flex items-start gap-2.5 text-xs">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${ITEM_DOT[item.status ?? ""] ?? "bg-slate-300"}`} />
              <div className="min-w-0">
                <p className="text-slate-800 break-words">{item.message}</p>
                <p className="text-slate-400">
                  {providerLabel(item.provider_name)} · {formatTime(item.timestamp)}
                  {item.connection_status === "disconnected" && " · disconnected"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
