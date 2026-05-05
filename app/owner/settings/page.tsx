"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usersAPI } from "@/lib/api/users";
import { useAuthStore } from "@/store/authStore";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function SettingsPage() {
  const { user: authUser } = useAuthStore();
  const [tab, setTab] = useState("profile");

  // Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // Security
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const res = await usersAPI.me();
      setFirstName(res.data.first_name ?? "");
      setLastName(res.data.last_name ?? "");
      setPhone(res.data.phone_number ?? "");
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await usersAPI.updateMe({ first_name: firstName, last_name: lastName, phone_number: phone });
      toast.success("Profile saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) { toast.error("Passwords do not match"); return; }
    if (newPwd.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setPwdSaving(true);
    try {
      await usersAPI.changePassword({ current_password: currentPwd, new_password: newPwd });
      toast.success("Password updated");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update password");
    } finally {
      setPwdSaving(false);
    }
  };

  const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || authUser?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Settings</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Manage your account and platform preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-2">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-0.5 ${tab === t.id ? "bg-gradient-to-r from-black/10 to-neutral-700/10 text-black" : "text-neutral-600 hover:bg-white/50"}`}
                style={{ fontWeight: tab === t.id ? 600 : 400 }}>
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {tab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
              <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Profile Information</h2>

              {profileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-black to-neutral-700 flex items-center justify-center text-white" style={{ fontWeight: 800, fontSize: "1.3rem" }}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs mt-1.5">Avatar uses initials from your name</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>First Name</label>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)}
                        className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
                    </div>
                    <div>
                      <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Last Name</label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)}
                        className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
                    </div>
                    <div>
                      <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Email Address</label>
                      <input value={authUser?.email ?? ""} disabled
                        className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-neutral-400 focus:outline-none cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Phone Number</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 000 0000"
                        className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSaveProfile} disabled={profileSaving}
                    className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm shadow-md bg-black text-white disabled:opacity-50" style={{ fontWeight: 600 }}>
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {profileSaving ? "Saving…" : "Save Changes"}
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {tab === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
              <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Daily Revenue Summary", desc: "Receive a daily email with revenue metrics", enabled: true },
                  { label: "KRA Compliance Alerts", desc: "Get notified when compliance drops below 80%", enabled: true },
                  { label: "Low Stock Alerts", desc: "Alert when inventory falls below minimum level", enabled: true },
                  { label: "Staff Attendance", desc: "Daily attendance summary report", enabled: false },
                  { label: "Task Overdue Alerts", desc: "Immediate notification for overdue KRA tasks", enabled: true },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-black/10">
                    <div>
                      <p className="text-black text-sm" style={{ fontWeight: 600 }}>{n.label}</p>
                      <p className="text-neutral-400 text-xs mt-0.5">{n.desc}</p>
                    </div>
                    <div className={`relative cursor-pointer rounded-full transition-colors ${n.enabled ? "bg-[#3B82F6]" : "bg-black/[0.06]"}`} style={{ width: "44px", height: "24px" }}>
                      <div className={`absolute top-1 w-4 h-4 bg-white/70 backdrop-blur rounded-full shadow transition-all ${n.enabled ? "left-6" : "left-1"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "security" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
              <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Change Password</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Current Password</label>
                  <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••"
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 transition-all" />
                </div>
                <div>
                  <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>New Password</label>
                  <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••"
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 transition-all" />
                  <p className="text-neutral-400 text-xs mt-1">Minimum 8 characters with uppercase, lowercase, and digit</p>
                </div>
                <div>
                  <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Confirm New Password</label>
                  <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••"
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 transition-all" />
                </div>
                <button onClick={handleChangePassword} disabled={pwdSaving || !currentPwd || !newPwd || !confirmPwd}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm shadow-md disabled:opacity-50" style={{ fontWeight: 600 }}>
                  {pwdSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {pwdSaving ? "Updating…" : "Update Password"}
                </button>
              </div>
            </motion.div>
          )}

          {tab === "billing" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
              <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Billing & Plan</h2>
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#EEF2FF] rounded-2xl p-6 border border-black/10 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-500 text-xs mb-0.5">Current Plan</p>
                    <p className="text-black" style={{ fontWeight: 800, fontSize: "1.3rem" }}>Professional</p>
                    <p className="text-neutral-500 text-sm mt-1">Contact support to manage billing</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
