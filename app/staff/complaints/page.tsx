"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, AlertCircle, CheckCircle2, Clock, X } from "lucide-react";
import { toast } from "sonner";

interface StaffComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  roomNumber?: string;
  department: string;
}

const categories = ["Housekeeping", "Maintenance", "F&B", "Front Desk", "Security", "WiFi", "HVAC", "Other"];
const severities = ["Low", "Medium", "High", "Critical"];

export default function StaffComplaintsPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [complaints, setComplaints] = useState<StaffComplaint[]>([
    {
      id: "#CMP-10480",
      title: "Room 305 - AC Not Cooling",
      description: "Guest reported AC is not working properly. Room temperature is uncomfortably warm.",
      category: "Maintenance",
      severity: "High",
      status: "in_progress",
      createdAt: "Today, 08:30 AM",
      roomNumber: "305",
      department: "Maintenance",
    },
    {
      id: "#CMP-10475",
      title: "Minibar Not Restocked",
      description: "Room 412 minibar was empty upon guest arrival despite being a paid service.",
      category: "Housekeeping",
      severity: "Medium",
      status: "resolved",
      createdAt: "Yesterday, 03:45 PM",
      roomNumber: "412",
      department: "Housekeeping",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    severity: "Medium",
    roomNumber: "",
  });

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newComplaint: StaffComplaint = {
      id: `#CMP-${10480 + complaints.length + 1}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      severity: formData.severity,
      status: "open",
      createdAt: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
      roomNumber: formData.roomNumber || undefined,
      department: formData.category,
    };
    setComplaints([newComplaint, ...complaints]);
    setFormData({ title: "", description: "", category: "", severity: "Medium", roomNumber: "" });
    setShowForm(false);
    toast.success("Complaint submitted successfully");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-100 text-red-700 border-red-200";
      case "High": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Medium": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Low": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-emerald-500";
      case "in_progress": return "bg-amber-500";
      case "open": return "bg-blue-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Complaints</h2>
          <p className="text-sm text-slate-500 mt-1">Create and view your submitted complaints.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" /> New Complaint
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or ID..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No complaints found</p>
            <p className="text-slate-400 text-sm mt-1">Submit your first complaint to get started</p>
          </div>
        ) : (
          filtered.map((complaint) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl border p-5 shadow-sm ${
                complaint.status === "resolved" ? "border-emerald-200" : "border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                    {complaint.category}
                  </span>
                  <span className="text-xs text-slate-400">{complaint.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getSeverityColor(complaint.severity)}`}>
                    {complaint.severity}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(complaint.status)}`} />
                  <span className="text-xs font-medium text-slate-500 capitalize">
                    {complaint.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{complaint.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">{complaint.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {complaint.createdAt}
                </span>
                {complaint.roomNumber && <span>Room {complaint.roomNumber}</span>}
                {complaint.status === "resolved" && (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Submit New Complaint</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about the complaint"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
                  >
                    {severities.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Number (optional)</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. 305"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}