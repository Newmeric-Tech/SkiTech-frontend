"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, Clock, TrendingUp, AlertCircle, 
  Calendar, ClipboardCheck, DollarSign, Users, FileText, Upload, X 
} from "lucide-react";

type KRaType = "daily" | "weekly" | "monthly" | "quarterly";

const tabs: { id: KRaType; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
];

const summaryData = [
  { label: "Pending KRAs", value: 1, icon: Clock, color: "#F59E0B" },
  { label: "Submitted This Month", value: 8, icon: CheckCircle2, color: "#10B981" },
  { label: "Approval Rate", value: "96%", icon: TrendingUp, color: "#3B82F6" },
  { label: "Last Submission", value: "Today", icon: AlertCircle, color: "#6366F1" },
];

interface DailyFormData {
  shift: string;
  date: string;
  guestCheckIns: string;
  guestCheckOuts: string;
  complaints: string;
  complaintsResolved: string;
  roomChecks: string;
  maintenanceTasks: string;
  cashDeposits: string;
  googleReviews: string;
}

interface WeeklyFormData {
  weekStartDate: string;
  weekEndDate: string;
  otaGoogle: boolean;
  otaBooking: boolean;
  otaMakemytrip: boolean;
  otaAirbnb: boolean;
  otaExpedia: boolean;
  otaTripadvisor: boolean;
  supplyOK: string;
  supplyLow: string;
  supplyOut: string;
  overallNotes: string;
}

interface MonthlyFormData {
  month: string;
  year: string;
  revenueAmount: string;
  revenueFile: File | null;
  revenueFilePreview: string | null;
  guestCount: string;
  occupancyRate: string;
}

interface QuarterlyFormData {
  quarter: string;
  year: string;
  revenueAmount: string;
  revenueFile: File | null;
  revenueFilePreview: string | null;
  guestCount: string;
  occupancyRate: string;
}

const initialDaily: DailyFormData = {
  shift: "",
  date: new Date().toISOString().split("T")[0],
  guestCheckIns: "",
  guestCheckOuts: "",
  complaints: "",
  complaintsResolved: "",
  roomChecks: "",
  maintenanceTasks: "",
  cashDeposits: "",
  googleReviews: "",
};

const initialWeekly: WeeklyFormData = {
  weekStartDate: "",
  weekEndDate: "",
  otaGoogle: false,
  otaBooking: false,
  otaMakemytrip: false,
  otaAirbnb: false,
  otaExpedia: false,
  otaTripadvisor: false,
  supplyOK: "",
  supplyLow: "",
  supplyOut: "",
  overallNotes: "",
};

const initialMonthly: MonthlyFormData = {
  month: "",
  year: "",
  revenueAmount: "",
  revenueFile: null,
  revenueFilePreview: null,
  guestCount: "",
  occupancyRate: "",
};

const initialQuarterly: QuarterlyFormData = {
  quarter: "",
  year: "",
  revenueAmount: "",
  revenueFile: null,
  revenueFilePreview: null,
  guestCount: "",
  occupancyRate: "",
};

