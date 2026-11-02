"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

// Same serif used on the marketing/landing pages — loaded locally here since
// the dashboard route group doesn't share the marketing layout's font tree.
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-playfair-dash",
});
import {
  Zap, LayoutDashboard, Building2, Users, UserCheck, BarChart3,
  Shield, Truck, FileText, Settings, ChevronLeft, ChevronRight,
  Bell, Briefcase, Menu, ClipboardList, Clock, Package,
  ShieldCheck, Layers, X, Sun, Moon, BedDouble,
  Folder, AlertCircle, Activity, Trophy, CalendarClock, CalendarDays,
  Inbox, MapPin,
} from "lucide-react";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import { ProfileMenu } from "@/components/dashboard/ProfileMenu";
import { SidebarTooltip } from "@/components/dashboard/SidebarTooltip";
import { inboxAPI } from "@/lib/api/inbox";
import { useDarkMode } from "@/hooks/useDarkMode";

type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  feature?: string;
  /** Show the inbox unread count next to this item. */
  inboxBadge?: boolean;
};

const ownerNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",          href: "/owner" },
  { icon: Inbox,           label: "Inbox",              href: "/owner/inbox" },
  { icon: Building2,       label: "Properties",         href: "/owner/properties" },
  { icon: Briefcase,       label: "Managers",           href: "/owner/managers" },
  { icon: Users,           label: "Staff",              href: "/owner/staff" },
  { icon: BarChart3,       label: "Reports",            href: "/owner/reports",                      feature: "reports" },
  { icon: Shield,          label: "KRA Monitoring",     href: "/owner/kra",                          feature: "kra" },
  { icon: Truck,           label: "Inventory",          href: "/owner/inventory",                    feature: "inventory" },
  { icon: FileText,        label: "SOP Management",     href: "/owner/sop",                          feature: "sop" },
  { icon: CalendarClock,   label: "Employee Scheduling",href: "/owner/scheduling",                   feature: "employee_scheduling" },
  { icon: AlertCircle,     label: "Error & Complaints", href: "/owner/complaints" },
  { icon: MapPin,          label: "Punch Locations",    href: "/owner/punch-locations",             feature: "attendance" },
  { icon: Folder,          label: "Documents",          href: "/owner/document-management" },
  { icon: Activity,        label: "Activity Log",       href: "/owner/master-activity-log",          feature: "master_log" },
  { icon: Trophy,          label: "Employee Ranking",   href: "/owner/employee-ranking/dashboard",   feature: "employee_ranking" },
];

const ownerConfigNav: NavItem[] = [
  { icon: Package,   label: "Vendors",     href: "/owner/vendors",     feature: "vendor_management" },
  { icon: UserCheck, label: "Owners",      href: "/owner/owners" },
  { icon: Layers,    label: "Departments", href: "/owner/departments" },
  { icon: Settings,  label: "Settings",    href: "/owner/settings" },
];

const managerNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",          href: "/manager" },
  { icon: Inbox,           label: "Inbox",              href: "/manager/inbox",                      inboxBadge: true },
  { icon: Clock,           label: "Punch In/Out",       href: "/manager/punch",                      feature: "attendance" },
  { icon: BedDouble,       label: "Room Management",    href: "/manager/rooms" },
  { icon: ClipboardList,   label: "Tasks",              href: "/manager/tasks" },
  { icon: UserCheck,       label: "Attendance",         href: "/manager/attendance",                 feature: "attendance" },
  { icon: Truck,           label: "Inventory",          href: "/manager/inventory",                  feature: "inventory" },
  { icon: BarChart3,       label: "Reports",            href: "/manager/reports",                    feature: "reports" },
  { icon: FileText,        label: "SOP Management",     href: "/manager/sop",                        feature: "sop" },
  { icon: CalendarDays,    label: "KRA Center",         href: "/manager/kra",                        feature: "kra" },
  { icon: CalendarClock,   label: "Employee Scheduling",href: "/manager/scheduling",                 feature: "employee_scheduling" },
  { icon: AlertCircle,     label: "Error & Complaints", href: "/manager/complaints" },
  { icon: Folder,          label: "Documents",          href: "/manager/document-management" },
  { icon: Trophy,          label: "Employee Ranking",   href: "/manager/employee-ranking/dashboard", feature: "employee_ranking" },
];

const staffNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/staff" },
  { icon: Clock,           label: "Punch In/Out", href: "/staff/punch",                              feature: "attendance" },
  { icon: ClipboardList,   label: "My Tasks",     href: "/staff/tasks" },
  { icon: FileText,        label: "SOPs",         href: "/staff/sop",                                feature: "sop" },
  { icon: CalendarDays,    label: "KRA Center",   href: "/staff/kra",                                feature: "kra" },
  { icon: CalendarClock,   label: "My Schedule",  href: "/staff/scheduling",                         feature: "employee_scheduling" },
  { icon: AlertCircle,     label: "My Complaints",href: "/staff/complaints" },
  { icon: Folder,          label: "Documents",    href: "/staff/document-management" },
  { icon: Trophy,          label: "My Ranking",   href: "/staff/employee-ranking/staff-dashboard",   feature: "employee_ranking" },
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
  const [inboxUnread, setInboxUnread] = useState(0);
  const onManagerPortal = pathname.startsWith("/manager");

  // Unread inbox count for the manager sidebar badge; one cheap count query
  // per navigation (GET /inbox/unread-count), only on manager pages.
  useEffect(() => {
    if (!onManagerPortal) return;
    let cancelled = false;
    inboxAPI.unreadCount().then((n) => { if (!cancelled) setInboxUnread(n); }).catch(() => {});
    return () => { cancelled = true; };
  }, [onManagerPortal, pathname]);
  const router = useRouter();
  const { user, features, refreshFeatures, isAuthenticated, logout } = useAuthStore();
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
  // Manager and Staff reach their Settings page from the profile menu
  let settingsHref: string | null = null;

  if (pathname.startsWith("/owner")) {
    navItems = ownerNav;
    configNavItems = ownerConfigNav;
    roleLabel = "Access"; // Simplified

    // Co Admin: hide nav items that expose cross-property or admin-only data
    if (user?.role === "Co Admin") {
      navItems = navItems.filter(item =>
        item.href !== "/owner/master-activity-log"
      );
      configNavItems = configNavItems.filter(item =>
        item.href !== "/owner/owners"
      );
    }
  } else if (pathname.startsWith("/manager")) {
    navItems = managerNav;
    roleLabel = "Manager";
    settingsHref = "/manager/settings";
  } else if (pathname.startsWith("/staff")) {
    navItems = staffNav;
    roleLabel = "Staff";
    settingsHref = "/staff/settings";
  }

  if (!mounted) return <div className="h-screen bg-[#f4f3ef] dark:bg-[#0a0a0a]" />;
  return (
    <div className={`${playfairDisplay.variable} flex h-screen bg-[#f4f3ef] dark:bg-[#0a0a0a] overflow-hidden relative`}>
      {/* Ambient accent glows — decorative only, mirrors the landing page background */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full pointer-events-none z-0 opacity-60 dark:opacity-100 blur-[110px]" style={{ background: "radial-gradient(circle, rgba(79,70,229,0.10) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full pointer-events-none z-0 opacity-60 dark:opacity-100 blur-[130px]" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />

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
        className={`fixed md:relative z-50 h-full bg-white/80 dark:bg-[#111111]/90 backdrop-blur-xl text-neutral-700 dark:text-[#c8c8c8] flex flex-col border-r border-black/10 dark:border-white/10 shadow-xl`}
      >
        {/* Logo Area */}
        <div className={`h-20 flex items-center ${collapsed ? "justify-center" : "px-6 justify-between"} border-b border-black/10 dark:border-white/10`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-black/25 dark:shadow-white/10">
              <Zap className="w-6 h-6 text-white dark:text-black" fill="currentColor" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-black dark:text-white font-bold text-xl tracking-tight [font-family:var(--font-playfair-dash)]"
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-8 px-4 custom-scrollbar">
          {/* Main Nav */}
          <div className="space-y-1">
            {!collapsed && <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2">Main Menu</p>}
            {navItems.filter(hasAccess).map((item) => {
              const isActive = pathname === item.href || (item.href.split("/").length > 2 && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/25 dark:shadow-white/10"
                      : "hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-[#c8c8c8]"
                  }`}
                >
                  <item.icon className={`w-[22px] h-[22px] shrink-0 ${isActive ? "text-white dark:text-black" : "text-neutral-500 dark:text-[#a0a0a0] group-hover:text-black dark:group-hover:text-white"}`} />
                  {!collapsed && <span className="font-medium whitespace-nowrap flex-1">{item.label}</span>}
                  {item.inboxBadge && inboxUnread > 0 && (
                    collapsed ? (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" aria-label={`${inboxUnread} unread`} />
                    ) : (
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-500 text-white" aria-label={`${inboxUnread} unread`}>
                        {inboxUnread > 99 ? "99+" : inboxUnread}
                      </span>
                    )
                  )}
                  {collapsed && <SidebarTooltip label={item.label} />}
                </Link>
              );
            })}
          </div>

          {/* Configuration Nav (owner only) */}
          {configNavItems.filter(hasAccess).length > 0 && (
            <div className="space-y-1">
              {!collapsed && <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2">Configuration</p>}
              {configNavItems.filter(hasAccess).map((item) => {
                const isActive = pathname === item.href || (item.href.split("/").length > 2 && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/10"
                        : "hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-[#c8c8c8]"
                    }`}
                  >
                    <item.icon className={`w-[22px] h-[22px] shrink-0 ${isActive ? "text-white dark:text-black" : "text-neutral-500 dark:text-[#a0a0a0] group-hover:text-black dark:group-hover:text-white"}`} />
                    {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                    {collapsed && <SidebarTooltip label={item.label} />}
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
      <div className="flex-1 flex flex-col h-full relative z-0 min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-20 bg-white/70 dark:bg-[#111111]/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-neutral-500 dark:text-[#a0a0a0] hover:text-black dark:hover:text-white">
               <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white hidden sm:block [font-family:var(--font-playfair-dash)]">
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
                <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full border-2 border-white dark:border-[#111111]" />
              </button>
              <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <div className="h-8 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block" />

            <ProfileMenu
              name={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
              roleLabel={user?.role || roleLabel}
              detail={user?.email}
              initials={`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`}
              items={settingsHref ? [{ icon: Settings, label: "Settings", href: settingsHref }] : []}
              onSignOut={() => logout()}
            />
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f4f3ef] dark:bg-[#0a0a0a] p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
