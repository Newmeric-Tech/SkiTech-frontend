"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Settings,
  HelpCircle,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  ChevronRight,
  MoreHorizontal,
  Send,
  Paperclip,
  Filter,
  Pin,
  Archive,
  Trash2,
  User,
  Building2,
  Wrench,
  DollarSign,
  ClipboardList,
  Package,
  TrendingUp,
  Shield,
  FileText,
  Image,
  Zap,
  X,
  ArrowLeft,
  Reply,
  Forward
} from "lucide-react";

type MessageType = 
  | "task" 
  | "approval" 
  | "maintenance" 
  | "vip" 
  | "alert" 
  | "financial" 
  | "report" 
  | "inventory" 
  | "message";

type MessageStatus = "new" | "pending" | "urgent" | "approved" | "message";

interface Message {
  id: string;
  type: MessageType;
  status: MessageStatus;
  sender: string;
  senderRole: string;
  receiver: string;
  receiverRole: string;
  title: string;
  description: string;
  timestamp: string;
  isPinned: boolean;
  isRead: boolean;
  actions?: string[];
  attachments?: number;
}

const typeConfig: Record<MessageType, { color: string; bg: string; icon: any; borderColor: string }> = {
  task: { color: "#3B82F6", bg: "bg-blue-50", icon: ClipboardList, borderColor: "border-l-blue-500" },
  approval: { color: "#8B5CF6", bg: "bg-violet-50", icon: CheckCircle2, borderColor: "border-l-violet-500" },
  maintenance: { color: "#F59E0B", bg: "bg-amber-50", icon: Wrench, borderColor: "border-l-amber-500" },
  vip: { color: "#EC4899", bg: "bg-pink-50", icon: Star, borderColor: "border-l-pink-500" },
  alert: { color: "#EF4444", bg: "bg-red-50", icon: Zap, borderColor: "border-l-red-500" },
  financial: { color: "#10B981", bg: "bg-emerald-50", icon: DollarSign, borderColor: "border-l-emerald-500" },
  report: { color: "#6366F1", bg: "bg-indigo-50", icon: FileText, borderColor: "border-l-indigo-500" },
  inventory: { color: "#14B8A6", bg: "bg-teal-50", icon: Package, borderColor: "border-l-teal-500" },
  message: { color: "#64748B", bg: "bg-slate-50", icon: MessageSquare, borderColor: "border-l-slate-400" },
};