export default function StaffKRAPage() {
  const [activeTab, setActiveTab] = useState<KRaType>("daily");
  const [dailyForm, setDailyForm] = useState<DailyFormData>(initialDaily);
  const [weeklyForm, setWeeklyForm] = useState<WeeklyFormData>(initialWeekly);
  const [monthlyForm, setMonthlyForm] = useState<MonthlyFormData>(initialMonthly);
  const [quarterlyForm, setQuarterlyForm] = useState<QuarterlyFormData>(initialQuarterly);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const monthlyFileRef = useRef<HTMLInputElement>(null);
  const quarterlyFileRef = useRef<HTMLInputElement>(null);

  const handleMonthlyFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => setMonthlyForm(f => ({ ...f, revenueFile: file, revenueFilePreview: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleQuarterlyFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => setQuarterlyForm(f => ({ ...f, revenueFile: file, revenueFilePreview: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const renderForm = () => {
    if (activeTab === "daily") return renderDailyForm();
    if (activeTab === "weekly") return renderWeeklyForm();
    if (activeTab === "monthly") return renderMonthlyForm();
    if (activeTab === "quarterly") return renderQuarterlyForm();
    return null;
  };

  const renderDailyForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date <span className="text-red-500">*</span></label>
          <input type="date" value={dailyForm.date} onChange={(e) => setDailyForm(f => ({ ...f, date: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Shift <span className="text-red-500">*</span></label>
          <select value={dailyForm.shift} onChange={(e) => setDailyForm(f => ({ ...f, shift: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="">Select shift...</option>
            <option value="Morning">Morning (6AM - 2PM)</option>
            <option value="Evening">Evening (2PM - 10PM)</option>
            <option value="Night">Night (10PM - 6AM)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Guest Check-Ins <span className="text-red-500">*</span></label>
          <input type="number" min="0" value={dailyForm.guestCheckIns} onChange={(e) => setDailyForm(f => ({ ...f, guestCheckIns: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Guest Check-Outs <span className="text-red-500">*</span></label>
          <input type="number" min="0" value={dailyForm.guestCheckOuts} onChange={(e) => setDailyForm(f => ({ ...f, guestCheckOuts: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Complaints <span className="text-red-500">*</span></label>
          <input type="number" min="0" value={dailyForm.complaints} onChange={(e) => setDailyForm(f => ({ ...f, complaints: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Complaints Resolved</label>
          <input type="number" min="0" value={dailyForm.complaintsResolved} onChange={(e) => setDailyForm(f => ({ ...f, complaintsResolved: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Checks Done <span className="text-red-500">*</span></label>
          <input type="number" min="0" value={dailyForm.roomChecks} onChange={(e) => setDailyForm(f => ({ ...f, roomChecks: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Maintenance Tasks <span className="text-red-500">*</span></label>
          <input type="number" min="0" value={dailyForm.maintenanceTasks} onChange={(e) => setDailyForm(f => ({ ...f, maintenanceTasks: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cash Deposits (₹) <span className="text-red-500">*</span></label>
          <input type="number" min="0" value={dailyForm.cashDeposits} onChange={(e) => setDailyForm(f => ({ ...f, cashDeposits: e.target.value }))} placeholder="0.00"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Google Reviews <span className="text-red-500">*</span></label>
          <input type="number" min="0" value={dailyForm.googleReviews} onChange={(e) => setDailyForm(f => ({ ...f, googleReviews: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
    </div>
  );

  const renderWeeklyForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Week Start <span className="text-red-500">*</span></label>
          <input type="date" value={weeklyForm.weekStartDate} onChange={(e) => setWeeklyForm(f => ({ ...f, weekStartDate: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Week End <span className="text-red-500">*</span></label>
          <input type="date" value={weeklyForm.weekEndDate} onChange={(e) => setWeeklyForm(f => ({ ...f, weekEndDate: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">OTA Platform Images Uploaded</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { key: "otaGoogle", label: "Google", color: "#4285F4" },
            { key: "otaBooking", label: "Booking", color: "#003580" },
            { key: "otaMakemytrip", label: "MMT", color: "#E63946" },
            { key: "otaAirbnb", label: "Airbnb", color: "#FF385C" },
            { key: "otaExpedia", label: "Expedia", color: "#FFB700" },
            { key: "otaTripadvisor", label: "TripAdvisor", color: "#34E0A1" },
          ].map((ota) => (
            <button
              key={ota.key}
              type="button"
              onClick={() => setWeeklyForm(f => ({ ...f, [ota.key]: !f[ota.key as keyof WeeklyFormData] }))}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                weeklyForm[ota.key as keyof WeeklyFormData]
                  ? "border-slate-950 bg-slate-950"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: ota.color }}>
                {weeklyForm[ota.key as keyof WeeklyFormData] ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white text-xs font-bold">{ota.label[0]}</span>
                )}
              </div>
              <span className={`text-xs font-medium ${weeklyForm[ota.key as keyof WeeklyFormData] ? "text-white" : "text-slate-600"}`}>
                {ota.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Supply Stock Review</label>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-4">
            <p className="text-sm font-medium text-emerald-800 mb-2">Stock OK</p>
            <input type="number" min="0" value={weeklyForm.supplyOK} onChange={(e) => setWeeklyForm(f => ({ ...f, supplyOK: e.target.value }))} placeholder="Count"
              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm" />
          </div>
          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">Low Stock</p>
            <input type="number" min="0" value={weeklyForm.supplyLow} onChange={(e) => setWeeklyForm(f => ({ ...f, supplyLow: e.target.value }))} placeholder="Count"
              className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm" />
          </div>
          <div className="bg-red-50 border border-red-200/60 rounded-xl p-4">
            <p className="text-sm font-medium text-red-800 mb-2">Out of Stock</p>
            <input type="number" min="0" value={weeklyForm.supplyOut} onChange={(e) => setWeeklyForm(f => ({ ...f, supplyOut: e.target.value }))} placeholder="Count"
              className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Overall Notes</label>
        <textarea value={weeklyForm.overallNotes} onChange={(e) => setWeeklyForm(f => ({ ...f, overallNotes: e.target.value }))}
          placeholder="Observations or highlights for this week..." rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
    </div>
  );

  const renderMonthlyForm = () => {
    const months = [
      { value: "1", label: "January" }, { value: "2", label: "February" }, { value: "3", label: "March" },
      { value: "4", label: "April" }, { value: "5", label: "May" }, { value: "6", label: "June" },
      { value: "7", label: "July" }, { value: "8", label: "August" }, { value: "9", label: "September" },
      { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
<div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Month <span className="text-red-500">*</span></label>
            <select value={monthlyForm.month} onChange={(e) => setMonthlyForm(f => ({ ...f, month: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">Select month...</option>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year <span className="text-red-500">*</span></label>
            <select value={monthlyForm.year} onChange={(e) => setMonthlyForm(f => ({ ...f, year: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">Select year...</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Revenue (₹) <span className="text-red-500">*</span></label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="number" min="0" value={monthlyForm.revenueAmount} onChange={(e) => setMonthlyForm(f => ({ ...f, revenueAmount: e.target.value }))} placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Revenue Report File (Optional)</label>
          {monthlyForm.revenueFilePreview ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl">
              <FileText className="w-8 h-8 text-emerald-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{monthlyForm.revenueFile?.name}</p>
                <p className="text-xs text-slate-500">{monthlyForm.revenueFile && (monthlyForm.revenueFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button type="button" onClick={() => setMonthlyForm(f => ({ ...f, revenueFile: null, revenueFilePreview: null }))}
                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div onClick={() => monthlyFileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-all">
              <Upload className="w-6 h-6 text-slate-400" />
              <p className="text-xs text-slate-500">Click to upload file</p>
              <input ref={monthlyFileRef} type="file" accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg" className="hidden"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handleMonthlyFileUpload(file); }} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Guests</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" min="0" value={monthlyForm.guestCount} onChange={(e) => setMonthlyForm(f => ({ ...f, guestCount: e.target.value }))} placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Occupancy Rate (%)</label>
            <input type="number" min="0" max="100" value={monthlyForm.occupancyRate} onChange={(e) => setMonthlyForm(f => ({ ...f, occupancyRate: e.target.value }))} placeholder="0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
        </div>
      </div>
    );
  };

  const renderQuarterlyForm = () => {
    const quarters = [
      { value: "1", label: "Q1 (Jan - Mar)" },
      { value: "2", label: "Q2 (Apr - Jun)" },
      { value: "3", label: "Q3 (Jul - Sep)" },
      { value: "4", label: "Q4 (Oct - Dec)" },
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quarter <span className="text-red-500">*</span></label>
            <select value={quarterlyForm.quarter} onChange={(e) => setQuarterlyForm(f => ({ ...f, quarter: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">Select quarter...</option>
              {quarters.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year <span className="text-red-500">*</span></label>
            <select value={quarterlyForm.year} onChange={(e) => setQuarterlyForm(f => ({ ...f, year: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">Select year...</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Revenue (₹) <span className="text-red-500">*</span></label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="number" min="0" value={quarterlyForm.revenueAmount} onChange={(e) => setQuarterlyForm(f => ({ ...f, revenueAmount: e.target.value }))} placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Revenue Report File (Optional)</label>
          {quarterlyForm.revenueFilePreview ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl">
              <FileText className="w-8 h-8 text-emerald-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{quarterlyForm.revenueFile?.name}</p>
                <p className="text-xs text-slate-500">{quarterlyForm.revenueFile && (quarterlyForm.revenueFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button type="button" onClick={() => setQuarterlyForm(f => ({ ...f, revenueFile: null, revenueFilePreview: null }))}
                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div onClick={() => quarterlyFileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-all">
              <Upload className="w-6 h-6 text-slate-400" />
              <p className="text-xs text-slate-500">Click to upload file</p>
              <input ref={quarterlyFileRef} type="file" accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg" className="hidden"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handleQuarterlyFileUpload(file); }} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Guests</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" min="0" value={quarterlyForm.guestCount} onChange={(e) => setQuarterlyForm(f => ({ ...f, guestCount: e.target.value }))} placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Avg. Occupancy (%)</label>
            <input type="number" min="0" max="100" value={quarterlyForm.occupancyRate} onChange={(e) => setQuarterlyForm(f => ({ ...f, occupancyRate: e.target.value }))} placeholder="0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">KRA Center</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and submit all Key Result Area forms in one place</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-950">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSubmitted(false); }}
              className={`flex-1 px-4 py-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id 
                  ? "text-slate-950 bg-slate-50/50" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/30"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabStaff"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950"
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {submitted ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-slate-900">Submitted Successfully!</h3>
                  <p className="text-slate-500 text-sm mt-1">Your {activeTab} KRA has been recorded</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {renderForm()}
                  
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-slate-950 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="w-4 h-4" />
                          Submit {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} KRA
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}