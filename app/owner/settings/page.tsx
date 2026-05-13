"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, Save, Loader2, Check, X, Zap, Building2, Users, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { usersAPI } from "@/lib/api/users";
import { subscriptionsAPI, MyPlan, SubscriptionPlan } from "@/lib/api/subscriptions";
import { useAuthStore } from "@/store/authStore";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const FEATURE_LABELS = [
  // Core
  { key: "reports",              label: "Reports & Analytics",    desc: "Revenue, occupancy, and trend reports",         soon: false },
  { key: "kra",                  label: "KRA Monitoring",          desc: "Key result area performance tracking",          soon: false },
  { key: "sop",                  label: "SOP Management",          desc: "Standard operating procedure workflows",        soon: false },
  // Operational
  { key: "attendance",           label: "Attendance Tracking",     desc: "Staff punch-in/out and daily reports",          soon: false },
  { key: "vendor_management",    label: "Vendor Management",       desc: "Manage suppliers and purchase orders",          soon: false },
  { key: "inventory",            label: "Inventory Management",    desc: "Track stock levels and reorder alerts",         soon: false },
  { key: "governance",           label: "Governance & Compliance", desc: "Audit logs and compliance tracking",            soon: false },
  // Upcoming
  { key: "employee_scheduling",  label: "Employee Scheduling",     desc: "Shift planning and roster management",          soon: true  },
  { key: "chat",                 label: "Team Chat",               desc: "In-app messaging for staff and managers",       soon: true  },
  { key: "employee_ranking",     label: "Employee Ranking",        desc: "Performance-based ranking and leaderboards",    soon: true  },
  { key: "master_log",           label: "Master Log Book",         desc: "Digital log book for daily operations",         soon: true  },
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

  // Billing
  const [myPlan, setMyPlan] = useState<MyPlan | null>(null);
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);

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

  const loadBilling = useCallback(async () => {
    if (billingLoading || myPlan) return;
    setBillingLoading(true);
    try {
      const [planRes, plansRes] = await Promise.all([
        subscriptionsAPI.myPlan(),
        subscriptionsAPI.plans(),
      ]);
      setMyPlan(planRes.data);
      setAllPlans(plansRes.data);
    } catch {
      toast.error("Failed to load billing information");
    } finally {
      setBillingLoading(false);
    }
  }, [billingLoading, myPlan]);

  useEffect(() => {
    if (tab === "billing") loadBilling();
  }, [tab, loadBilling]);

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
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {billingLoading ? (
                <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-16 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
                </div>
              ) : myPlan ? (
                <>
                  {/* Current Plan Card */}
                  <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
                    <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Current Plan</h2>
                    <div className="bg-gradient-to-br from-black to-neutral-800 rounded-2xl p-6 text-white mb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-amber-400" fill="currentColor" />
                            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Active Subscription</span>
                          </div>
                          <p className="text-white font-bold" style={{ fontSize: "1.8rem" }}>{myPlan.plan.name}</p>
                          <p className="text-white/60 text-sm mt-1">
                            ₹{myPlan.plan.price.toLocaleString("en-IN")}<span className="text-white/40"> / month</span>
                          </p>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                          {myPlan.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-white/40" />
                          <span className="text-white/60 text-sm">
                            {myPlan.plan.max_properties ? `Up to ${myPlan.plan.max_properties} properties` : "Unlimited properties"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-white/40" />
                          <span className="text-white/60 text-sm">
                            {myPlan.plan.max_users ? `Up to ${myPlan.plan.max_users} users` : "Unlimited users"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div>
                      <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-4">Included Features</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {FEATURE_LABELS.map(({ key, label, desc, soon }) => {
                          const enabled = myPlan.features[key] === true;
                          return (
                            <div key={key} className={`flex items-start gap-3 p-3 rounded-xl border ${enabled ? "border-emerald-200/60 bg-emerald-50/50" : "border-black/5 bg-black/[0.02] opacity-40"}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${enabled ? "bg-emerald-500" : "bg-neutral-300"}`}>
                                {enabled ? <Check className="w-3.5 h-3.5 text-white" /> : <X className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-black">{label}</p>
                                  {soon && enabled && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 leading-none">COMING SOON</span>
                                  )}
                                </div>
                                <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Plan Comparison */}
                  {allPlans.length > 0 && (
                    <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-black" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Available Plans</h2>
                        <p className="text-xs text-neutral-400">Contact support to change your plan</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...allPlans].sort((a, b) => a.price - b.price).map((plan) => {
                          const isCurrent = plan.id === myPlan.plan.id;
                          const isUpgrade = plan.price > myPlan.plan.price;
                          const isFree = plan.price === 0;
                          return (
                            <div key={plan.id} className={`relative rounded-2xl border p-6 flex flex-col ${isCurrent ? "border-black bg-black text-white shadow-xl" : "border-black/10 bg-white/50"}`}>
                              {isCurrent && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20 whitespace-nowrap">
                                  Current Plan
                                </span>
                              )}
                              <div className="mb-5">
                                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isCurrent ? "text-white/50" : "text-neutral-400"}`}>
                                  {plan.name}
                                </p>
                                <p className={`font-bold leading-none ${isCurrent ? "text-white" : "text-black"}`} style={{ fontSize: "1.8rem" }}>
                                  {isFree && plan.name !== "Free" ? "Custom" : `₹${plan.price.toLocaleString("en-IN")}`}
                                  {!(isFree && plan.name !== "Free") && (
                                    <span className={`text-sm font-normal ml-1 ${isCurrent ? "text-white/40" : "text-neutral-400"}`}>/mo</span>
                                  )}
                                </p>
                                {plan.max_properties && (
                                  <p className={`text-xs mt-2 ${isCurrent ? "text-white/40" : "text-neutral-400"}`}>
                                    Up to {plan.max_properties} {plan.max_properties === 1 ? "property" : "properties"} · {plan.max_users} users
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2 mb-6 flex-1">
                                {FEATURE_LABELS.map(({ key, label, soon }) => {
                                  const has = plan.features?.[key] === true;
                                  return (
                                    <div key={key} className="flex items-center gap-2">
                                      {has
                                        ? <Check className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-emerald-400" : "text-emerald-500"}`} />
                                        : <X className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-white/20" : "text-neutral-200"}`} />
                                      }
                                      <span className={`text-xs flex items-center gap-1.5 ${has ? (isCurrent ? "text-white/80" : "text-neutral-700") : (isCurrent ? "text-white/25" : "text-neutral-300")}`}>
                                        {label}
                                        {has && soon && <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-500/20 text-amber-600 leading-none">SOON</span>}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              {!isCurrent && (
                                <button
                                  onClick={() => toast.info("Contact support at skitec@newmerictech.com to change your plan.")}
                                  className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-all ${isUpgrade ? "bg-black text-white hover:bg-neutral-800" : "bg-black/5 text-neutral-500 hover:bg-black/10"}`}
                                  style={{ fontWeight: 600 }}>
                                  {isUpgrade ? <><ArrowUpRight className="w-4 h-4" /> Upgrade</> : "Downgrade"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-center text-xs text-neutral-400 mt-6">
                        To change your subscription plan, contact us at{" "}
                        <a href="mailto:skitec@newmerictech.com" className="text-black underline underline-offset-2">skitec@newmerictech.com</a>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-16 text-center">
                  <CreditCard className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">No active subscription found.</p>
                  <p className="text-neutral-400 text-xs mt-1">Contact your administrator to assign a plan.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
