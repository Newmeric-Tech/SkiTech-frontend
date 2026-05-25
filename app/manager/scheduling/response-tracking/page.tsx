"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useScheduling, SchedulingProvider } from "@/store/SchedulingStore";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Sparkles, Send,
  Users, AlertTriangle, ChevronRight, Plus, Bell, Activity,
  Eye, Calendar, Zap
} from "lucide-react";

// ─── Mock data that matches Figma ─────────────────────────────────────────────

const MOCK_RESPONSES = [
  {
    id: "r1",
    name: "Rahul Verma",
    role: "Concierge • Tuesday • 14:00 – 22:00",
    reason: "Medical Emergency Leave",
    status: "accepted" as const,
    matchPct: 98,
    note: "Rahul is ready to start.",
    priority: "high" as const,
    respondedAgo: "6 hrs response",
  },
  {
    id: "r2",
    name: "Ahmed Mansoor",
    role: "Concierge • Tuesday • 14:00 – 22:00",
    reason: "Medical Emergency Leave",
    status: "rejected" as const,
    matchPct: 0,
    note: "Conflict with existing shift",
    priority: "normal" as const,
    respondedAgo: "",
  },
  {
    id: "r3",
    name: "Sarah Jenkins",
    role: "Auditing response (Sent 41m ago)",
    reason: "",
    status: "pending" as const,
    matchPct: 0,
    note: "",
    priority: "normal" as const,
    respondedAgo: "",
  },
];

const STANDBY_QUEUE = [
  { initials: "LM", name: "Lucas Miller", skill: 92, color: "#6366F1" },
  { initials: "EK", name: "Elena Kozlov", skill: 85, color: "#10B981" },
];

const TIMELINE = [
  {
    id: "tl1",
    type: "replacement-assigned" as const,
    title: "Replacement Assigned (Pending Confirmation)",
    desc: "System pre-selected Rahul Verma based on positive response. 10:27 • 13 min ago",
  },
  {
    id: "tl2",
    type: "accepted" as const,
    title: "Rahul Verma accepted request",
    desc: "Availability confirmed for 14:00 – 22:00 window. 10:32 • 13 min ago",
  },
  {
    id: "tl3",
    type: "rejected" as const,
    title: "Ahmed Mansoor rejected",
    desc: "Reason: Conflict with private appointment. 10:46 • 12 min ago",
  },
  {
    id: "tl4",
    type: "broadcast" as const,
    title: "Broadcast Sent to Pool [36]",
    desc: "Push notifications and SMS dispatched. 11:03 • 11 min ago",
  },
];

const STATUS_COUNTS = { pending: 5, accepted: 1, rejected: 2 };

// ─── Sub-components ────────────────────────────────────────────────────────────

interface ResponseItem {
  id: string;
  name: string;
  role: string;
  reason: string;
  status: "accepted" | "rejected" | "pending";
  matchPct: number;
  note: string;
  priority: "high" | "normal";
  respondedAgo: string;
  toEmployeeId: string;
}

function StatusBadge({ status }: { status: "accepted" | "rejected" | "pending" }) {
  if (status === "accepted") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
        <CheckCircle2 className="w-3 h-3" /> ACCEPTED
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full uppercase tracking-wide border border-red-200">
        <XCircle className="w-3 h-3" /> REJECTED
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full uppercase tracking-wide border border-amber-200">
      <Clock className="w-3 h-3" /> PENDING
    </span>
  );
}

