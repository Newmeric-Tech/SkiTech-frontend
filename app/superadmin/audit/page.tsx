"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, AlertCircle, Download, Search, User, Settings, Building2, Shield, Key, LogIn, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { superadminAPI, AuditEvent } from "@/lib/api/superadmin";

const actionTypes = ["All Actions", "LOGIN_SUCCESS", "LOGIN_FAILED", "ROLE_CHANGED", "USER_SUSPENDED", "PROPERTY_UPDATE", "CONFIG_CHANGE", "API_KEY_CREATED", "API_KEY_REVOKED"];
const severities = ["All", "info", "warning", "critical"];

const getActionIcon = (action: string) => {
  if (action.includes("LOGIN")) return <LogIn className="w-4 h-4" />;
  if (action.includes("ROLE") || action.includes("PERMISSION")) return <Shield className="w-4 h-4" />;
  if (action.includes("PROPERTY")) return <Building2 className="w-4 h-4" />;
  if (action.includes("USER")) return <User className="w-4 h-4" />;
  if (action.includes("API")) return <Key className="w-4 h-4" />;
  if (action.includes("CONFIG") || action.includes("SETTINGS")) return <Settings className="w-4 h-4" />;
  if (action.includes("EXPORT") || action.includes("IMPORT")) return <FileText className="w-4 h-4" />;
  return <Clock className="w-4 h-4" />;
};

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "info": return "bg-black/5 text-neutral-700 border-black/10";
    case "warning": return "bg-amber-100/50 text-amber-700 border-amber-200";
    case "critical": return "bg-red-100/50 text-red-700 border-red-200";
    default: return "bg-black/5 text-neutral-700 border-black/10";
  }
};

export default function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [logSize, setLogSize] = useState("—");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [severityFilter, setSeverityFilter] = useState("All");

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (actionFilter !== "All Actions") params.action = actionFilter;
      if (severityFilter !== "All") params.severity = severityFilter;
      const res = await superadminAPI.audit(params);
      setEvents(res.data.events);
      setLogSize(res.data.log_size);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, severityFilter]);

  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  const handleExport = async () => {
    try {
      const res = await superadminAPI.exportAudit();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit-log.csv";
      a.click();
    } catch {
      toast.error("Export failed");
    }
  };

  const stats = {
    totalToday: events.length,
    warnings: events.filter((e) => e.severity === "warning").length,
    critical: events.filter((e) => e.severity === "critical").length,
    logSize,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Audit Log</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Track all administrative actions and changes</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Events Today", value: stats.totalToday, color: "text-black" },
          { label: "Warnings", value: stats.warnings, color: "text-amber-600" },
          { label: "Critical", value: stats.critical, color: "text-red-600" },
          { label: "Log Size", value: stats.logSize, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 flex items-center gap-4 border-b border-black/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search by user or details..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
          </div>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
            {actionTypes.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
            {severities.map((s) => (
              <button key={s} onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${severityFilter === s ? "bg-white text-black shadow-sm" : "text-neutral-600 hover:text-black"}`}>
                {s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
            <Download className="w-4 h-4" /> Export Logs
          </motion.button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  {["Timestamp", "User", "Action Type", "Resource", "Details", "Severity"].map((h) => (
                    <th key={h} className={`p-4 text-sm font-medium text-neutral-500 ${h === "Severity" ? "text-center" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((event, i) => (
                  <motion.tr key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-black/5 hover:bg-black/5 transition-colors">
                    <td className="p-4 text-sm text-neutral-600 font-mono">{event.timestamp}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {event.user.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-sm font-medium text-black">{event.user}</span>
                      </div>
                    </td>
                    <td className="p-4"><div className="flex items-center gap-2 text-sm text-neutral-600">{getActionIcon(event.action)}{event.action.replace(/_/g, " ")}</div></td>
                    <td className="p-4 text-sm text-neutral-600">{event.resource}</td>
                    <td className="p-4 text-sm text-neutral-600 max-w-xs truncate">{event.details}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityStyles(event.severity)}`}>{event.severity}</span>
                    </td>
                  </motion.tr>
                ))}
                {events.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-neutral-400">No audit events found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
