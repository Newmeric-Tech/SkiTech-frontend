"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMarketingTheme } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

/* ─── menu overlay items — hash anchors preserved exactly ─────────────── */
const menuLinks = [
  {
    label: "Home",
    href: "/#home",
    number: "01",
    tag: "Start here",
    img: "https://images.unsplash.com/photo-1497366754035-f200581374c7?auto=format&fit=crop&w=900&q=80",
    caption: "Start here",
    sub: "Your journey begins",
  },
  {
    label: "About Us",
    href: "/#about-us",
    number: "02",
    tag: "Our story",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    caption: "Our story",
    sub: "The people behind SkiTech",
  },
  {
    label: "Features",
    href: "/#features",
    number: "03",
    tag: "What we do",
    img: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=900&q=80",
    caption: "What we do",
    sub: "Powerful tools, refined",
  },
  {
    label: "Solutions",
    href: "/#solutions",
    number: "04",
    tag: "For you",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    caption: "For you",
    sub: "Tailored to your needs",
  },
  {
    label: "Why SkiTech",
    href: "/#why-skitech",
    number: "05",
    tag: "The case",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    caption: "The case",
    sub: "Why we stand apart",
  },
  {
    label: "Pricing",
    href: "/#pricing",
    number: "06",
    tag: "Fair & clear",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    caption: "Fair & clear",
    sub: "Transparent pricing",
  },
  {
    label: "FAQs",
    href: "/#faqs",
    number: "07",
    tag: "Got questions?",
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
    caption: "Got questions?",
    sub: "We have answers",
  },
];

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80";

