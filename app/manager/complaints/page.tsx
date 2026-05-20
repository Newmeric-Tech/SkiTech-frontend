"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, AlertCircle, CheckCircle2, Clock, X, UserPlus, Eye } from "lucide-react";
import { toast } from "sonner";

interface TeamComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: "open" | "in_progress" | "resolved" | "escalated";
  createdAt: string;
  roomNumber?: string;
  department: string;
  reportedBy: string;
  assignedTo?: string;
}

const categories = ["Housekeeping", "Maintenance", "F&B", "Front Desk", "Security", "WiFi", "HVAC", "Other"];
const severities = ["Low", "Medium", "High", "Critical"];
const teamMembers = ["Fatima Al-Hassan", "Ahmed Khalid", "Raj Patel", "Sarah Mitchell", "James Lee", "Maria Santos"];

export default function ManagerComplaintsPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<TeamComplaint | null>(null);

  const [complaints, setComplaints] = useState<TeamComplaint[]>([
    {
      id: "#CMP-10492",
      title: "Room 402 - Water Leakage",
      description: "Guest reported water dripping from the ceiling in the bathroom. Possible pipe burst on the floor above.",
      category: "Maintenance",
      severity: "High",
      status: "open",
      createdAt: "Today, 08:45 AM",
      roomNumber: "402",
      department: "Maintenance",
      reportedBy: "Sarah Mitchell",
    },
    {
      id: "#CMP-10495",
      title: "Suite 22 - Smart Lock Failure",
      description: "RFID reader is not responding to keycards. Guest is currently waiting in the lobby.",
      category: "Maintenance",
      severity: "Critical",
      status: "in_progress",
      createdAt: "Today, 09:12 AM",
      roomNumber: "22",
      department: "Maintenance",
      reportedBy: "James Lee",
      assignedTo: "Raj Patel",
    },
    {
      id: "#CMP-10501",
      title: "Room 1105 - Incomplete Turnout",
      description: "Guest checked in and found minibar not restocked and towels missing. VIP Platinum member.",
      category: "Housekeeping",
      severity: "High",
      status: "open",
      createdAt: "Today, 10:30 AM",
      roomNumber: "1105",
      department: "Housekeeping",
      reportedBy: "Fatima Al-Hassan",
    },
    {
      id: "#CMP-10480",
      title: "Room 305 - AC Not Cooling",
      description: "Guest reported AC is not working properly.",
      category: "Maintenance",
      severity: "High",
      status: "resolved",
      createdAt: "Yesterday, 08:30 AM",
      roomNumber: "305",
      department: "Maintenance",
      reportedBy: "Raj Patel",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    severity: "Medium",
    roomNumber: "",
    assignedTo: "",
  });

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesDept = filterDept === "all" || c.department === filterDept;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newComplaint: TeamComplaint = {
      id: `#CMP-${10500 + complaints.length + 1}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      severity: formData.severity,
      status: "open",
      createdAt: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
      roomNumber: formData.roomNumber || undefined,
      department: formData.category,
      reportedBy: "You",
      assignedTo: formData.assignedTo || undefined,
    };
    setComplaints([newComplaint, ...complaints]);
    setFormData({ title: "", description: "", category: "", severity: "Medium", roomNumber: "", assignedTo: "" });
    setShowForm(false);
    toast.success("Complaint created successfully");
  };

  const handleStatusChange = (id: string, newStatus: TeamComplaint["status"]) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
  };

  const handleAssign = (id: string, assignee: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, assignedTo: assignee } : c));
    toast.success(`Assigned to ${assignee}`);
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "resolved": return "bg-emerald-100 text-emerald-700";
      case "in_progress": return "bg-amber-100 text-amber-700";
      case "escalated": return "bg-red-100 text-red-700";
      case "open": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === "open").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team Complaints</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track all complaints in your team.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" /> New Complaint
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "#3B82F6" },
          { label: "Open", value: stats.open, color: "#3B82F6" },
          { label: "In Progress", value: stats.inProgress, color: "#F59E0B" },
          { label: "Resolved", value: stats.resolved, color: "#10B981" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, ID or reporter..."
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
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
        >
          <option value="all">All Departments</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No complaints found</p>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                    {complaint.category}
                  </span>
                  <span className="text-xs text-slate-400">{complaint.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getSeverityColor(complaint.severity)}`}>
                    {complaint.severity}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${getStatusStyle(complaint.status)}`}>
                  {complaint.status.replace("_", " ")}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{complaint.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">{complaint.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {complaint.createdAt}
                    </span>
                    <span>By: <span className="text-slate-600">{complaint.reportedBy}</span></span>
                    {complaint.roomNumber && <span>Room {complaint.roomNumber}</span>}
                    {complaint.assignedTo && (
                      <span>Assigned: <span className="text-slate-600">{complaint.assignedTo}</span></span>
                    )}
                  </div>
                </div>

                {complaint.status !== "resolved" && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
                      title="Manage"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="font-bold text-slate-900">Create New Complaint</h3>
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
                  placeholder="Provide detailed information"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g. 305"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                  Create Complaint
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Manage Complaint</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Title</p>
                <p className="font-semibold text-slate-900">{selectedComplaint.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Change Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["open", "in_progress", "escalated", "resolved"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => { handleStatusChange(selectedComplaint.id, s); setSelectedComplaint(null); }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedComplaint.status === s
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Staff</label>
                <select
                  onChange={(e) => { handleAssign(selectedComplaint.id, e.target.value); setSelectedComplaint(null); }}
                  value={selectedComplaint.assignedTo || ""}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-300"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}