const statusConfig: Record<MessageStatus, { label: string; bg: string; text: string; border: string }> = {
  new: { label: "New", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  urgent: { label: "Urgent", bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  message: { label: "Message", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

const mockMessages: Message[] = [
  {
    id: "1",
    type: "vip",
    status: "new",
    sender: "Sarah Johnson",
    senderRole: "Guest",
    receiver: "You",
    receiverRole: "Manager",
    title: "VIP Guest Arrival Confirmation",
    description: "Mr. Robert Chen and family arriving tomorrow at 3 PM. Special dietary requirements noted. Suite 501 prepared with welcome amenities.",
    timestamp: "2 min ago",
    isPinned: true,
    isRead: false,
    actions: ["View", "Reply"],
    attachments: 2,
  },
  {
    id: "2",
    type: "approval",
    status: "urgent",
    sender: "Mike Thompson",
    senderRole: "Staff",
    receiver: "You",
    receiverRole: "Manager",
    title: "Overtime Approval Request",
    description: "Requesting 4 hours overtime for kitchen staff due to unexpected large event. Estimated additional cost: $240.",
    timestamp: "15 min ago",
    isPinned: true,
    isRead: false,
    actions: ["Approve", "Decline"],
  },
  {
    id: "3",
    type: "maintenance",
    status: "pending",
    sender: "Maintenance Team",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Manager",
    title: "HVAC Repair Required - Floor 3",
    description: "AC unit in rooms 301-305 not cooling properly. Technician scheduled for tomorrow morning. Parts may need ordering.",
    timestamp: "1 hour ago",
    isPinned: false,
    isRead: true,
    actions: ["View", "Order Parts"],
  },
  {
    id: "4",
    type: "task",
    status: "new",
    sender: "Lisa Wang",
    senderRole: "Manager",
    receiver: "You",
    receiverRole: "Manager",
    title: "Daily Briefing Task Assigned",
    description: "Complete morning briefing summary for today's all-staff meeting. Include yesterday's performance metrics and today's priorities.",
    timestamp: "2 hours ago",
    isPinned: false,
    isRead: false,
    actions: ["View", "Complete"],
  },
  {
    id: "5",
    type: "financial",
    status: "message",
    sender: "Finance Dept",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Manager",
    title: "Weekly Revenue Report Available",
    description: "Weekly revenue report for Week 18 is now available. Total revenue: $48,250 (+12% vs last week).",
    timestamp: "3 hours ago",
    isPinned: false,
    isRead: true,
    actions: ["View Report"],
  },
  {
    id: "6",
    type: "inventory",
    status: "urgent",
    sender: "Inventory System",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Manager",
    title: "Low Stock Alert - Housekeeping",
    description: "Towel inventory critically low (45 remaining). Previous order not yet delivered. Immediate reorder recommended.",
    timestamp: "4 hours ago",
    isPinned: false,
    isRead: false,
    actions: ["Order Now", "View Details"],
  },
  {
    id: "7",
    type: "report",
    status: "approved",
    sender: "John Davis",
    senderRole: "Staff",
    receiver: "You",
    receiverRole: "Manager",
    title: "Proof of Work - Pool Area Cleaning",
    description: "Completed deep cleaning of pool area and surrounding deck. All areas inspected and approved by supervisor.",
    timestamp: "5 hours ago",
    isPinned: false,
    isRead: true,
    actions: ["View Proof"],
    attachments: 5,
  },
  {
    id: "8",
    type: "alert",
    status: "pending",
    sender: "Security System",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Manager",
    title: "Security Alert - Unusual Access",
    description: "Multiple failed access attempts detected at staff entrance. Security team notified. Recommend reviewing access logs.",
    timestamp: "6 hours ago",
    isPinned: false,
    isRead: true,
    actions: ["Review", "Dismiss"],
  },
];

const mockMorningBriefing = [
  { time: "06:00", event: "Night shift ends", type: "shift" },
  { time: "06:30", event: "Morning shift begins", type: "shift" },
  { time: "07:00", event: "Kitchen opens for breakfast", type: "operation" },
  { time: "09:00", event: "Pool area cleaning", type: "task" },
  { time: "10:00", event: "VIP check-in: Suite 501", type: "guest" },
  { time: "12:00", event: "Lunch service begins", type: "operation" },
];

const mockKPIs = [
  { label: "Check-ins Today", value: "12", change: "+3", positive: true },
  { label: "Check-outs Today", value: "8", change: "+1", positive: true },
  { label: "Pending Tasks", value: "5", change: "-2", positive: true },
  { label: "Staff On Duty", value: "18/20", change: "90%", positive: true },
];

const mockActivityOverview = [
  { category: "Tasks Completed", value: "24", total: "32", color: "#3B82F6" },
  { category: "Approvals Pending", value: "3", total: "8", color: "#F59E0B" },
  { category: "Messages Unread", value: "7", total: "24", color: "#8B5CF6" },
  { category: "Alerts Today", value: "2", total: "5", color: "#EF4444" },
];

function MessageCard({ message, onClick }: { message: Message; onClick: () => void }) {
  const config = typeConfig[message.type];
  const status = statusConfig[message.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200 cursor-pointer overflow-hidden group ${message.isPinned ? 'ring-2 ring-amber-400/30' : ''}`}
    >
      <div className={`flex border-l-4 ${config.borderColor}`}>
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                <Icon className="w-5 h-5" style={{ color: config.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{message.sender}</span>
                  <span className="text-xs text-slate-400">• {message.senderRole}</span>
                  {message.isPinned && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  To: {message.receiver}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              {!message.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
          </div>
          
          <h3 className="text-slate-900 font-semibold text-base mb-2 group-hover:text-blue-600 transition-colors">
            {message.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-4">
            {message.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {message.timestamp}
              </span>
              {message.attachments && (
                <span className="flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5" />
                  {message.attachments}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {message.actions?.map((action, i) => (
                <button
                  key={i}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    action === "Approve" || action === "View" || action === "Order Now"
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />
          <div className="h-4 w-full bg-slate-200 rounded mb-2" />
          <div className="h-4 w-2/3 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-slate-900 font-semibold text-lg mb-2">No messages found</h3>
      <p className="text-slate-500 text-center max-w-sm">
        {type === "unread" 
          ? "You're all caught up! No unread messages at the moment."
          : type === "mentions"
          ? "No messages where you're mentioned yet."
          : "Your inbox is empty. New messages will appear here."}
      </p>
    </div>
  );
}

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredMessages = mockMessages.filter((msg) => {
    if (activeTab === "unread" && msg.isRead) return false;
    if (activeTab === "mentions" && !msg.title.toLowerCase().includes("mention")) return false;
    if (activeTab === "dms" && msg.type !== "message") return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return msg.title.toLowerCase().includes(search) || 
             msg.description.toLowerCase().includes(search) ||
             msg.sender.toLowerCase().includes(search);
    }
    return true;
  });

  const pinnedMessages = filteredMessages.filter(m => m.isPinned);
  const unpinnedMessages = filteredMessages.filter(m => !m.isPinned);

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setIsMobileDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Inbox</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your messages and notifications</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-72 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Settings className="w-4 h-4 text-slate-600" />
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors relative">
            <HelpCircle className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border border-slate-200/60 shadow-sm w-fit">
        {["All", "Unread", "Mentions", "DMs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.toLowerCase()
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab}
            {tab === "Unread" && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {mockMessages.filter(m => !m.isRead).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockKPIs.map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-2xl font-bold text-slate-950">{kpi.value}</div>
                <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
                <div className={`text-xs mt-2 font-medium ${kpi.positive ? "text-emerald-600" : "text-red-600"}`}>
                  {kpi.change}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Activity Overview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Activity Overview</h3>
              <button className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                View Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockActivityOverview.map((item, i) => (
                <div key={i} className="text-center">
                  <div className="relative inline-block">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                      <circle 
                        cx="32" cy="32" r="28" 
                        stroke={item.color} 
                        strokeWidth="4" 
                        fill="none"
                        strokeDasharray={`${(parseInt(item.value) / parseInt(item.total)) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">{item.category}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Morning Briefing */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Morning Briefing</h3>
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="space-y-3">
              {mockMorningBriefing.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-12 text-xs font-medium text-slate-500">{item.time}</div>
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === "guest" ? "bg-pink-500" :
                    item.type === "task" ? "bg-blue-500" :
                    item.type === "shift" ? "bg-emerald-500" :
                    "bg-amber-500"
                  }`} />
                  <span className="text-sm text-slate-700">{item.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlight Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 bg-gradient-to-r from-slate-900 to-slate-700">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800')] bg-cover bg-center opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="relative z-10 p-6 h-full flex flex-col justify-end">
              <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">Featured</span>
              <h3 className="text-white text-xl font-bold mb-2">Monthly Performance Review</h3>
              <p className="text-slate-300 text-sm">Complete your monthly KRA submission by Friday</p>
              <button className="mt-4 w-fit px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
                View Report
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Messages</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredMessages.length === 0 ? (
              <EmptyState type={activeTab} />
            ) : (
              <div className="space-y-4">
                {pinnedMessages.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Pin className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-700">Pinned</span>
                    </div>
                    <div className="space-y-4">
                      {pinnedMessages.map((msg) => (
                        <MessageCard 
                          key={msg.id} 
                          message={msg} 
                          onClick={() => handleMessageClick(msg)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  {pinnedMessages.length > 0 && (
                    <div className="text-sm font-medium text-slate-700 mb-3">All Messages</div>
                  )}
                  <div className="space-y-4">
                    {unpinnedMessages.map((msg) => (
                      <MessageCard 
                        key={msg.id} 
                        message={msg} 
                        onClick={() => handleMessageClick(msg)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-center">
                <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-700">New Message</span>
              </button>
              <button className="p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-emerald-700">Approvals</span>
              </button>
              <button className="p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-center">
                <Archive className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-amber-700">Archived</span>
              </button>
              <button className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center">
                <Trash2 className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-slate-700">Trash</span>
              </button>
            </div>
          </div>

          {/* Unread Indicators */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Unread by Type</h3>
            <div className="space-y-3">
              {Object.entries(typeConfig).slice(0, 5).map(([type, config]) => {
                const count = mockMessages.filter(m => m.type === type && !m.isRead).length;
                if (count === 0) return null;
                return (
                  <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                        <config.icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Pending Actions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-700">Pending Approvals</span>
                </div>
                <span className="text-sm font-bold text-amber-700">3</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Awaiting Reply</span>
                </div>
                <span className="text-sm font-bold text-blue-700">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Detail Panel */}
      {isMobileDetailOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setIsMobileDetailOpen(false)}>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute right-0 top-0 bottom-0 w-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <button onClick={() => setIsMobileDetailOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold text-slate-900">Message Details</h3>
                <button className="p-2 hover:bg-slate-100 rounded-lg">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{selectedMessage.sender}</div>
                    <div className="text-sm text-slate-500">{selectedMessage.senderRole}</div>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">{selectedMessage.title}</h2>
                <p className="text-slate-600 mb-4">{selectedMessage.description}</p>
                <div className="text-sm text-slate-400">{selectedMessage.timestamp}</div>
              </div>
              <div className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-medium">
                    Reply
                  </button>
                  <button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl">
                    <Forward className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}