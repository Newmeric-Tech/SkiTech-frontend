"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown,
  Clock, DollarSign, Home, Star,
  Wrench, Users, ClipboardCheck,
} from "lucide-react";
import { kraAPI } from "@/lib/api/kra";

interface DailyKraForm {
  shift: "Morning" | "Evening" | "Night" | "";
  date: string;
  guestCheckIns: string;
  guestCheckOuts: string;
  complaints: string;
  complaintsResolved: string;
  roomChecks: string;
  roomCheckNotes: string;
  maintenanceTasks: string;
  maintenanceNotes: string;
  cashDeposits: string;
  cashDepositRef: string;
  googleReviews: string;
  googleReviewNotes: string;
  additionalNotes: string;
}

const initialForm: DailyKraForm = {
  shift: "",
  date: new Date().toISOString().split("T")[0],
  guestCheckIns: "",
  guestCheckOuts: "",
  complaints: "",
  complaintsResolved: "",
  roomChecks: "",
  roomCheckNotes: "",
  maintenanceTasks: "",
  maintenanceNotes: "",
  cashDeposits: "",
  cashDepositRef: "",
  googleReviews: "",
  googleReviewNotes: "",
  additionalNotes: "",
};

const steps = [
  { id: 1, label: "Shift Info", icon: Clock },
  { id: 2, label: "Guest Activity", icon: Users },
  { id: 3, label: "Operations", icon: Home },
  { id: 4, label: "Financials & Reviews", icon: Star },
  { id: 5, label: "Review", icon: ClipboardCheck },
];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function NumberInput({
  value, onChange, placeholder, error,
}: { value: string; onChange: (v: string) => void; placeholder?: string; error?: string; }) {
  return (
    <div>
      <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${error ? "border-red-300 focus:ring-red-100" : "border-slate-200/60 focus:ring-slate-200 focus:border-slate-300"}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all resize-none"
    />
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 flex-1">{label}</span>
      <span className="text-sm font-medium text-slate-900 flex-1 text-right">{value || "—"}</span>
    </div>
  );
}

