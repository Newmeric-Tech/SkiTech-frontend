"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Upload, X,
  DollarSign, Users, Calendar, ClipboardCheck, FileText,
} from "lucide-react";

interface MonthlyKraForm {
  month: string;
  year: string;
  revenueAmount: string;
  guestCount: string;
  occupancyRate: string;
  revenueFile: File | null;
  revenueFilePreview: string | null;
  notes: string;
}

const initialForm: MonthlyKraForm = {
  month: "",
  year: "",
  revenueAmount: "",
  guestCount: "",
  occupancyRate: "",
  revenueFile: null,
  revenueFilePreview: null,
  notes: "",
};

const steps = [
  { id: 1, label: "Period", icon: Calendar },
  { id: 2, label: "Revenue Report", icon: DollarSign },
  { id: 3, label: "Guest Data", icon: Users },
  { id: 4, label: "Review", icon: ClipboardCheck },
];

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function MonthlyKRAForm({ backHref }: { backHref: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MonthlyKraForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof MonthlyKraForm, string>>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, revenueFile: file, revenueFilePreview: reader.result as string }));
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const validateStep = (s: number): boolean => {
    const newErrors: typeof errors = {};
    if (s === 1) {
      if (!form.month) newErrors.month = "Please select a month";
      if (!form.year) newErrors.year = "Please select a year";
    }
    if (s === 2) {
      if (!form.revenueAmount) newErrors.revenueAmount = "Revenue amount is required";
    }
    if (s === 3) {
      if (!form.guestCount) newErrors.guestCount = "Guest count is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => { if (!validateStep(step)) return; setDirection(1); setStep((s) => Math.min(s + 1, 4)); };
  const back = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("submission_type", "monthly");
      formData.append("period_month", form.month);
      formData.append("period_year", form.year);
      formData.append("revenue_amount", form.revenueAmount);
      formData.append("guest_count", form.guestCount);
      formData.append("occupancy_rate", form.occupancyRate);
      formData.append("notes", form.notes);
      if (form.revenueFile) {
        formData.append("file", form.revenueFile);
      }

      await new Promise((r) => setTimeout(r, 2000));
      
      toast.success("Monthly KRA submitted successfully!", {
        description: `${months.find(m => m.value === form.month)?.label} ${form.year}`,
        duration: 4500,
      });
      router.push(backHref);
    } catch (err) {
      setError("Failed to submit KRA. Please try again.");
      toast.error("Submission failed", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
  };

  const monthLabel = months.find(m => m.value === form.month)?.label;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push(backHref)}
          className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Monthly KRA Form</h1>
          <p className="text-slate-500 text-sm">Submit your monthly key result areas</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200/60 rounded-xl p-4 flex items-start gap-3"
        >
          <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">Please try again or contact support if the issue persists.</p>
          </div>
        </motion.div>
      )}

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

              {/* Step 1: Period */}
              {step === 1 && (
                <>
                  <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-4 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Monthly Reporting Period</p>
                      <p className="text-xs text-blue-600 mt-0.5">Select the month and year for this KRA submission.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Month <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 transition-all ${errors.month ? "border-red-300 focus:ring-red-100" : "border-slate-200/60 focus:ring-slate-200"}`}>
                          <option value="">Select month...</option>
                          {months.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>
                      {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 transition-all ${errors.year ? "border-red-300 focus:ring-red-100" : "border-slate-200/60 focus:ring-slate-200"}`}>
                          <option value="">Select year...</option>
                          {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                      {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Revenue Report */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Revenue (₹) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" min="0" value={form.revenueAmount} onChange={(e) => setForm((f) => ({ ...f, revenueAmount: e.target.value }))} placeholder="0.00"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.revenueAmount ? "border-red-300 focus:ring-red-100" : "border-slate-200/60 focus:ring-slate-200"}`} />
                    </div>
                    {errors.revenueAmount && <p className="text-red-500 text-xs mt-1">{errors.revenueAmount}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Revenue Report File (Optional)</label>
                    <p className="text-xs text-slate-500 mb-2">Upload the revenue report (PDF, Excel, or image)</p>
                    {form.revenueFilePreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200/60">
                        <div className="bg-slate-50 p-4 flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{form.revenueFile?.name}</p>
                            <p className="text-xs text-slate-500">{form.revenueFile && (form.revenueFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button onClick={() => setForm((f) => ({ ...f, revenueFile: null, revenueFilePreview: null }))}
                            className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                        <Upload className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        <p className="text-xs text-slate-400 group-hover:text-blue-500 transition-colors">Click to upload file</p>
                        <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg" className="hidden"
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Guest Data */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Guest Count <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="number" min="0" value={form.guestCount} onChange={(e) => setForm((f) => ({ ...f, guestCount: e.target.value }))} placeholder="0"
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.guestCount ? "border-red-300 focus:ring-red-100" : "border-slate-200/60 focus:ring-slate-200"}`} />
                      </div>
                      {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Occupancy Rate (%)</label>
                      <input type="number" min="0" max="100" value={form.occupancyRate} onChange={(e) => setForm((f) => ({ ...f, occupancyRate: e.target.value }))} placeholder="0"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Additional Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Any additional notes or observations for this month..." rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none" />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Period</p>
                    <div className="text-sm flex justify-between">
                      <span className="text-slate-500">Month</span>
                      <span className="text-slate-900 font-medium">{monthLabel} {form.year}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Revenue</p>
                    <div className="text-sm flex justify-between mb-2">
                      <span className="text-slate-500">Amount</span>
                      <span className="text-slate-900 font-medium">₹{Number(form.revenueAmount || 0).toLocaleString("en-IN")}</span>
                    </div>
                    {form.revenueFile && (
                      <div className="text-sm flex justify-between">
                        <span className="text-slate-500">Report File</span>
                        <span className="text-slate-900 font-medium">{form.revenueFile?.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Guest Data</p>
                    <div className="text-sm flex justify-between mb-2">
                      <span className="text-slate-500">Total Guests</span>
                      <span className="text-slate-900 font-medium">{form.guestCount || "—"}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-slate-500">Occupancy</span>
                      <span className="text-slate-900 font-medium">{form.occupancyRate ? `${form.occupancyRate}%` : "—"}</span>
                    </div>
                  </div>
                  {form.notes && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</p>
                      <p className="text-sm text-slate-700">{form.notes}</p>
                    </div>
                  )}
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
          {step < 4 ? (
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
                <><CheckCircle2 className="w-4 h-4" /> Submit Monthly KRA</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}