"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Target, Flame, Calendar } from "lucide-react";
import EmployeeProfileCard from "@/components/employee-ranking/EmployeeProfileCard";
import ScoreCard from "@/components/employee-ranking/ScoreCard";
import ProgressBar from "@/components/employee-ranking/ProgressBar";
import TaskList from "@/components/employee-ranking/TaskList";
import { rankings, staffTasks } from "@/mock-data/employee-ranking";

export default function ManagerStaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const ranking = rankings.find((r) => r.employeeId === id);

  if (!ranking) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold text-slate-950">Employee not found</h2>
        <p className="text-slate-500 mt-2">The employee you&apos;re looking for doesn&apos;t exist.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2.5 text-sm font-medium text-white bg-slate-950 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  const performanceFactors = [
    { label: "Attendance", value: ranking.attendance, color: "#3B82F6" },
    { label: "Task Completion", value: ranking.taskCompletion, color: "#10B981" },
    { label: "Punctuality", value: ranking.punctuality, color: "#8B5CF6" },
    { label: "Teamwork", value: ranking.teamwork, color: "#F59E0B" },
    { label: "Guest Satisfaction", value: ranking.guestSatisfaction, color: "#EC4899" },
  ];

  const whyRankText =
    ranking.rank === 1
      ? `${ranking.employee.name} is currently delivering top performance and has excelled in attendance, task completion, and guest satisfaction. Their consistency over ${ranking.streak} months demonstrates commitment to excellence.`
      : `${ranking.employee.name} has shown strong performance metrics across all categories. With continued improvement in key areas, they can climb even higher in the rankings.`;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Rankings
      </button>

      {/* Profile Header */}
      <EmployeeProfileCard
        name={ranking.employee.name}
        department={ranking.employee.department}
        role={ranking.employee.role}
        status={ranking.employee.status}
        rank={ranking.rank}
        score={ranking.finalScore}
        joinDate={ranking.employee.joinDate}
      />

      {/* Why Rank Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6"
      >
        <h3 className="font-bold text-slate-950 text-lg mb-2">
          Why #{ranking.rank} Rank?
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">{whyRankText}</p>
      </motion.div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          icon={Calendar}
          label="Attendance"
          value={`${ranking.attendance}%`}
          subtext="Monthly average"
          color="#3B82F6"
          index={0}
        />
        <ScoreCard
          icon={Target}
          label="Task Completion"
          value={`${ranking.taskCompletion}%`}
          subtext="Tasks completed on time"
          color="#10B981"
          index={1}
        />
        <ScoreCard
          icon={CheckCircle}
          label="Final Score"
          value={ranking.finalScore.toString()}
          subtext="Overall performance score"
          color="#6366F1"
          index={2}
        />
        <ScoreCard
          icon={Flame}
          label="Streak"
          value={`${ranking.streak} months`}
          subtext="Consecutive high performance"
          color="#F59E0B"
          index={3}
        />
      </div>

      {/* Tasks + Ranking Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskList tasks={staffTasks} title="Tasks Performed" />

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="font-bold text-slate-950 text-lg mb-6">
            Ranking Factor Breakdown
          </h3>
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
