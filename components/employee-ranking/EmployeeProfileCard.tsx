"use client";

import { motion } from "framer-motion";

interface EmployeeProfileCardProps {
  name: string;
  department: string;
  role: string;
  status: "active" | "on-leave" | "probation";
  rank: number;
  score: number;
  joinDate: string;
}

export default function EmployeeProfileCard({
  name,
  department,
  role,
  status,
  rank,
  score,
  joinDate,
}: EmployeeProfileCardProps) {
  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const statusConfig = {
    active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
    "on-leave": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "On Leave" },
    probation: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Probation" },
  };

  const s = statusConfig[status];

  const getRankText = (rank: number) => {
    return `#${rank}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6"
    >
      <div className="flex items-start gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-bold text-2xl border-2 border-white shadow-lg">
            {getInitials(name)}
          </div>
          <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm ${
            rank === 1 ? "bg-amber-400 text-slate-950" : "bg-slate-950 text-amber-400"
          }`}>
            {getRankText(rank)}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-950">{name}</h2>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{role} • {department}</p>
          <div className="flex items-center gap-4 mt-3">
            <div>
              <span className="text-xs text-slate-400">Rank</span>
              <p className="text-lg font-bold text-slate-950">{getRankText(rank)}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-xs text-slate-400">Score</span>
              <p className="text-lg font-bold text-slate-950">{score}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-xs text-slate-400">Since</span>
              <p className="text-sm font-medium text-slate-700">{joinDate}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
