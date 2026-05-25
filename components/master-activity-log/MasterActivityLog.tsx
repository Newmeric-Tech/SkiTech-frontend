"use client";

import React, { useState } from 'react';
import StatsCards from './StatsCards';
import FilterToolbar from './FilterToolbar';
import ActivityTable from './ActivityTable';
import mockLogs from '@/mock-data/mockLogs';

const MasterActivityLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All Actions");

  // Filter logs based on search term and selected severity level
  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSeverity = selectedSeverity === "All Actions" || log.severity === selectedSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  const handleExportLogs = () => {
    const headers = ["Timestamp", "User", "Action Type", "Resource", "Details", "Severity"];
    const rows = filteredLogs.map(log => [
      log.timestamp,
      log.user,
      log.actionType,
      log.resource,
      log.details,
      log.severity
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
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
      <div>
        <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Master Activity Log</h2>
        <p className="text-slate-500 text-sm mt-1">
          Track all administrative actions and changes across the enterprise ecosystem.
        </p>
      </div>
      <StatsCards />
      <FilterToolbar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        onExport={handleExportLogs}
      />
      <ActivityTable logs={filteredLogs} />
    </div>
  );
};

export default MasterActivityLog;