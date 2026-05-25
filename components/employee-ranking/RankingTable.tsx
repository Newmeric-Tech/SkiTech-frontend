"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { EmployeeRanking, RankingFilter } from "@/types/employee-ranking";
import { departments, statusFilters } from "@/mock-data/employee-ranking";
import RankBadge from "./RankBadge";
import StatusBadge from "./StatusBadge";
import SearchInput from "./SearchInput";
import FilterDropdown from "./FilterDropdown";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import { useRouter } from "next/navigation";

interface RankingTableProps {
  data: EmployeeRanking[];
  showFilters?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  preview?: boolean;
  onViewAll?: () => void;
  basePath?: string;
}

export default function RankingTable({
  data,
  showFilters = true,
  showPagination = true,
  pageSize = 10,
  preview = false,
  onViewAll,
  basePath = "/owner/employee-ranking",
}: RankingTableProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<RankingFilter>({
    search: "",
    department: "All Departments",
    status: "All Status",
    sortBy: "rank",
    sortOrder: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.employee.name.toLowerCase().includes(search) ||
          r.employee.department.toLowerCase().includes(search)
      );
    }

    // Department filter
    if (filters.department !== "All Departments") {
      result = result.filter((r) => r.employee.department === filters.department);
    }

    // Status filter
    if (filters.status !== "All Status") {
      result = result.filter((r) => r.status === filters.status);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "rank":
          comparison = a.rank - b.rank;
          break;
        case "name":
          comparison = a.employee.name.localeCompare(b.employee.name);
          break;
        case "score":
          comparison = b.finalScore - a.finalScore;
          break;
        case "attendance":
          comparison = b.attendance - a.attendance;
          break;
        default:
          comparison = a.rank - b.rank;
      }
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [data, filters]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = showPagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : preview
    ? filteredData.slice(0, 5)
    : filteredData;

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (filters.sortBy !== column) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return filters.sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-slate-950" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-slate-950" />
    );
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-950 text-lg">
              {preview ? "Employee Ranking Preview" : "Employee Ranking"}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredData.length} employee{filteredData.length !== 1 ? "s" : ""} ranked
            </p>
          </div>
          {preview && onViewAll && (
            <button
              onClick={onViewAll}
              className="px-4 py-2.5 text-sm font-medium text-white bg-slate-950 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-950/20 flex items-center gap-2"
            >
              View All
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex-1 max-w-sm">
              <SearchInput
                placeholder="Search employees..."
                value={filters.search}
                onChange={handleSearch}
              />
            </div>
            <FilterDropdown
              options={departments}
              value={filters.department}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, department: val }));
                setCurrentPage(1);
              }}
            />
            <FilterDropdown
              options={statusFilters}
              value={filters.status}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, status: val }));
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Table */}
      {paginatedData.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200/60">
                <th
                  className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort("rank")}
                >
                  <div className="flex items-center gap-1.5">
                    Rank <SortIcon column="rank" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1.5">
                    Employee <SortIcon column="name" />
                  </div>
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                {!preview && (
                  <>
                    <th
                      className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                      onClick={() => handleSort("attendance")}
                    >
                      <div className="flex items-center gap-1.5">
                        Attendance <SortIcon column="attendance" />
                      </div>
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Task %
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Standby
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Overtime
                    </th>
                  </>
                )}
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort("score")}
                >
                  <div className="flex items-center gap-1.5">
                    Final Score <SortIcon column="score" />
                  </div>
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((ranking, i) => (
                <motion.tr
                  key={ranking.employeeId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 tracking-wider">
                      #{ranking.rank.toString().padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                        {getInitials(ranking.employee.name)}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{ranking.employee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{ranking.employee.department}</td>
                  {!preview && (
                    <>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{ranking.attendance}%</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{ranking.taskCompletion}%</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{ranking.standbyHours}h</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{ranking.overtimeHours}h</td>
                    </>
                  )}
                  <td className="px-6 py-4">
                    <StatusBadge status={ranking.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-950">{ranking.finalScore}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => router.push(`${basePath}/staff/${ranking.employeeId}`)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-950 hover:text-white rounded-lg border border-slate-200/60 hover:border-slate-950 transition-all duration-200"
                    >
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-6 pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
