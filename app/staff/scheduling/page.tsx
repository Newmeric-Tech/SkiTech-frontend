"use client";

import { useScheduling, SchedulingProvider } from "@/store/SchedulingStore";
import { mapBackendShift } from "@/lib/api/scheduling";
import { CheckCircle2, XCircle, Info, Building2, Clock, Zap, DollarSign, Calendar, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function StaffSchedulingContent() {
  const {
    replacementRequests,
    acceptReplacementRequest,
    rejectReplacementRequest,
    staffTimeline,
    currentWeekSchedule,
  } = useScheduling();

  const weekShifts = (currentWeekSchedule?.shift_assignments ?? []).map((s) => mapBackendShift(s));
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "short" });

  const pendingRequests = replacementRequests.filter((r) => r.status === "pending");
  const acceptedRequests = replacementRequests.filter((r) => r.status === "accepted");
  const rejectedRequests = replacementRequests.filter((r) => r.status === "rejected");

  const handleAccept = (requestId: string) => {
    acceptReplacementRequest(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectReplacementRequest(requestId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb/Header area */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-gray-900">Staff Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          <AnimatePresence mode="wait">
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((req, index) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="bg-[#EF4444] text-white px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✱</span>
                        <span className="text-xs font-bold tracking-widest uppercase">Emergency Shift Request</span>
                      </div>
                      <span className="bg-red-800/40 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        High Priority
                      </span>
                    </div>

                    <div className="p-6 md:p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        You have been selected as a replacement employee for an urgent vacant shift.
                      </h2>
                      <p className="text-gray-600 text-sm leading-relaxed mb-8">
                        <span className="font-medium text-gray-800">{req.fromEmployee || "A colleague"}</span> is on emergency leave. You are requested to cover <span className="font-medium text-gray-800">{req.department}</span> Shift. <br />
                        Tuesday • {req.shiftTime}
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="w-full sm:w-auto px-8 py-3 bg-[#10B981] hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Accept Shift
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5 text-gray-400" />
                          Reject Request
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : acceptedRequests.length > 0 || rejectedRequests.length > 0 ? (
              <motion.div
                key="handled"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">All requests handled!</h2>
                <p className="text-gray-500 text-center">You have responded to all pending requests.</p>
                
                {(acceptedRequests.length > 0 || rejectedRequests.length > 0) && (
                  <div className="mt-6 space-y-3">
                    {acceptedRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-800">{req.department} - {req.shiftTime}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 uppercase">Accepted</span>
                      </div>
                    ))}
                    {rejectedRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">{req.department} - {req.shiftTime}</span>
                        </div>
                        <span className="text-xs font-bold text-red-600 uppercase">Rejected</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="no-request"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
                <p className="text-gray-500">No emergency shift requests at the moment.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Details & AI Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shift Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shift Details</span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Building2 className="w-4 h-4" /> Department
                    </div>
                    <span className="font-medium text-gray-900">{pendingRequests[0]?.department || "Concierge"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" /> Timing
                    </div>
                    <span className="font-medium text-gray-900">{pendingRequests[0]?.shiftTime || "14:00 - 22:00"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  {pendingRequests[0]?.overtimeEligible && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide">
                      <Zap className="w-3 h-3" /> Overtime Eligible
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wide">
                    <DollarSign className="w-3 h-3" /> +${pendingRequests[0]?.incentive || "50"} Incentive
                  </span>
                </div>
              </div>
            </div>

            {/* AI Smart Insight */}
            <div className="bg-[#0F172A] rounded-xl shadow-sm overflow-hidden text-white p-6 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">AI Smart Insight</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">No shift conflicts</p>
                    <p className="text-xs text-slate-400 mt-1">Schedule is clear for Tuesday.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Moderate workload</p>
                    <p className="text-xs text-slate-400 mt-1">Expected foot traffic: 65%.</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6 opacity-10 pointer-events-none">
                <Zap className="w-24 h-24" />
              </div>
            </div>
          </div>

          {/* Live Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity Timeline</span>
            </div>
            <div className="p-6">
              {staffTimeline.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
              ) : (
                <div className="relative space-y-6">
                  {/* Timeline Line */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gray-200" />

                  {staffTimeline.map((event) => {
                    const isAccepted = event.type === "responded" && event.response_type === "accepted";
                    const isRejected = event.type === "responded" && event.response_type === "rejected";
                    const dotColor = isAccepted ? "border-emerald-500" : isRejected ? "border-red-500" : "border-gray-300";
                    const dotFill = isAccepted ? "bg-emerald-500" : isRejected ? "bg-red-500" : "bg-gray-400";
                    const label = isAccepted
                      ? "You accepted the shift"
                      : isRejected
                      ? "You declined the shift"
                      : "Request received";
                    const timestamp = new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div key={`${event.replacement_request_id}-${event.type}`} className="relative flex items-start gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 ${dotColor} bg-white flex items-center justify-center z-10`}>
                          <div className={`w-2 h-2 rounded-full ${dotFill}`} />
                        </div>
                        <div className="flex-1 flex justify-between items-center mt-0.5">
                          <p className="text-sm font-semibold text-gray-900">{label}</p>
                          <span className="text-xs font-medium text-gray-400">{timestamp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar: Existing Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-gray-50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Existing Schedule</span>
          </div>
          
          <div className="p-2 space-y-1">
            {weekShifts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No shifts scheduled this week</p>
            ) : (
              weekShifts.map((shift, i) => {
                const isToday = shift.day === todayName;
                return (
                  <div
                    key={shift.id}
                    className={`p-3 hover:bg-gray-50 rounded-lg transition-colors group ${i > 0 ? "border-t border-gray-50" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-black">{shift.department}</p>
                      <span
                        className={
                          isToday
                            ? "bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                            : "bg-gray-100 text-gray-600 border border-gray-200 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                        }
                      >
                        {isToday ? "Today" : shift.day}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" /> {shift.startTime} - {shift.endTime}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StaffSchedulingPage() {
  return (
    <SchedulingProvider>
      <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
        <StaffSchedulingContent />
      </div>
    </SchedulingProvider>
  );
}