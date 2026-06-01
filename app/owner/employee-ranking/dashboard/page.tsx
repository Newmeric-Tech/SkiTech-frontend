"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3, Users, Clock, Timer, Activity, Award, TrendingUp, Zap,
  Download, RefreshCw, AlertCircle,
} from "lucide-react";
import AnalyticsCard from "@/components/employee-ranking/AnalyticsCard";
import EmployeeCard from "@/components/employee-ranking/EmployeeCard";
import AIInsightCard from "@/components/employee-ranking/AIInsightCard";
import RankingTable from "@/components/employee-ranking/RankingTable";
import { useAuthStore } from "@/store/authStore";
import {
  rankingAPI, mapRankingItem, mapInsight, getPeriodDates,
  BackendDashboardStats, RankingPeriodType,
} from "@/lib/api/ranking";
import { EmployeeRanking } from "@/types/employee-ranking";
import PropertySelector from "@/components/employee-ranking/PropertySelector";

const PERIOD_OPTIONS: { label: string; value: RankingPeriodType }[] = [
  { label: "Weekly",  value: "weekly"  },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly",  value: "yearly"  },
];

export default function EmployeeRankingDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [period, setPeriod] = useState<RankingPeriodType>("weekly");
  const [dashboard, setDashboard] = useState<BackendDashboardStats | null>(null);
  const [rankings, setRankings] = useState<EmployeeRanking[]>([]);
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedPropertyName, setSelectedPropertyName] = useState<string>("");

  const tenantId   = user?.tenant_id ?? "";
  // Owner has null property_id in JWT — use the property selector instead
  const propertyId = selectedPropertyId;

  const fetchData = useCallback(async () => {
    if (!tenantId || !propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const [dashData, rankData] = await Promise.all([
        rankingAPI.getDashboard(propertyId, tenantId),
        rankingAPI.getPropertyRankings(propertyId, tenantId, period, 0, 50),
      ]);
      setDashboard(dashData);
      setRankings(rankData.items.map(mapRankingItem));
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to load ranking data");
    } finally {
      setLoading(false);
    }
  }, [tenantId, propertyId, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRecalculate = async () => {
    if (!tenantId || !propertyId || recalculating) return;
    setRecalculating(true);
    try {
      const { start, end } = getPeriodDates(period);
      await rankingAPI.recalculate(propertyId, tenantId, period, start, end);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Recalculation failed");
    } finally {
      setRecalculating(false);
    }
  };

  const top5     = rankings.slice(0, 5);
  const insights = (dashboard?.insights ?? []).map(mapInsight);

  const analyticsCards = [
    {
      icon: BarChart3, title: "Overall Workforce Score",
      value: dashboard ? dashboard.overall_workforce_score.toFixed(1) : "—",
      subtext: "Across all departments", change: 0, color: "#3B82F6", dark: true,
    },
    {
      icon: Users, title: "Active Staff",
      value: dashboard ? `${dashboard.active_staff}` : "—",
      subtext: "Currently ranked employees", change: 0, color: "#6366F1",
    },
    {
      icon: Activity, title: "High Performers",
      value: dashboard
        ? `${(dashboard.performance_distribution.promotion_ready ?? 0) + (dashboard.performance_distribution.high_performer ?? 0)}`
        : "—",
      subtext: "Score 80+", change: 0, color: "#10B981",
    },
    {
      icon: Timer, title: "Consistent",
      value: dashboard ? `${dashboard.performance_distribution.consistent ?? 0}` : "—",
      subtext: "Score 70–79", change: 0, color: "#F59E0B",
    },
    {
      icon: Clock, title: "Needs Attention",
      value: dashboard ? `${dashboard.performance_distribution.needs_improvement ?? 0}` : "—",
      subtext: "Score below 70", change: 0, color: "#EF4444",
    },
    {
      icon: Zap, title: "Promotion Ready",
      value: dashboard ? `${dashboard.performance_distribution.promotion_ready ?? 0}` : "—",
      subtext: "Score 90+", change: 0, color: "#EC4899",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Employee Ranking</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor workforce performance and track employee rankings</p>
        </div>
        <div className="flex items-center gap-3">
          <PropertySelector
            selectedId={selectedPropertyId}
            onChange={(id, name) => { setSelectedPropertyId(id); setSelectedPropertyName(name); }}
          />
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
              a.download = `employee_ranking_${new Date().toISOString().split("T")[0]}.csv`;
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={fetchData} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

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

      {/* Analytics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {analyticsCards.map((card, i) => (
            <AnalyticsCard key={card.title} {...card} index={i} />
          ))}
        </div>
      )}

      {/* Top 5 */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-950 text-lg">Top 5 Employees</h3>
            <p className="text-sm text-slate-500">Highest performing team members</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : top5.length === 0 ? (
          <div className="text-sm text-slate-500 py-6 text-center bg-white rounded-2xl border border-slate-200/60">
            No rankings yet — click <span className="font-medium">Recalculate</span> to generate rankings.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {top5.map((r, i) => (
              <EmployeeCard key={r.employeeId} ranking={r} index={i} basePath="/owner/employee-ranking" />
            ))}
          </div>
        )}
      </div>

      {/* Insights + Table Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-950 text-lg">Insights</h3>
                <p className="text-sm text-slate-500">Performance analysis</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : insights.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No insights available yet.</p>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <AIInsightCard key={insight.id} insight={insight} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <RankingTable
            data={rankings}
            preview
            showFilters={false}
            showPagination={false}
            onViewAll={() => router.push("/owner/employee-ranking/ranking-table")}
            basePath="/owner/employee-ranking"
          />
        </div>
      </div>
    </div>
  );
}
