"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, AlertCircle, CheckCircle2, Clock, Eye, ShieldAlert, BarChart3 } from "lucide-react";

interface LogEntry {
  id: string;
  type: "complaint" | "error" | "handover" | "event" | "safety";
  title: string;
  description: string;
  category: string;
  severity: string;
  status: "open" | "in_progress" | "resolved" | "escalated" | "noted";
  createdAt: string;
  department: string;
  reportedBy: string;
  assignedTo?: string;
  roomNumber?: string;
  slaDeadline?: string;
  slaBreached: boolean;
  timeline: { action: string; by: string; at: string }[];
}

const typeConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  complaint: { color: "#EF4444", bg: "bg-red-50", icon: AlertCircle, label: "Complaint" },
  error: { color: "#F97316", bg: "bg-orange-50", icon: ShieldAlert, label: "Error" },
  handover: { color: "#8B5CF6", bg: "bg-purple-50", icon: BarChart3, label: "Handover" },
  event: { color: "#3B82F6", bg: "bg-blue-50", icon: Clock, label: "Event" },
  safety: { color: "#DC2626", bg: "bg-red-50", icon: ShieldAlert, label: "Safety Alert" },
};

export default function OwnerComplaintsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "#CMP-10492",
      type: "complaint",
      title: "Room 402 - Water Leakage",
      description: "Guest reported water dripping from the ceiling in the bathroom. Possible pipe burst on the floor above. Maintenance notified but has not yet arrived on scene.",
      category: "Maintenance",
      severity: "High",
      status: "open",
      createdAt: "Today, 08:45 AM",
      department: "Maintenance",
      reportedBy: "Sarah Mitchell",
      assignedTo: "Raj Patel",
      roomNumber: "402",
      slaDeadline: "Today, 10:45 AM",
      slaBreached: false,
      timeline: [
        { action: "Complaint filed", by: "Sarah Mitchell", at: "Today, 08:45 AM" },
        { action: "Assigned to Raj Patel", by: "Manager", at: "Today, 08:50 AM" },
      ],
    },
    {
      id: "#CMP-10495",
      type: "error",
      title: "Suite 22 - Smart Lock Failure",
      description: "RFID reader is not responding to keycards or mobile app unlock. Internal deadbolt remains active. Guest is currently in the lobby.",
      category: "Technology",
      severity: "Critical",
      status: "in_progress",
      createdAt: "Today, 09:12 AM",
      department: "IT",
      reportedBy: "James Lee",
      assignedTo: "IT Team",
      roomNumber: "22",
      slaDeadline: "Today, 11:12 AM",
      slaBreached: false,
      timeline: [
        { action: "Error reported", by: "James Lee", at: "Today, 09:12 AM" },
        { action: "IT Team notified", by: "Manager", at: "Today, 09:20 AM" },
        { action: "Investigation started", by: "IT Team", at: "Today, 09:30 AM" },
      ],
    },
    {
      id: "#LOG-001",
      type: "handover",
      title: "Shift Handover - Morning Team",
      description: "Morning shift handover to afternoon team. Key issues: HVAC maintenance in progress, VIP check-in at 2 PM, pool area needs inspection.",
      category: "Operations",
      severity: "Medium",
      status: "noted",
      createdAt: "Today, 09:00 AM",
      department: "Front Desk",
      reportedBy: "Sarah Mitchell",
      slaBreached: false,
      timeline: [
        { action: "Handover created", by: "Sarah Mitchell", at: "Today, 09:00 AM" },
        { action: "Acknowledged", by: "Afternoon Manager", at: "Today, 09:05 AM" },
      ],
    },
    {
      id: "#CMP-10480",
      type: "complaint",
      title: "Room 305 - AC Not Cooling",
      description: "Guest reported room temperature at 28°C despite AC set to 18°C.",
      category: "Maintenance",
      severity: "High",
      status: "resolved",
      createdAt: "Yesterday, 08:30 AM",
      department: "Maintenance",
      reportedBy: "Raj Patel",
      assignedTo: "Raj Patel",
      roomNumber: "305",
      slaBreached: false,
      timeline: [
        { action: "Complaint filed", by: "Raj Patel", at: "Yesterday, 08:30 AM" },
        { action: "Resolved", by: "Raj Patel", at: "Yesterday, 11:00 AM" },
      ],
    },
    {
      id: "#SAF-001",
      type: "safety",
      title: "Fire Alarm - Kitchen Area",
      description: "Fire alarm triggered in kitchen area due to minor smoke from oven. Quick response, no actual danger.",
      category: "Safety",
      severity: "Emergency",
      status: "resolved",
      createdAt: "Yesterday, 02:00 PM",
      department: "Security",
      reportedBy: "Omar Hassan",
      slaBreached: false,
      timeline: [
        { action: "Alert triggered", by: "Omar Hassan", at: "Yesterday, 02:00 PM" },
        { action: "Resolved - All clear", by: "Security Team", at: "Yesterday, 02:15 PM" },
      ],
    },
    {
      id: "#CMP-10501",
      type: "complaint",
      title: "Room 1105 - Incomplete Turnout",
      description: "Guest checked in and found minibar not restocked and towels missing. VIP Platinum member expressed significant disappointment.",
      category: "Housekeeping",
      severity: "Critical",
      status: "escalated",
      createdAt: "Today, 10:30 AM",
      department: "Housekeeping",
      reportedBy: "Fatima Al-Hassan",
      roomNumber: "1105",
      slaDeadline: "Today, 12:30 PM",
      slaBreached: false,
      timeline: [
        { action: "Complaint filed", by: "Fatima Al-Hassan", at: "Today, 10:30 AM" },
        { action: "Escalated to Manager", by: "Staff", at: "Today, 10:35 AM" },
      ],
    },
  ]);

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || l.type === filterType;
    const matchesStatus = filterStatus === "all" || l.status === filterStatus;
    const matchesDept = filterDept === "all" || l.department === filterDept;
    return matchesSearch && matchesType && matchesStatus && matchesDept;
  });

  const stats = {
    total: logs.length,
    open: logs.filter(l => l.status === "open").length,
    inProgress: logs.filter(l => l.status === "in_progress").length,
    escalated: logs.filter(l => l.status === "escalated").length,
    resolved: logs.filter(l => l.status === "resolved").length,
    slaBreached: logs.filter(l => l.slaBreached).length,
  };

  const uniqueDepts = [...new Set(logs.map(l => l.department))];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Emergency": return "bg-red-100 text-red-700 border-red-200";
      case "Critical": return "bg-red-100 text-red-700 border-red-200";
      case "High": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Medium": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Low": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "resolved": return "bg-emerald-100 text-emerald-700";
      case "in_progress": return "bg-amber-100 text-amber-700";
      case "escalated": return "bg-red-100 text-red-700";
      case "noted": return "bg-slate-100 text-slate-600";
      case "open": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Error & Complaint Log</h2>
          <p className="text-sm text-slate-500 mt-1">Overview of all operational logs, complaints, and errors.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, color: "#3B82F6" },
          { label: "Open", value: stats.open, color: "#3B82F6" },
          { label: "In Progress", value: stats.inProgress, color: "#F59E0B" },
          { label: "Escalated", value: stats.escalated, color: "#EF4444" },
          { label: "Resolved", value: stats.resolved, color: "#10B981" },
          { label: "SLA Breached", value: stats.slaBreached, color: "#DC2626" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none">
          <option value="all">All Types</option>
          {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="escalated">Escalated</option>
          <option value="noted">Noted</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none">
          <option value="all">All Departments</option>
          {uniqueDepts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Eye className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No logs found</p>
          </div>
        ) : (
          filtered.map((log) => {
            const config = typeConfig[log.type];
            const isExpanded = expanded === log.id;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl border p-5 shadow-sm ${
                  log.status === "resolved" ? "border-emerald-200" : log.status === "escalated" ? "border-red-200" : "border-slate-200"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${config.bg}`} style={{ color: config.color }}>
                      <config.icon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>
                    <span className="text-xs text-slate-400">{log.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                    {log.slaBreached && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-red-100 text-red-700 border border-red-200">
                        SLA Breached
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${getStatusStyle(log.status)}`}>
                    {log.status.replace("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{log.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{log.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {log.createdAt}
                      </span>
                      <span>By: <span className="text-slate-600">{log.reportedBy}</span></span>
                      {log.assignedTo && <span>To: <span className="text-slate-600">{log.assignedTo}</span></span>}
                      {log.roomNumber && <span>Room {log.roomNumber}</span>}
                      {log.slaDeadline && !log.slaBreached && (
                        <span className="text-amber-600">SLA: {log.slaDeadline}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : log.id)}
                    className="ml-4 p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-slate-100"
                  >
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Timeline</p>
                    <div className="space-y-2">
                      {log.timeline.map((t, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700">{t.action}</p>
                            <p className="text-xs text-slate-400">{t.by} · {t.at}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}