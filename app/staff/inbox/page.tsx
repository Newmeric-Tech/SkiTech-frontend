"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Settings,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  ChevronRight,
  Paperclip,
  Filter,
  Pin,
  ClipboardList,
  User,
  Wrench,
  FileText,
  Calendar
} from "lucide-react";

type MessageType = 
  | "task" 
  | "approval" 
  | "maintenance" 
  | "vip" 
  | "alert" 
  | "report" 
  | "message";

type MessageStatus = "new" | "pending" | "urgent" | "done" | "message";

interface Message {
  id: string;
  type: MessageType;
  status: MessageStatus;
  sender: string;
  senderRole: string;
  title: string;
  description: string;
  timestamp: string;
  isPinned: boolean;
  isRead: boolean;
  dueTime?: string;
}

const typeConfig: Record<MessageType, { color: string; bg: string; icon: any; borderColor: string }> = {
  task: { color: "#3B82F6", bg: "bg-blue-50", icon: ClipboardList, borderColor: "border-l-blue-500" },
  approval: { color: "#8B5CF6", bg: "bg-violet-50", icon: CheckCircle2, borderColor: "border-l-violet-500" },
  maintenance: { color: "#F59E0B", bg: "bg-amber-50", icon: Wrench, borderColor: "border-l-amber-500" },
  vip: { color: "#EC4899", bg: "bg-pink-50", icon: Star, borderColor: "border-l-pink-500" },
  alert: { color: "#EF4444", bg: "bg-red-50", icon: AlertCircle, borderColor: "border-l-red-500" },
  report: { color: "#6366F1", bg: "bg-indigo-50", icon: FileText, borderColor: "border-l-indigo-500" },
  message: { color: "#64748B", bg: "bg-slate-50", icon: MessageSquare, borderColor: "border-l-slate-400" },
};

const statusConfig: Record<MessageStatus, { label: string; bg: string; text: string }> = {
  new: { label: "New", bg: "bg-blue-100", text: "text-blue-700" },
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700" },
  urgent: { label: "Urgent", bg: "bg-red-100", text: "text-red-700" },
  done: { label: "Done", bg: "bg-emerald-100", text: "text-emerald-700" },
  message: { label: "Message", bg: "bg-slate-100", text: "text-slate-700" },
};

const mockMessages: Message[] = [
  {
    id: "1",
    type: "task",
    status: "new",
    sender: "Manager - Lisa Wang",
    senderRole: "Manager",
    title: "Room 305 Deep Clean Required",
    description: "Guest checking out by 11 AM. Deep clean needed before next check-in at 3 PM. Focus on bathroom and kitchen areas.",
    timestamp: "30 min ago",
    isPinned: true,
    isRead: false,
    dueTime: "11:00 AM",
  },
  {
    id: "2",
    type: "vip",
    status: "urgent",
    sender: "Manager - Mike Thompson",
    senderRole: "Manager",
    title: "VIP Suite Service - Urgent",
    description: "VIP guests arriving in Suite 501. Premium service required. Fresh towels, amenities restock, and turndown service.",
    timestamp: "1 hour ago",
    isPinned: true,
    isRead: false,
    dueTime: "2:00 PM",
  },
  {
    id: "3",
    type: "maintenance",
    status: "pending",
    sender: "Maintenance Team",
    senderRole: "System",
    title: "Work Order #4521 - Faucet Repair",
    description: "Bathroom faucet in Room 412 is leaking. Replacement parts ordered. Estimated completion: 4 PM.",
    timestamp: "2 hours ago",
    isPinned: false,
    isRead: true,
  },
  {
    id: "4",
    type: "task",
    status: "pending",
    sender: "Manager - Sarah Chen",
    senderRole: "Manager",
    title: "Lobby Area Refresh",
    description: "Vacuum and mop lobby floors. Wipe down all furniture. Restock refreshment station. Complete before 5 PM.",
    timestamp: "3 hours ago",
    isPinned: false,
    isRead: true,
    dueTime: "5:00 PM",
  },
  {
    id: "5",
    type: "report",
    status: "done",
    sender: "System",
    senderRole: "System",
    title: "Task Completed - Pool Area",
    description: "Your task 'Pool area cleaning' has been marked as complete by supervisor. Great work!",
    timestamp: "4 hours ago",
    isPinned: false,
    isRead: true,
  },
  {
    id: "6",
    type: "alert",
    status: "new",
    sender: "Safety System",
    senderRole: "System",
    title: "Safety Briefing Reminder",
    description: "Monthly fire safety drill scheduled for tomorrow at 10 AM. Attendance is mandatory. Meet at main lobby.",
    timestamp: "5 hours ago",
    isPinned: false,
    isRead: false,
    dueTime: "10:00 AM (Tomorrow)",
  },
  {
    id: "7",
    type: "message",
    status: "message",
    sender: "Colleague - John Davis",
    senderRole: "Staff",
    title: "Shift Swap Request",
    description: "Hi! Could we swap our shifts next Tuesday? I have a doctor appointment. I'll cover your Saturday shift.",
    timestamp: "Yesterday",
    isPinned: false,
    isRead: true,
  },
];

function MessageCard({ message }: { message: Message }) {
  const config = typeConfig[message.type];
  const status = statusConfig[message.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200 overflow-hidden group cursor-pointer ${message.isPinned ? 'ring-2 ring-amber-400/30' : ''}`}
    >
      <div className={`flex border-l-4 ${config.borderColor}`}>
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center`}>
                <Icon className="w-4 h-4" style={{ color: config.color }} />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500">{message.sender}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              {!message.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
          </div>
          
          <h3 className="text-slate-900 font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">
            {message.title}
          </h3>
          <p className="text-slate-500 text-xs line-clamp-2 mb-3">
            {message.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {message.timestamp}
              {message.dueTime && (
                <span className="text-amber-600 font-medium">• Due {message.dueTime}</span>
              )}
            </div>
            {message.type === "task" && (
              <button className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                Start
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-full bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-slate-900 font-semibold text-base mb-2">All caught up!</h3>
      <p className="text-slate-500 text-center text-sm">
        No pending tasks or messages.
      </p>
    </div>
  );
}

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredMessages = mockMessages.filter((msg) => {
    if (activeTab === "unread" && msg.isRead) return false;
    if (activeTab === "tasks" && msg.type !== "task") return false;
    if (activeTab === "messages" && msg.type !== "message") return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return msg.title.toLowerCase().includes(search) || 
             msg.description.toLowerCase().includes(search) ||
             msg.sender.toLowerCase().includes(search);
    }
    return true;
  });

  const unreadCount = mockMessages.filter(m => !m.isRead).length;
  const urgentCount = mockMessages.filter(m => m.status === "urgent").length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">View your assigned tasks and messages</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">
                {mockMessages.filter(m => m.type === "task" && m.status !== "done").length}
              </div>
              <div className="text-xs text-slate-500">Active Tasks</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{urgentCount}</div>
              <div className="text-xs text-slate-500">Urgent</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{unreadCount}</div>
              <div className="text-xs text-slate-500">Unread</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border border-slate-200/60 shadow-sm w-fit">
        {[
          { key: "all", label: "All" },
          { key: "tasks", label: "Tasks" },
          { key: "messages", label: "Messages" },
          { key: "unread", label: "Unread" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredMessages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <MessageCard key={msg.id} message={msg} />
          ))}
        </div>
      )}
    </div>
  );
}