"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useScheduling, EmergencyAlert, Employee } from "@/store/SchedulingStore";
import { EmergencyAlertBanner } from "@/components/scheduling/EmergencyAlertBanner";
import { StaffingAnalytics } from "@/components/scheduling/StaffingAnalytics";
import { ScheduleTable } from "@/components/scheduling/ScheduleTable";
import { AIRecommendationCard } from "@/components/scheduling/AIRecommendationCard";
import { TimelineActivity } from "@/components/scheduling/TimelineActivity";
import {
  Activity, Bell, ChevronRight, Users, UserMinus, AlertTriangle,
  TrendingUp, BarChart2, Sparkles, ArrowRight, CheckCircle
} from "lucide-react";

function ManagerSchedulingContent() {
  const {
    employees,
    shifts,
    emergencyAlerts,
    replacementRequests,
    timeline,
    dismissEmergencyAlert,
    resolveEmergencyAlert,
    sendReplacementRequest,
    assignShift,
    getPendingRequests,
    getAcceptedRequests,
    getRejectedRequests,
    getAwaitingRequests,
  } = useScheduling();

  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const [showAssignSuccess, setShowAssignSuccess] = useState<{ employee: string; type: string } | null>(null);

  const handleAssignReplacement = (alert: EmergencyAlert) => {
    const vacantShift = shifts.find((s) => s.isVacant && s.department === alert.department);
    const availableEmployee = employees.find((e) => e.status === "available" && e.department === alert.department);
    
    if (vacantShift && availableEmployee) {
      sendReplacementRequest({
        emergencyAlertId: alert.id,
        shiftId: vacantShift.id,
        fromEmployee: "Manager",
        toEmployeeId: availableEmployee.id,
        toEmployeeName: availableEmployee.name,
        toEmployeeDept: availableEmployee.department,
        shiftTime: `${vacantShift.startTime} - ${vacantShift.endTime}`,
        department: alert.department,
        incentive: 150,
        overtimeEligible: availableEmployee.overtimeEligible,
      });
      resolveEmergencyAlert(alert.id);
      setShowAssignSuccess({ employee: availableEmployee.name, type: "request" });
      setTimeout(() => setShowAssignSuccess(null), 3000);
    } else if (vacantShift) {
      setSelectedDepartment(alert.department);
    }
  };

  const handleSendRequest = (employee: Employee) => {
    const vacantShift = shifts.find((s) => s.isVacant);
    sendReplacementRequest({
      emergencyAlertId: emergencyAlerts[0]?.id || "ea1",
      shiftId: vacantShift?.id || "s4",
      fromEmployee: "Manager",
      toEmployeeId: employee.id,
      toEmployeeName: employee.name,
      toEmployeeDept: employee.department,
      shiftTime: vacantShift ? `${vacantShift.startTime} - ${vacantShift.endTime}` : "6:00 PM - 2:00 AM",
      department: employee.department,
      incentive: 150,
      overtimeEligible: employee.overtimeEligible,
    });
  };

  const handleAutoAssign = (employee: Employee) => {
    const vacantShift = shifts.find((s) => s.isVacant);
    if (vacantShift) {
      assignShift(vacantShift.id, employee.id);
    }
  };

  const presentCount = employees.filter((e) => e.status === "available").length;
  const onLeaveCount = employees.filter((e) => e.status === "on-leave").length;
  const shortageCount = shifts.filter((s) => s.isVacant).length;
  const efficiency = Math.round(((presentCount - shortageCount) / employees.length) * 100) || 85;

  const pendingCount = getPendingRequests().length;
  const acceptedCount = getAcceptedRequests().length;
  const rejectedCount = getRejectedRequests().length;

  // Staffing efficiency by department
  const deptEfficiency = [
    { dept: "Front Office", pct: 82, color: "#3B82F6" },
    { dept: "Housekeeping", pct: 71, color: "#10B981" },
    { dept: "Food & Bev.", pct: 55, color: "#F59E0B" },
  ];

  return (
    <div className="space-y-6">
      {showAssignSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">
            Replacement request sent to {showAssignSuccess.employee}
          </p>
        </motion.div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Scheduling</h1>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              42% STARTED
            </span>
          </div>
          <p className="text-gray-500 text-sm">Manage workforce scheduling and replacements</p>
        </div>

        {/* Response Tracking Button — navigates to page 2 */}
        <Link href="/manager/scheduling/response-tracking">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:bg-slate-800 transition-colors relative"
          >
            <Activity className="w-4 h-4" />
            Response Tracking
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {pendingCount}
              </span>
            )}
            <ChevronRight className="w-4 h-4 opacity-60" />
          </motion.button>
        </Link>
      </div>

      {/* Emergency Alert Banner */}
      <EmergencyAlertBanner
        alerts={emergencyAlerts}
        onDismiss={dismissEmergencyAlert}
        onAssign={handleAssignReplacement}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{String(presentCount).padStart(3, "0").slice(-3)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Present Employees</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">↑ 91% capacity</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <UserMinus className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{String(onLeaveCount).padStart(2, "0")}</p>
            <p className="text-xs text-gray-500 mt-0.5">On Planned Leave</p>
            <p className="text-[10px] text-blue-500 font-medium mt-1">Vacancies 24 – 72 hrs</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{String(shortageCount).padStart(2, "0")}</p>
            <p className="text-xs text-gray-500 mt-0.5">Staff Shortage</p>
            <p className="text-[10px] text-red-500 font-medium mt-1">Critical — needs staffing</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{efficiency}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Staffing Efficiency</p>
            <p className="text-[10px] text-purple-500 font-medium mt-1">Coverage rate</p>
          </div>
        </motion.div>
      </div>

      {/* Schedule Table */}
      <ScheduleTable
        employees={employees}
        shifts={shifts}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        onAssignShift={assignShift}
      />

      {/* Bottom section: Staffing Efficiency + AI Smart Suggest */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Staffing Efficiency Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Staffing Efficiency</h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {deptEfficiency.map((d) => (
              <div key={d.dept}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{d.dept}</span>
                  <span className="text-xs font-bold text-gray-900">{d.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                </div>
              </div>
            ))}

            <Link
              href="/manager/scheduling/response-tracking"
              className="mt-4 flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors group"
            >
              <span>View Response Tracking</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* AI Smart Suggest */}
        <AIRecommendationCard
          employees={employees}
          department={selectedDepartment}
          onAutoAssign={handleAutoAssign}
          onSendRequest={handleSendRequest}
        />
      </div>

      {/* Timeline Activity */}
      <TimelineActivity events={timeline} />
    </div>
  );
}

export default function ManagerSchedulingPage() {
  return <ManagerSchedulingContent />;
}