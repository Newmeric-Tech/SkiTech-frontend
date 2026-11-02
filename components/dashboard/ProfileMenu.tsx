"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

export type ProfileMenuItem = {
  icon: React.ElementType;
  label: string;
  href: string;
};

type ProfileMenuProps = {
  name: string;
  roleLabel: string;
  /** Second line inside the open menu; defaults to roleLabel. */
  detail?: string;
  initials: string;
  /** Links shown above Sign Out, e.g. Settings. */
  items?: ProfileMenuItem[];
  onSignOut: () => void;
};

// Header profile trigger and its dropdown, shared by the dashboard and
// superadmin layouts. The dropdown is a portal so it escapes stacking contexts.
export function ProfileMenu({ name, roleLabel, detail, initials, items = [], onSignOut }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [domReady, setDomReady] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDomReady(true); }, []);

  // The menu is portalled to the end of <body>, so move focus into it on open;
  // Escape closes it and returns focus to the trigger
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    onSignOut();
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-black dark:text-white leading-tight">{name}</p>
          <p className="text-xs text-neutral-500 dark:text-[#a0a0a0] leading-tight">{roleLabel}</p>
        </div>
        <div className="w-10 h-10 bg-black/5 dark:bg-white/10 backdrop-blur rounded-xl border border-black/10 dark:border-white/15 flex items-center justify-center text-black dark:text-white font-bold shadow-sm shrink-0">
          {initials}
        </div>
      </button>

      {domReady && createPortal(
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
              <motion.div
                ref={menuRef}
                role="menu"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="fixed top-[88px] right-4 w-72 bg-white dark:bg-[#111111] rounded-2xl shadow-xl border border-black/10 dark:border-white/10 overflow-hidden z-[9999]"
              >
                {/* User info */}
                <div className="px-4 py-3.5 border-b border-black/8 dark:border-white/8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black dark:text-white truncate">{name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{detail || roleLabel}</p>
                  </div>
                </div>

                {/* Extra items, then sign out */}
                <div className="p-2">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-700 dark:text-[#c8c8c8] hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    role="menuitem"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
