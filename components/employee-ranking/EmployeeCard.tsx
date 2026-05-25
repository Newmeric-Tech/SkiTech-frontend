"use client";

import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { EmployeeRanking } from "@/types/employee-ranking";
import { useRouter } from "next/navigation";

interface EmployeeCardProps {
  ranking: EmployeeRanking;
  index?: number;
}

export default function EmployeeCard({ ranking, index = 0 }: EmployeeCardProps) {
  const router = useRouter();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const isRank1 = ranking.rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group flex flex-col items-center min-w-[200px]"
    >
      <div className="relative mb-3">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg border-2 border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-300">
          {getInitials(ranking.employee.name)}
        </div>
        <div
          className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ${
            isRank1 ? "bg-amber-400 text-slate-950" : "bg-slate-950 text-amber-400"
          }`}
        >
          #{ranking.rank}
        </div>
      </div>
      
      <h3 className="font-bold text-slate-950 text-sm text-center truncate w-full">{ranking.employee.name}</h3>
      <p className="text-xs text-slate-500 mt-0.5 text-center truncate w-full">{ranking.employee.role}</p>
      
      <div className="flex items-center gap-1.5 mt-2 mb-4">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="text-sm font-bold text-slate-950">{ranking.finalScore}</span>
      </div>

      <div className="w-full h-px bg-slate-100 mb-4" />

      <button
        onClick={() => router.push(`/owner/employee-ranking/staff/${ranking.employeeId}`)}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-950 transition-colors group-hover:text-slate-950"
      >
        View Details
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
