"use client";

import { Download, Filter } from "lucide-react";
import RankingTable from "@/components/employee-ranking/RankingTable";
import { rankings } from "@/mock-data/employee-ranking";

export default function ManagerRankingTablePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
            Employee Directory
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Complete employee ranking directory with advanced filtering
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => {
              const csvContent = [
                ["Rank", "Name", "Department", "Attendance", "Task %", "Standby", "Overtime", "Score", "Status"].join(","),
                ...rankings.map((r) =>
                  [r.rank, r.employee.name, r.employee.department, r.attendance, r.taskCompletion, r.standbyHours, r.overtimeHours, r.finalScore, r.status].join(",")
                ),
              ].join("\n");
              const blob = new Blob([csvContent], { type: "text/csv" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `ranking_table_${new Date().toISOString().split("T")[0]}.csv`;
              link.click();
            }}
            className="px-4 py-2.5 text-sm font-medium text-white bg-slate-950 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-950/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Full Ranking Table */}
      <RankingTable
        data={rankings}
        showFilters
        showPagination
        pageSize={10}
        basePath="/manager/employee-ranking"
      />
    </div>
  );
}
