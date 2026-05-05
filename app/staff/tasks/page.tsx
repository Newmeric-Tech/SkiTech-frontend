"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, AlertCircle, Calendar,
  Filter, Search, MapPin, Loader2, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { sopAPI } from "@/lib/api/sop";
import { usersAPI } from "@/lib/api/users";

interface SOPExecution {
  id: string; sop_id: string; user_id: string;
  status: "pending" | "completed"; completed_at?: string;
  created_at: string;
}

interface SOPItem {
  id: string; title: string; description?: string;
  priority: "low" | "medium" | "high"; status: string; due_date?: string;
}

interface Task {
  executionId: string; sopId: string; title: string;
  description?: string; priority: "low" | "medium" | "high";
  status: "pending" | "completed"; due_date?: string;
}

const statusConfig = {
  pending:   { color: "#F59E0B", bg: "bg-amber-50 text-amber-700 border border-amber-200/60",   label: "Pending",   icon: Clock },
  completed: { color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", label: "Done", icon: CheckCircle2 },
};

const priorityConfig = {
  high:   { color: "#EF4444", label: "High" },
  medium: { color: "#F59E0B", label: "Medium" },
  low:    { color: "#10B981", label: "Low" },
};

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = useCallback(async () => {
    try {
      const meRes = await usersAPI.me();
      const propId = meRes.data.property_id;

      const [execRes, sopRes] = await Promise.all([
        sopAPI.myTasks(),
        propId ? sopAPI.listSOPs(propId) : Promise.resolve({ data: [] }),
      ]);

      const executions = execRes.data as SOPExecution[];
      const sopList = sopRes.data as SOPItem[];
      const sopMap = new Map(sopList.map(s => [s.id, s]));

      const mapped: Task[] = executions.map(exec => {
        const sop = sopMap.get(exec.sop_id);
        return {
          executionId: exec.id,
          sopId: exec.sop_id,
          title: sop?.title ?? "Unknown Task",
          description: sop?.description,
          priority: sop?.priority ?? "medium",
          status: exec.status,
          due_date: sop?.due_date,
        };
      });

      setTasks(mapped);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const completeTask = async (task: Task) => {
    if (task.status === "completed") return;
    setCompleting(task.executionId);
    try {
      await sopAPI.completeTask(task.executionId);
      setTasks(prev => prev.map(t =>
        t.executionId === task.executionId ? { ...t, status: "completed" } : t
      ));
      toast.success("Task marked as complete");
    } catch {
      toast.error("Failed to complete task");
    } finally {
      setCompleting(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Your assigned tasks</p>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-emerald-50 border border-emerald-200/60 px-4 py-2 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {completedCount}/{totalCount} Complete
        </div>
      </div>

      {totalCount > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-950">Progress</h3>
            <span className="text-sm font-medium text-slate-600">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-950/10 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-950/10 transition-all">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Done</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-950">All Tasks ({filteredTasks.length})</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">
                {tasks.length === 0 ? "No tasks assigned to you yet" : "No tasks match your filter"}
              </p>
            </div>
          ) : (
            filteredTasks.map((t, i) => {
              const statusCfg = statusConfig[t.status];
              const priorityCfg = priorityConfig[t.priority] ?? priorityConfig.medium;
              const StatusIcon = statusCfg.icon;
              const isCompleting = completing === t.executionId;

              return (
                <motion.div key={t.executionId}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <button
                    onClick={() => completeTask(t)}
                    disabled={t.status === "completed" || isCompleting}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:cursor-not-allowed ${
                      t.status === "completed"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}>
                    {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${t.status === "completed" ? "line-through text-slate-400" : "text-slate-950"}`}>
                      {t.title}
                    </p>
                    {(t.description || t.due_date) && (
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {t.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                        {t.description && (
                          <span className="truncate max-w-xs">{t.description}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: `${priorityCfg.color}15`, color: priorityCfg.color }}>
                      {priorityCfg.label}
                    </span>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${statusCfg.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
