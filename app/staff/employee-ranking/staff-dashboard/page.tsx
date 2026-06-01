"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Star, Clock, Award, AlertCircle } from "lucide-react";
import ScoreCard from "@/components/employee-ranking/ScoreCard";
import ProgressBar from "@/components/employee-ranking/ProgressBar";
import LeaderboardWidget from "@/components/employee-ranking/LeaderboardWidget";
import PerformanceChart from "@/components/employee-ranking/PerformanceChart";
import { useAuthStore } from "@/store/authStore";
import { rankingAPI, mapRankingItem, BackendEmployeeRanking, RankingPeriodType } from "@/lib/api/ranking";
import { EmployeeRanking } from "@/types/employee-ranking";

const CRITERION_META: Record<string, { label: string; color: string }> = {
  "Attendance & Functionality":     { label: "Attendance Rate",   color: "#3B82F6" },
  "Task Completion":                { label: "Task Completion",   color: "#10B981" },
  "Task Quality & Cleanliness":     { label: "Task Quality",      color: "#8B5CF6" },
  "Manager Review & Behaviour":     { label: "Manager Review",    color: "#F59E0B" },
  "Customer Feedback / Complaints": { label: "Guest Satisfaction",color: "#EC4899" },
  "Standby / Emergency Support":    { label: "Standby Support",   color: "#06B6D4" },
  "Overtime Contribution":          { label: "Overtime",          color: "#6366F1" },
};

const PERF_STATUS_LABEL: Record<string, string> = {
  promotion_ready:   "High Performer",
  high_performer:    "High Performer",
  most_improved:     "Most Improved",
  consistent:        "Consistent",
  needs_improvement: "Needs Improvement",
  smart_ranking:     "Consistent",
};

