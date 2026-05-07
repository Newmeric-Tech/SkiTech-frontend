"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Plus, Filter, Users, UserPlus, Activity, PenLine, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ComplaintItem {
  id: string;
  category: string;
  priority: string;
  priorityColor: string;
  title: string;
  time: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  assigneeType: "avatar-group" | "in-progress" | "unassigned" | "resolved";
}

export default function ComplaintsTab() {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([
    {
      id: "#CMP-10492",
      category: "PLUMBING",
      priority: "PRIORITY HIGH",
      priorityColor: "text-red-600 border-red-200 bg-red-50",
      title: "Room 402 - Water Leakage",
      time: "Today, 08:45 AM",
      description: "Guest reported water dripping from the ceiling in the bathroom. Possible pipe burst on the floor above. Maintenance notified but has not yet arrived on scene. Guest is requesting immediate room change if not resolved within the hour.",
      status: "open",
      assigneeType: "avatar-group"
    },
    {
      id: "#CMP-10495",
      category: "TECHNOLOGY",
      priority: "STANDARD",
      priorityColor: "text-blue-600 border-blue-200 bg-blue-50",
      title: "Suite 22 - Smart Lock Failure",
      time: "Today, 09:12 AM",
      description: "RFID reader is not responding to keycards or mobile app unlock. Internal deadbolt remains active. Guest is currently in the lobby waiting for a manual bypass. Battery replacement attempted but issue persists with the controller.",
      status: "in_progress",
      assigneeType: "in-progress"
    },
    {
      id: "#CMP-10501",
      category: "HOUSEKEEPING",
      priority: "HIGH",
      priorityColor: "text-orange-600 border-orange-200 bg-orange-50",
      title: "Room 1105 - Incomplete Turnout",
      time: "Today, 10:30 AM",
      description: "Guest checked in and found the minibar not restocked and towels missing from the secondary bathroom. Guest is a VIP Platinum member and expressed significant disappointment with the standards.",
      status: "open",
      assigneeType: "unassigned"
    },
  ]);

  const handleExport = () => {
    toast.info("Generating report... Download will start shortly");
  };

  const handleNewEntry = () => {
    setShowNewEntry(true);
    toast.info("New complaint form opened");
  };

  const handleFilter = (filterType: string) => {
    toast.info(`${filterType} filter options`);
  };

  const handleAssign = (complaintTitle: string) => {
    toast.info(`Assigning staff for: ${complaintTitle}`);
  };

  const handleResolve = (id: string) => {
    setComplaints(prev => prev.map(item => 
      item.id === id ? { ...item, status: "resolved", assigneeType: "resolved" } : item
    ));
    toast.success("Complaint marked as resolved");
  };

  const handleEmergency = () => {
    toast.error("Emergency protocol activated! Notifying all managers...");
  };

  const handleEdit = (id: string) => {
    toast.info(`Editing complaint ${id}`);
  };

  const displayedComplaints = complaints;

  return (
    <div className="space-y-6">
      {/* Header matching Image 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Active Complaints</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and resolve reported issues for the current shift.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button onClick={handleNewEntry} className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-sm font-medium text-white hover:bg-slate-800">
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => handleFilter("Room")} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Filter className="w-3 h-3" /> All Rooms
          </button>
          <button onClick={() => handleFilter("Priority")} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Filter className="w-3 h-3" /> All Priorities
          </button>
          <button onClick={() => handleFilter("Status")} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Filter className="w-3 h-3" /> All Status
          </button>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {displayedComplaints.length} issues
        </span>
      </div>

      {/* Grid of Complaints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedComplaints.map((complaint) => (
          <div 
            key={complaint.id}
            className={`bg-white rounded-xl border p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              complaint.status === "resolved" ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  complaint.status === "resolved" 
                    ? "bg-emerald-100 text-emerald-600" 
                    : "bg-emerald-50 text-emerald-600"
                }`}>
                  {complaint.category}
                </span>
                <span className="text-xs font-medium text-slate-400">{complaint.id}</span>
              </div>
              <div className="flex items-center gap-2">
                {complaint.status === "resolved" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-500 text-white">
                    RESOLVED
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                  complaint.status === "resolved" 
                    ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                    : complaint.priorityColor
                }`}>
                  {complaint.priority}
                </span>
              </div>
            </div>
            
            <div className="mb-2 flex flex-col gap-1">
              <h3 className="font-bold text-slate-900">{complaint.title}</h3>
              <span className="text-xs font-medium text-slate-400">{complaint.time}</span>
            </div>
            
            <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-6">{complaint.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
              <div className="flex items-center">
                {complaint.assigneeType === 'avatar-group' && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center -ml-1 text-[10px] font-bold text-slate-600">
                      +1
                    </div>
                  </div>
                )}
                {complaint.assigneeType === 'in-progress' && (
                  <div className="flex items-center gap-2 text-orange-500">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
                  </div>
                )}
                {complaint.assigneeType === 'unassigned' && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
                      <span className="w-3 h-0.5 bg-slate-300 rounded-full"></span>
                    </div>
                    <span className="text-xs font-medium">Unassigned</span>
                  </div>
                )}
                {complaint.assigneeType === 'resolved' && (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
                  </div>
                )}
              </div>
              
              {complaint.status !== "resolved" && (
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleAssign(complaint.title); }} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">
                    Assign Staff
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleResolve(complaint.id); }} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Critical Issue Dark Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col h-full shadow-sm relative group cursor-pointer text-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider">
                CRITICAL ISSUE
              </span>
              <span className="text-xs font-medium text-slate-400">#CMP-10510</span>
            </div>
            
            <h3 className="font-bold text-lg mb-2">Escalation Required: HVAC Outage</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              The central chiller unit on the West Wing has failed. Temperatures in 15 rooms are rising above 25°C. Outside contractor called; estimated arrival is 1:00 PM. Front desk must prepare for mass relocations or fan deployments.
            </p>

            <div className="mt-auto pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-slate-400">Affected Areas</span>
                <span className="font-medium text-right">West Wing, Floors 4-5</span>
              </div>
              <div className="flex justify-between items-center py-2 text-sm border-t border-slate-800">
                <span className="text-slate-400">Reported By</span>
                <span className="font-medium text-right">Automated BMS Alert</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button onClick={handleEmergency} className="w-full py-2.5 bg-white text-slate-900 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors">
                Activate Emergency Protocol
              </button>
            </div>
            
            {/* Floating Edit Button */}
            <div onClick={() => handleEdit("CMP-10510")} className="absolute -right-3 -bottom-3 w-10 h-10 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-lg cursor-pointer">
              <PenLine className="w-4 h-4 text-white" />
            </div>
          </div>

        {displayedComplaints.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-slate-500">No issues</p>
          </div>
        )}
      </div>
    </div>
  );
}
