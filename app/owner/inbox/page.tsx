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
  Forward,
  BarChart3
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
    type: "financial",
    status: "new",
    sender: "Finance Team",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Owner",
    title: "Monthly Revenue Report - April",
    description: "Total revenue for April: $485,000 (+18% vs March). Properties performing above target: 4/6.",
    timestamp: "1 hour ago",
    isPinned: true,
    isRead: false,
    actions: ["View Report"],
  },
  {
    id: "2",
    type: "approval",
    status: "urgent",
    sender: "Property Manager",
    senderRole: "Manager",
    receiver: "You",
    receiverRole: "Owner",
    title: "Renovation Budget Approval Needed",
    description: "Requesting $75,000 for lobby renovation at Grand Horizon. Work scheduled for June. ROI expected: 12% increase in bookings.",
    timestamp: "2 hours ago",
    isPinned: true,
    isRead: false,
    actions: ["Approve", "Decline", "Review"],
  },
  {
    id: "3",
    type: "report",
    status: "approved",
    sender: "Operations Team",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Owner",
    title: "Q1 Performance Summary",
    description: "Quarterly performance report available. All KPIs met or exceeded. Staff satisfaction: 92%.",
    timestamp: "5 hours ago",
    isPinned: false,
    isRead: true,
    actions: ["View Report"],
  },
  {
    id: "4",
    type: "alert",
    status: "pending",
    sender: "Security System",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Owner",
    title: "Property Access Audit Required",
    description: "Quarterly security audit reveals 3 areas needing attention. Recommend review within 48 hours.",
    timestamp: "8 hours ago",
    isPinned: false,
    isRead: false,
    actions: ["Review", "Dismiss"],
  },
  {
    id: "5",
    type: "maintenance",
    status: "message",
    sender: "Maintenance Supervisor",
    senderRole: "Manager",
    receiver: "You",
    receiverRole: "Owner",
    title: "Annual HVAC Service Complete",
    description: "All properties' HVAC systems serviced. Total cost: $12,400. 2 units require part replacement next quarter.",
    timestamp: "1 day ago",
    isPinned: false,
    isRead: true,
    actions: ["View Details"],
  },
  {
    id: "6",
    type: "task",
    status: "new",
    sender: "HR Department",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Owner",
    title: "Staff Review Scheduled",
    description: "Quarterly staff performance reviews due next week. 45 staff across all properties. Managers to submit reports by Friday.",
    timestamp: "1 day ago",
    isPinned: false,
    isRead: false,
    actions: ["View", "Remind"],
  },
  {
    id: "7",
    type: "inventory",
    status: "pending",
    sender: "Procurement Team",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Owner",
    title: "Bulk Order Approval - Amenities",
    description: "Monthly amenities restock order: $8,500. Includes toiletries, linens, and cleaning supplies. Savings: 15% vs retail.",
    timestamp: "2 days ago",
    isPinned: false,
    isRead: true,
    actions: ["Approve", "Decline"],
  },
  {
    id: "8",
    type: "vip",
    status: "message",
    sender: "Guest Relations",
    senderRole: "System",
    receiver: "You",
    receiverRole: "Owner",
    title: "VIP Guest Feedback - 5-Star Review",
    description: "Guest from Skyline Suites left exceptional review. Praised staff, amenities, and service. Requesting repeat booking.",
    timestamp: "2 days ago",
    isPinned: false,
    isRead: true,
    actions: ["View Review"],
  },
];

const mockKPIs = [
  { label: "Total Revenue", value: "$485K", change: "+18%", positive: true },
  { label: "Occupancy Rate", value: "87%", change: "+5%", positive: true },
  { label: "Pending Approvals", value: "4", change: "-2", positive: true },
  { label: "Active Properties", value: "6/6", change: "100%", positive: true },
];

const mockActivityOverview = [
  { category: "Revenue Reports", value: "12", total: "15", color: "#10B981" },
  { category: "Approvals Needed", value: "4", total: "8", color: "#F59E0B" },
  { category: "Team Updates", value: "8", total: "20", color: "#3B82F6" },
  { category: "Guest Feedback", value: "6", total: "12", color: "#EC4899" },
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
                    action === "Approve" || action === "View Report" || action === "View"
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Inbox</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor your properties and business updates</p>
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
              <h3 className="font-bold text-slate-900 text-lg">Business Overview</h3>
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

          {/* Property Performance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Property Performance</h3>
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                This Month
              </span>
            </div>
            <div className="space-y-4">
              {[
                { name: "Grand Horizon Hotel", revenue: "$185K", occupancy: "92%", status: "excellent" },
                { name: "Skyline Suites", revenue: "$142K", occupancy: "88%", status: "good" },
                { name: "Harbor View Resort", revenue: "$98K", occupancy: "79%", status: "fair" },
              ].map((property, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{property.name}</div>
                      <div className="text-sm text-slate-500">{property.occupancy} occupancy</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{property.revenue}</div>
                    <div className="text-xs text-emerald-600">+12%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlight Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 bg-gradient-to-r from-emerald-900 to-emerald-700">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="relative z-10 p-6 h-full flex flex-col justify-end">
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">Quarterly Review</span>
              <h3 className="text-white text-xl font-bold mb-2">Q1 Business Performance</h3>
              <p className="text-emerald-100 text-sm">All properties exceeded revenue targets. Download full report.</p>
              <button className="mt-4 w-fit px-4 py-2 bg-white text-emerald-900 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors">
                Download Report
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
                        <MessageCard key={msg.id} message={msg} onClick={() => {}} />
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
                      <MessageCard key={msg.id} message={msg} onClick={() => {}} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-center">
                <BarChart3 className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-emerald-700">Reports</span>
              </button>
              <button className="p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors text-center">
                <CheckCircle2 className="w-5 h-5 text-violet-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-violet-700">Approvals</span>
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

          {/* Pending Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Pending Actions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-violet-200 bg-violet-50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-600" />
                  <span className="text-sm font-medium text-slate-700">Budget Approvals</span>
                </div>
                <span className="text-sm font-bold text-violet-700">2</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-700">Security Alerts</span>
                </div>
                <span className="text-sm font-bold text-amber-700">1</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Staff Reviews</span>
                </div>
                <span className="text-sm font-bold text-blue-700">45</span>
              </div>
            </div>
          </div>

          {/* Revenue by Type */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Revenue by Source</h3>
            <div className="space-y-3">
              {[
                { label: "Room Bookings", value: "$385K", percent: 79 },
                { label: "Food & Beverage", value: "$62K", percent: 13 },
                { label: "Amenities", value: "$38K", percent: 8 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900 rounded-full" 
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}