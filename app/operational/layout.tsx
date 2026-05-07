"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, AlertTriangle, Bell, Calendar, Activity, Users, Settings,
  Plus, X, MessageSquare, Building, Wrench, PartyPopper, ShieldAlert,
  ChevronRight, Clock, Home, BarChart3
} from "lucide-react";
import { HandoverLog, dummyHandoverLogs, dummyComplaints } from "@/lib/operational";

export default function OperationalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [sidebarLinks, setSidebarLinks] = useState<{href: string; label: string; icon: any}[]>([]);

  useEffect(() => {
    const role = localStorage.getItem("skitech_role");
    const isManager = role === "Manager";
    setSidebarLinks([
      ...(isManager ? [{ href: "/operational/manager", label: "Manager Dashboard", icon: BarChart3 }] : []),
      { href: "/operational", label: "Error & Complaint Log", icon: AlertTriangle },
    ]);
  }, []);

  const getCounts = () => {
    const urgentLogs = dummyHandoverLogs.filter(l => 
      !l.resolved && ["critical", "emergency"].includes(l.priority)
    );
    const urgentComplaints = dummyComplaints.filter(c => 
      ["critical", "emergency"].includes(c.severity) && c.status !== "resolved"
    );
    return {
      handover: dummyHandoverLogs.length,
      complaints: dummyComplaints.length,
      attention: urgentLogs.length + urgentComplaints.length,
    };
  };

  const counts = getCounts();

  useEffect(() => {
    const handleScroll = () => {
      setShowFab(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-30 hidden lg:block">
        <div className="p-6 border-b border-slate-100">
          <Link href="/operational" className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-950 tracking-tight" style={{ fontWeight: 800 }}>SkiTech</h2>
              <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5">Hospitality Suite</p>
            </div>
          </Link>
        </div>

        <div className="px-4 pt-6 pb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Management</p>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarLinks.map(link => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
                {link.href === "/operational/handover" && counts.handover > 0 && (
                  <span className="ml-auto text-xs bg-slate-800 px-2 py-0.5 rounded-full">
                    {counts.handover}
                  </span>
                )}
                {link.href === "/operational/complaints" && counts.complaints > 0 && (
                  <span className="ml-auto text-xs bg-slate-800 px-2 py-0.5 rounded-full">
                    {counts.complaints}
                  </span>
                )}
                {link.href === "/operational/attention" && counts.attention > 0 && (
                  <span className="ml-auto text-xs bg-red-500 px-2 py-0.5 rounded-full animate-pulse">
                    {counts.attention}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white">
          <div className="mb-2">
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-2">Current Shift</p>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                JD
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">John Doe</p>
                <p className="text-xs text-slate-500 truncate">Morning Shift</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64">
        {children}
      </main>

      <AnimatePresence>
        {showFab && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowQuickAction(true)}
            className="fixed right-6 bottom-6 w-14 h-14 bg-slate-900 rounded-full shadow-lg flex items-center justify-center text-white z-50"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuickAction && (
          <QuickActionModal onClose={() => setShowQuickAction(false)} />
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}

function QuickActionModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"log" | "complaint" | "emergency">("log");

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed right-4 left-4 md:left-auto md:right-8 md:max-w-md bottom-4 md:top-8 md:bottom-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-950">Quick Actions</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {[
              { key: "log", label: "New Log" },
              { key: "complaint", label: "Complaint" },
              { key: "emergency", label: "Emergency" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-3">
          {activeTab === "log" && (
            <>
              <QuickActionBtn icon={FileText} label="Handover Log" href="/operational/handover" />
              <QuickActionBtn icon={AlertTriangle} label="Safety Alert" color="#DC2626" />
              <QuickActionBtn icon={Wrench} label="Maintenance" color="#F59E0B" />
              <QuickActionBtn icon={PartyPopper} label="Event" color="#8B5CF6" />
            </>
          )}
          {activeTab === "complaint" && (
            <>
              <QuickActionBtn icon={AlertTriangle} label="Guest Issue" color="#EF4444" />
              <QuickActionBtn icon={Building} label="Room Issue" color="#3B82F6" />
              <QuickActionBtn icon={Wrench} label="Technical" color="#F59E0B" />
              <QuickActionBtn icon={ShieldAlert} label="Safety" color="#DC2626" />
            </>
          )}
          {activeTab === "emergency" && (
            <>
              <QuickActionBtn icon={Bell} label="Fire Alarm" color="#DC2626" />
              <QuickActionBtn icon={ShieldAlert} label="Security" color="#DC2626" />
              <QuickActionBtn icon={AlertTriangle} label="Medical" color="#DC2626" />
              <QuickActionBtn icon={MessageSquare} label="Evacuation" color="#DC2626" />
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

function QuickActionBtn({
  icon: Icon,
  label,
  href,
  color = "#3B82F6"
}: {
  icon: any;
  label: string;
  href?: string;
  color?: string;
}) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: color + "20" }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function MobileNav() {
  const pathname = usePathname();
  const [links, setLinks] = useState<{href: string; label: string; icon: any}[]>([]);

  useEffect(() => {
    const role = localStorage.getItem("skitech_role");
    const isManager = role === "Manager";
    setLinks([
      ...(isManager ? [{ href: "/operational/manager", label: "Manager Dashboard", icon: BarChart3 }] : []),
      { href: "/operational", label: "Error & Complaint Log", icon: AlertTriangle },
    ]);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 lg:hidden">
      <nav className="flex items-center justify-around py-2">
        {links.slice(0, 5).map(link => {
          const isActive = pathname === link.href || (link.href !== "/operational" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}