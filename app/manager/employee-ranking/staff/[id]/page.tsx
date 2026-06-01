"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Target, Flame, Calendar, AlertCircle } from "lucide-react";
import EmployeeProfileCard from "@/components/employee-ranking/EmployeeProfileCard";
import ScoreCard from "@/components/employee-ranking/ScoreCard";
import ProgressBar from "@/components/employee-ranking/ProgressBar";
import TaskList from "@/components/employee-ranking/TaskList";
import { useAuthStore } from "@/store/authStore";
import { rankingAPI, BackendEmployeeRanking } from "@/lib/api/ranking";

// Criterion name → display label + color
const CRITERION_META: Record<string, { label: string; color: string }> = {
  "Attendance & Functionality":    { label: "Attendance",       color: "#3B82F6" },
  "Task Completion":               { label: "Task Completion",  color: "#10B981" },
  "Task Quality & Cleanliness":    { label: "Task Quality",     color: "#8B5CF6" },
  "Manager Review & Behaviour":    { label: "Manager Review",   color: "#F59E0B" },
  "Customer Feedback / Complaints": { label: "Guest Satisfaction", color: "#EC4899" },
  "Standby / Emergency Support":   { label: "Standby Support",  color: "#06B6D4" },
  "Overtime Contribution":         { label: "Overtime",         color: "#6366F1" },
};

const PERF_STATUS_LABEL: Record<string, string> = {
  promotion_ready:   "High Performer",
  high_performer:    "High Performer",
  most_improved:     "Consistent",
  consistent:        "Consistent",
  needs_improvement: "Needs Attention",
  smart_ranking:     "Consistent",
};

export default function ManagerStaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const [ranking, setRanking] = useState<BackendEmployeeRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantId = user?.tenant_id ?? "";

  useEffect(() => {
    if (!tenantId || !id) return;
    setLoading(true);
    setError(null);

    rankingAPI
      .getEmployeeRanking(id, tenantId)
      .then(setRanking)
      .catch((err: any) => {
        setError(err?.response?.data?.detail ?? "Failed to load employee ranking");
      })
      .finally(() => setLoading(false));
  }, [id, tenantId]);

  // Loading
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 rounded bg-slate-100" />
        <div className="h-40 rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !ranking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-950">
          {error ?? "No ranking found"}
        </h2>
        <p className="text-slate-500 text-sm">
          This employee may not have been ranked yet for the current period.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-950 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Build performance factors from scores_breakdown
  const performanceFactors = ranking.scores_breakdown
    .map((s) => {
      const meta = CRITERION_META[s.criterion_name];
      return {
        label: meta?.label ?? s.criterion_name,
        value: Math.round(s.score),
        color: meta?.color ?? "#94A3B8",
      };
    })
    .sort((a, b) => b.value - a.value);

  // Find key scores
  const attendanceScore = ranking.scores_breakdown.find(
    (s) => s.criterion_name === "Attendance & Functionality"
  )?.score ?? 0;
  const taskScore = ranking.scores_breakdown.find(
    (s) => s.criterion_name === "Task Completion"
  )?.score ?? 0;

  const statusLabel = PERF_STATUS_LABEL[ranking.performance_status] ?? "Consistent";

  const whyRankText =
    ranking.rank === 1
      ? `${ranking.employee_name} is currently delivering top performance with an overall score of ${ranking.overall_score.toFixed(1)}. Their consistency across all ranking criteria demonstrates outstanding commitment.`
      : `${ranking.employee_name} holds rank #${ranking.rank} out of ${ranking.total_active_employees} employees with a score of ${ranking.overall_score.toFixed(1)}.${ranking.score_change != null ? ` ${ranking.score_change > 0 ? `Up ${ranking.score_change.toFixed(1)} points` : `Down ${Math.abs(ranking.score_change).toFixed(1)} points`} from last period.` : ""}`;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Rankings
      </button>

      {/* Profile Header */}
      <EmployeeProfileCard
        name={ranking.employee_name}
        department={ranking.department ?? "—"}
        role={statusLabel}
        status="active"
        rank={ranking.rank}
        score={Math.round(ranking.overall_score * 10) / 10}
        joinDate={new Date(ranking.period_start).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })}
      />

      {/* Why Rank */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6"
      >
        <h3 className="font-bold text-slate-950 text-lg mb-2">Why #{ranking.rank} Rank?</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{whyRankText}</p>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          icon={Calendar}
          label="Attendance"
          value={`${Math.round(attendanceScore)}%`}
          subtext="Attendance & functionality score"
          color="#3B82F6"
          index={0}
        />
        <ScoreCard
          icon={Target}
          label="Task Completion"
          value={`${Math.round(taskScore)}%`}
          subtext="Tasks completed on time"
          color="#10B981"
          index={1}
        />
        <ScoreCard
          icon={CheckCircle}
          label="Final Score"
          value={`${(Math.round(ranking.overall_score * 10) / 10)}`}
          subtext={`Rank #${ranking.rank} of ${ranking.total_active_employees}`}
          color="#6366F1"
          index={2}
        />
        <ScoreCard
          icon={Flame}
          label="Score Change"
          value={
            ranking.score_change != null
              ? `${ranking.score_change > 0 ? "+" : ""}${ranking.score_change.toFixed(1)}`
              : "—"
          }
          subtext="vs previous period"
          color="#F59E0B"
          index={3}
        />
      </div>

      {/* Tasks + Ranking Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's tasks placeholder — would come from the task/KRA module */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="font-bold text-slate-950 text-lg mb-4">Ranking Period</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-500">Period Start</span>
              <span className="font-medium">
                {new Date(ranking.period_start).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Period End</span>
              <span className="font-medium">
                {new Date(ranking.period_end).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Period Type</span>
              <span className="font-medium capitalize">{ranking.ranking_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Performance Status</span>
              <span className="font-medium">{statusLabel}</span>
            </div>
            {ranking.previous_overall_score != null && (
              <div className="flex justify-between">
                <span className="text-slate-500">Previous Score</span>
                <span className="font-medium">{ranking.previous_overall_score.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ranking Factor Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="font-bold text-slate-950 text-lg mb-6">Ranking Factor Breakdown</h3>
          <div className="space-y-5">
            {performanceFactors.map((factor, i) => (
              <ProgressBar
                key={factor.label}
                label={factor.label}
                value={factor.value}
                color={factor.color}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
