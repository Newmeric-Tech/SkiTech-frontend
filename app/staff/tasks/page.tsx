"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Calendar, Filter, Search, MapPin, Loader, Camera } from "lucide-react";
import { dashboardApi, type StaffStats, type TaskItem } from "@/lib/api";

const statusConfig = {
  done: { color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", label: "Done", icon: CheckCircle2 },
  pending: { color: "#F59E0B", bg: "bg-amber-50 text-amber-700 border border-amber-200/60", label: "In Progress", icon: Clock },
  upcoming: { color: "#3B82F6", bg: "bg-blue-50 text-blue-700 border border-blue-200/60", label: "Upcoming", icon: Calendar },
  overdue: { color: "#EF4444", bg: "bg-red-50 text-red-700 border border-red-200/60", label: "Overdue", icon: AlertCircle },
  pending_approval: { color: "#8B5CF6", bg: "bg-purple-50 text-purple-700 border border-purple-200/60", label: "Pending Approval", icon: AlertCircle },
};

const priorityConfig = {
  high: { color: "#EF4444", label: "High" },
  medium: { color: "#F59E0B", label: "Medium" },
  low: { color: "#10B981", label: "Low" },
};

const demoTasks: TaskItem[] = [
  {
    id: "task-001",
    task: "Clean and sanitize main lobby area",
    location: "Main Lobby",
    priority: "high",
    status: "pending",
    due: "Today, 6:00 PM",
    assignee: "John Doe",
  },
  {
    id: "task-002",
    task: "Restock supplies in floor 2 bathroom",
    location: "Floor 2 Restroom",
    priority: "medium",
    status: "pending",
    due: "Today, 4:00 PM",
    assignee: "John Doe",
  },
  {
    id: "task-003",
    task: "Check fire extinguishers in parking basement",
    location: "Basement Parking",
    priority: "high",
    status: "upcoming",
    due: "Tomorrow, 9:00 AM",
    assignee: "John Doe",
  },
];

export default function StaffTasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [taskList, setTaskList] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completedTaskId = searchParams.get("completed");
    if (completedTaskId) {
      setTaskList(prev => {
        const updated = prev.map(t => 
          t.id === completedTaskId ? { ...t, status: "done" as const } : t
        );
        localStorage.setItem("manager_tasks", JSON.stringify(updated));
        return updated;
      });
      router.replace("/staff/tasks");
    }
  }, [searchParams, router]);

  useEffect(() => {
    const storedTasks = localStorage.getItem("manager_tasks");
    if (storedTasks && JSON.parse(storedTasks).length > 0) {
      setTaskList(JSON.parse(storedTasks));
    } else {
      setTaskList(demoTasks);
      localStorage.setItem("manager_tasks", JSON.stringify(demoTasks));
    }
  }, []);

  const filteredTasks = taskList.filter(t => {
    const matchesSearch = t.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleTask = (id: string) => {
    setTaskList(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, status: t.status === "done" ? "pending" : "done" } : t
      );
      localStorage.setItem("manager_tasks", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmitProof = (taskId: string) => {
    router.push(`/staff/tasks/proof?id=${taskId}`);
  };

  const completedCount = taskList.filter(t => t.status === "done").length;
  const totalCount = taskList.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Your assigned tasks for today</p>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-emerald-50 border border-emerald-200/60 px-4 py-2 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {completedCount}/{totalCount} Complete
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-950">Today's Progress</h3>
          <span className="text-sm font-medium text-slate-600">{progress}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks or locations..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-950/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-950/10 transition-all"
            >
              <option value="all">All Status</option>
              <option value="done">Done</option>
              <option value="pending">In Progress</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-950">All Tasks ({filteredTasks.length})</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              <span>Loading tasks...</span>
            </div>
          )}
          {error && !isLoading && (
            <div className="flex items-center justify-center py-8 px-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          {!isLoading && !error && filteredTasks.length === 0 && (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">No tasks found</p>
              </div>
            </div>
          )}
          {!isLoading && !error && filteredTasks.map((t, i) => {
            const statusCfg = statusConfig[t.status as keyof typeof statusConfig];
            const StatusIcon = statusCfg.icon;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    t.status === "done"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.status === "done" ? "line-through text-slate-400" : "text-slate-950"}`}>
                    {t.task}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      {t.assignee}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t.due}
                    </span>
                    {t.priority && (
                      <>
                        <span>·</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          t.priority === "high" ? "bg-red-50 text-red-600" :
                          t.priority === "medium" ? "bg-amber-50 text-amber-600" :
                          "bg-emerald-50 text-emerald-600"
                        }`}>
                          {priorityConfig[t.priority as keyof typeof priorityConfig].label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {t.status !== "done" && t.status !== "pending_approval" && (
                    <button
                      onClick={() => handleSubmitProof(t.id)}
                      className="p-1.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200/60 hover:bg-blue-100 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusCfg.bg}`}>
                    {statusCfg.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
