"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, Clock, TrendingUp, AlertCircle, 
  DollarSign, Users, Calendar, ClipboardCheck 
} from "lucide-react";

type KRaType = "daily" | "weekly" | "monthly" | "quarterly";

const tabs: { id: KRaType; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
];

const summaryData = [
  { label: "Pending KRAs", value: 2, icon: Clock, color: "#F59E0B" },
  { label: "Submitted This Month", value: 18, icon: CheckCircle2, color: "#10B981" },
  { label: "Approval Rate", value: "94%", icon: TrendingUp, color: "#3B82F6" },
  { label: "Last Submission", value: "Apr 23", icon: AlertCircle, color: "#6366F1" },
];

interface DailyFormData {
  shift: string;
  date: string;
  guestCheckIns: string;
  guestCheckOuts: string;
  complaints: string;
  roomChecks: string;
  maintenanceTasks: string;
  cashDeposits: string;
}

interface WeeklyFormData {
  weekStartDate: string;
  weekEndDate: string;
  overallNotes: string;
}

interface MonthlyFormData {
  month: string;
  year: string;
  revenueAmount: string;
  guestCount: string;
  occupancyRate: string;
}

interface QuarterlyFormData {
  quarter: string;
  year: string;
  revenueAmount: string;
  guestCount: string;
  occupancyRate: string;
}

const initialDaily: DailyFormData = {
  shift: "",
  date: new Date().toISOString().split("T")[0],
  guestCheckIns: "",
  guestCheckOuts: "",
  complaints: "",
  roomChecks: "",
  maintenanceTasks: "",
  cashDeposits: "",
};

const initialWeekly: WeeklyFormData = {
  weekStartDate: "",
  weekEndDate: "",
  overallNotes: "",
};

const initialMonthly: MonthlyFormData = {
  month: "",
  year: "",
  revenueAmount: "",
  guestCount: "",
  occupancyRate: "",
};

const initialQuarterly: QuarterlyFormData = {
  quarter: "",
  year: "",
  revenueAmount: "",
  guestCount: "",
  occupancyRate: "",
};

export default function OwnerKRAPage() {
  const [activeTab, setActiveTab] = useState<KRaType>("daily");
  const [dailyForm, setDailyForm] = useState<DailyFormData>(initialDaily);
  const [weeklyForm, setWeeklyForm] = useState<WeeklyFormData>(initialWeekly);
  const [monthlyForm, setMonthlyForm] = useState<MonthlyFormData>(initialMonthly);
  const [quarterlyForm, setQuarterlyForm] = useState<QuarterlyFormData>(initialQuarterly);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
          <input type="date" value={dailyForm.date} onChange={(e) => setDailyForm(f => ({ ...f, date: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Shift</label>
          <select value={dailyForm.shift} onChange={(e) => setDailyForm(f => ({ ...f, shift: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="">Select shift...</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Guest Check-Ins</label>
          <input type="number" value={dailyForm.guestCheckIns} onChange={(e) => setDailyForm(f => ({ ...f, guestCheckIns: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Guest Check-Outs</label>
          <input type="number" value={dailyForm.guestCheckOuts} onChange={(e) => setDailyForm(f => ({ ...f, guestCheckOuts: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Checks</label>
          <input type="number" value={dailyForm.roomChecks} onChange={(e) => setDailyForm(f => ({ ...f, roomChecks: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cash Deposits (₹)</label>
          <input type="number" value={dailyForm.cashDeposits} onChange={(e) => setDailyForm(f => ({ ...f, cashDeposits: e.target.value }))} placeholder="0"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
    </div>
  );

  const renderWeeklyForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Week Start</label>
          <input type="date" value={weeklyForm.weekStartDate} onChange={(e) => setWeeklyForm(f => ({ ...f, weekStartDate: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Week End</label>
          <input type="date" value={weeklyForm.weekEndDate} onChange={(e) => setWeeklyForm(f => ({ ...f, weekEndDate: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
      <div className="bg-indigo-50 border border-indigo-200/60 rounded-xl p-4">
        <p className="text-sm text-indigo-800 font-medium">Weekly KRA Checklist</p>
        <p className="text-xs text-indigo-600 mt-1">Upload OTA platform images and review supply stock</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
        <textarea value={weeklyForm.overallNotes} onChange={(e) => setWeeklyForm(f => ({ ...f, overallNotes: e.target.value }))}
          rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200" />
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
            <input type="number" value={monthlyForm.revenueAmount} onChange={(e) => setMonthlyForm(f => ({ ...f, revenueAmount: e.target.value }))} placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Guests</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" value={monthlyForm.guestCount} onChange={(e) => setMonthlyForm(f => ({ ...f, guestCount: e.target.value }))} placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Occupancy Rate (%)</label>
            <input type="number" value={monthlyForm.occupancyRate} onChange={(e) => setMonthlyForm(f => ({ ...f, occupancyRate: e.target.value }))} placeholder="0"
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
            <input type="number" value={quarterlyForm.revenueAmount} onChange={(e) => setQuarterlyForm(f => ({ ...f, revenueAmount: e.target.value }))} placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Guests</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" value={quarterlyForm.guestCount} onChange={(e) => setQuarterlyForm(f => ({ ...f, guestCount: e.target.value }))} placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Avg. Occupancy (%)</label>
            <input type="number" value={quarterlyForm.occupancyRate} onChange={(e) => setQuarterlyForm(f => ({ ...f, occupancyRate: e.target.value }))} placeholder="0"
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
          <p className="text-slate-500 text-sm mt-1">Manage and submit all Key Result Area forms</p>
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
                  layoutId="activeTabOwner"
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

const kraItems = [
  { dept: "Front Desk", task: "Shift changeover report", due: "08:00 AM", status: "done", compliance: 100 },
  { dept: "Front Desk", task: "Guest check-in verification", due: "09:15 AM", status: "done", compliance: 100 },
  { dept: "Housekeeping", task: "Room inspection — Floor 1-5", due: "10:00 AM", status: "done", compliance: 96 },
  { dept: "Housekeeping", task: "Minibar restocking audit", due: "11:00 AM", status: "pending", compliance: 0 },
  { dept: "F&B", task: "Breakfast service quality check", due: "09:30 AM", status: "done", compliance: 92 },
  { dept: "Maintenance", task: "Preventive maintenance log", due: "02:00 PM", status: "overdue", compliance: 0 },
  { dept: "Security", task: "Perimeter check report", due: "12:00 PM", status: "done", compliance: 100 },
{ dept: "Finance", task: "Daily revenue reconciliation", due: "03:00 PM", status: "pending", compliance: 0 },
];
