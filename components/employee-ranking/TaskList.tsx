"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Eye } from "lucide-react";
import { TaskItem } from "@/types/employee-ranking";

interface TaskListProps {
  tasks: TaskItem[];
  title?: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200/60",
    label: "Completed",
    labelColor: "text-emerald-700",
  },
  pending: {
    icon: Clock,
    iconColor: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200/60",
    label: "Pending",
    labelColor: "text-amber-700",
  },
  "in-review": {
    icon: Eye,
    iconColor: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200/60",
    label: "In Review",
    labelColor: "text-blue-700",
  },
};

export default function TaskList({ tasks, title }: TaskListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
      {title && (
        <h3 className="font-bold text-slate-950 text-lg mb-4">{title}</h3>
      )}
      <div className="space-y-3">
        {tasks.map((task, i) => {
          const config = statusConfig[task.status];
          const Icon = config.icon;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-50/80 transition-colors group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === "completed" ? "text-slate-500 line-through" : "text-slate-900"}`}>
                  {task.title}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.bg} ${config.border} ${config.labelColor} hidden sm:inline-flex`}>
                  {config.label}
                </span>
                <span className="text-xs font-bold text-blue-500 w-12 text-right">
                  +10 pts
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
