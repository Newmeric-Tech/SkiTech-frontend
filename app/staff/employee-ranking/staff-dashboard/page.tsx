"use client";

import { motion } from "framer-motion";
import {
  Calendar, CheckCircle2, Star, Clock, Award,
} from "lucide-react";
import ScoreCard from "@/components/employee-ranking/ScoreCard";
import ProgressBar from "@/components/employee-ranking/ProgressBar";
import LeaderboardWidget from "@/components/employee-ranking/LeaderboardWidget";
import PerformanceChart from "@/components/employee-ranking/PerformanceChart";
import TaskList from "@/components/employee-ranking/TaskList";
import BadgeCard from "@/components/employee-ranking/BadgeCard";
import { rankings, staffTasks, badges, scoreHistory } from "@/mock-data/employee-ranking";

export default function StaffDashboardPage() {
  // Mock: Current user is Elena Rossi (id: 1)
  const currentEmployee = rankings.find((r) => r.employeeId === "1")!;

  const performanceFactors = [
    { label: "Task Completion", value: currentEmployee.taskCompletion, color: "#10B981" },
    { label: "Attendance Rate", value: currentEmployee.attendance, color: "#3B82F6" },
    { label: "Punctuality", value: currentEmployee.punctuality, color: "#8B5CF6" },
    { label: "Teamwork Score", value: currentEmployee.teamwork, color: "#F59E0B" },
    { label: "Guest Satisfaction", value: currentEmployee.guestSatisfaction, color: "#EC4899" },
  ];

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

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
                {getInitials(currentEmployee.employee.name)}
              </div>
              <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm ${
                currentEmployee.rank === 1 ? "bg-amber-400 text-slate-950" : "bg-slate-950 text-amber-400"
              }`}>
                #{currentEmployee.rank}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-950">
                  {currentEmployee.employee.name}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                  <Award className="w-3 h-3" /> Premium Performer
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                You are the #1 ranked employee of the year so far. Keep up the great work!
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Overall Score</p>
            <p className="text-4xl font-bold text-slate-950 tracking-tight">
              {currentEmployee.finalScore}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          icon={Calendar}
          label="Attendance Rate"
          value={`${currentEmployee.attendance}%`}
          subtext="100% record this quarter"
          color="#3B82F6"
          index={0}
        />
        <ScoreCard
          icon={CheckCircle2}
          label="Task Completion"
          value={`${currentEmployee.taskCompletion}%`}
          subtext="All 150 tasks completed"
          color="#10B981"
          index={1}
        />
        <ScoreCard
          icon={Star}
          label="Guest Satisfaction"
          value={`${(currentEmployee.guestSatisfaction / 20).toFixed(2)}`}
          subtext="Guest rating average"
          color="#8B5CF6"
          index={2}
        />
        <ScoreCard
          icon={Clock}
          label="Punctuality"
          value={`${currentEmployee.punctuality}%`}
          subtext="Always on time"
          color="#F59E0B"
          index={3}
        />
      </div>

      {/* Score Breakdown + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="font-bold text-slate-950 text-lg mb-6">Score Breakdown</h3>
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

        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <LeaderboardWidget
            rankings={rankings}
            currentEmployeeId="1"
            currentRank={currentEmployee.rank}
          />
        </div>
      </div>

      {/* Performance Chart */}
      <PerformanceChart data={scoreHistory} title="Score History" />

      {/* Today's Tasks + Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskList tasks={staffTasks} title="Today's Tasks" />

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="font-bold text-slate-950 text-lg mb-4">Badges Earned</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((badge, i) => (
              <BadgeCard key={badge.id} badge={badge} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