/* Preload overlay images on client */
if (typeof window !== "undefined") {
  [DEFAULT_IMG, ...menuLinks.map((l) => l.img)].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

/* ─── Desktop center nav links ────────────────────────────────────────── */
const centerLinks = [
  { label: "Modules",    href: "/#features"   },
  { label: "Solutions",  href: "/#solutions"  },
  { label: "Pricing",    href: "/#pricing"    },
  { label: "About",      href: "/about"       },
  { label: "Contact",    href: "/contact"     },
];

/* ─── Image crossfade panel (overlay right column) ────────────────────── */
function ImageSlide({
  src,
  alt,
  visible,
  caption,
  sub,
}: {
  src: string;
  alt: string;
  visible: boolean;
  caption?: string;
  sub?: string;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        animate={{ scale: visible ? 1 : 1.08 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        loading="eager"
      />
      {caption && sub && (
        <motion.div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)",
          }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.4, delay: visible ? 0.1 : 0 }}
        >
          <div className="px-7 pb-7">
            <motion.p
              className="text-[10px] tracking-[0.25em] uppercase mb-[5px]"
              style={{ color: "rgba(255,255,255,0.6)" }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 7 }}
              transition={{ duration: 0.35, delay: visible ? 0.18 : 0 }}
            >
              {caption}
            </motion.p>
            <motion.p
              className="font-light leading-snug"
              style={{
                fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
                letterSpacing: "-0.01em",
                color: "#ffffff",
              }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 9 }}
              transition={{ duration: 0.4, delay: visible ? 0.22 : 0 }}
            >
              {sub}
            </motion.p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Navbar ──────────────────────────────────────────────────────────── */
export function Navbar() {
  const { theme, toggleTheme } = useMarketingTheme();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen]   = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  /* scroll + escape + body-overflow */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ═══ NAV BAR ══════════════════════════════════════════════════════ */}
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

            {/* Center links — desktop only */}
            <div className="hidden lg:flex items-center gap-7">
              {centerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{ color: "var(--mk-text-2)", fontSize: 13, fontWeight: 400 }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--mk-text-1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--mk-text-2)")
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right controls */}
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

              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[13px]"
                style={{
                  background: "var(--mk-btn-primary-bg)",
                  color: "var(--mk-btn-primary-text)",
                  fontWeight: 700,
                }}
              >
                Get started <span className="ml-0.5">→</span>
              </Link>

              {/* Menu button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                className="relative flex items-center gap-2.5 px-[18px] py-[9px] rounded-full overflow-hidden"
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

      {/* ═══ FULLSCREEN OVERLAY — always light ════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[100] marketing-menu-overlay flex flex-col overflow-hidden"
            style={{ backgroundColor: "var(--menu-bg)" }}
          >
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-8 md:px-16 pt-6 pb-4 shrink-0">
              {/* Logo — always dark on light overlay */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span
                  className="nav-logo-dot w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "var(--menu-text)" }}
                />
                <span
                  style={{ fontWeight: 700, fontSize: 15, color: "var(--menu-text)" }}
                >
                  SkiTech
                </span>
              </Link>

              <div className="flex items-center gap-3">
                {/* Theme toggle — light-adapted for always-light overlay */}
                <button
                  onClick={() => { toggleTheme(); setIsOpen(false); }}
                  aria-label={
                    isDark ? "Switch to light mode" : "Switch to dark mode"
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid var(--menu-border)",
                    color: "var(--menu-text-muted)",
                  }}
                >
                  <span className="text-[13px] leading-none">
                    {isDark ? "☀" : "🌙"}
                  </span>
                  <div
                    className="relative flex-shrink-0"
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 9,
                      background: "rgba(0,0,0,0.08)",
                      border: "1px solid var(--menu-border)",
                    }}
                  >
                    <div
                      className="theme-toggle-thumb absolute top-[3px]"
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#4f46e5",
                        boxShadow: "0 0 6px rgba(79,70,229,0.2)",
                        transform: isDark
                          ? "translateX(3px)"
                          : "translateX(17px)",
                        transition:
                          "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    />
                  </div>
                  <span
                    className="hidden sm:block"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {isDark ? "Dark" : "Light"}
                  </span>
                </button>

                {/* Close button */}
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    border: "1px solid var(--menu-border)",
                    color: "var(--menu-text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(10,10,10,0.25)";
                    e.currentTarget.style.color = "var(--menu-text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--menu-border)";
                    e.currentTarget.style.color = "var(--menu-text-muted)";
                  }}
                >
                  <span className="relative w-3 h-3 flex items-center justify-center">
                    <span
                      className="block w-3 h-[1.5px] rotate-45 absolute"
                      style={{ background: "currentColor" }}
                    />
                    <span
                      className="block w-3 h-[1.5px] -rotate-45 absolute"
                      style={{ background: "currentColor" }}
                    />
                  </span>
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
                    Close
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Top rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.08,
              }}
              className="h-px mx-8 md:mx-16 origin-left shrink-0"
              style={{ background: "var(--menu-border)" }}
            />

            {/* ── Body ── */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* LEFT — nav list */}
              <div className="flex-1 flex items-center min-h-0 overflow-hidden">
                <div className="w-full px-8 md:px-16">
                  {menuLinks.map((link, i) => (
                    <div key={link.label} className="relative">
                      {/* Hover row highlight */}
                      <motion.div
                        className="absolute inset-y-0 -inset-x-8 md:-inset-x-16 pointer-events-none"
                        animate={{ opacity: hovered === i ? 1 : 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(0,0,0,0.035) 0%, transparent 80%)",
                        }}
                      />

                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        className="group flex items-center gap-5 md:gap-8 py-[10px] md:py-[12px] relative"
                      >
                        {/* Number + tag */}
                        <div className="flex flex-col items-end w-10 md:w-20 shrink-0">
                          <motion.span
                            animate={{ opacity: hovered === i ? 0.7 : 0.2 }}
                            transition={{ duration: 0.2 }}
                            className="text-[10px] tracking-[0.25em] tabular-nums"
                            style={{ color: "var(--menu-text)" }}
                          >
                            {link.number}
                          </motion.span>
                          <motion.span
                            animate={{ opacity: hovered === i ? 0.4 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="hidden md:block text-[9px] tracking-widest uppercase mt-0.5 whitespace-nowrap"
                            style={{ color: "var(--menu-text-muted)" }}
                          >
                            {link.tag}
                          </motion.span>
                        </div>

                        {/* Vertical divider */}
                        <motion.div
                          className="hidden md:block w-px self-stretch"
                          animate={{
                            background:
                              hovered === i
                                ? "rgba(10,10,10,0.18)"
                                : "rgba(10,10,10,0.07)",
                          }}
                          transition={{ duration: 0.2 }}
                        />

                        {/* Label */}
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.16 + i * 0.065,
                            duration: 0.55,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="flex-1 leading-none font-light"
                          style={{
                            fontSize: "clamp(1.65rem, 3.8vw, 3.4rem)",
                            letterSpacing: "-0.02em",
                            color:
                              hovered === null
                                ? "var(--menu-text)"
                                : hovered === i
                                ? "#000000"
                                : "rgba(10,10,10,0.15)",
                          }}
                        >
                          {link.label}
                        </motion.span>

                        {/* Arrow circle */}
                        <motion.div
                          className="shrink-0 w-9 h-9 rounded-full border flex items-center justify-center"
                          style={{ borderColor: "rgba(10,10,10,0.2)" }}
                          animate={{
                            opacity: hovered === i ? 1 : 0,
                            scale: hovered === i ? 1 : 0.6,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <span
                            className="text-base leading-none"
                            style={{ color: "rgba(10,10,10,0.5)" }}
                          >
                            →
                          </span>
                        </motion.div>
                      </Link>

                      {/* Item rule */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          delay: 0.1 + i * 0.05,
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="h-px origin-left"
                        style={{ background: "var(--menu-border)" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — image panel */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{
                  duration: 0.6,
                  delay: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="hidden lg:flex w-[38%] shrink-0 items-center justify-center py-8 pr-12"
              >
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden"
                  style={{
                    background: "#e0dfd9",
                    boxShadow:
                      "0 24px 64px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)",
                  }}
                >
                  <ImageSlide
                    src={DEFAULT_IMG}
                    alt="SkiTech"
                    visible={hovered === null}
                  />
                  {menuLinks.map((link, i) => (
                    <ImageSlide
                      key={link.label}
                      src={link.img}
                      alt={link.label}
                      visible={hovered === i}
                      caption={link.caption}
                      sub={link.sub}
                    />
                  ))}

                  {/* SkiTech badge */}
                  <motion.div
                    className="absolute top-5 right-5 z-10 px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.4)",
                    }}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.45,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <span
                      className="text-[9px] tracking-[0.2em] uppercase font-bold"
                      style={{ color: "#0a0a0a" }}
                    >
                      SkiTech
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* ── Bottom bar ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.35 }}
              className="shrink-0"
            >
              <div
                className="h-px mx-8 md:mx-16"
                style={{ background: "var(--menu-border)" }}
              />
              <div className="flex items-center justify-between px-8 md:px-16 py-4">
                <span
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--menu-text-muted)" }}
                >
                  © 2026 SkiTech
                </span>
                <div className="flex items-center gap-5">
                  {["Instagram ↗", "Twitter ↗", "LinkedIn ↗"].map((s) => (
                    <a
                      key={s}
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] tracking-[0.18em] uppercase"
                      style={{ color: "var(--menu-text-muted)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--menu-text)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--menu-text-muted)")
                      }
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
