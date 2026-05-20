"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  ChevronRight,
  X,
  Image as ImageIcon,
  File,
  Download
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
    sender: "Sarah Johnson",
    senderRole: "Guest",
    content: "Hello! I wanted to confirm our arrival time for tomorrow. We'll be arriving around 3 PM.",
    timestamp: "Yesterday, 2:30 PM",
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    senderRole: "Manager",
    content: "Hi Sarah! Thank you for reaching out. I've noted your arrival time. We'll have everything ready for you. Is there anything specific you'd like prepared for your stay?",
    timestamp: "Yesterday, 2:45 PM",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Sarah Johnson",
    senderRole: "Guest",
    content: "Wonderful! My husband has some dietary restrictions - he's allergic to shellfish. Could you ensure the kitchen is aware? Also, we'd love some fresh flowers in the suite if possible.",
    timestamp: "Yesterday, 3:00 PM",
    isOwn: false,
  },
  {
    id: "4",
    sender: "You",
    senderRole: "Manager",
    content: "Absolutely! I've informed our kitchen team about the shellfish allergy. We'll also have a beautiful floral arrangement waiting for you in Suite 501. Is there anything else you need?",
    timestamp: "Yesterday, 3:15 PM",
    isOwn: true,
    attachments: [
      { name: "menu_options.pdf", type: "pdf" },
      { name: "suite_amenities.jpg", type: "image" }
    ]
  },
  {
    id: "5",
    sender: "Sarah Johnson",
    senderRole: "Guest",
    content: "That's perfect! One more thing - we're celebrating our anniversary during this trip. Would it be possible to arrange something special?",
    timestamp: "Today, 9:00 AM",
    isOwn: false,
  },
];

export default function InboxDetailPage() {
  const params = useParams();
  const router = useRouter();
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
              href="/manager/inbox" 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                SJ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">Sarah Johnson</h3>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-sm text-slate-500">VIP Guest • Suite 501</div>
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
              <h4 className="font-semibold text-slate-900">VIP Guest Arrival Confirmation</h4>
              <p className="text-sm text-slate-500">Conversation started: Yesterday, 2:30 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                VIP Guest
              </span>
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                Responding
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
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    SJ
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
            <span>Response time: &lt; 1 hour</span>
          </div>
        </div>
      </div>

      {/* Sidebar - Conversation Details */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Guest Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Guest Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Sarah Johnson</div>
                <div className="text-xs text-slate-500">Guest</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Suite 501</div>
                <div className="text-xs text-slate-500">Penthouse Suite</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-2">Special Notes</div>
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              • Shellfish allergy<br/>
              • Anniversary celebration<br/>
              • Prefers non-smoking room<br/>
              • Late check-out preferred
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">Mark as Resolved</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
              <Star className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-slate-700">Add to VIP List</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
              <Forward className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Forward to Team</span>
            </button>
          </div>
        </div>

        {/* Related Messages */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-lg mb-4">From This Guest</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="text-sm font-medium text-slate-900">Check-out Confirmation</div>
              <div className="text-xs text-slate-400 mt-1">2 weeks ago</div>
            </button>
            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="text-sm font-medium text-slate-900">Room Service Request</div>
              <div className="text-xs text-slate-400 mt-1">1 month ago</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Phone(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}

function Video(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
}