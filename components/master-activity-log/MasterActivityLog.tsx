"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import StatsCards from './StatsCards';
import FilterToolbar from './FilterToolbar';
import ActivityTable from './ActivityTable';
import {
  activityLogAPI,
  ActivityLogItem,
  ActivitySummary,
  LogSeverityDisplay,
} from '@/lib/api/activity-log';

// Map the frontend display severity to the backend raw severity filter values
const displayToRaw: Record<string, string | undefined> = {
  "All Actions": undefined,
  "Info":        undefined,   // Info covers both low + medium — no single raw filter
  "Warning":     "high",
  "Critical":    "critical",
};

const MasterActivityLog: React.FC = () => {
  const [summary, setSummary]               = useState<ActivitySummary | null>(null);
  const [logs, setLogs]                     = useState<ActivityLogItem[]>([]);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All Actions");

  const load = useCallback(async () => {
    try {
      setLoading(true);

      // Build severity param for the API
      const rawSeverity = displayToRaw[selectedSeverity];

      const [summaryData, [items, count]] = await Promise.all([
        activityLogAPI.summary(7),
        activityLogAPI.list({
          skip:     0,
          limit:    100,
          severity: rawSeverity,
        }),
      ]);

      setSummary(summaryData);
      setLogs(items);
      setTotal(count);
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, [selectedSeverity]);

  useEffect(() => { load(); }, [load]);

  // Client-side search across user, actionType, resource, details
  const filtered = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      log.user.toLowerCase().includes(q) ||
      log.actionType.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);

    // If "Info" is selected, keep only low/medium severity items
    const matchesSeverity =
      selectedSeverity === "All Actions" ||
      selectedSeverity === log.severity ||
      (selectedSeverity === "Info" && (log.raw_severity === "low" || log.raw_severity === "medium"));

    return matchesSearch && matchesSeverity;
  });

  const handleExportLogs = () => {
    const headers = ["Timestamp", "User", "Action Type", "Resource", "Details", "Severity"];
    const rows = filtered.map((log) => [
      log.timestamp,
      log.user,
      log.actionType,
      log.resource,
      log.details,
      log.severity,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
            Master Activity Log
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Track all administrative actions and changes across the enterprise ecosystem.
            {!loading && <span className="ml-1 text-slate-400">({total} total events)</span>}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <StatsCards summary={summary} />

      {/* Filters */}
      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        onExport={handleExportLogs}
      />

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <ActivityTable
          logs={filtered.map((log) => ({
            timestamp: log.timestamp,
            user:       log.user,
            actionType: log.actionType,
            resource:   log.resource,
            details:    log.details,
            severity:   log.severity as LogSeverityDisplay,
          }))}
        />
      )}
    </div>
  );
};

export default MasterActivityLog;
