"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Paperclip, Image as ImageIcon, AtSign, Clock, User, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function HandoverTab() {
  const [logText, setLogText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePostLog = () => {
    if (!logText.trim()) {
      toast.error("Please enter a log message");
      return;
    }
    setIsPosting(true);
    setTimeout(() => {
      toast.success("Log posted successfully!");
      setLogText("");
      setIsPosting(false);
    }, 500);
  };

  const handleAttachment = (type: string) => {
    toast.info(`${type} attachment feature coming soon`);
  };

  const handleCardClick = (title: string) => {
    toast.info(`Opening ${title} details`);
  };

  return (
    <div className="space-y-6">
      {/* Composer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <textarea 
            placeholder="Write a log for next shift..." 
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-700 placeholder:text-slate-400 h-12 pt-2"
          ></textarea>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 pl-12">
            <button onClick={() => handleAttachment("File")} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button onClick={() => handleAttachment("Image")} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button onClick={() => handleAttachment("Mention")} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <AtSign className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handlePostLog}
            disabled={isPosting}
            className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isPosting ? "Posting..." : "Post Log"}
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Need Attention */}
        <div onClick={() => handleCardClick("Kitchen Exhaust Malfunction")} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-red-500 bg-red-50">
              Need Attention
            </span>
            <span className="text-xs font-medium text-slate-400">10:30 AM</span>
          </div>
          
          <h3 className="font-bold text-slate-900 mb-2">Kitchen Exhaust Malfunction</h3>
          <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-6">Main kitchen extraction fan making loud grinding noise. Maintenance called but...</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-blue-100 text-blue-600">
                MK
              </div>
              <span className="text-xs font-medium text-slate-600">Marcus King</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
        </div>

        {/* Complaint */}
        <div onClick={() => handleCardClick("Suite 402 Noise Issue")} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-emerald-600 bg-emerald-50">
              Complaint
            </span>
            <span className="text-xs font-medium text-slate-400">09:15 AM</span>
          </div>
          
          <h3 className="font-bold text-slate-900 mb-2">Suite 402 Noise Issue</h3>
          <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-6">Guest reported loud music from adjacent balcony. Security dispatched and situation...</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-100 text-slate-600">
                AS
              </div>
              <span className="text-xs font-medium text-slate-600">Alicia Smith</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
        </div>

        {/* Events */}
        <div onClick={() => handleCardClick("Conference Hall Setup")} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-orange-500 bg-orange-50">
              Events
            </span>
            <span className="text-xs font-medium text-slate-400">08:00 AM</span>
          </div>
          
          <h3 className="font-bold text-slate-900 mb-2">Conference Hall Setup</h3>
          <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-6">Vanguard Tech Summit stage prep complete. Audio check scheduled for 11:00 AM...</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-orange-100 text-orange-600">
                RJ
              </div>
              <span className="text-xs font-medium text-slate-600">Robert Jenkins</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
        </div>

        {/* Chats */}
        <div onClick={() => handleCardClick("In-Room Dining Feedback")} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-yellow-500 bg-yellow-50">
              Chats
            </span>
            <span className="text-xs font-medium text-slate-400">Yesterday</span>
          </div>
          
          <h3 className="font-bold text-slate-900 mb-2">In-Room Dining Feedback</h3>
          <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-6">Ongoing conversation with Room 104 regarding gluten-free menu options for...</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-900 text-white">
                EL
              </div>
              <span className="text-xs font-medium text-slate-600">Elena Lowe</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
        </div>

        {/* System Alert (Special wide card) */}
        <div onClick={() => handleCardClick("Facility Inspection Due")} className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-sm relative overflow-hidden group cursor-pointer">
          <div className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>
          
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="flex gap-2 p-4">
              <div className="w-16 h-8 bg-white/20 rounded"></div>
              <div className="w-8 h-8 bg-white/20 rounded-full"></div>
            </div>
            <div className="w-full h-px bg-white/20 my-2"></div>
            <div className="flex gap-4 p-4">
               <div className="w-full h-2 bg-white/20 rounded"></div>
               <div className="w-full h-2 bg-white/20 rounded"></div>
            </div>
          </div>
          
          <div className="relative z-10 pt-12">
            <span className="text-[10px] font-bold bg-white text-slate-900 px-2 py-0.5 rounded uppercase tracking-wider mb-3 inline-block">SYSTEM ALERT</span>
            <h3 className="text-lg font-bold mb-2">Facility Inspection Due</h3>
            <p className="text-sm text-slate-300">The quarterly structural inspection for the West Wing Spa and Pool area is scheduled for next Monday. Please review the checklist.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
