"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, ArrowRight, Sparkles } from "lucide-react";
import { ReplacementRequest } from "@/store/SchedulingStore";

interface ResponseTrackingPanelProps {
  pendingRequests: ReplacementRequest[];
  acceptedRequests: ReplacementRequest[];
  rejectedRequests: ReplacementRequest[];
  awaitingRequests: ReplacementRequest[];
  onAssignShift: (requestId: string) => void;
  onAutoAssign: (requestId: string) => void;
  onSendMore: (requestId: string) => void;
}

export function ResponseTrackingPanel({
  pendingRequests,
  acceptedRequests,
  rejectedRequests,
  awaitingRequests,
  onAssignShift,
  onAutoAssign,
  onSendMore,
}: ResponseTrackingPanelProps) {
  const allRequests = [...pendingRequests, ...acceptedRequests, ...rejectedRequests, ...awaitingRequests];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Response Tracking</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {allRequests.length} total requests • {pendingRequests.length} pending
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-600">{pendingRequests.length} Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-600">{acceptedRequests.length} Accepted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600">{rejectedRequests.length} Rejected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {allRequests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">No replacement requests yet</p>
          </div>
        ) : (
          allRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    {request.status === "pending" && <Clock className="w-4 h-4 text-amber-500" />}
                    {request.status === "accepted" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {request.status === "rejected" && <XCircle className="w-4 h-4 text-red-500" />}
                    {request.status === "awaiting" && <Clock className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.toEmployeeName}</p>
                    <p className="text-xs text-gray-500">{request.department} • {request.shiftTime}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    request.status === "pending" ? "bg-amber-50 text-amber-700" :
                    request.status === "accepted" ? "bg-emerald-50 text-emerald-700" :
                    request.status === "rejected" ? "bg-red-50 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {request.status === "pending" ? "Pending" :
                   request.status === "accepted" ? "Accepted" :
                   request.status === "rejected" ? "Rejected" :
                   "Awaiting"}
                </span>
              </div>

              {request.status === "pending" && (
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => onAssignShift(request.id)}
                    className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Assign Shift
                  </button>
                  <button
                    onClick={() => onAutoAssign(request.id)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto Assign
                  </button>
                  <button
                    onClick={() => onSendMore(request.id)}
                    className="px-3 py-1.5 text-gray-500 text-xs font-medium hover:text-gray-700 transition-colors"
                  >
                    Send More
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}