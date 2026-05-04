"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BarChart3, Calendar, CheckCircle2, ChevronRight, Clock,
  FileText, Filter, Plus, Search, TrendingUp, Eye, AlertCircle, ArrowRight,
} from "lucide-react";

type KraType = "daily" | "weekly" | "monthly" | "quarterly";
type KraStatus = "submitted" | "approved" | "rejected";

interface KraEntry {
  id: string; type: KraType; date: string; shift?: "Morning" | "Evening" | "Night";
  status: KraStatus; submittedAt: string; highlights: string[];
}

interface KRAListViewProps { 
  dailySubmitHref?: string; 
  weeklySubmitHref?: string;
  monthlySubmitHref?: string;
  quarterlySubmitHref?: string;
}

const mockKras: KraEntry[] = [
  { id: "kra-001", type: "daily", date: "2026-04-22", shift: "Morning", status: "approved", submittedAt: "2026-04-22T09:15:00", highlights: ["12 check-ins", "8 check-outs", "0 complaints"] },
  { id: "kra-002", type: "daily", date: "2026-04-21", shift: "Evening", status: "approved", submittedAt: "2026-04-21T22:05:00", highlights: ["9 check-ins", "11 check-outs", "1 complaint resolved"] },
  { id: "kra-003", type: "weekly", date: "2026-04-14", status: "submitted", submittedAt: "2026-04-14T18:45:00", highlights: ["OTA images updated", "Stock reviewed", "3/5 platforms done"] },
  { id: "kra-004", type: "daily", date: "2026-04-20", shift: "Night", status: "rejected", submittedAt: "2026-04-20T06:30:00", highlights: ["5 check-ins", "3 check-outs", "2 maintenance tasks"] },
  { id: "kra-005", type: "daily", date: "2026-04-19", shift: "Morning", status: "approved", submittedAt: "2026-04-19T09:00:00", highlights: ["7 check-ins", "6 check-outs", "Room checks done"] },
  { id: "kra-006", type: "weekly", date: "2026-04-07", status: "approved", submittedAt: "2026-04-07T17:30:00", highlights: ["All OTA images updated", "Full stock review", "Google reviews tracked"] },
];

const statusConfig: Record<KraStatus, { color: string; bg: string; label: string; icon: typeof CheckCircle2 }> = {
  submitted: { color: "#3B82F6", bg: "bg-blue-50 text-blue-700 border-blue-200/60", label: "Submitted", icon: Clock },
  approved: { color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60", label: "Approved", icon: CheckCircle2 },
  rejected: { color: "#EF4444", bg: "bg-red-50 text-red-700 border-red-200/60", label: "Rejected", icon: AlertCircle },
};

const shiftColors: Record<string, string> = {
  Morning: "bg-amber-50 text-amber-700 border-amber-200/60",
  Evening: "bg-purple-50 text-purple-700 border-purple-200/60",
  Night: "bg-slate-100 text-slate-700 border-slate-200/60",
};

export default function KRAListView({ dailySubmitHref, weeklySubmitHref }: KRAListViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | KraType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | KraStatus>("all");

  const filtered = mockKras.filter((k) => {
    const matchType = typeFilter === "all" || k.type === typeFilter;
    const matchStatus = statusFilter === "all" || k.status === statusFilter;
    const matchSearch = search === "" || k.date.includes(search) || k.highlights.some((h) => h.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchStatus && matchSearch;
  });

  const stats = {
    total: mockKras.length,
    approved: mockKras.filter((k) => k.status === "approved").length,
    submitted: mockKras.filter((k) => k.status === "submitted").length,
    rejected: mockKras.filter((k) => k.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">KRA Reports</h1>
          <p className="text-slate-500 text-sm mt-1">View and track your submitted KRA reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={dailySubmitHref} className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Daily KRA
          </Link>
          <Link href={weeklySubmitHref} className="flex items-center gap-2 bg-white text-slate-800 border border-slate-200/80 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <BarChart3 className="w-4 h-4" /> Weekly KRA
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Submitted", value: stats.total, color: "#6366F1", icon: FileText },
          { label: "Approved", value: stats.approved, color: "#10B981", icon: CheckCircle2 },
          { label: "Pending Review", value: stats.submitted, color: "#3B82F6", icon: Clock },
          { label: "Rejected", value: stats.rejected, color: "#EF4444", icon: AlertCircle },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-slate-950">{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Submit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href={dailySubmitHref}>
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-950 to-slate-800 rounded-2xl p-6 cursor-pointer group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/15 transition-colors">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg">Daily KRA Form</h3>
              <p className="text-slate-400 text-sm mt-1">Check-ins, complaints, room checks, cash deposits & more</p>
              <div className="flex items-center gap-2 mt-4 text-white/70 text-sm group-hover:text-white transition-colors">
                Submit today's report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </Link>
        <Link href={weeklySubmitHref}>
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 cursor-pointer group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/15 transition-colors">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg">Weekly KRA Form</h3>
              <p className="text-indigo-200 text-sm mt-1">OTA image tracking, supply stock review & platform updates</p>
              <div className="flex items-center gap-2 mt-4 text-white/70 text-sm group-hover:text-white transition-colors">
                Submit weekly report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Filters + List */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by date or keyword..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="all">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No KRA reports found</p>
              </div>
            ) : filtered.map((kra, i) => {
              const cfg = statusConfig[kra.status];
              const StatusIcon = cfg.icon;
              return (
                <motion.div key={kra.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04 }} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kra.type === "daily" ? "bg-slate-950" : "bg-indigo-600"}`}>
                    {kra.type === "daily" ? <Calendar className="w-5 h-5 text-white" /> : <BarChart3 className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-slate-950 font-semibold text-sm capitalize">{kra.type} KRA Report</span>
                      {kra.shift && <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${shiftColors[kra.shift]}`}>{kra.shift}</span>}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium flex items-center gap-1 ${cfg.bg}`}><StatusIcon className="w-3 h-3" />{cfg.label}</span>
                    </div>
                    <p className="text-slate-500 text-xs mb-2">
                      {new Date(kra.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {new Date(kra.submittedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {kra.highlights.map((h, j) => <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{h}</span>)}
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 mt-1">
                    <Eye className="w-4 h-4" /><span className="hidden sm:inline">View</span><ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
