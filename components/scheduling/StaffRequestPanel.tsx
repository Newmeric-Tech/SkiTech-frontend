"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, Building2, User, DollarSign, Zap, CheckCircle2, XCircle } from "lucide-react";
import { ReplacementRequest } from "@/store/SchedulingStore";

interface StaffRequestPanelProps {
  requests: ReplacementRequest[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function StaffRequestPanel({ requests, onAccept, onReject }: StaffRequestPanelProps) {
  const pendingRequests = requests.filter((r) => r.status === "pending");

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Emergency Requests</h3>
        </div>
        <p className="text-gray-500 text-sm">No pending requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((request, index) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  EMERGENCY
                </span>
                <p className="text-sm font-medium text-gray-900 mt-1">Shift Replacement Request</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{request.shiftTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>{request.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              <span>Requested by: Manager</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span>Incentive: ${request.incentive}</span>
            </div>
            {request.overtimeEligible && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-gray-400" />
                <span>Overtime Eligible</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => onAccept(request.id)}
              className="flex-1 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept Shift
            </button>
            <button
              onClick={() => onReject(request.id)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}