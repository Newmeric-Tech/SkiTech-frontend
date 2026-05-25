"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BarChart3, Users, Clock, Timer, Activity, Award, TrendingUp, Zap,
  Download,
} from "lucide-react";
import AnalyticsCard from "@/components/employee-ranking/AnalyticsCard";
import EmployeeCard from "@/components/employee-ranking/EmployeeCard";
import AIInsightCard from "@/components/employee-ranking/AIInsightCard";
import RankingTable from "@/components/employee-ranking/RankingTable";
import {
  rankings,
  dashboardMetrics,
  aiInsights,
} from "@/mock-data/employee-ranking";

export default function EmployeeRankingDashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"Weekly" | "Monthly" | "Yearly">("Weekly");
  const top5 = rankings.slice(0, 5);

  const analyticsCards = [
    {
      icon: BarChart3,
      title: "Overall Workforce Score",
      value: dashboardMetrics.overallWorkforceScore.toString(),
      subtext: "Across all departments",
      change: dashboardMetrics.scoreChange,
      color: "#3B82F6",
      dark: true,
    },
    {
      icon: Users,
      title: "Active Staff",
      value: `${dashboardMetrics.activeStaff}/${dashboardMetrics.totalStaff}`,
      subtext: `${dashboardMetrics.totalStaff - dashboardMetrics.activeStaff} on leave`,
      change: dashboardMetrics.staffChange,
      color: "#6366F1",
    },
    {
      icon: Activity,
      title: "Attendance %",
      value: `${dashboardMetrics.attendancePercentage}%`,
      subtext: "Monthly average",
      change: dashboardMetrics.attendanceChange,
      color: "#10B981",
    },
    {
      icon: Timer,
      title: "Overtime",
      value: `${dashboardMetrics.overtimeHours}`,
      subtext: "Hours this week",
      change: 0.8,
      color: "#F59E0B",
    },
    {
      icon: Clock,
      title: "Standby",
      value: `${dashboardMetrics.standbyHours}`,
      subtext: "Hours this week",
      change: -0.5,
      color: "#8B5CF6",
    },
    {
      icon: Zap,
      title: "Total Hours",
      value: dashboardMetrics.totalHours.toLocaleString(),
      subtext: "This month",
      change: 2.1,
      color: "#EC4899",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
            Employee Ranking
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Monitor workforce performance and track employee rankings
          </p>
        </div>
        <button
          onClick={() => {
            const csvContent = [
              ["Rank", "Name", "Department", "Attendance", "Task %", "Score", "Status"].join(","),
              ...rankings.map((r) =>
                [r.rank, r.employee.name, r.employee.department, r.attendance, r.taskCompletion, r.finalScore, r.status].join(",")
              ),
            ].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `employee_ranking_${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
          }}
          className="px-4 py-2.5 text-sm font-medium text-white bg-slate-950 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-950/20 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Time Range Tabs */}
      <div className="flex items-center gap-2">
        {["Weekly", "Monthly", "Yearly"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range as any)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              timeRange === range
                ? "bg-slate-950 text-white shadow-md shadow-slate-950/10"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {analyticsCards.map((card, i) => (
          <AnalyticsCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Top 5 Employees */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Top 5 Employees</h3>
              <p className="text-sm text-slate-500">Highest performing team members</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {top5.map((r, i) => (
            <EmployeeCard key={r.employeeId} ranking={r} index={i} />
          ))}
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-950 text-lg">AI Insights</h3>
                <p className="text-sm text-slate-500">Smart performance analysis</p>
              </div>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight, i) => (
                <AIInsightCard key={insight.id} insight={insight} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Ranking Table Preview */}
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
