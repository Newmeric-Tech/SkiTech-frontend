"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, X, Clock, MapPin, Building, ChevronRight,
  AlertCircle, Timer, Users, Activity, PartyPopper
} from "lucide-react";
import {
  HandoverLog, ComplaintIssue, priorityConfig, severityConfig, statusConfig,
  dummyHandoverLogs, dummyComplaints, formatTimeAgo
} from "@/lib/operational";
import { toast } from "sonner";

export default function AttentionTab() {
  const [alerts, setAlerts] = useState<(HandoverLog | ComplaintIssue)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handoverLogs = dummyHandoverLogs.filter(l => 
      !l.resolved && ["attention", "safety", "critical", "emergency"].includes(l.priority)
    );
    const complaints = dummyComplaints.filter(c => 
      c.status !== "resolved" && ["critical", "emergency"].includes(c.severity)
    );
    setAlerts([...handoverLogs, ...complaints]);
    setIsLoading(false);
  }, []);

  const handleFilter = (type: string) => {
    toast.info(`Filtering by ${type}`);
  };

  const handleExport = () => {
    toast.info("Exporting PDF... Download will start shortly");
  };

  const handleActions = (title: string) => {
    toast.info(`Opening actions menu for: ${title}`);
  };

  const handleViewHistory = () => {
    toast.info("Opening log history");
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Urgent Issues */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-red-600 rounded-full"></div>
            Urgent Pending Issues
          </h2>
          <div className="text-xs font-medium bg-red-50 text-red-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            3 HIGH PRIORITY
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Urgent Cards */}
          <div className="bg-white rounded-xl border border-red-500 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-600 text-white">
                CRITICAL
              </span>
              <span className="text-xs font-medium flex items-center gap-1 text-red-500">
                <Clock className="w-3 h-3" /> 40m elapsed
              </span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1.5">HVAC Failure - Penthouse B</h3>
            <p className="text-xs leading-relaxed text-slate-500">Water leakage reported from ceiling units. Electrical risk identified by floor supervisor.</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-orange-100 text-orange-700">
                SAFETY
              </span>
              <span className="text-xs font-medium flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" /> 1h 12m
              </span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1.5">Unreported Guest Entry</h3>
            <p className="text-xs leading-relaxed text-slate-500">Unauthorized keycard access in Service Lift 4. No staff activity logged for this period.</p>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-white text-slate-900">
                SYSTEM
              </span>
              <span className="text-xs font-medium flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" /> 16m
              </span>
            </div>
            <h3 className="font-bold text-white mb-1.5">Fire Alarm Logic Error</h3>
            <p className="text-xs leading-relaxed text-slate-400">Secondary sensor loop is non-responsive in East Wing. Manual watch required.</p>
          </div>
        </div>
      </div>

      {/* Active Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Active Complaints & Logs</h3>
          <div className="flex gap-2">
            <button onClick={() => handleFilter("Time Elapsed")} className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Filter: Time Elapsed</button>
            <button onClick={handleExport} className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Export PDF</button>
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium text-xs">
            <tr>
              <th className="px-4 py-3 border-b border-slate-200">Incident Details</th>
              <th className="px-4 py-3 border-b border-slate-200">Assigned To</th>
              <th className="px-4 py-3 border-b border-slate-200">Duration</th>
              <th className="px-4 py-3 border-b border-slate-200">Priority</th>
              <th className="px-4 py-3 border-b border-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center"><AlertTriangle className="w-4 h-4"/></div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Food Poisoning Claim - Table 14</p>
                    <p className="text-xs text-slate-500">Guest: Marcus Thorne, Room 402. Claims illness post-dinner.</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    JD
                  </div>
                  <span className="text-sm font-medium text-slate-700">Julian Dang</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm font-medium text-red-600">2h 45m</span>
              </td>
              <td className="px-4 py-4">
                <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-red-600 text-white">
                  HIGH
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <button onClick={() => handleActions("Food Poisoning Claim")} className="text-xs font-semibold text-slate-500 hover:text-slate-700 uppercase tracking-wider">
                  Actions ▾
                </button>
              </td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center"><AlertCircle className="w-4 h-4"/></div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Floor 8 Connectivity Blackout</p>
                    <p className="text-xs text-slate-500">Repeated complaints from rooms 801-815 regarding high latency.</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    IT
                  </div>
                  <span className="text-sm font-medium text-slate-700">Tech Support</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm font-medium text-slate-600">3h 12m</span>
              </td>
              <td className="px-4 py-4">
                <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-orange-500 text-white">
                  MEDIUM
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <button onClick={() => handleActions("Floor 8 Connectivity")} className="text-xs font-semibold text-slate-500 hover:text-slate-700 uppercase tracking-wider">
                  Actions ▾
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Live Update Banner */}
      <div className="bg-red-600 rounded-xl p-3 flex items-center justify-between text-white shadow-lg mt-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="font-bold text-sm uppercase tracking-wider">Live Update</span>
          <span className="text-sm font-medium opacity-90">Shift Change in 1h 42m</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold">TOTAL UNRESOLVED: 14</span>
          <button onClick={handleViewHistory} className="text-xs font-bold bg-white/20 hover:bg-white/30 transition-colors px-4 py-1.5 rounded-lg">
            VIEW LOG HISTORY
          </button>
        </div>
      </div>
    </div>
  );
}
