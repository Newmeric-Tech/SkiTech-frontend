"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreHorizontal,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Phone
} from "lucide-react";

export default function InboxDetailPage() {
  const [replyText, setReplyText] = useState("");
  const [showActions, setShowActions] = useState(false);

  const handleSend = () => {
    if (replyText.trim()) {
      setReplyText("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/staff/inbox" 
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tasks
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Task Header */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    New Task
                  </span>
                  <h1 className="text-xl font-bold text-slate-900 mt-2">Room 305 Deep Clean Required</h1>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <p className="text-slate-600 mb-4">
              Guest checking out by 11 AM. Deep clean needed before next check-in at 3 PM. Focus on bathroom and kitchen areas.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Assigned 30 min ago</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Due: 11:00 AM</span>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-4">Task Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <User className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Assigned By</div>
                  <div className="text-sm text-slate-500">Manager - Lisa Wang</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Location</div>
                  <div className="text-sm text-slate-500">Room 305, Floor 3</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Priority</div>
                  <div className="text-sm text-red-600 font-medium">High - Guest checkout soon</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">Checklist</h3>
              <div className="space-y-2">
                {[
                  "Remove all used towels and linens",
                  "Clean and sanitize bathroom thoroughly",
                  "Clean kitchenette and appliances",
                  "Vacuum and mop all floors",
                  "Dust all surfaces and furniture",
                  "Restock amenities (toiletries, tissues)",
                  "Final inspection and photos",
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
              Mark as Complete
            </button>
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Request Help
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Manager Contact */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Contact Manager</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">Lisa Wang</div>
                <div className="text-sm text-slate-500">Floor Manager</div>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              <Phone className="w-4 h-4" />
              Call Manager
            </button>
          </div>

          {/* Quick Tips */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Tips</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>• Use the proper cleaning checklist for deep cleans</p>
              <p>• Take photos before and after for proof of work</p>
              <p>• Report any damages or issues immediately</p>
              <p>• Restock all amenities even if partially used</p>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Time Tracking</h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-slate-900">00:00:00</div>
              <div className="text-sm text-slate-500">Time spent</div>
            </div>
            <button className="w-full py-2.5 bg-emerald-100 text-emerald-700 rounded-xl font-medium hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Start Timer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}