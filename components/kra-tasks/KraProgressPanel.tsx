"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  KRA_FREQUENCIES, KraDisplayStatus, KraFrequency, KraOccurrencePage, KraSummary,
  kraErrorMessage, kraTasksAPI,
} from "@/lib/api/kraTasks";
import { DateRangePreset, localRangeFor } from "@/lib/utils/localDate";
import { FREQUENCY_LABELS, KraPeriodLabel, KraStatusBadge } from "./KraLabels";
import { KraEmptyState, KraErrorState, KraLoading, kraInputClass, kraSecondaryButtonClass } from "./KraPanelStates";
import { useKraPeople } from "./useKraPeople";

const PAGE_SIZE = 20;

const RANGE_OPTIONS: { value: DateRangePreset | "custom"; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "custom", label: "Custom" },
];

const STATUS_OPTIONS: { value: KraDisplayStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "delayed", label: "Delayed" },
  // The server's "completed" filter also returns the ones completed late
  { value: "completed", label: "Completed (all)" },
  { value: "completed_delayed", label: "Completed late" },
];

const selectClass = `${kraInputClass} sm:w-auto`;

function SummaryCards({ summary }: { summary: KraSummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {summary.by_frequency.map((row) => (
        <div key={row.frequency} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-950 mb-3">{FREQUENCY_LABELS[row.frequency]}</h3>
          <dl className="grid grid-cols-2 gap-3">
            {[
              { label: "Pending", value: row.pending },
              { label: "Delayed", value: row.delayed },
              // Without the late ones, so that the four numbers add up to the total
              { label: "Completed", value: row.completed - row.completed_with_delay },
              { label: "Completed late", value: row.completed_with_delay },
            ].map((stat) => (
              <div key={stat.label}>
                <dd className="text-xl font-bold text-slate-950">{stat.value}</dd>
                <dt className="text-xs text-slate-500">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

/** Render with key={propertyId}: state belongs to one property */
export default function KraProgressPanel({ propertyId }: { propertyId: string }) {
  const [preset, setPreset] = useState<DateRangePreset | "custom">("week");
  const [customFrom, setCustomFrom] = useState(() => localRangeFor("month").from);
  const [customTo, setCustomTo] = useState(() => localRangeFor("month").to);
  const [userId, setUserId] = useState("");
  const [frequency, setFrequency] = useState<KraFrequency | "">("");
  const [status, setStatus] = useState<KraDisplayStatus | "">("");
  const [skip, setSkip] = useState(0);

  const [summary, setSummary] = useState<KraSummary | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [page, setPage] = useState<KraOccurrencePage | null>(null);
  const [pageError, setPageError] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [retry, setRetry] = useState(0);
  const summaryRequest = useRef(0);
  const pageRequest = useRef(0);

  const { people } = useKraPeople(propertyId);

  const range = useMemo(
    () => (preset === "custom" ? { from: customFrom, to: customTo } : localRangeFor(preset)),
    [preset, customFrom, customTo]
  );
  const rangeProblem = !range.from || !range.to
    ? "Choose both dates."
    : range.from > range.to ? "The start date must not be after the end date." : "";

  useEffect(() => {
    if (rangeProblem) return;
    const request = ++summaryRequest.current;
    setSummary(null);
    setSummaryError("");
    kraTasksAPI.summary({ property_id: propertyId, period_from: range.from, period_to: range.to })
      .then((data) => { if (request === summaryRequest.current) setSummary(data); })
      .catch((err) => { if (request === summaryRequest.current) setSummaryError(kraErrorMessage(err)); });
  }, [propertyId, range.from, range.to, rangeProblem, retry]);

  useEffect(() => {
    if (rangeProblem) return;
    const request = ++pageRequest.current;
    setLoadingPage(true);
    setPageError("");
    kraTasksAPI.listOccurrences({
      property_id: propertyId,
      user_id: userId || undefined,
      frequency: frequency || undefined,
      status: status || undefined,
      period_from: range.from,
      period_to: range.to,
      skip,
      limit: PAGE_SIZE,
    })
      .then((data) => { if (request === pageRequest.current) setPage(data); })
      .catch((err) => { if (request === pageRequest.current) setPageError(kraErrorMessage(err)); })
      .finally(() => { if (request === pageRequest.current) setLoadingPage(false); });
  }, [propertyId, range.from, range.to, rangeProblem, userId, frequency, status, skip, retry]);

  const items = page?.items ?? [];
  const total = page?.total ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
        <div>
          <label htmlFor="kra-range" className="block text-xs font-semibold text-slate-600 mb-1">Range</label>
          <select id="kra-range" value={preset} className={selectClass}
            onChange={(e) => { setPreset(e.target.value as DateRangePreset | "custom"); setSkip(0); }}>
            {RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {preset === "custom" && (
          <>
            <div>
              <label htmlFor="kra-from" className="block text-xs font-semibold text-slate-600 mb-1">From</label>
              <input id="kra-from" type="date" value={customFrom} className={selectClass}
                onChange={(e) => { setCustomFrom(e.target.value); setSkip(0); }} />
            </div>
            <div>
              <label htmlFor="kra-to" className="block text-xs font-semibold text-slate-600 mb-1">To</label>
              <input id="kra-to" type="date" value={customTo} className={selectClass}
                onChange={(e) => { setCustomTo(e.target.value); setSkip(0); }} />
            </div>
          </>
        )}
      </div>

      {rangeProblem ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{rangeProblem}</p>
      ) : (
        <>
          {summaryError ? (
            <KraErrorState message={summaryError} onRetry={() => setRetry((n) => n + 1)} />
          ) : summary ? (
            <SummaryCards summary={summary} />
          ) : (
            <KraLoading />
          )}

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <select aria-label="Filter by person" value={userId} className={selectClass}
                onChange={(e) => { setUserId(e.target.value); setSkip(0); }}>
                <option value="">Everyone</option>
                {(people ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select aria-label="Filter by frequency" value={frequency} className={selectClass}
                onChange={(e) => { setFrequency(e.target.value as KraFrequency | ""); setSkip(0); }}>
                <option value="">All frequencies</option>
                {KRA_FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
              </select>
              <select aria-label="Filter by status" value={status} className={selectClass}
                onChange={(e) => { setStatus(e.target.value as KraDisplayStatus | ""); setSkip(0); }}>
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {loadingPage && page && <Loader2 className="w-4 h-4 animate-spin text-slate-400 self-center" aria-label="Loading" />}
            </div>

            {pageError ? (
              <KraErrorState message={pageError} onRetry={() => setRetry((n) => n + 1)} />
            ) : !page ? (
              <KraLoading />
            ) : items.length === 0 ? (
              <KraEmptyState title="No tasks match">
                Try a wider range or fewer filters. Tasks appear here once a KRA is assigned.
              </KraEmptyState>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        {["Person", "Task", "Period", "Status", "Delay reason", "Note", "Number"].map((h) => (
                          <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors align-top">
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.assignee_name ?? "Unnamed"}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 max-w-[220px] break-words">{row.title}</td>
                          <td className="px-4 py-3">
                            <KraPeriodLabel frequency={row.frequency} periodStart={row.period_start} periodEnd={row.period_end} />
                          </td>
                          <td className="px-4 py-3"><KraStatusBadge status={row.display_status} /></td>
                          <td className="px-4 py-3 text-sm text-slate-600 max-w-[180px] break-words">{row.delay_reason ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 max-w-[180px] break-words">{row.completion_note ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {row.completion_value != null ? (
                              <>
                                <span className="font-semibold text-slate-900">{row.completion_value.toLocaleString("en-IN")}</span>
                                {row.value_label && <span className="block text-xs text-slate-500">{row.value_label}</span>}
                              </>
                            ) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Showing {skip + 1}–{skip + items.length} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))} disabled={skip === 0 || loadingPage}
                      className={`${kraSecondaryButtonClass} px-3 py-1.5`}>
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button onClick={() => setSkip(skip + PAGE_SIZE)} disabled={skip + items.length >= total || loadingPage}
                      className={`${kraSecondaryButtonClass} px-3 py-1.5`}>
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