function ResponseCard({ r, onAssign, onAutoAssign }: { r: ResponseItem; onAssign: (employeeId: string) => void; onAutoAssign?: (employeeId: string) => void }) {
  const initials = r.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const avatarColor = r.status === "accepted" ? "#10B981" : r.status === "rejected" ? "#EF4444" : "#94A3B8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border transition-shadow hover:shadow-md ${
        r.status === "accepted"
          ? "border-emerald-200 bg-emerald-50/40"
          : r.status === "rejected"
          ? "border-red-100 bg-red-50/30"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + Priority badge + Status */}
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-semibold text-gray-900">{r.name}</p>
            {r.priority === "high" && (
              <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-wide">HIGH PRIORITY</span>
            )}
            {r.respondedAgo && (
              <span className="text-[10px] text-gray-400">{r.respondedAgo}</span>
            )}
          </div>
          <p className="text-xs text-gray-500">{r.role}</p>
          {r.reason && <p className="text-xs text-gray-500 mt-0.5">{r.reason}</p>}
          {r.matchPct > 0 && (
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">● {r.matchPct}% Match</p>
          )}
          {r.note && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              {r.status === "accepted" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
              {r.note}
            </p>
          )}
          {r.status === "rejected" && r.note && (
            <p className="text-xs text-red-500 mt-1">{r.note}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={r.status} />
          {r.status === "pending" && (
            <div className="flex items-center gap-1.5">
              <button className="text-xs font-medium text-gray-600 border border-gray-200 bg-white px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                Send More
              </button>
            </div>
          )}
          {r.status === "accepted" && (
            <button 
              onClick={() => onAssign(r.toEmployeeId || "e1")}
              className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Assign Shift
            </button>
          )}
          {r.status === "accepted" && (
            <button 
              onClick={() => onAutoAssign?.(r.toEmployeeId || "e1")}
              className="text-xs font-semibold text-slate-700 border border-slate-300 bg-white px-3 py-1 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Auto Assign
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TimelineItem({ item }: { item: typeof TIMELINE[0] }) {
  const dotColor =
    item.type === "replacement-assigned"
      ? "bg-blue-500"
      : item.type === "accepted"
      ? "bg-emerald-500"
      : item.type === "rejected"
      ? "bg-red-400"
      : "bg-gray-400";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${dotColor}`} />
        <div className="w-px flex-1 bg-gray-200 mt-1" />
      </div>
      <div className="pb-4 min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-snug">{item.title}</p>
        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

function ResponseTrackingPageInner() {
  const { replacementRequests, getPendingRequests, getAcceptedRequests, getRejectedRequests, employees, shifts, assignShift, sendReplacementRequest, addEmergencyAlert } = useScheduling();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [showNewAlertForm, setShowNewAlertForm] = useState(false);

  const handleNewStaffingAlert = () => {
    const departments = ["Front Desk", "Housekeeping", "F&B", "Maintenance", "Security", "Wellness"];
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const shiftTimes = ["08:00 - 16:00", "14:00 - 22:00", "18:00 - 02:00"];
    const shiftTime = shiftTimes[Math.floor(Math.random() * shiftTimes.length)];
    const reasons = ["Sudden Leave", "Medical Emergency", "Family Emergency", "Unexpected Absence"];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const availableEmp = employees.find(e => e.status === "available");
    
    addEmergencyAlert({
      employeeName: availableEmp?.name || "Unknown",
      department: dept,
      shiftTime: shiftTime,
      reason: reason,
    });
    setShowNewAlertForm(false);
  };

const pending = getPendingRequests().length;
  const accepted = getAcceptedRequests().length;
  const rejected = getRejectedRequests().length;

  const realRequests: ResponseItem[] = replacementRequests.map((r) => ({
  id: r.id,
  name: r.toEmployeeName,
  role: `${r.department} • ${r.shiftTime}`,
  reason: "",
  status: r.status === "accepted" ? "accepted" : r.status === "rejected" ? "rejected" : "pending",
  matchPct: 0,
  note: r.status === "accepted" ? "Ready to assign" : r.status === "rejected" ? "Request rejected" : "",
  priority: "normal",
  respondedAgo: r.respondedAt ? `Responded ${r.respondedAt}` : "",
  toEmployeeId: r.toEmployeeId,
}));

  const filteredResponses =
    activeTab === "pending"
      ? realRequests.filter((r) => r.status === "pending")
      : activeTab === "accepted"
      ? realRequests.filter((r) => r.status === "accepted")
      : activeTab === "rejected"
      ? realRequests.filter((r) => r.status === "rejected")
      : realRequests;

  const availableEmployees = employees.filter((e) => e.status === "available");

  const handleAssignShift = (requestId: string) => {
    const request = replacementRequests.find((r) => r.id === requestId);
    if (request) {
      const vacantShift = shifts.find((s) => s.isVacant && s.department === request.department);
      if (vacantShift) {
        assignShift(vacantShift.id, request.toEmployeeId);
      }
    }
  };

  const handleAutoAssign = (requestId: string) => {
    const request = replacementRequests.find((r) => r.id === requestId);
    if (request) {
      const vacantShift = shifts.find((s) => s.isVacant && s.department === request.department);
      if (vacantShift) {
        assignShift(vacantShift.id, request.toEmployeeId);
      }
    }
  };

  const handleSendMore = (requestId: string) => {
    const request = replacementRequests.find((r) => r.id === requestId);
    if (request) {
      availableEmployees.forEach((emp) => {
        if (emp.id !== request.toEmployeeId) {
          sendReplacementRequest({
            emergencyAlertId: request.emergencyAlertId,
            shiftId: request.shiftId,
            fromEmployee: "Manager",
            toEmployeeId: emp.id,
            toEmployeeName: emp.name,
            toEmployeeDept: emp.department,
            shiftTime: request.shiftTime,
            department: request.department,
            incentive: request.incentive,
            overtimeEligible: emp.overtimeEligible,
          });
        }
      });
    }
  };

  const handleAssignStandby = (employeeId: string) => {
    const vacantShift = shifts.find((s) => s.isVacant);
    if (vacantShift) {
      assignShift(vacantShift.id, employeeId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          href="/manager/scheduling"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Schedule
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <h1 className="text-lg font-bold text-gray-900">Employee Response Tracking</h1>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-700 font-semibold uppercase">Live</span>
        </div>
      </div>

      {/* Replacement Workflow Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium px-4 py-2.5 rounded-xl"
      >
        <ChevronRight className="w-4 h-4 opacity-60" />
        Replacement Workflow
      </motion.div>

      {/* Status Counts Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "PENDING", value: pending, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", tab: "pending" as const },
          { label: "ACCEPTED", value: accepted, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", tab: "accepted" as const },
          { label: "REJECTED", value: rejected, color: "text-red-700", bg: "bg-red-50 border-red-200", tab: "rejected" as const },
        ].map((s) => (
          <button
            key={s.tab}
            onClick={() => setActiveTab(activeTab === s.tab ? "all" : s.tab)}
            className={`rounded-xl border p-4 text-center transition-all hover:shadow-sm ${s.bg} ${
              activeTab === s.tab ? "ring-2 ring-offset-1 ring-slate-900" : ""
            }`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${s.color} opacity-80`}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Main content: responses list + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Active Responses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Active Responses</h2>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
              {MOCK_RESPONSES.length} Recipients Tracked
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredResponses.map((r) => (
                <ResponseCard 
                  key={r.id} 
                  r={r} 
                  onAssign={(empId) => {
                    const vacantShift = shifts.find((s) => s.isVacant);
                    if (vacantShift) {
                      assignShift(vacantShift.id, empId);
                    }
                  }}
                  onAutoAssign={(empId) => {
                    const vacantShift = shifts.find((s) => s.isVacant);
                    if (vacantShift) {
                      assignShift(vacantShift.id, empId);
                    }
                  }}
                />
              ))}
              {filteredResponses.length === 0 && (
                <div className="py-10 text-center text-gray-400 text-sm">
                  No responses in this category yet.
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Manual Standby Queue */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Manual Standby Queue</h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-3 px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Employee</span>
                <span>Skill</span>
                <span>Action</span>
              </div>
              {availableEmployees.slice(0, 4).map((emp) => (
                <div key={emp.id} className="grid grid-cols-3 items-center px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: emp.color }}
                    >
                      {emp.initials}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                  </div>
                  <span className="text-sm text-gray-700 font-semibold">{emp.overtimeEligible ? "95" : "80"}/100</span>
                  <button 
                    onClick={() => handleAssignStandby(emp.id)}
                    className="text-xs font-bold text-slate-900 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors w-fit"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* New Staffing Alert Button */}
          <button 
            onClick={handleNewStaffingAlert}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-md mt-2"
          >
            <Plus className="w-4 h-4" />
            New Staffing Alert
          </button>
        </div>

        {/* Right: Timeline Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Timeline</h3>
            </div>
            <div className="p-5">
              <div className="space-y-0">
                {TIMELINE.map((item, i) => (
                  <TimelineItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* System Notification */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-gray-500" />
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">System Notification</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-blue-500 font-bold">●</span>
                <p>Predicted fit probability: 84% within the next 15 minutes.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-emerald-500 font-bold">●</span>
                <p>On Call Available</p>
              </div>
            </div>
          </div>

          {/* Quick Navigate back */}
          <Link
            href="/manager/scheduling"
            className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors group"
          >
            <span>Back to Schedule View</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResponseTrackingPage() {
  return (
    <SchedulingProvider>
      <ResponseTrackingPageInner />
    </SchedulingProvider>
  );
}
