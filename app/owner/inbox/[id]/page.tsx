"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreHorizontal,
  Star,
  Archive,
  Trash2,
  Forward,
  Reply,
  CheckCircle2,
  Clock,
  User,
  Building2,
  MessageSquare,
  Download,
  File,
  Image as ImageIcon,
  Phone,
  Video
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  attachments?: { name: string; type: string }[];
}

const mockConversation: ChatMessage[] = [
  {
    id: "1",
    sender: "Finance Team",
    senderRole: "System",
    content: "Good morning! The monthly revenue report for April is now available for your review.",
    timestamp: "Today, 9:00 AM",
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    senderRole: "Owner",
    content: "Thanks! Can you give me a quick summary of the highlights?",
    timestamp: "Today, 9:15 AM",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Finance Team",
    senderRole: "System",
    content: "Certainly! Total revenue reached $485K, which is 18% above March. All 6 properties performed well, with Grand Horizon leading at $185K. Occupancy averaged 87% across all properties.",
    timestamp: "Today, 9:30 AM",
    isOwn: false,
    attachments: [
      { name: "april_revenue_report.pdf", type: "pdf" },
      { name: "property_breakdown.xlsx", type: "file" }
    ]
  },
  {
    id: "4",
    sender: "You",
    senderRole: "Owner",
    content: "Excellent results! Please prepare the detailed breakdown for the board meeting next week.",
    timestamp: "Today, 10:00 AM",
    isOwn: true,
  },
  {
    id: "5",
    sender: "Finance Team",
    senderRole: "System",
    content: "Understood! I'll have the board presentation ready by Friday. Should I include the Q2 projections as well?",
    timestamp: "Today, 10:15 AM",
    isOwn: false,
  },
];

export default function InboxDetailPage() {
  const [replyText, setReplyText] = useState("");
  const [showActions, setShowActions] = useState(false);

  const handleSend = () => {
    if (replyText.trim()) {
      setReplyText("");
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <Link 
              href="/owner/inbox" 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                FT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">Finance Team</h3>
                </div>
                <div className="text-sm text-slate-500">System • Reports</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              <Phone className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              <Video className="w-5 h-5 text-slate-600" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowActions(!showActions)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-slate-600" />
              </button>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-10 min-w-[160px]"
                >
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Archive className="w-4 h-4" /> Archive
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Mark Important
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Message Info Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">Monthly Revenue Report - April</h4>
              <p className="text-sm text-slate-500">Conversation started: Today, 9:00 AM</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                Financial
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {mockConversation.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[75%] ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                {!msg.isOwn && (
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    FT
                  </div>
                )}
                <div>
                  <div className={`p-4 rounded-2xl ${
                    msg.isOwn 
                      ? "bg-slate-900 text-white rounded-br-md" 
                      : "bg-slate-100 text-slate-900 rounded-bl-md"
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  {msg.attachments && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.attachments.map((att, j) => (
                        <div key={j} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                          {att.type === "image" ? (
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                          ) : (
                            <File className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="text-xs text-slate-700">{att.name}</span>
                          <button className="text-slate-400 hover:text-slate-600">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`text-xs text-slate-400 mt-1.5 ${msg.isOwn ? "text-right" : ""}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reply Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-end gap-3">
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              <Paperclip className="w-5 h-5 text-slate-500" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={1}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={!replyText.trim()}
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>Response time: &lt; 30 min</span>
          </div>
        </div>
      </div>

      {/* Sidebar - Conversation Details */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Report Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Report Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">Total Revenue</span>
              <span className="text-sm font-bold text-slate-900">$485,000</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">vs Last Month</span>
              <span className="text-sm font-bold text-emerald-600">+18%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">Properties</span>
              <span className="text-sm font-bold text-slate-900">6/6</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">Avg Occupancy</span>
              <span className="text-sm font-bold text-slate-900">87%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
              <Download className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Download Full Report</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
              <Forward className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-medium text-slate-700">Share with Board</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">Mark as Reviewed</span>
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Recent Reports</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="text-sm font-medium text-slate-900">March Revenue Report</div>
              <div className="text-xs text-slate-400 mt-1">$412,000 • Mar 31</div>
            </button>
            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="text-sm font-medium text-slate-900">Q1 Summary</div>
              <div className="text-xs text-slate-400 mt-1">$1.2M • Mar 31</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}