"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, X, Crown, Briefcase, User, Ban, CheckCircle2, Loader2, Mail, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { superadminAPI, SuperadminUser, InviteUserPayload } from "@/lib/api/superadmin";

const TAB_FILTERS = ["All", "Owner", "Manager", "Staff", "Suspended", "Invited"];

const getRoleIcon = (role: string) => {
  switch (role) {
    case "Owner": return <Crown className="w-4 h-4" />;
    case "Manager": return <Briefcase className="w-4 h-4" />;
    case "Staff": return <User className="w-4 h-4" />;
    default: return <User className="w-4 h-4" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "Owner": return "bg-amber-100 text-amber-700 border-amber-200";
    case "Manager": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Staff": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default: return "bg-neutral-100 text-neutral-700 border-neutral-200";
  }
};

export default function AllUsers() {
  const [users, setUsers] = useState<SuperadminUser[]>([]);
  const [pendingUsers, setPendingUsers] = useState<SuperadminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SuperadminUser | null>(null);
  const [inviteForm, setInviteForm] = useState<InviteUserPayload>({ full_name: "", email: "", role: "Owner" });
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (activeTab !== "All" && activeTab !== "Suspended" && activeTab !== "Invited") params.role = activeTab;
      if (activeTab === "Suspended") params.status = "suspended";

      const [usersRes, pendingRes] = await Promise.all([
        superadminAPI.listUsers(params),
        superadminAPI.listPendingInvites(),
      ]);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.full_name) return toast.error("Fill all required fields");
    try {
      setSaving(true);
      await superadminAPI.inviteUser(inviteForm);
      toast.success(`Invite sent to ${inviteForm.email} — OTP & temporary password emailed.`);
      setShowInviteModal(false);
      setInviteForm({ full_name: "", email: "", role: "Owner" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send invite");
    } finally {
      setSaving(false);
    }
  };

  const handleResendInvite = async (user: SuperadminUser) => {
    setResendingId(user.id);
    try {
      await superadminAPI.resendInvite(user.email);
      toast.success(`Invite resent to ${user.email}`);
    } catch (err: any) {
      toast.error("Failed to resend invite");
    } finally {
      setResendingId(null);
    }
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    try {
      setSaving(true);
      await superadminAPI.updateUserRole(editingUser.id, editRole);
      toast.success("Role updated");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async (user: SuperadminUser) => {
    try {
      if (user.status === "suspended") {
        await superadminAPI.activateUser(user.id);
        toast.success("User activated");
      } else {
        await superadminAPI.suspendUser(user.id);
        toast.success("User suspended");
      }
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Action failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await superadminAPI.deleteUser(id);
      toast.success("User deleted");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete user");
    }
  };

  const displayedUsers = activeTab === "Invited" ? pendingUsers : users;

  const stats = [
    { label: "Total Users", value: users.length, color: "text-black" },
    { label: "Active Today", value: users.filter((u) => u.last_active.includes("T") && new Date(u.last_active) > new Date(Date.now() - 86400000)).length, color: "text-emerald-600" },
    { label: "Pending Invites", value: pendingUsers.length, color: "text-amber-600" },
    { label: "Suspended", value: users.filter((u) => u.status === "suspended").length, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>All Users</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Manage users across all properties and roles</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 flex items-center gap-4 border-b border-black/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
            {TAB_FILTERS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === tab ? "bg-white text-black shadow-sm" : "text-neutral-600 hover:text-black"}`}>
                {tab === "Invited" && <Clock className="w-3.5 h-3.5" />}
                {tab}
                {tab === "Invited" && pendingUsers.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{pendingUsers.length}</span>
                )}
              </button>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Invite User
          </motion.button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
        ) : activeTab === "Invited" ? (
          /* ── Invited / Pending Tab ── */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  {["Name", "Email", "Role", "Invited At", "Status", "Actions"].map((h) => (
                    <th key={h} className={`p-4 text-sm font-medium text-neutral-500 ${h === "Status" || h === "Actions" ? "text-center" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-black/5 hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {u.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium text-black">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(u.role)}`}>
                        {getRoleIcon(u.role)}{u.role === "Tenant Admin" ? "Owner" : u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-neutral-500">
                      {u.invited_at ? new Date(u.invited_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit mx-auto">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleResendInvite(u)} disabled={resendingId === u.id} title="Resend invite"
                          className="p-2 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50">
                          {resendingId === u.id ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Mail className="w-4 h-4 text-amber-500" />}
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {pendingUsers.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-neutral-400">No pending invites</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── Active / All Users Tab ── */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  {["Name", "Email", "Role", "Property/Org", "Last Active", "Status", "Actions"].map((h) => (
                    <th key={h} className={`p-4 text-sm font-medium text-neutral-500 ${h === "Status" || h === "Actions" ? "text-center" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-black/5 hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium text-black">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}{user.role === "Tenant Admin" ? "Owner" : user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{user.property}</td>
                    <td className="p-4 text-sm text-neutral-500">{user.last_active}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {user.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditingUser(user); setEditRole(user.role); }} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-neutral-600" />
                        </button>
                        {user.status === "suspended" ? (
                          <button onClick={() => handleSuspend(user)} title="Remove suspension" className="p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </button>
                        ) : (
                          <button onClick={() => handleSuspend(user)} title="Suspend user" className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                            <Ban className="w-4 h-4 text-amber-500" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {displayedUsers.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-neutral-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Invite New User</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                <input type="text" placeholder="Enter full name" value={inviteForm.full_name}
                  onChange={(e) => setInviteForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                <input type="email" placeholder="Enter email address" value={inviteForm.email}
                  onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                <select value={inviteForm.role} onChange={(e) => setInviteForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
                  <option>Owner</option><option>Manager</option><option>Staff</option>
                </select>
              </div>
              <p className="text-xs text-neutral-400">An OTP and temporary password will be sent to the user's email.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">Cancel</button>
                <button onClick={handleInvite} disabled={saving} className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Send Invite
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-xl text-white">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                  {editingUser.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div><h3 className="text-lg font-bold">{editingUser.name}</h3><p className="text-neutral-300 text-sm">{editingUser.email}</p></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
                  <option>Owner</option><option>Manager</option><option>Staff</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">Cancel</button>
                <button onClick={handleSaveRole} disabled={saving} className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
