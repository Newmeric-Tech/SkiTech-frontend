"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, CheckCircle2, Filter, Plus, User, FileText } from "lucide-react";
import { toast } from "sonner";

export default function EventsTab() {
  const handleFilter = () => {
    toast.info("Opening filter options");
  };

  const handleNewUpdate = () => {
    toast.info("Creating new event update");
  };

  const handleAction = (action: string, title: string) => {
    switch (action) {
      case "noted":
        toast.success(`"${title}" marked as noted`);
        break;
      case "details":
        toast.info(`Viewing details for "${title}"`);
        break;
      case "history":
        toast.info(`Viewing history for "${title}"`);
        break;
      default:
        toast.info(`${action}: ${title}`);
    }
  };

  const handleAddNewEvent = () => {
    toast.info("Opening new event form");
  };

  return (
    <div className="space-y-6">
      {/* Header section matching Image 3 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Live Monitoring</p>
          <h2 className="text-xl font-bold text-slate-900">Daily Event Dashboard</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={handleFilter} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button onClick={handleNewUpdate} className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-sm font-medium text-white hover:bg-slate-800">
            <Plus className="w-4 h-4" /> New Update
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">24</p>
            <p className="text-sm text-slate-500">Events Today</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Staff Briefing</p>
            <p className="text-sm text-slate-500">In 45 minutes</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">18 / 24</p>
            <p className="text-sm text-slate-500">Actions Noted</p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Event Card 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
              VIP ARRIVAL
            </span>
            <span className="text-xs font-medium text-slate-500">10:45 AM</span>
          </div>
          
          <h3 className="font-bold text-slate-900 mb-2">Mr. Henderson - Room 402</h3>
          <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-4">Guest requested early check-in and luggage storage. Concierge has been notified. Champagne set to be delivered at 11:30 AM.</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-500" />
              </div>
              <span className="text-xs font-medium text-slate-600">Sarah Mitchell</span>
            </div>
            
            <button onClick={() => handleAction("noted", "Mr. Henderson - Room 402")} className="text-xs font-bold px-4 py-2 rounded-lg transition-colors ml-auto bg-slate-900 text-white hover:bg-slate-800">
              MARK NOTED
            </button>
          </div>
        </div>

        {/* Event Card 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-blue-50 text-blue-600">
              MAINTENANCE
            </span>
            <span className="text-xs font-medium text-slate-500">09:15 AM</span>
          </div>
          
          <h3 className="font-bold text-slate-900 mb-2">HVAC Inspection - Floor 2</h3>
          <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-4">Routine quarterly inspection of the central heating and ventilation systems. Temporary noise expected near corridors 2A and 2B.</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-500" />
              </div>
              <span className="text-xs font-medium text-slate-600">Engineering Dept</span>
            </div>
            
            <button className="text-xs font-bold px-4 py-2 rounded-lg transition-colors ml-auto text-slate-400 cursor-not-allowed">
              ✓ NOTED
            </button>
          </div>
        </div>

        {/* Event Card 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-purple-50 text-purple-600">
              EVENT
            </span>
            <span className="text-xs font-medium text-slate-500">08:00 AM</span>
          </div>
          
          <h3 className="font-bold text-slate-900 mb-2">Lobby Furniture Reconfig</h3>
          <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-4">Layout adjusted for the evening cocktail reception. Bar stools added and lighting preset changed to 'Evening Mood'.</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-500" />
              </div>
              <span className="text-xs font-medium text-slate-600">Housekeeping</span>
            </div>
            
            <button onClick={() => handleAction("details", "Lobby Furniture Reconfig")} className="text-xs font-bold px-4 py-2 rounded-lg transition-colors ml-auto bg-slate-900 text-white hover:bg-slate-800">
              VIEW DETAILS
            </button>
          </div>
        </div>

        {/* Event Card 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
              COMPLAINT
            </span>
            <span className="text-xs font-medium text-slate-500">Oct 22, 11:30 PM</span>
          </div>
          
          <h3 className="font-bold text-slate-900 mb-2">Noise Report - Room 311</h3>
          <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-4">Guest reported loud music from adjacent room. Security dispatched and issue resolved within 15 minutes. Formal apology sent.</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium">Resolved</span>
            </div>

            <button onClick={() => handleAction("history", "Noise Report - Room 311")} className="text-xs font-bold px-4 py-2 rounded-lg transition-colors ml-auto text-slate-600 hover:bg-slate-50">
              VIEW HISTORY
            </button>
          </div>
        </div>

        {/* Event Card 5 */}
        <div className="bg-white rounded-xl border border-orange-200 p-5 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-orange-100 text-orange-700">
              PRIORITY ALERT
            </span>
            <span className="text-xs font-medium text-orange-600">16:00 (Exp)!</span>
          </div>
          
          <h3 className="font-bold text-slate-900 mb-2">Presidential Suite Arrival</h3>
          <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-4">VIP Guest arriving. Ensure all amenities are staged and staff is briefed on specific dietary requirements.</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-500" />
              </div>
              <span className="text-xs font-medium text-slate-600">Front Desk Team</span>
            </div>
            
            <button onClick={() => handleAction("noted", "Presidential Suite Arrival")} className="text-xs font-bold px-4 py-2 rounded-lg transition-colors ml-auto bg-slate-900 text-white hover:bg-slate-800">
              MARK NOTED
            </button>
          </div>
        </div>

        {/* Add New Event Card */}
        <div onClick={handleAddNewEvent} className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-300 hover:bg-slate-100 transition-colors min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 mb-3 shadow-sm">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-slate-700">Add New Event</h3>
          <p className="text-sm text-slate-500 mt-1">Log a new update to the timeline</p>
        </div>
      </div>

      {/* Floating Action Button for smaller screens */}
      <div onClick={handleNewUpdate} className="fixed bottom-6 right-6 bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg lg:hidden cursor-pointer">
        <FileText className="w-5 h-5" />
      </div>
    </div>
  );
}