export default function DailyKRAForm({ backHref }: { backHref: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DailyKraForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof DailyKraForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  const set = (field: keyof DailyKraForm) => (v: string) => {
    setForm((f) => ({ ...f, [field]: v }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: typeof errors = {};
    if (s === 1) {
      if (!form.shift) newErrors.shift = "Please select a shift";
      if (!form.date) newErrors.date = "Date is required";
    }
    if (s === 2) {
      if (form.guestCheckIns === "") newErrors.guestCheckIns = "Required";
      if (form.guestCheckOuts === "") newErrors.guestCheckOuts = "Required";
      if (form.complaints === "") newErrors.complaints = "Required";
    }
    if (s === 3) {
      if (form.roomChecks === "") newErrors.roomChecks = "Required";
      if (form.maintenanceTasks === "") newErrors.maintenanceTasks = "Required";
    }
    if (s === 4) {
      if (form.cashDeposits === "") newErrors.cashDeposits = "Required";
      if (form.googleReviews === "") newErrors.googleReviews = "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => { if (!validateStep(step)) return; setDirection(1); setStep((s) => Math.min(s + 1, 5)); };
  const back = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await kraAPI.submitDaily({
        date: form.date,
        shift: form.shift,
        guestCheckIns: form.guestCheckIns,
        guestCheckOuts: form.guestCheckOuts,
        complaints: form.complaints,
        complaintsResolved: form.complaintsResolved,
        roomChecks: form.roomChecks,
        maintenanceTasks: form.maintenanceTasks,
        cashDeposits: form.cashDeposits,
        googleReviews: form.googleReviews,
      });
      toast.success("Daily KRA submitted successfully!", {
        description: `${form.shift} shift · ${new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        duration: 4000,
      });
      router.push(backHref);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Submission failed. Please try again.";
      toast.error("Submission failed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push(backHref)}
          className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Daily KRA Form</h1>
          <p className="text-slate-500 text-sm">Submit your daily key result areas</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-px bg-slate-100 z-0 mx-10" />
          {steps.map((s) => {
            const isComplete = step > s.id;
            const isCurrent = step === s.id;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5 z-10 relative flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isComplete ? "bg-emerald-500 shadow-lg shadow-emerald-500/25" : isCurrent ? "bg-slate-950 shadow-lg shadow-slate-950/20" : "bg-slate-100"}`}>
                  {isComplete ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Icon className={`w-4 h-4 ${isCurrent ? "text-white" : "text-slate-400"}`} />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isCurrent ? "text-slate-950" : "text-slate-400"}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Step {step} of {steps.length}</p>
          <h2 className="text-lg font-bold text-slate-950 mt-0.5">{steps[step - 1].label}</h2>
        </div>

        <div className="relative overflow-hidden min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }} className="p-6 space-y-5">

              {step === 1 && (
                <>
                  <div>
                    <Label required>Date</Label>
                    <input type="date" value={form.date} onChange={(e) => set("date")(e.target.value)}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${errors.date ? "border-red-300 focus:ring-red-100" : "border-slate-200/60 focus:ring-slate-200"}`}
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                  </div>
                  <div>
                    <Label required>Shift</Label>
                    <div className="relative">
                      <select value={form.shift} onChange={(e) => set("shift")(e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 transition-all ${errors.shift ? "border-red-300 focus:ring-red-100" : "border-slate-200/60 focus:ring-slate-200"}`}>
                        <option value="">Select shift...</option>
                        <option value="Morning">☀️ Morning</option>
                        <option value="Evening">🌆 Evening</option>
                        <option value="Night">🌙 Night</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.shift && <p className="text-red-500 text-xs mt-1">{errors.shift}</p>}
                  </div>
                  {form.shift && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-3 p-4 rounded-xl border ${form.shift === "Morning" ? "bg-amber-50 border-amber-200/60" : form.shift === "Evening" ? "bg-purple-50 border-purple-200/60" : "bg-slate-100 border-slate-200/60"}`}>
                      <Clock className={`w-5 h-5 ${form.shift === "Morning" ? "text-amber-600" : form.shift === "Evening" ? "text-purple-600" : "text-slate-600"}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{form.shift} Shift Selected</p>
                        <p className="text-xs text-slate-500">{form.shift === "Morning" ? "6:00 AM – 2:00 PM" : form.shift === "Evening" ? "2:00 PM – 10:00 PM" : "10:00 PM – 6:00 AM"}</p>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label required>Guest Check-Ins</Label><NumberInput value={form.guestCheckIns} onChange={set("guestCheckIns")} placeholder="0" error={errors.guestCheckIns} /></div>
                    <div><Label required>Guest Check-Outs</Label><NumberInput value={form.guestCheckOuts} onChange={set("guestCheckOuts")} placeholder="0" error={errors.guestCheckOuts} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label required>Total Complaints</Label><NumberInput value={form.complaints} onChange={set("complaints")} placeholder="0" error={errors.complaints} /></div>
                    <div><Label>Complaints Resolved</Label><NumberInput value={form.complaintsResolved} onChange={set("complaintsResolved")} placeholder="0" /></div>
                  </div>
                  <div>
                    <Label>Complaint Details / Notes</Label>
                    <TextArea value={form.roomCheckNotes} onChange={set("roomCheckNotes")} placeholder="Describe any guest complaints or special requests..." />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label required>Room Checks Done</Label><NumberInput value={form.roomChecks} onChange={set("roomChecks")} placeholder="0" error={errors.roomChecks} /></div>
                    <div><Label required>Maintenance Tasks</Label><NumberInput value={form.maintenanceTasks} onChange={set("maintenanceTasks")} placeholder="0" error={errors.maintenanceTasks} /></div>
                  </div>
                  <div><Label>Room Check Notes</Label><TextArea value={form.roomCheckNotes} onChange={set("roomCheckNotes")} placeholder="Any issues found during room inspections..." /></div>
                  <div><Label>Maintenance Notes</Label><TextArea value={form.maintenanceNotes} onChange={set("maintenanceNotes")} placeholder="List completed maintenance tasks or pending issues..." /></div>
                </>
              )}

              {step === 4 && (
                <>
                  <div>
                    <Label required>Cash Deposits (₹)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" min="0" value={form.cashDeposits} onChange={(e) => set("cashDeposits")(e.target.value)} placeholder="0.00"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${errors.cashDeposits ? "border-red-300 focus:ring-red-100" : "border-slate-200/60 focus:ring-slate-200"}`}
                      />
                    </div>
                    {errors.cashDeposits && <p className="text-red-500 text-xs mt-1">{errors.cashDeposits}</p>}
                  </div>
                  <div>
                    <Label>Deposit Reference / Receipt No.</Label>
                    <input type="text" value={form.cashDepositRef} onChange={(e) => set("cashDepositRef")(e.target.value)} placeholder="e.g. RCT-2026-001"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                  </div>
                  <div>
                    <Label required>Google Reviews Received</Label>
                    <div className="flex items-center gap-2">
                      <NumberInput value={form.googleReviews} onChange={set("googleReviews")} placeholder="0" error={errors.googleReviews} />
                      <div className="flex text-amber-400 shrink-0">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <div><Label>Review Notes</Label><TextArea value={form.googleReviewNotes} onChange={set("googleReviewNotes")} placeholder="Any notable guest feedback or review highlights..." /></div>
                  <div><Label>Additional Notes</Label><TextArea value={form.additionalNotes} onChange={set("additionalNotes")} placeholder="Any other notes for this shift..." rows={2} /></div>
                </>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Shift Information</p>
                    <ReviewRow label="Date" value={new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
                    <ReviewRow label="Shift" value={form.shift} />
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Guest Activity</p>
                    <ReviewRow label="Check-Ins" value={form.guestCheckIns} />
                    <ReviewRow label="Check-Outs" value={form.guestCheckOuts} />
                    <ReviewRow label="Complaints" value={form.complaints} />
                    <ReviewRow label="Resolved" value={form.complaintsResolved} />
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Home className="w-3.5 h-3.5" /> Operations</p>
                    <ReviewRow label="Room Checks" value={form.roomChecks} />
                    <ReviewRow label="Maintenance Tasks" value={form.maintenanceTasks} />
                    {form.maintenanceNotes && <ReviewRow label="Notes" value={form.maintenanceNotes} />}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Financials & Reviews</p>
                    <ReviewRow label="Cash Deposit" value={form.cashDeposits ? `₹${Number(form.cashDeposits).toLocaleString("en-IN")}` : ""} />
                    <ReviewRow label="Receipt Ref" value={form.cashDepositRef} />
                    <ReviewRow label="Google Reviews" value={form.googleReviews} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button onClick={back} disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-slate-400 text-xs">{step} / {steps.length}</span>
          {step < 5 ? (
            <button onClick={next}
              className="flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm">
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Submit KRA</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
