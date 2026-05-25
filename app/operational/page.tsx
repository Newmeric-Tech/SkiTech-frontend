"use client";

import { useState } from "react";
import { Bell, Settings, Search as SearchIcon } from "lucide-react";
import { Toaster, toast } from "sonner";
import HandoverTab from "@/components/operational/HandoverTab";
import ComplaintsTab from "@/components/operational/ComplaintsTab";
import EventsTab from "@/components/operational/EventsTab";
import AttentionTab from "@/components/operational/AttentionTab";

type TabType = "all" | "complaint" | "events" | "attention";

export default function OperationalPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "complaint", label: "Complaint" },
    { key: "events", label: "Events" },
    { key: "attention", label: "Need Attention" },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 2) {
      toast.info(`Searching for: ${e.target.value}`);
    }
  };

  const handleBellClick = () => {
    toast.info("Viewing notifications");
  };

  const handleSettingsClick = () => {
    toast.info("Opening settings");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-right" />
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-sm font-medium transition-colors relative pb-1 ${
                  activeTab === tab.key
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute left-0 right-0 -bottom-5 h-0.5 bg-slate-900 rounded-t-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search logs..."
              className="bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 w-48 transition-all"
            />
          </div>
          <button onClick={handleBellClick} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50"></span>
          </button>
          <button onClick={handleSettingsClick} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center">
            <span className="text-sm font-bold text-slate-600">JD</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8">
        {activeTab === "all" && <HandoverTab />}
        {activeTab === "complaint" && <ComplaintsTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "attention" && <AttentionTab />}
      </main>
    </div>
  );
}