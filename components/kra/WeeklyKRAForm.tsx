"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Upload, X,
  Package, Globe, BarChart3, ClipboardList,
} from "lucide-react";
import { kraAPI } from "@/lib/api/kra";

interface OtaPlatform {
  id: string; name: string; icon: string; color: string;
  uploaded: boolean; imageFile: File | null; imagePreview: string | null; notes: string;
}
interface SupplyItem {
  id: string; name: string; category: string;
  checked: boolean; quantity: string; status: "ok" | "low" | "out";
}
interface WeeklyKraForm { weekStartDate: string; weekEndDate: string; overallNotes: string; }

const initialPlatforms: OtaPlatform[] = [
  { id: "google", name: "Google Business", icon: "G", color: "#4285F4", uploaded: false, imageFile: null, imagePreview: null, notes: "" },
  { id: "booking", name: "Booking.com", icon: "B", color: "#003580", uploaded: false, imageFile: null, imagePreview: null, notes: "" },
  { id: "makemytrip", name: "MakeMyTrip", icon: "M", color: "#E63946", uploaded: false, imageFile: null, imagePreview: null, notes: "" },
  { id: "airbnb", name: "Airbnb", icon: "A", color: "#FF385C", uploaded: false, imageFile: null, imagePreview: null, notes: "" },
  { id: "expedia", name: "Expedia", icon: "E", color: "#FFB700", uploaded: false, imageFile: null, imagePreview: null, notes: "" },
  { id: "tripadvisor", name: "TripAdvisor", icon: "T", color: "#34E0A1", uploaded: false, imageFile: null, imagePreview: null, notes: "" },
];

const initialSupplies: SupplyItem[] = [
  { id: "s1", name: "Bed Linen", category: "Housekeeping", checked: false, quantity: "", status: "ok" },
  { id: "s2", name: "Towels", category: "Housekeeping", checked: false, quantity: "", status: "ok" },
  { id: "s3", name: "Guest Toiletries", category: "Amenities", checked: false, quantity: "", status: "ok" },
  { id: "s4", name: "Cleaning Supplies", category: "Housekeeping", checked: false, quantity: "", status: "ok" },
  { id: "s5", name: "Minibar Drinks", category: "F&B", checked: false, quantity: "", status: "ok" },
  { id: "s6", name: "Snack Packs", category: "F&B", checked: false, quantity: "", status: "ok" },
  { id: "s7", name: "Tea / Coffee Sachets", category: "F&B", checked: false, quantity: "", status: "ok" },
  { id: "s8", name: "Paper & Stationery", category: "Admin", checked: false, quantity: "", status: "ok" },
  { id: "s9", name: "Maintenance Tools", category: "Maintenance", checked: false, quantity: "", status: "ok" },
  { id: "s10", name: "Safety Equipment", category: "Safety", checked: false, quantity: "", status: "ok" },
];

const steps = [
  { id: 1, label: "Week Details", icon: BarChart3 },
  { id: 2, label: "OTA Images", icon: Globe },
  { id: 3, label: "Supply Review", icon: Package },
  { id: 4, label: "Review & Submit", icon: ClipboardList },
];

const statusOptions = [
  { value: "ok" as const, label: "OK", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  { value: "low" as const, label: "Low", color: "bg-amber-50 text-amber-700 border-amber-200/60" },
  { value: "out" as const, label: "Out", color: "bg-red-50 text-red-700 border-red-200/60" },
];

function getWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday.toISOString().split("T")[0], end: sunday.toISOString().split("T")[0] };
}

