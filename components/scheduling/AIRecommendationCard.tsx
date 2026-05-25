"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Clock, DollarSign, Zap, CheckCircle, XCircle } from "lucide-react";
import { Employee } from "@/store/SchedulingStore";

interface AIRecommendationCardProps {
  employees: Employee[];
  department: string;
  onAutoAssign: (employee: Employee) => void;
  onSendRequest: (employee: Employee) => void;
}

type ActionStatus = "none" | "request-sent" | "assigned" | "error";

export function AIRecommendationCard({ employees, department, onAutoAssign, onSendRequest }: AIRecommendationCardProps) {
  const [actionStatus, setActionStatus] = useState<Record<string, { status: ActionStatus; message: string }>>({});

  const availableEmployees = employees
    .filter((e) => e.status === "available" && (department === "All" || e.department === department))
    .slice(0, 4);

  const handleSendRequest = (employee: Employee) => {
    onSendRequest(employee);
    setActionStatus((prev) => ({
      ...prev,
      [employee.id]: { status: "request-sent", message: "Request sent" },
    }));
    setTimeout(() => {
      setActionStatus((prev) => ({ ...prev, [employee.id]: { status: "none", message: "" } }));
    }, 3000);
  };

  const handleAutoAssign = (employee: Employee) => {
    onAutoAssign(employee);
    setActionStatus((prev) => ({
      ...prev,
      [employee.id]: { status: "assigned", message: "Assigned" },
    }));
    setTimeout(() => {
      setActionStatus((prev) => ({ ...prev, [employee.id]: { status: "none", message: "" } }));
    }, 3000);
  };

  if (availableEmployees.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Smart Recommendations</h3>
        </div>
        <p className="text-gray-500 text-sm">No available employees for recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Smart Recommendations</h3>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {availableEmployees.length} available
        </span>
      </div>

      <div className="p-4 space-y-3">
        {availableEmployees.map((employee, index) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: employee.color }}
              >
                {employee.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                <p className="text-xs text-gray-500">{employee.department} • {employee.role}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Available
                  </span>
                  {employee.overtimeEligible && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Zap className="w-3 h-3" />
                      OT Eligible
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {actionStatus[employee.id]?.status !== "none" && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  actionStatus[employee.id]?.status === "request-sent" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : actionStatus[employee.id]?.status === "assigned"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {actionStatus[employee.id]?.status === "request-sent" && <CheckCircle className="w-3.5 h-3.5" />}
                  {actionStatus[employee.id]?.status === "assigned" && <CheckCircle className="w-3.5 h-3.5" />}
                  {actionStatus[employee.id]?.message}
                </div>
              )}
              <button
                onClick={() => handleSendRequest(employee)}
                className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Send Request
              </button>
              <button
                onClick={() => handleAutoAssign(employee)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Auto Assign
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}