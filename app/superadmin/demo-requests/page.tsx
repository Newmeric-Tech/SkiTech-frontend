"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Mail, Phone, Building2, Users, CheckCircle2, X, Eye, XCircle, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  size: string;
  role: string;
  message: string;
  status: "pending" | "contacted" | "completed";
  createdAt: string;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("demo_requests");
    if (stored) {
      setRequests(JSON.parse(stored));
    }
  }, []);

  const updateStatus = (id: string, status: "pending" | "contacted" | "completed") => {
    const updated = requests.map(r => r.id === id ? { ...r, status } : r);
    setRequests(updated);
    localStorage.setItem("demo_requests", JSON.stringify(updated));
    setSelectedRequest(null);
  };

  const filtered = requests.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.company?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    contacted: requests.filter(r => r.status === "contacted").length,
    completed: requests.filter(r => r.status === "completed").length,
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "contacted": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-emerald-100 text-emerald-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          Demo Requests
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">
          View and manage demo requests from potential customers
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-black/10 rounded-xl p-4">
          <p className="text-sm text-neutral-500">Total Requests</p>
          <p className="text-2xl font-bold text-black mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-black/10 rounded-xl p-4">
          <p className="text-sm text-neutral-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white border border-black/10 rounded-xl p-4">
          <p className="text-sm text-neutral-500">Contacted</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.contacted}</p>
        </div>
        <div className="bg-white border border-black/10 rounded-xl p-4">
          <p className="text-sm text-neutral-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Charts Section */}
      {requests.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <div className="bg-white border border-black/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-4">Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Pending", value: stats.pending },
                      { name: "Contacted", value: stats.contacted },
                      { name: "Completed", value: stats.completed },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {["pending", "contacted", "completed"].map((entry, index) => (
                      <Cell key={entry} fill={["#F59E0B", "#3B82F6", "#10B981"][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-neutral-600">Pending ({stats.pending})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-neutral-600">Contacted ({stats.contacted})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-neutral-600">Completed ({stats.completed})</span>
              </div>
            </div>
          </div>

          {/* Properties Distribution Bar Chart */}
          <div className="bg-white border border-black/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-4">Properties Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "1 property", count: requests.filter(r => r.size === "1 property").length },
                    { name: "2-5", count: requests.filter(r => r.size === "2–5 properties").length },
                    { name: "6-15", count: requests.filter(r => r.size === "6–15 properties").length },
                    { name: "16+", count: requests.filter(r => r.size === "16+ properties").length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Roles Distribution */}
          <div className="bg-white border border-black/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-4">Roles Distribution</h3>
            <div className="space-y-3">
              {["Owner", "Manager", "Operations Director", "IT/Tech", "Other"].map((role, i) => {
                const count = requests.filter(r => r.role === role).length;
                const percentage = requests.length > 0 ? Math.round((count / requests.length) * 100) : 0;
                return (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">{role}</span>
                      <span className="text-neutral-900 font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="bg-black h-2 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-black/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-4">Recent Requests</h3>
            <div className="space-y-3">
              {requests.slice(0, 5).reverse().map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 text-xs font-medium">
                      {r.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">{r.name}</p>
                      <p className="text-xs text-neutral-500">{r.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs px-2 py-1 rounded-full ${
                      r.status === "pending" ? "bg-amber-100 text-amber-700" :
                      r.status === "contacted" ? "bg-blue-100 text-blue-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {r.status}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Table */}
        <div className="p-4 border-b border-black/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-black/10 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">
              {requests.length === 0 ? "No demo requests yet" : "No requests match your search"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Company</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Properties</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Date</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-black/5 hover:bg-black/5"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 font-medium text-sm">
                          {r.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-black">{r.name}</p>
                          <p className="text-xs text-neutral-500">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{r.company || "—"}</td>
                    <td className="p-4 text-sm text-neutral-600">{r.size || "—"}</td>
                    <td className="p-4 text-sm text-neutral-600">{r.role || "—"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-neutral-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-neutral-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRequest(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                Request Details
              </h2>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-black/5 rounded-lg">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                <div className="w-14 h-14 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-700 font-bold text-lg">
                  {selectedRequest.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-black">{selectedRequest.name}</h3>
                  <p className="text-sm text-neutral-500">Requested on {new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border border-black/10 rounded-lg">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Email</p>
                    <p className="text-sm text-black">{selectedRequest.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-black/10 rounded-lg">
                  <Phone className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Phone</p>
                    <p className="text-sm text-black">{selectedRequest.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-black/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Company</p>
                    <p className="text-sm text-black">{selectedRequest.company || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-black/10 rounded-lg">
                  <Users className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Role</p>
                    <p className="text-sm text-black">{selectedRequest.role || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-black/10 rounded-lg">
                <p className="text-xs text-neutral-500 mb-1">Properties</p>
                <p className="text-sm text-black">{selectedRequest.size || "—"}</p>
              </div>

              {selectedRequest.message && (
                <div className="p-3 border border-black/10 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-1">Message</p>
                  <p className="text-sm text-black">{selectedRequest.message}</p>
                </div>
              )}

              <div className="pt-4 border-t border-black/10">
                <p className="text-sm font-medium text-black mb-2">Update Status</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(selectedRequest.id, "pending")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border ${
                      selectedRequest.status === "pending" ? "bg-amber-100 border-amber-300 text-amber-700" : "border-black/10 text-neutral-600 hover:bg-black/5"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateStatus(selectedRequest.id, "contacted")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border ${
                      selectedRequest.status === "contacted" ? "bg-blue-100 border-blue-300 text-blue-700" : "border-black/10 text-neutral-600 hover:bg-black/5"
                    }`}
                  >
                    Contacted
                  </button>
                  <button
                    onClick={() => updateStatus(selectedRequest.id, "completed")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border ${
                      selectedRequest.status === "completed" ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "border-black/10 text-neutral-600 hover:bg-black/5"
                    }`}
                  >
                    Completed
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