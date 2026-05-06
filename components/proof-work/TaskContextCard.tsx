"use client";

interface TaskItem {
  id: string;
  task: string;
  location: string;
  priority: "high" | "medium" | "low";
  status: "done" | "pending" | "upcoming" | "overdue";
  due: string;
  assignee?: string;
}

interface TaskContextCardProps {
  task: TaskItem;
}

const priorityConfig = {
  high: {
    bg: "bg-red-950 text-white",
    label: "High",
  },
  medium: {
    bg: "bg-black text-white",
    label: "Medium",
  },
  low: {
    bg: "bg-emerald-950 text-white",
    label: "Low",
  },
};

export function TaskContextCard({ task }: TaskContextCardProps) {
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-slate-900 rounded-full" />
        <h3 className="text-lg font-bold text-slate-900">Task Context</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">
            Assigned Task
          </p>
          <h2 className="text-[15px] font-medium text-slate-900">
            {task.task}
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">
              Room
            </p>
            <p className="text-[15px] font-medium text-slate-900">{task.location || "Not specified"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">
              Priority
            </p>
            <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold ${priority.bg}`}>
              {priority.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}