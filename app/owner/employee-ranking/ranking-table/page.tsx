"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import RankingTable from "@/components/employee-ranking/RankingTable";
import { useAuthStore } from "@/store/authStore";
import { rankingAPI, mapRankingItem, getPeriodDates, RankingPeriodType } from "@/lib/api/ranking";
import { EmployeeRanking } from "@/types/employee-ranking";

const PERIOD_OPTIONS: { label: string; value: RankingPeriodType }[] = [
  { label: "Weekly",  value: "weekly"  },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly",  value: "yearly"  },
];

export default function RankingTablePage() {
  const { user } = useAuthStore();

  const [period, setPeriod] = useState<RankingPeriodType>("weekly");
  const [rankings, setRankings] = useState<EmployeeRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tenantId   = user?.tenant_id   ?? "";
  const propertyId = user?.property_id ?? "";

  const fetchRankings = useCallback(async () => {
    if (!tenantId || !propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rankingAPI.getPropertyRankings(propertyId, tenantId, period, 0, 100);
      setRankings(data.items.map(mapRankingItem));
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to load rankings");
    } finally {
      setLoading(false);
    }
  }, [tenantId, propertyId, period]);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  const handleRecalculate = async () => {
    if (!tenantId || !propertyId || recalculating) return;
    setRecalculating(true);
    try {
      const { start, end } = getPeriodDates(period);
      await rankingAPI.recalculate(propertyId, tenantId, period, start, end);
      await fetchRankings();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Recalculation failed");
    } finally {
      setRecalculating(false);
    }
  };

  if (!propertyId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-slate-400" />
        <p className="text-slate-600 font-medium">No property linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Employee Directory</h2>
          <p className="text-slate-500 text-sm mt-1">Complete employee ranking directory with advanced filtering</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
            {recalculating ? "Calculating…" : "Recalculate"}
          </button>
          <button
            onClick={() => {
              const csv = [
                ["Rank", "Name", "Department", "Attendance", "Task %", "Score", "Status"].join(","),
                ...rankings.map((r) =>
                  [r.rank, r.employee.name, r.employee.department, r.attendance, r.taskCompletion, r.finalScore, r.status].join(",")
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `ranking_table_${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
            }}
            disabled={rankings.length === 0}
            className="px-4 py-2.5 text-sm font-medium text-white bg-slate-950 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-950/20 flex items-center gap-2 disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-2">
        {PERIOD_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              period === value
                ? "bg-slate-950 text-white shadow-md shadow-slate-950/10"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={fetchRankings} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200/60">
            <div className="h-5 w-40 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-8 rounded bg-slate-100 animate-pulse" />
                <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-24 rounded bg-slate-100 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <RankingTable
          data={rankings}
          showFilters
          showPagination
          pageSize={10}
          basePath="/owner/employee-ranking"
        />
      )}
    </div>
  );
}