export default function WeeklyKRAForm({ backHref }: { backHref: string }) {
  const router = useRouter();
  const { start, end } = getWeekRange();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<WeeklyKraForm>({ weekStartDate: start, weekEndDate: end, overallNotes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof WeeklyKraForm, string>>>({});
  const [platforms, setPlatforms] = useState<OtaPlatform[]>(initialPlatforms);
  const [supplies, setSupplies] = useState<SupplyItem[]>(initialSupplies);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileUpload = (platformId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPlatforms((prev) => prev.map((p) => p.id === platformId ? { ...p, imageFile: file, imagePreview: reader.result as string, uploaded: true } : p));
    };
    reader.readAsDataURL(file);
  };

  const toggleSupply = (id: string) => setSupplies((prev) => prev.map((s) => s.id === id ? { ...s, checked: !s.checked } : s));
  const updateSupply = (id: string, field: keyof SupplyItem, value: string | boolean) =>
    setSupplies((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));

  const validateStep = (s: number) => {
    const newErrors: typeof errors = {};
    if (s === 1) { if (!form.weekStartDate) newErrors.weekStartDate = "Required"; if (!form.weekEndDate) newErrors.weekEndDate = "Required"; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => { if (!validateStep(step)) return; setDirection(1); setStep((s) => Math.min(s + 1, 4)); };
  const back = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const supplyOK = String(supplies.filter((s) => s.status === "ok").length);
      const supplyLow = String(supplies.filter((s) => s.status === "low").length);
      const supplyOut = String(supplies.filter((s) => s.status === "out").length);

      await kraAPI.submitWeekly({
        weekStartDate: form.weekStartDate,
        weekEndDate: form.weekEndDate,
        otaGoogle: platforms.find((p) => p.id === "google")?.uploaded ?? false,
        otaBooking: platforms.find((p) => p.id === "booking")?.uploaded ?? false,
        otaMakemytrip: platforms.find((p) => p.id === "makemytrip")?.uploaded ?? false,
        otaAirbnb: platforms.find((p) => p.id === "airbnb")?.uploaded ?? false,
        otaExpedia: platforms.find((p) => p.id === "expedia")?.uploaded ?? false,
        otaTripadvisor: platforms.find((p) => p.id === "tripadvisor")?.uploaded ?? false,
        supplyOK,
        supplyLow,
        supplyOut,
        overallNotes: form.overallNotes,
      });
      toast.success("Weekly KRA submitted successfully!", {
        description: `Week of ${new Date(form.weekStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${platforms.filter((p) => p.uploaded).length}/${platforms.length} OTA platforms updated`,
        duration: 4500,
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

  const categories = [...new Set(supplies.map((s) => s.category))];
  const uploadedCount = platforms.filter((p) => p.uploaded).length;
  const reviewedCount = supplies.filter((s) => s.checked).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push(backHref)}
          className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Weekly KRA Form</h1>
          <p className="text-slate-500 text-sm">Submit your weekly key result areas</p>
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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isComplete ? "bg-indigo-500 shadow-lg shadow-indigo-500/25" : isCurrent ? "bg-indigo-600 shadow-lg shadow-indigo-600/20" : "bg-slate-100"}`}>
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

        <div className="relative overflow-hidden min-h-[360px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }} className="p-6 space-y-5">

              {/* Step 1 */}
              {step === 1 && (
                <>
                  <div className="bg-indigo-50 border border-indigo-200/60 rounded-xl p-4 flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">Weekly Report</p>
                      <p className="text-xs text-indigo-600 mt-0.5">Covers OTA image uploads and supply stock review for the full week.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Week Start <span className="text-red-500">*</span></label>
                      <input type="date" value={form.weekStartDate} onChange={(e) => setForm((f) => ({ ...f, weekStartDate: e.target.value }))}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${errors.weekStartDate ? "border-red-300 focus:ring-red-100" : "border-slate-200/60 focus:ring-slate-200"}`} />
                      {errors.weekStartDate && <p className="text-red-500 text-xs mt-1">{errors.weekStartDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Week End <span className="text-red-500">*</span></label>
                      <input type="date" value={form.weekEndDate} onChange={(e) => setForm((f) => ({ ...f, weekEndDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Weekly Notes</label>
                    <textarea value={form.overallNotes} onChange={(e) => setForm((f) => ({ ...f, overallNotes: e.target.value }))}
                      placeholder="Overall observations or highlights for this week..." rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none" />
                  </div>
                </>
              )}

              {/* Step 2: OTA */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Upload property images for each OTA platform</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${uploadedCount === platforms.length ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-slate-100 text-slate-600 border-slate-200/60"}`}>
                      {uploadedCount}/{platforms.length} uploaded
                    </span>
                  </div>
                  {platforms.map((p) => (
                    <div key={p.id} className="border border-slate-200/60 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: p.color }}>{p.icon}</div>
                        <span className="text-sm font-semibold text-slate-900 flex-1">{p.name}</span>
                        {p.uploaded && (
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        {p.imagePreview ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200/60">
                            <img src={p.imagePreview} alt={p.name} className="w-full h-36 object-cover" />
                            <button onClick={() => setPlatforms((prev) => prev.map((pl) => pl.id === p.id ? { ...pl, imageFile: null, imagePreview: null, uploaded: false } : pl))}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div onClick={() => fileInputRefs.current[p.id]?.click()}
                            className="flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                            <Upload className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                            <p className="text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">Click to upload image</p>
                            <input ref={(el) => { fileInputRefs.current[p.id] = el; }} type="file" accept="image/*" className="hidden"
                              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(p.id, file); }} />
                          </div>
                        )}
                        <input type="text" value={p.notes} onChange={(e) => setPlatforms((prev) => prev.map((pl) => pl.id === p.id ? { ...pl, notes: e.target.value } : pl))}
                          placeholder={`Notes for ${p.name}...`}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Supply */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Review and check all supply items</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${reviewedCount === supplies.length ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"}`}>
                      {reviewedCount}/{supplies.length} reviewed
                    </span>
                  </div>
                  {categories.map((category) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{category}</p>
                      <div className="border border-slate-200/60 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {supplies.filter((s) => s.category === category).map((supply) => (
                          <div key={supply.id} className={`flex items-start gap-3 p-3.5 transition-colors ${supply.checked ? "bg-slate-50/80" : "bg-white"}`}>
                            <button onClick={() => toggleSupply(supply.id)}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${supply.checked ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-slate-400"}`}>
                              {supply.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </button>
                            <div className="flex-1 min-w-0 space-y-2">
                              <span className={`text-sm font-medium ${supply.checked ? "text-slate-500 line-through" : "text-slate-900"}`}>{supply.name}</span>
                              {supply.checked && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <input type="text" value={supply.quantity} onChange={(e) => updateSupply(supply.id, "quantity", e.target.value)} placeholder="Qty / notes"
                                    className="flex-1 min-w-0 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200" />
                                  <div className="flex gap-1">
                                    {statusOptions.map((opt) => (
                                      <button key={opt.value} onClick={() => updateSupply(supply.id, "status", opt.value)}
                                        className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${supply.status === opt.value ? opt.color : "bg-white text-slate-500 border-slate-200/60"}`}>
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Week Details</p>
                    <div className="text-sm flex justify-between"><span className="text-slate-500">Period</span>
                      <span className="text-slate-900 font-medium">
                        {new Date(form.weekStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(form.weekEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">OTA Image Tracker</p>
                    <div className="space-y-2">
                      {platforms.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: p.color }}>{p.icon}</div>
                            <span className="text-sm text-slate-700">{p.name}</span>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.uploaded ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-200"}`}>
                            {p.uploaded ? "✓ Uploaded" : "Skipped"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Supply Summary</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Reviewed", value: reviewedCount, color: "text-slate-950" },
                        { label: "Low Stock", value: supplies.filter((s) => s.status === "low").length, color: "text-amber-600" },
                        { label: "Out of Stock", value: supplies.filter((s) => s.status === "out").length, color: "text-red-500" },
                      ].map((item) => (
                        <div key={item.label} className="text-center bg-white rounded-xl p-3 border border-slate-200/60">
                          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>
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
          {step < 4 ? (
            <button onClick={next} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm">
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Submit Weekly KRA</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
