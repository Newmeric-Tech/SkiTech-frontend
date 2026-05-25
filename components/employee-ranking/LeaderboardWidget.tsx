"use client";

import { motion } from "framer-motion";
import { EmployeeRanking } from "@/types/employee-ranking";

interface LeaderboardWidgetProps {
  rankings: EmployeeRanking[];
  currentEmployeeId?: string;
  currentRank?: number;
}

export default function LeaderboardWidget({
  rankings,
  currentEmployeeId,
}: LeaderboardWidgetProps) {
  const topRankings = rankings.slice(0, 3);
  const leaderboardList = rankings.slice(0, 5);
  
  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const secondPlace = topRankings[1];
  const firstPlace = topRankings[0];
  const thirdPlace = topRankings[2];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-slate-950 text-xs tracking-widest uppercase">Your Position</h3>
        <span className="text-xs text-slate-400 font-medium cursor-pointer hover:text-slate-700 transition-colors">Last month &gt;</span>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-8 h-28 mt-4">
        {/* 2nd Place */}
        {secondPlace && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 mb-2 border border-slate-200 shadow-sm z-10 relative">
                {getInitials(secondPlace.employee.name)}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700 border border-white z-20">
                #2
              </div>
            </div>
            <div className="h-10 w-12 bg-slate-50 border-t border-x border-slate-200/60 rounded-t-lg mt-1" />
          </div>
        )}

        {/* 1st Place */}
        {firstPlace && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-sm font-bold text-white mb-2 border-2 border-amber-400 shadow-md z-10 relative">
                {getInitials(firstPlace.employee.name)}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-bold text-black border-2 border-white z-20 shadow-sm">
                #1
              </div>
            </div>
            <div className="h-16 w-14 bg-slate-900 border-t border-x border-slate-800 rounded-t-xl mt-1" />
          </div>
        )}

        {/* 3rd Place */}
        {thirdPlace && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 mb-2 border border-slate-200 shadow-sm z-10 relative">
                {getInitials(thirdPlace.employee.name)}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700 border border-white z-20">
                #3
              </div>
            </div>
            <div className="h-6 w-12 bg-slate-50 border-t border-x border-slate-200/60 rounded-t-lg mt-1" />
          </div>
        )}
      </div>

      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Leaderboard - Next Goal</h4>

      <div className="space-y-1">
        {leaderboardList.map((r, i) => {
          const isCurrent = r.employeeId === currentEmployeeId;
          return (
            <motion.div
              key={r.employeeId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                isCurrent ? "bg-slate-950 text-white shadow-md" : "hover:bg-slate-50"
              }`}
            >
              <div className="w-5 text-center shrink-0">
                <span className={`text-[11px] font-bold ${isCurrent ? 'text-white/80' : 'text-slate-400'}`}>#{r.rank}</span>
              </div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                isCurrent ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}>
                {getInitials(r.employee.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isCurrent ? "text-white" : "text-slate-900"}`}>
                  {r.employee.name}
                </p>
              </div>
              <span className={`text-sm font-bold shrink-0 ${isCurrent ? "text-white" : "text-slate-950"}`}>
                {r.finalScore}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
