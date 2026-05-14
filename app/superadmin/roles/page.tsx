"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield, Plus, CheckCircle2, XCircle, Edit, Trash2, X,
  Crown, Briefcase, User, Settings, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { superadminAPI, Role, CreateRolePayload } from "@/lib/api/superadmin";

const permissions = [
  { id: "users", name: "Users" },
  { id: "properties", name: "Properties" },
  { id: "billing", name: "Billing" },
  { id: "reports", name: "Reports" },
  { id: "settings", name: "Settings" },
  { id: "audit", name: "Audit Logs" },
  { id: "integrations", name: "Integrations" },
  { id: "api", name: "API Access" },
];

const getRoleIcon = (name: string) => {
  switch (name) {
    case "Superadmin": return <Shield className="w-5 h-5 text-white" />;
    case "Owner": return <Crown className="w-5 h-5 text-white" />;
    case "Manager": return <Briefcase className="w-5 h-5 text-white" />;
    case "Staff": return <User className="w-5 h-5 text-white" />;
    default: return <Settings className="w-5 h-5 text-white" />;
  }
};

export default function RolesPermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [createForm, setCreateForm] = useState<CreateRolePayload>({ name: "", description: "", permissions: [] });
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await superadminAPI.listRoles();
      setRoles(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const handleCreate = async () => {
    if (!createForm.name) return toast.error("Role name is required");
    try {
      setSaving(true);
      await superadminAPI.createRole(createForm);
      toast.success("Role created");
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "", permissions: [] });
      fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create role");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingRole) return;
    try {
      setSaving(true);
      await superadminAPI.updateRole(editingRole.id, { description: editDescription });
      toast.success("Role updated");
      setEditingRole(null);
      fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role? This cannot be undone.")) return;
    try {
      await superadminAPI.deleteRole(id);
      toast.success("Role deleted");
      fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete role");
    }
  };

  const stats = {
    totalRoles: roles.length,
    permissionsDefined: permissions.length,
    customRoles: roles.filter((r) => !r.is_system).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            Roles & Permissions
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">Configure access control and user roles</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Create Role
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Total Roles</p>
          <p className="text-2xl font-bold text-black mt-1">{stats.totalRoles}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Permissions Defined</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.permissionsDefined}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Custom Roles Created</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.customRoles}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {roles.map((role, i) => (
            <motion.div key={role.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${role.color || "bg-neutral-500"} rounded-lg flex items-center justify-center`}>
                    {getRoleIcon(role.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-black">{role.name}</h3>
                    <span className={`text-xs ${role.is_system ? "text-blue-600" : "text-neutral-500"}`}>
                      {role.is_system ? "System Role" : "Custom Role"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{role.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-black/10">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-black">{role.user_count}</p>
                    <p className="text-xs text-neutral-500">Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-black">{role.permission_count}</p>
                    <p className="text-xs text-neutral-500">Permissions</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingRole(role); setEditDescription(role.description); }}
                    className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-neutral-600" />
                  </button>
                  {!role.is_system && (
                    <button onClick={() => handleDelete(role.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {roles.length === 0 && (
            <div className="col-span-3 py-12 text-center text-sm text-neutral-400">No roles found</div>
          )}
        </div>
      )}

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 border-b border-black/10">
          <h2 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            Permission Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left p-4 text-sm font-medium text-neutral-500">Permission</th>
                {roles.slice(0, 5).map((role) => (
                  <th key={role.id} className="text-center p-4 text-sm font-medium text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 ${role.color || "bg-neutral-500"} rounded`} />
                      {role.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm.id} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                  <td className="p-4 font-medium text-black">{perm.name}</td>
                  {roles.slice(0, 5).map((role) => (
                    <td key={role.id} className="p-4 text-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-black/5">
                <td className="p-4 text-sm text-neutral-500">Legend:</td>
                <td colSpan={5} className="p-4">
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Read</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Write</span>
                    <span className="flex items-center gap-1"><XCircle className="w-4 h-4 text-neutral-300" /> No Access</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Create Custom Role</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role Name</label>
                <input type="text" placeholder="Enter role name" value={createForm.name}
                  onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea placeholder="Describe what this role can do..." rows={3} value={createForm.description}
                  onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create Role
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingRole(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Edit Role</h2>
              <button onClick={() => setEditingRole(null)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-xl text-white">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${editingRole.color || "bg-neutral-500"} rounded-lg flex items-center justify-center`}>
                    {getRoleIcon(editingRole.name)}
                  </div>
                  <div>
                    <h3 className="font-bold">{editingRole.name}</h3>
                    <p className="text-sm text-neutral-300">{editingRole.is_system ? "System Role" : "Custom Role"}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditingRole(null)} className="flex-1 px-4 py-2.5 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">Cancel</button>
                <button onClick={handleEdit} disabled={saving} className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
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
