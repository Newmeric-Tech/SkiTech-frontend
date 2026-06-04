"use client";

/**
 * OwnerOnboardingModal
 *
 * Shown to a new Tenant Admin whose tenant has no properties yet.
 * Three linear steps:
 *   1. Create first Property
 *   2. Invite first Manager
 *   3. Invite first Staff member
 *
 * Completion (or "Skip setup") writes skitech_onboarding_complete="true"
 * to localStorage so the modal never shows again.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, UserPlus, Users, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { propertiesAPI, PropertyCreate } from "@/lib/api/properties";
import { usersAPI, UserInvite } from "@/lib/api/users";

const ONBOARDING_KEY = "skitech_onboarding_complete";

// ── Types ──────────────────────────────────────────────────────────────
type StepStatus = "pending" | "active" | "done";

interface StepState {
  status: StepStatus;
}

// ── Inline form defaults ──────────────────────────────────────────────
const EMPTY_PROPERTY: PropertyCreate = {
  name: "",
  address: "",
  city: "",
  country: "",
  franchise_type: "owner-operated",
};

const EMPTY_MANAGER: UserInvite = {
  email: "",
  first_name: "",
  last_name: "",
  role: "Manager",
};

const EMPTY_STAFF: UserInvite = {
  email: "",
  first_name: "",
  last_name: "",
  role: "Staff",
};

// ── Helper: shared input class ────────────────────────────────────────
const INPUT_CLS =
  "w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30 transition-colors";

// ── Component ─────────────────────────────────────────────────────────
interface Props {
  onDismiss: () => void;
}

export default function OwnerOnboardingModal({ onDismiss }: Props) {
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);
  const [steps, setSteps] = useState<StepState[]>([
    { status: "active" },
    { status: "pending" },
    { status: "pending" },
  ]);

  // Property form state
  const [propForm, setPropForm] = useState<PropertyCreate>(EMPTY_PROPERTY);
  const [propSubmitting, setPropSubmitting] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);

  // Manager invite form
  const [managerForm, setManagerForm] = useState<UserInvite>(EMPTY_MANAGER);
  const [managerSubmitting, setManagerSubmitting] = useState(false);

  // Staff invite form
  const [staffForm, setStaffForm] = useState<UserInvite>(EMPTY_STAFF);
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────

  function markStepDone(step: number) {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i === step) return { status: "done" };
        if (i === step + 1) return { status: "active" };
        return s;
      })
    );
  }

  function completeOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onDismiss();
  }

  function skipOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onDismiss();
  }

  // ── Step handlers ────────────────────────────────────────────────────

  async function handleCreateProperty() {
    if (!propForm.name.trim()) {
      toast.error("Property name is required");
      return;
    }
    try {
      setPropSubmitting(true);
      const res = await propertiesAPI.create(propForm);
      setCreatedPropertyId(res.data.id);
      toast.success("Property created!");
      markStepDone(0);
      setCurrentStep(1);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create property");
    } finally {
      setPropSubmitting(false);
    }
  }

  async function handleInviteManager() {
    if (!managerForm.email.trim()) {
      toast.error("Email is required");
      return;
    }
    try {
      setManagerSubmitting(true);
      await usersAPI.invite({ ...managerForm, role: "Manager", property_id: createdPropertyId ?? undefined });
      toast.success("Manager invited!");
      markStepDone(1);
      setCurrentStep(2);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to invite manager");
    } finally {
      setManagerSubmitting(false);
    }
  }

  async function handleInviteStaff() {
    if (!staffForm.email.trim()) {
      toast.error("Email is required");
      return;
    }
    try {
      setStaffSubmitting(true);
      await usersAPI.invite({ ...staffForm, role: "Staff", property_id: createdPropertyId ?? undefined });
      toast.success("Staff member invited!");
      markStepDone(2);
      completeOnboarding();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to invite staff");
    } finally {
      setStaffSubmitting(false);
    }
  }

  // ── Step definitions ─────────────────────────────────────────────────

  const stepMeta = [
    { icon: Building2, title: "Create your first Property", color: "bg-blue-500" },
    { icon: UserPlus,  title: "Invite your first Manager",  color: "bg-indigo-500" },
    { icon: Users,     title: "Invite your first Staff member", color: "bg-emerald-500" },
  ];

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl shadow-2xl border border-black/10 w-full max-w-lg overflow-hidden"
        style={{ fontFamily: "Merriweather, serif" }}
      >
        {/* Header */}
        <div className="bg-[#f5f4f0] border-b border-black/10 px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-black leading-tight">
                Welcome to SkiTech
              </h2>
              <p className="text-neutral-500 text-sm mt-1">
                Let&apos;s set up your workspace in a few quick steps.
              </p>
            </div>
            <button
              onClick={skipOnboarding}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 -mt-1 -mr-1"
              title="Skip setup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step progress pills */}
          <div className="flex items-center gap-2 mt-5">
            {stepMeta.map((meta, i) => {
              const s = steps[i];
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0 transition-colors ${
                      s.status === "done"
                        ? "bg-black"
                        : s.status === "active"
                        ? "bg-black"
                        : "bg-black/20"
                    }`}
                  >
                    {s.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold leading-tight ${
                      s.status === "pending" ? "text-neutral-400" : "text-black"
                    }`}
                  >
                    {meta.title}
                  </span>
                  {i < stepMeta.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 rounded-full ${
                        steps[i].status === "done" ? "bg-black" : "bg-black/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 py-6 min-h-[260px]">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Create Property ── */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-base">Create your first Property</h3>
                    <p className="text-neutral-500 text-xs mt-0.5">
                      A property is a hotel, resort, or venue you manage.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-700 text-xs mb-1.5 font-semibold">
                      Property Name *
                    </label>
                    <input
                      value={propForm.name}
                      onChange={(e) => setPropForm((f) => ({ ...f, name: e.target.value }))}
                      className={INPUT_CLS}
                      placeholder="Grand Horizon Hotel"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-700 text-xs mb-1.5 font-semibold">City</label>
                      <input
                        value={propForm.city ?? ""}
                        onChange={(e) => setPropForm((f) => ({ ...f, city: e.target.value }))}
                        className={INPUT_CLS}
                        placeholder="Dubai"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 text-xs mb-1.5 font-semibold">Country</label>
                      <input
                        value={propForm.country ?? ""}
                        onChange={(e) => setPropForm((f) => ({ ...f, country: e.target.value }))}
                        className={INPUT_CLS}
                        placeholder="UAE"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleCreateProperty}
                    disabled={propSubmitting || !propForm.name.trim()}
                    className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {propSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Property
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Invite Manager ── */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-base">Invite your first Manager</h3>
                    <p className="text-neutral-500 text-xs mt-0.5">
                      Managers oversee property operations and staff.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-700 text-xs mb-1.5 font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={managerForm.email}
                      onChange={(e) => setManagerForm((f) => ({ ...f, email: e.target.value }))}
                      className={INPUT_CLS}
                      placeholder="manager@yourhotel.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-700 text-xs mb-1.5 font-semibold">First Name</label>
                      <input
                        value={managerForm.first_name ?? ""}
                        onChange={(e) => setManagerForm((f) => ({ ...f, first_name: e.target.value }))}
                        className={INPUT_CLS}
                        placeholder="Sarah"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 text-xs mb-1.5 font-semibold">Last Name</label>
                      <input
                        value={managerForm.last_name ?? ""}
                        onChange={(e) => setManagerForm((f) => ({ ...f, last_name: e.target.value }))}
                        className={INPUT_CLS}
                        placeholder="Khan"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleInviteManager}
                    disabled={managerSubmitting || !managerForm.email.trim()}
                    className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {managerSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Invite
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Invite Staff ── */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-base">Invite your first Staff member</h3>
                    <p className="text-neutral-500 text-xs mt-0.5">
                      Staff are the front-line team at your property.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-700 text-xs mb-1.5 font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))}
                      className={INPUT_CLS}
                      placeholder="staff@yourhotel.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-700 text-xs mb-1.5 font-semibold">First Name</label>
                      <input
                        value={staffForm.first_name ?? ""}
                        onChange={(e) => setStaffForm((f) => ({ ...f, first_name: e.target.value }))}
                        className={INPUT_CLS}
                        placeholder="Ali"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 text-xs mb-1.5 font-semibold">Last Name</label>
                      <input
                        value={staffForm.last_name ?? ""}
                        onChange={(e) => setStaffForm((f) => ({ ...f, last_name: e.target.value }))}
                        className={INPUT_CLS}
                        placeholder="Hassan"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleInviteStaff}
                    disabled={staffSubmitting || !staffForm.email.trim()}
                    className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {staffSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Invite &amp; Finish
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 pt-2 border-t border-black/5 flex items-center justify-between">
          <p className="text-neutral-400 text-xs">
            Step {currentStep + 1} of 3
          </p>
          <button
            onClick={skipOnboarding}
            className="text-neutral-400 hover:text-neutral-600 text-xs underline underline-offset-2 transition-colors"
          >
            Skip setup
          </button>
        </div>
      </motion.div>
    </div>
  );
}
