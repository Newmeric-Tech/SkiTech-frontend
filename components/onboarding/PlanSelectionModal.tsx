"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { subscriptionsAPI, SubscriptionPlan, MyPlan } from "@/lib/api/subscriptions";

export const PLAN_SELECTED_KEY = "skitech_plan_selected";

const FEATURE_LABELS: Record<string, string> = {
  reports: "Reports & Analytics",
  kra: "KRA Monitoring",
  sop: "SOP Management",
  attendance: "Attendance Tracking",
  vendor_management: "Vendor Management",
  inventory: "Inventory Management",
  governance: "Governance & Compliance",
  employee_scheduling: "Employee Scheduling",
  chat: "Team Chat",
  employee_ranking: "Employee Ranking",
  master_log: "Master Log Book",
};

const FEATURE_ORDER = [
  "reports", "kra", "sop", "attendance", "vendor_management",
  "inventory", "governance", "employee_scheduling", "chat",
  "employee_ranking", "master_log",
];

interface Props {
  currentPlan: MyPlan;
  onDismiss: (updatedPlan?: MyPlan) => void;
}

export default function PlanSelectionModal({ currentPlan, onDismiss }: Props) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    subscriptionsAPI.plans()
      .then(res => setPlans(res.data))
      .catch(() => toast.error("Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (planId: string) => {
    setSelecting(planId);
    try {
      const res = await subscriptionsAPI.selectPlan(planId);
      localStorage.setItem(PLAN_SELECTED_KEY, "true");
      toast.success("Plan selected successfully!");
      onDismiss(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to select plan");
    } finally {
      setSelecting(null);
    }
  };

  const handleContinueWithCurrent = () => {
    localStorage.setItem(PLAN_SELECTED_KEY, "true");
    onDismiss();
  };

  const isCurrentPlan = (planId: string) => planId === currentPlan.plan.id;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl shadow-2xl border border-black/10 w-full max-w-4xl my-auto overflow-hidden"
        style={{ fontFamily: "Merriweather, serif" }}
      >
        {/* Header */}
        <div className="bg-[#f5f4f0] border-b border-black/10 px-8 pt-8 pb-6 relative">
          <button
            onClick={handleContinueWithCurrent}
            className="absolute right-6 top-6 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-black">Choose Your Plan</h2>
          </div>
          <p className="text-neutral-500 text-sm mt-1 ml-12">
            You&apos;re currently on the <span className="font-semibold text-black">{currentPlan.plan.name}</span> plan.
            Select a plan that fits your team.
          </p>
        </div>

        {/* Plans */}
        <div className="p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const isCurrent = isCurrentPlan(plan.id);
                const features = plan.features || {};
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-6 flex flex-col relative transition-shadow ${
                      isCurrent
                        ? "bg-black text-white border-black shadow-xl"
                        : "bg-white border-slate-200 hover:border-black/30 hover:shadow-md"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                        Current Plan
                      </div>
                    )}

                    <div className="mb-4">
                      <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${isCurrent ? "text-white/60" : "text-neutral-400"}`}>
                        {plan.name}
                      </p>
                      <div className="flex items-end gap-1">
                        {plan.price === 0 ? (
                          <span className={`text-3xl font-extrabold ${isCurrent ? "text-white" : "text-black"}`}>Free</span>
                        ) : (
                          <>
                            <span className={`text-3xl font-extrabold ${isCurrent ? "text-white" : "text-black"}`}>
                              ₹{plan.price}
                            </span>
                            <span className={`text-sm mb-1 ${isCurrent ? "text-white/60" : "text-neutral-400"}`}>/mo</span>
                          </>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${isCurrent ? "text-white/60" : "text-neutral-500"}`}>
                        {plan.max_properties ? `Up to ${plan.max_properties} propert${plan.max_properties === 1 ? "y" : "ies"}` : "Unlimited properties"}
                        {plan.max_users ? ` · ${plan.max_users} users` : ""}
                      </p>
                    </div>

                    <ul className="space-y-2 flex-1 mb-6">
                      {FEATURE_ORDER.map(key => {
                        const enabled = features[key] === true;
                        return (
                          <li key={key} className={`flex items-center gap-2 text-xs ${
                            enabled
                              ? isCurrent ? "text-white" : "text-slate-800"
                              : isCurrent ? "text-white/30 line-through" : "text-neutral-300 line-through"
                          }`}>
                            {enabled
                              ? <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent ? "text-emerald-400" : "text-emerald-500"}`} />
                              : <X className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent ? "text-white/20" : "text-neutral-300"}`} />
                            }
                            {FEATURE_LABELS[key] ?? key}
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      onClick={() => isCurrent ? handleContinueWithCurrent() : handleSelect(plan.id)}
                      disabled={!!selecting}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                        isCurrent
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-black text-white hover:bg-neutral-800"
                      }`}
                    >
                      {selecting === plan.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : isCurrent
                          ? <><ArrowRight className="w-4 h-4" /> Continue</>
                          : "Select Plan"
                      }
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          <p className="text-center text-xs text-neutral-400 mt-6">
            To change your plan later, go to <span className="font-medium text-neutral-600">Settings → Billing</span>.
            Contact <span className="font-medium text-neutral-600">SkiTech@newmerictech.com</span> for enterprise pricing.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
