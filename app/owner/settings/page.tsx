"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, Save, Loader2, Check, X, Zap, Building2, Users, ArrowUpRight, ExternalLink, Key, Plus, Clock, CheckCircle2, XCircle, ChevronDown, Radio, Link2 } from "lucide-react";
import { toast } from "sonner";
import { usersAPI } from "@/lib/api/users";
import { subscriptionsAPI, MyPlan, SubscriptionPlan } from "@/lib/api/subscriptions";
import { coAdminAPI, CoAdminRequestItem } from "@/lib/api/co-admin";
import { propertiesAPI, Property } from "@/lib/api/properties";
import { useAuthStore } from "@/store/authStore";

const ALL_TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard, coAdminHidden: true },
  { id: "channel-manager", label: "Channel Manager", icon: Radio },
  { id: "permissions", label: "Permissions", icon: Key, coAdminHidden: true },
];

const CHANNEL_MANAGER_PROVIDERS = [
  { value: "channex", label: "Channex" },
  { value: "mews", label: "Mews" },
  { value: "cloudbeds", label: "Cloudbeds" },
  { value: "siteminder", label: "SiteMinder" },
  { value: "little_hotelier", label: "Little Hotelier" },
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
  const isCoAdmin = authUser?.role === "Co Admin";
  const tabs = ALL_TABS.filter(t => !(t.coAdminHidden && isCoAdmin));
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get("tab") || "profile");

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
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Permissions
  const [coAdminRequests, setCoAdminRequests] = useState<CoAdminRequestItem[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [showCoAdminForm, setShowCoAdminForm] = useState(false);
  const [coAdminForm, setCoAdminForm] = useState({ property_id: "", proposed_name: "", proposed_email: "" });
  const [coAdminSubmitting, setCoAdminSubmitting] = useState(false);

  // Channel Manager (UI only — not yet backed by a real integration API)
  const [cmProperty, setCmProperty] = useState("");
  const [cmProvider, setCmProvider] = useState("");
  const [cmPropertiesLoading, setCmPropertiesLoading] = useState(false);

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

  const fetchBillingData = async () => {
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
  };

  const loadBilling = useCallback(async () => {
    if (billingLoading || myPlan) return;
    await fetchBillingData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingLoading, myPlan]);

  useEffect(() => {
    if (tab === "billing") loadBilling();
  }, [tab, loadBilling]);

  // Show toast based on Stripe redirect result
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "success") {
      toast.success("Payment successful! Your plan has been upgraded.");
      if (sessionId) {
        // Verify session with Stripe directly — ensures plan updates even if webhook is delayed
        subscriptionsAPI.verifySession(sessionId)
          .then(() => fetchBillingData())
          .catch(() => fetchBillingData());
      } else {
        fetchBillingData();
      }
    } else if (payment === "cancelled") {
      toast.info("Payment cancelled. Your plan was not changed.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      // Free plan — switch directly, no payment needed
      try {
        setUpgradingPlanId(plan.id);
        await subscriptionsAPI.selectPlan(plan.id);
        toast.success(`Switched to ${plan.name} plan`);
        await fetchBillingData();
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || "Failed to switch plan");
      } finally {
        setUpgradingPlanId(null);
      }
      return;
    }
    // Paid plan — redirect to Stripe Checkout
    try {
      setUpgradingPlanId(plan.id);
      const res = await subscriptionsAPI.createCheckoutSession(plan.id);
      window.location.href = res.data.session_url;
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to initiate payment");
      setUpgradingPlanId(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const res = await subscriptionsAPI.createPortalSession();
      window.location.href = res.data.portal_url;
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const loadPermissions = useCallback(async () => {
    setPermissionsLoading(true);
    try {
      const [reqRes, propRes] = await Promise.all([
        coAdminAPI.listMyRequests(),
        propertiesAPI.list(),
      ]);
      setCoAdminRequests(reqRes.data);
      setProperties(propRes.data);
    } catch {
      toast.error("Failed to load permissions data");
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "permissions") loadPermissions();
  }, [tab, loadPermissions]);

  const loadPropertiesForChannelManager = useCallback(async () => {
    if (properties.length > 0) return;
    setCmPropertiesLoading(true);
    try {
      const res = await propertiesAPI.list();
      setProperties(res.data);
    } catch {
      toast.error("Failed to load properties");
    } finally {
      setCmPropertiesLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.length]);

  useEffect(() => {
    if (tab === "channel-manager") loadPropertiesForChannelManager();
  }, [tab, loadPropertiesForChannelManager]);

  const handleConnectChannelManager = () => {
    if (!cmProperty || !cmProvider) {
      toast.error("Select a property and a provider");
      return;
    }
    toast.info("Channel manager integrations are coming soon");
  };

  const handleSubmitCoAdmin = async () => {
    if (!coAdminForm.property_id || !coAdminForm.proposed_name.trim() || !coAdminForm.proposed_email.trim()) {
      toast.error("All fields are required");
      return;
    }
    setCoAdminSubmitting(true);
    try {
      await coAdminAPI.submitRequest(coAdminForm);
      toast.success("Co-Owner request submitted — pending superadmin approval");
      setShowCoAdminForm(false);
      setCoAdminForm({ property_id: "", proposed_name: "", proposed_email: "" });
      await loadPermissions();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to submit request");
    } finally {
      setCoAdminSubmitting(false);
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
                            ${myPlan.plan.price.toLocaleString("en-US")}<span className="text-white/40"> / month</span>
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
                          const enabled = soon || myPlan.features[key] === true;
                          return (
                            <div key={key} className={`flex items-start gap-3 p-3 rounded-xl border ${enabled ? "border-emerald-200/60 bg-emerald-50/50" : "border-black/5 bg-black/[0.02] opacity-40"}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${enabled ? "bg-emerald-500" : "bg-neutral-300"}`}>
                                {enabled ? <Check className="w-3.5 h-3.5 text-white" /> : <X className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-black">{label}</p>
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
                        {myPlan.plan.price > 0 && (
                          <button
                            onClick={handleManageSubscription}
                            disabled={portalLoading}
                            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black transition-colors disabled:opacity-50">
                            {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                            Manage billing
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...allPlans].sort((a, b) => a.price - b.price).map((plan) => {
                          const isCurrent = plan.id === myPlan.plan.id;
                          const isUpgrade = plan.price > myPlan.plan.price;
                          const isFree = plan.price === 0;
                          const isUpgrading = upgradingPlanId === plan.id;
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
                                  {isFree && plan.name !== "Free" ? "Custom" : `$${plan.price.toLocaleString("en-US")}`}
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
                                  const has = soon || plan.features?.[key] === true;
                                  return (
                                    <div key={key} className="flex items-center gap-2">
                                      {has
                                        ? <Check className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-emerald-400" : "text-emerald-500"}`} />
                                        : <X className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-white/20" : "text-neutral-200"}`} />
                                      }
                                      <span className={`text-xs flex items-center gap-1.5 ${has ? (isCurrent ? "text-white/80" : "text-neutral-700") : (isCurrent ? "text-white/25" : "text-neutral-300")}`}>
                                        {label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              {!isCurrent && (
                                <button
                                  onClick={() => handleUpgrade(plan)}
                                  disabled={isUpgrading || !!upgradingPlanId}
                                  className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 ${isUpgrade ? "bg-black text-white hover:bg-neutral-800" : "bg-black/5 text-neutral-500 hover:bg-black/10"}`}
                                  style={{ fontWeight: 600 }}>
                                  {isUpgrading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                                    : isUpgrade
                                      ? <><ArrowUpRight className="w-4 h-4" /> Upgrade</>
                                      : "Downgrade"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
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

          {tab === "channel-manager" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
              <h2 className="text-black" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Channel Managers</h2>
              <p className="text-neutral-400 text-xs mt-1 mb-6 max-w-xl leading-relaxed">
                Connect your property&apos;s channel manager to automatically synchronize reservations, room availability, and guests in the background.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Connected Integrations */}
                <div className="bg-black/[0.02] border border-black/5 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Radio className="w-4 h-4 text-black" />
                    <p className="text-black text-sm" style={{ fontWeight: 700 }}>Connected Integrations</p>
                  </div>
                  <div className="border border-dashed border-black/15 rounded-xl py-10 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mx-auto mb-3">
                      <Radio className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-black text-sm" style={{ fontWeight: 700 }}>No integrations connected</p>
                    <p className="text-neutral-400 text-xs mt-1 max-w-[220px] mx-auto leading-relaxed">
                      Use the form to connect a channel manager and begin syncing reservation data.
                    </p>
                  </div>
                </div>

                {/* Connect Channel Manager form */}
                <div className="bg-black/[0.02] border border-black/5 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5 text-black">
                    <Plus className="w-4 h-4" />
                    <p className="text-sm" style={{ fontWeight: 700 }}>Connect Channel Manager</p>
                  </div>

                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="block text-neutral-700 text-xs mb-1.5" style={{ fontWeight: 500 }}>Target Property</label>
                      <div className="relative">
                        <select
                          value={cmProperty}
                          onChange={e => setCmProperty(e.target.value)}
                          disabled={cmPropertiesLoading}
                          className="w-full appearance-none bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-all pr-9 disabled:opacity-50">
                          <option value="">{cmPropertiesLoading ? "Loading properties…" : "Select property…"}</option>
                          {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-700 text-xs mb-1.5" style={{ fontWeight: 500 }}>Channel Manager Provider</label>
                      <div className="relative">
                        <select
                          value={cmProvider}
                          onChange={e => setCmProvider(e.target.value)}
                          className="w-full appearance-none bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-all pr-9">
                          <option value="">Select a provider…</option>
                          {CHANNEL_MANAGER_PROVIDERS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConnectChannelManager}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm shadow-md hover:bg-neutral-800 transition-colors"
                    style={{ fontWeight: 600 }}>
                    <Link2 className="w-4 h-4" />
                    Connect Integration
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "permissions" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-black" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Co-Owner Permissions</h2>
                    <p className="text-neutral-400 text-xs mt-1">Grant partner owners access to a specific property</p>
                  </div>
                  {!showCoAdminForm && (
                    <button
                      onClick={() => setShowCoAdminForm(true)}
                      className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md hover:bg-neutral-800 transition-colors"
                      style={{ fontWeight: 600 }}>
                      <Plus className="w-4 h-4" />
                      Add Co-Owner
                    </button>
                  )}
                </div>

                {/* Add Co-Owner Form */}
                {showCoAdminForm && (
                  <div className="mb-6 p-5 rounded-2xl border border-black/10 bg-black/[0.02]">
                    <p className="text-black text-sm mb-4" style={{ fontWeight: 600 }}>New Co-Owner Request</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-neutral-700 text-xs mb-1.5" style={{ fontWeight: 500 }}>Property</label>
                        <div className="relative">
                          <select
                            value={coAdminForm.property_id}
                            onChange={e => setCoAdminForm(f => ({ ...f, property_id: e.target.value }))}
                            className="w-full appearance-none bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-all pr-9">
                            <option value="">Select property…</option>
                            {properties.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-neutral-700 text-xs mb-1.5" style={{ fontWeight: 500 }}>Full Name</label>
                        <input
                          value={coAdminForm.proposed_name}
                          onChange={e => setCoAdminForm(f => ({ ...f, proposed_name: e.target.value }))}
                          placeholder="Partner's full name"
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-neutral-700 text-xs mb-1.5" style={{ fontWeight: 500 }}>Email Address</label>
                        <input
                          type="email"
                          value={coAdminForm.proposed_email}
                          onChange={e => setCoAdminForm(f => ({ ...f, proposed_email: e.target.value }))}
                          placeholder="partner@email.com"
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-all" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={handleSubmitCoAdmin}
                        disabled={coAdminSubmitting}
                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm disabled:opacity-50"
                        style={{ fontWeight: 600 }}>
                        {coAdminSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {coAdminSubmitting ? "Submitting…" : "Submit Request"}
                      </button>
                      <button
                        onClick={() => { setShowCoAdminForm(false); setCoAdminForm({ property_id: "", proposed_name: "", proposed_email: "" }); }}
                        className="px-5 py-2.5 rounded-xl text-sm text-neutral-500 hover:bg-black/5 transition-colors"
                        style={{ fontWeight: 500 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Requests List */}
                {permissionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
                  </div>
                ) : coAdminRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Key className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                    <p className="text-neutral-400 text-sm">No co-owner requests yet</p>
                    <p className="text-neutral-300 text-xs mt-1">Submit a request to grant property access to a partner</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {coAdminRequests.map(req => {
                      const statusConfig = {
                        pending:  { icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50  border-amber-200",   label: "Pending"  },
                        approved: { icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Approved" },
                        rejected: { icon: XCircle,       color: "text-red-500",     bg: "bg-red-50    border-red-200",      label: "Rejected" },
                      }[req.status];
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-black/5 bg-black/[0.015] hover:bg-black/[0.03] transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-black/10 to-neutral-200/60 flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 text-neutral-500" />
                            </div>
                            <div>
                              <p className="text-black text-sm" style={{ fontWeight: 600 }}>{req.proposed_name}</p>
                              <p className="text-neutral-400 text-xs">{req.proposed_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-right">
                            <div className="hidden sm:block">
                              <p className="text-neutral-500 text-xs" style={{ fontWeight: 500 }}>Property</p>
                              <p className="text-black text-xs mt-0.5">{req.property_name || "—"}</p>
                            </div>
                            <div className="hidden sm:block">
                              <p className="text-neutral-500 text-xs" style={{ fontWeight: 500 }}>Requested</p>
                              <p className="text-black text-xs mt-0.5">{new Date(req.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.color}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