export default function StaffDashboardPage() {
  const { user } = useAuthStore();

  const [myRanking, setMyRanking]         = useState<BackendEmployeeRanking | null>(null);
  const [leaderboard, setLeaderboard]     = useState<EmployeeRanking[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const tenantId   = user?.tenant_id   ?? "";
  const propertyId = user?.property_id ?? "";

  useEffect(() => {
    if (!tenantId) return;

    const tasks: Promise<any>[] = [
      rankingAPI.getMyRanking("weekly").then(setMyRanking),
    ];

    // Also fetch property leaderboard if property_id is available
    if (propertyId) {
      tasks.push(
        rankingAPI.getPropertyRankings(propertyId, tenantId, "weekly", 0, 10)
          .then((data) => setLeaderboard(data.items.map(mapRankingItem)))
      );
    }

    Promise.all(tasks)
      .catch((err: any) => setError(err?.response?.data?.detail ?? "Failed to load your ranking"))
      .finally(() => setLoading(false));
  }, [tenantId, propertyId]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100" />)}
        </div>
      </div>
    );
  }

  // ── Error / no ranking yet ────────────────────────────────
  if (error || !myRanking) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-slate-400" />
        <p className="text-slate-700 font-medium text-lg">
          {error ?? "No ranking found for the current period"}
        </p>
        <p className="text-sm text-slate-400">
          Your manager hasn&apos;t run the ranking calculation yet. Check back soon.
        </p>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────
  const performanceFactors = myRanking.scores_breakdown.map((s) => {
    const meta = CRITERION_META[s.criterion_name];
    return { label: meta?.label ?? s.criterion_name, value: Math.round(s.score), color: meta?.color ?? "#94A3B8" };
  });

  const attendanceScore = myRanking.scores_breakdown.find(s => s.criterion_name === "Attendance & Functionality")?.score ?? 0;
  const taskScore       = myRanking.scores_breakdown.find(s => s.criterion_name === "Task Completion")?.score ?? 0;
  const guestScore      = myRanking.scores_breakdown.find(s => s.criterion_name === "Customer Feedback / Complaints")?.score ?? 0;
  const qualityScore    = myRanking.scores_breakdown.find(s => s.criterion_name === "Task Quality & Cleanliness")?.score ?? 0;
  const statusLabel     = PERF_STATUS_LABEL[myRanking.performance_status] ?? "Consistent";

  const performanceMessage =
    myRanking.rank === 1
      ? `You are the #1 ranked employee this period. Outstanding dedication!`
      : myRanking.rank <= 3
      ? `You are in the top 3 this period with a score of ${myRanking.overall_score.toFixed(1)}. Keep it up!`
      : `You hold rank #${myRanking.rank} out of ${myRanking.total_active_employees} employees this period.`;

  // Build a fake score-history chart from what we have (current + previous period)
  const scoreHistory = myRanking.previous_overall_score != null
    ? [
        { month: "Previous", score: myRanking.previous_overall_score, attendance: 0, tasks: 0 },
        { month: "Current",  score: myRanking.overall_score,          attendance: Math.round(attendanceScore), tasks: Math.round(taskScore) },
      ]
    : [
        { month: "Current", score: myRanking.overall_score, attendance: Math.round(attendanceScore), tasks: Math.round(taskScore) },
      ];

  // Find my entry in the leaderboard for the LeaderboardWidget
  const myLeaderboardEntry: EmployeeRanking = {
    employeeId:        myRanking.employee_id,
    employee: {
      id:         myRanking.employee_id,
      name:       myRanking.employee_name,
      avatar:     "",
      department: myRanking.department ?? "—",
      role:       statusLabel,
      email:      "",
      phone:      "",
      joinDate:   "",
      status:     "active",
    },
    rank:              myRanking.rank,
    previousRank:      myRanking.rank,
    rankChange:        0,
    attendance:        Math.round(attendanceScore),
    taskCompletion:    Math.round(taskScore),
    punctuality:       Math.round(qualityScore),
    teamwork:          0,
    guestSatisfaction: Math.round(guestScore),
    standbyHours:      0,
    overtimeHours:     0,
    totalHours:        0,
    finalScore:        Math.round(myRanking.overall_score * 10) / 10,
    streak:            0,
    status:            "Consistent",
  };

  const leaderboardData = leaderboard.length > 0 ? leaderboard : [myLeaderboardEntry];

  return (
    <div className="space-y-8">
      {/* Performance Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-bold text-xl border-2 border-white shadow-lg">
                {getInitials(myRanking.employee_name)}
              </div>
              <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm ${
                myRanking.rank === 1 ? "bg-amber-400 text-slate-950" : "bg-slate-950 text-amber-400"
              }`}>
                #{myRanking.rank}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-950">{myRanking.employee_name}</h2>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                  <Award className="w-3 h-3" /> {statusLabel}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{performanceMessage}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Overall Score</p>
            <p className="text-4xl font-bold text-slate-950 tracking-tight">
              {(Math.round(myRanking.overall_score * 10) / 10).toFixed(1)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard icon={Calendar}    label="Attendance Rate"   value={`${Math.round(attendanceScore)}%`} subtext="Attendance score"      color="#3B82F6" index={0} />
        <ScoreCard icon={CheckCircle2} label="Task Completion"  value={`${Math.round(taskScore)}%`}       subtext="On-time completion"    color="#10B981" index={1} />
        <ScoreCard icon={Star}         label="Guest Satisfaction" value={`${(guestScore / 20).toFixed(2)}`} subtext="Guest rating average" color="#8B5CF6" index={2} />
        <ScoreCard icon={Clock}        label="Task Quality"     value={`${Math.round(qualityScore)}%`}    subtext="Quality & cleanliness" color="#F59E0B" index={3} />
      </div>

      {/* Score Breakdown + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="font-bold text-slate-950 text-lg mb-6">Score Breakdown</h3>
          <div className="space-y-5">
            {performanceFactors.map((factor, i) => (
              <ProgressBar key={factor.label} label={factor.label} value={factor.value} color={factor.color} index={i} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <LeaderboardWidget
            rankings={leaderboardData}
            currentEmployeeId={myRanking.employee_id}
            currentRank={myRanking.rank}
          />
        </div>
      </div>

      {/* Score History Chart */}
      <PerformanceChart data={scoreHistory} title="Score History" />
    </div>
  );
}
