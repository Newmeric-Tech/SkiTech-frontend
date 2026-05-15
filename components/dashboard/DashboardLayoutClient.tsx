"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Building2, Users, UserCheck, BarChart3,
  Shield, Truck, FileText, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, Search, Briefcase, Menu, ClipboardList, Clock, Package,
  ShieldCheck, Layers, Lock, X, Sun, Moon, BedDouble,
} from "lucide-react";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import { useDarkMode } from "@/hooks/useDarkMode";

type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  feature?: string;
};

const ownerNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/owner" },
  { icon: Building2, label: "Properties", href: "/owner/properties" },
  { icon: Briefcase, label: "Managers", href: "/owner/managers" },
  { icon: Users, label: "Staff", href: "/owner/staff" },
  { icon: BarChart3, label: "Reports", href: "/owner/reports" },
  { icon: Shield, label: "KRA Monitoring", href: "/owner/kra" },
  { icon: Truck, label: "Inventory", href: "/owner/inventory", feature: "inventory" },
  { icon: FileText, label: "SOP Management", href: "/owner/sop" },
];

const ownerConfigNav: NavItem[] = [
  { icon: Package, label: "Vendors", href: "/owner/vendors" },
  { icon: UserCheck, label: "Owners", href: "/owner/owners" },
  { icon: Layers, label: "Departments", href: "/owner/departments" },
  { icon: Lock, label: "Permissions", href: "/owner/permissions" },
  { icon: Settings, label: "Settings", href: "/owner/settings" },
];

const managerNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/manager" },
  { icon: Clock, label: "Punch In/Out", href: "/manager/punch" },
  { icon: BedDouble, label: "Room Management", href: "/manager/rooms" },
  { icon: ClipboardList, label: "Tasks", href: "/manager/tasks" },
  { icon: UserCheck, label: "Attendance", href: "/manager/attendance" },
  { icon: Truck, label: "Inventory", href: "/manager/inventory", feature: "inventory" },
  { icon: BarChart3, label: "Reports", href: "/manager/reports" },
  { icon: FileText, label: "SOP Management", href: "/manager/sop" },
];

const staffNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/staff" },
  { icon: Clock, label: "Punch In/Out", href: "/staff/punch" },
  { icon: ClipboardList, label: "My Tasks", href: "/staff/tasks" },
  { icon: FileText, label: "SOPs", href: "/staff/sop" },
];

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { dark, toggle: toggleDark } = useDarkMode();
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [])
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar");
    setCollapsed(saved === "true");
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, features, refreshFeatures, isAuthenticated, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Refresh features from server on every mount so stale localStorage never persists
  useEffect(() => {
    if (isAuthenticated) refreshFeatures();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Super admins bypass all feature gates
  const isSuperAdmin = user?.role === "Super Admin";

  function hasAccess(item: NavItem): boolean {
    if (isSuperAdmin || !item.feature) return true;
    return features[item.feature] === true;
  }

  // Determine which nav to show based on current path
  let navItems: NavItem[] = [];
  let configNavItems: NavItem[] = [];
  let roleLabel = "";

  if (pathname.startsWith("/owner")) {
    navItems = ownerNav;
    configNavItems = ownerConfigNav;
    roleLabel = "Access"; // Simplified
  } else if (pathname.startsWith("/manager")) {
    navItems = managerNav;
    configNavItems = []; // No config for managers as per example
    roleLabel = "Manager";
  } else if (pathname.startsWith("/staff")) {
    navItems = staffNav;
    configNavItems = [];
    roleLabel = "Staff";
  }

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  if (!mounted) return <div className="h-screen bg-[#f8f7f4] dark:bg-[#111111]" />;
  return (
    <div className="flex h-screen bg-[#f8f7f4] dark:bg-[#111111] overflow-hidden">
      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 md:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 280,
          x: mobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768) ? -280 : 0
        }}
        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className={`fixed md:relative z-50 h-full bg-white/80 dark:bg-[#1c1c1c]/90 backdrop-blur-xl text-neutral-700 dark:text-[#c8c8c8] flex flex-col border-r border-black/10 dark:border-white/10 shadow-xl`}
      >
        {/* Logo Area */}
        <div className={`h-20 flex items-center ${collapsed ? "justify-center" : "px-6 justify-between"} border-b border-black/10 dark:border-white/10`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-black dark:text-white font-bold text-xl tracking-tight"
              >
                SkiTech
              </motion.span>
            )}
          </div>
          {!collapsed && (
             <button onClick={() => setMobileOpen(false)} className="md:hidden text-neutral-500">
               <X />
             </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 space-y-8 px-4 custom-scrollbar">
          {/* Main Nav */}
          <div className="space-y-1">
            {!collapsed && <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2">Main Menu</p>}
            {navItems.filter(hasAccess).map((item) => {
              const isActive = pathname === item.href || (item.href.split("/").length > 2 && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/10"
                      : "hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-[#c8c8c8]"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white dark:text-black" : "text-neutral-500 dark:text-[#a0a0a0] group-hover:text-black dark:group-hover:text-white"}`} />
                  {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-4 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Configuration Nav (only owner) */}
          {configNavItems.filter(hasAccess).length > 0 && (
            <div className="space-y-1">
              {!collapsed && <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2">Configuration</p>}
              {configNavItems.filter(hasAccess).map((item) => {
                const isActive = pathname === item.href || (item.href.split("/").length > 2 && pathname.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/10"
                        : "hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-[#c8c8c8]"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-white dark:text-black" : "text-neutral-500 dark:text-[#a0a0a0] group-hover:text-black dark:group-hover:text-white"}`} />
                    {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                    {collapsed && (
                      <div className="absolute left-full ml-4 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="px-3 py-2 border-t border-black/10 dark:border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-neutral-500 dark:text-[#a0a0a0] hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : <><ChevronLeft className="w-4 h-4" /><span className="font-medium text-sm">Collapse Sidebar</span></>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col h-full relative z-0">
        {/* Header */}
        <header className="h-20 bg-white/70 dark:bg-[#1c1c1c]/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-neutral-500 dark:text-[#a0a0a0] hover:text-black dark:hover:text-white">
               <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-black dark:text-white hidden sm:block">
              {roleLabel} Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDark}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/5 text-neutral-600 dark:text-[#c0c0c0] hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative text-neutral-500 dark:text-[#a0a0a0] hover:text-black dark:hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-black dark:bg-white rounded-full border-2 border-white dark:border-[#111111]" />
              </button>
              <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <div className="h-8 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block" />

            {/* Profile with dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-black dark:text-white leading-tight">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-[#a0a0a0] leading-tight">
                    {user?.role || roleLabel}
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/80 dark:bg-[#2a2a2a] backdrop-blur rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white font-bold shadow-sm shrink-0">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-xl border border-black/10 dark:border-white/10 overflow-hidden z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3.5 border-b border-black/8 dark:border-white/8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-bold text-sm shrink-0">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-black dark:text-white truncate">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {user?.email || (user?.role || roleLabel)}
                        </p>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="px-4 py-3 border-b border-black/8 dark:border-white/8">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          className="w-full pl-9 pr-3 py-2 bg-black/5 dark:bg-white/8 rounded-lg text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15 transition-all"
                        />
                      </div>
                    </div>

                    {/* Sign out */}
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f7f4] dark:bg-[#111111] p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
