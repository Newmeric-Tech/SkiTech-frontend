"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMarketingTheme } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { setMenuOpen } = useMarketingTheme();

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "var(--mk-nav-bg)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid var(--mk-glass-border)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span
              className="nav-logo-dot w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: "var(--mk-accent)",
                boxShadow: "0 0 8px var(--mk-accent-glow)",
              }}
            />
            <span
              className="tracking-tight"
              style={{
                color: "var(--mk-text-1)",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              SkiTech
            </span>
          </Link>

          {/* Right controls: ThemeToggle → Sign in → MENU */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              href="/auth/login"
              className="hidden md:inline-flex items-center px-4 py-1.5 rounded-full text-[13px]"
              style={{
                color: "var(--mk-text-2)",
                border: "1px solid var(--mk-border)",
                fontWeight: 400,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--mk-text-1)";
                e.currentTarget.style.borderColor = "var(--mk-border-strong)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--mk-text-2)";
                e.currentTarget.style.borderColor = "var(--mk-border)";
              }}
            >
              Sign in
            </Link>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex items-center gap-2.5 px-[18px] py-[9px] rounded-full"
              style={{
                background: "var(--mk-btn-primary-bg)",
                color: "var(--mk-btn-primary-text)",
              }}
            >
              <span className="flex flex-col justify-center gap-[4.5px] w-[16px]">
                <span
                  className="block h-[1.5px] w-full rounded-full"
                  style={{ background: "var(--mk-btn-primary-text)" }}
                />
                <span
                  className="block h-[1.5px] w-[10px] rounded-full"
                  style={{ background: "var(--mk-btn-primary-text)", opacity: 0.6 }}
                />
              </span>
              <span className="text-[10.5px] font-semibold tracking-[0.2em] uppercase">
                Menu
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
