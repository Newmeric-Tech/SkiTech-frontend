"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, Loader2, Search, Building2, CheckCircle2,
  ChevronDown, RefreshCw, AlertCircle, TrendingUp, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/config/app";
import { subscriptionsAPI } from "@/lib/api/subscriptions";

interface PlanSummary {
  id: string;
  name: string;
  price: number;
  max_properties: number | null;
  max_users: number | null;
}

interface TenantRow {
  tenant_id: string;
  user_id: string;
  user_name: string;
  business_name: string;
  contact_email: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  current_plan: PlanSummary | null;
  subscription_start_date: string | null;
  stripe_subscription_id: string | null;
}

interface SubscriptionsData {
  tenants: TenantRow[];
  plans: PlanSummary[];
}

export default function SuperadminSubscriptionsPage() {
  const [data, setData] = useState<SubscriptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<SubscriptionsData>("/v1/superadmin/subscriptions");
      setData(res.data);
      // Pre-select current plan for each tenant
      const defaults: Record<string, string> = {};
      for (const t of res.data.tenants) {
        if (t.current_plan) defaults[t.tenant_id] = t.current_plan.id;
      }
      setSelectedPlan(defaults);
    } catch {
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDeleteTenant = async (tenantId: string) => {
    setDeletingId(tenantId);
    try {
      await api.delete(`/v1/superadmin/tenants/${tenantId}`);
      toast.success("Tenant deleted");
      setConfirmDeleteId(null);
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete tenant");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssign = async (tenantId: string) => {
    const planId = selectedPlan[tenantId];
    if (!planId) return;
    const tenant = data?.tenants.find(t => t.tenant_id === tenantId);
    const plan = data?.plans.find(p => p.id === planId);
    if (!plan || !tenant) return;

    setAssigningId(tenantId);
    try {
      await subscriptionsAPI.assignPlan(tenantId, planId);
      toast.success(`${tenant.business_name} moved to ${plan.name} plan`);
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to assign plan");
    } finally {
      setAssigningId(null);
    }
  };

  const filtered = (data?.tenants ?? []).filter(t =>
    t.user_name.toLowerCase().includes(search.toLowerCase()) ||
    t.contact_email.toLowerCase().includes(search.toLowerCase()) ||
    t.business_name.toLowerCase().includes(search.toLowerCase())
  );

  const planStats = data
    ? data.plans.map(p => ({
        ...p,
        count: data.tenants.filter(t => t.current_plan?.id === p.id).length,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Subscription Management</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage tenant plans and billing
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all disabled:opacity-50"
          style={{ fontWeight: 500 }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Plan Stats */}
      {!loading && data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {planStats.map(plan => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-black/10 dark:border-white/10 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">{plan.name}</span>
                <TrendingUp className="w-4 h-4 text-neutral-300" />
              </div>
              <p className="text-3xl font-bold text-black dark:text-white">{plan.count}</p>
              <p className="text-xs text-neutral-400 mt-1">
                {plan.price === 0 ? "Free" : `₹${plan.price}/mo`} ·{" "}
                {plan.max_properties ? `${plan.max_properties} prop` : "∞ prop"}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
        <div className="p-5 border-b border-black/10 dark:border-white/10 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tenants…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-black dark:text-white"
            />
          </div>
          {data && (
            <span className="text-sm text-neutral-400">{filtered.length} tenant{filtered.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-neutral-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">No tenants found</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {filtered.map((tenant, idx) => {
              const currentPlanId = tenant.current_plan?.id;
              const chosenPlanId = selectedPlan[tenant.tenant_id] || "";
              const hasChanged = chosenPlanId && chosenPlanId !== currentPlanId;
              const isAssigning = assigningId === tenant.tenant_id;

              return (
                <motion.div
                  key={tenant.tenant_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  {/* User / Tenant info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-black to-neutral-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {tenant.user_name[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-black dark:text-white truncate">{tenant.user_name}</p>
                      <p className="text-xs text-neutral-400 truncate">{tenant.contact_email}</p>
                      <p className="text-xs text-neutral-300 truncate">{tenant.business_name}</p>
                    </div>
                  </div>

                  {/* Current plan badge */}
                  <div className="shrink-0">
                    {tenant.current_plan ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-700/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {tenant.current_plan.name}
                        {tenant.current_plan.price > 0 && (
                          <span className="text-emerald-500/70 font-normal">· ₹{tenant.current_plan.price}/mo</span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-500 text-xs font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        No plan
                      </span>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="shrink-0">
                    {confirmDeleteId === tenant.tenant_id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-500 font-medium">Confirm?</span>
                        <button
                          onClick={() => handleDeleteTenant(tenant.tenant_id)}
                          disabled={!!deletingId}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50">
                          {deletingId === tenant.tenant_id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes, delete"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-black/5 text-neutral-600 hover:bg-black/10 transition-all">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(tenant.tenant_id)}
                        className="p-2 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Delete tenant">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Plan selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <select
                        value={chosenPlanId}
                        onChange={e => setSelectedPlan(prev => ({ ...prev, [tenant.tenant_id]: e.target.value }))}
                        className="appearance-none pl-3 pr-8 py-2 text-sm bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 cursor-pointer">
                        <option value="">— Select plan —</option>
                        {(data?.plans ?? []).map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.price > 0 ? `(₹${p.price}/mo)` : "(Free)"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                    </div>

                    <button
                      onClick={() => handleAssign(tenant.tenant_id)}
                      disabled={!hasChanged || isAssigning || !!assigningId}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all"
                      style={{ fontWeight: 600 }}>
                      {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                      {isAssigning ? "Saving…" : "Apply"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info note */}
      <p className="text-xs text-neutral-400 text-center">
        Plan changes applied here take effect immediately. Stripe billing is not affected — this is for manual overrides only.
      </p>
    </div>
  );
}
