"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Zap, ShieldCheck, LineChart, Users, ChevronsDown } from "lucide-react";
import Link from "next/link";
import { ParticleCanvas } from "./ParticleCanvas";
import { TypedWord } from "./TypedWord";
import { useMarketingTheme } from "./ThemeProvider";

const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")";

const FEATURE_PILLS = [
  { icon: Zap, label: "Fast setup" },
  { icon: ShieldCheck, label: "Enterprise security" },
  { icon: LineChart, label: "Real-time analytics" },
  { icon: Users, label: "Multi-role access" },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { theme } = useMarketingTheme();

  /* Monochrome (black/white) glows — kept local to the hero so the site-wide
     indigo --mk-accent* tokens used elsewhere stay untouched. */
  const heroGlow  = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";
  const spotGlow  = theme === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";

  const [showPill,      setShowPill]      = useState(false);
  const [showSub,       setShowSub]       = useState(false);
  const [showCTAs,      setShowCTAs]      = useState(false);
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [mouse,     setMouse]     = useState({ x: -9999, y: -9999 });

  /* Staggered content reveal */
  useEffect(() => {
    const t1 = setTimeout(() => setShowPill(true),  300)
    const t2 = setTimeout(() => setShowSub(true),   700)
    const t3 = setTimeout(() => setShowCTAs(true),  1000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  /* Hide the scroll cue once the user starts scrolling past the fold */
  useEffect(() => {
    const onScroll = () => setShowScrollCue(window.scrollY < 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Mouse spotlight */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onMove  = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const onLeave = () => setMouse({ x: -9999, y: -9999 });
    section.addEventListener("mousemove",  onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove",  onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden px-4 pt-32 pb-24 flex flex-col justify-center"
      style={{
        backgroundColor: "var(--mk-bg)",
        backgroundImage:
          `radial-gradient(ellipse 60% 50% at 50% 10%, ${heroGlow} 0%, transparent 70%)`,
      }}
    >
      {/* Grain texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ backgroundImage: GRAIN_URL, opacity: 0.4 }}
      />

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Mouse spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(500px circle at ${mouse.x}px ${mouse.y}px,
            ${spotGlow} 0%,
            transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">

        {/* Pill */}
        <AnimatePresence>
          {showPill && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-[30px] pl-2.5 pr-4 py-1.5 rounded-full border backdrop-blur-sm"
              style={{
                background:    "var(--mk-glass-bg)",
                borderColor:   "var(--mk-border)",
                color:         "var(--mk-text-2)",
                fontSize:      "11.5px",
                letterSpacing: "0.03em",
              }}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Built for owners. Made for growth.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif leading-[1.1]"
          style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", color: "var(--mk-text-1)" }}
        >
          <span className="font-medium block">One platform for every</span>
          <span
            className="block italic font-light mt-1"
            style={{ color: "var(--mk-text-2)" }}
          >
            <TypedWord />{" "}operation
          </span>
        </motion.h1>

        {/* Subtext */}
        <AnimatePresence>
          {showSub && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-xl leading-relaxed"
              style={{ color: "var(--mk-text-2)" }}
            >
              Centralise property management, workforce, SOPs, finance, and
              reporting — in one elegant, automated workspace.
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {showCTAs && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              <Link
                href="/demo"
                className="group flex items-center gap-2.5 px-8 py-3.5 rounded-full transition-all duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
                style={{
                  background: "var(--mk-btn-primary-bg)",
                  color:      "var(--mk-btn-primary-text)",
                  boxShadow:  "var(--mk-shadow-lg)",
                }}
              >
                Book a Demo
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badges */}
        <AnimatePresence>
          {showCTAs && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10"
            >
              <div className="flex flex-wrap items-center justify-center gap-2">
                {FEATURE_PILLS.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur-sm transition-colors duration-200"
                    style={{
                      border:     "0.5px solid var(--mk-border)",
                      background: "var(--mk-glass-bg)",
                      color:      "var(--mk-text-2)",
                      fontSize:   "12px",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "var(--mk-text-3)" }} />
                    {label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dashboard image */}
      <AnimatePresence>
        {showCTAs && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
            className="mt-8 md:mt-10 w-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-7xl px-4"
            >
              <div className="absolute inset-x-8 -bottom-6 top-10 bg-black/30 blur-3xl rounded-3xl -z-10" />
              <div className="absolute inset-x-16 -bottom-2 top-16 bg-black/20 blur-2xl rounded-3xl -z-10" />
              <div
                className="relative backdrop-blur-sm rounded-3xl p-1 border shadow-2xl"
                style={{ background: "var(--mk-glass-bg)", borderColor: "var(--mk-border)" }}
              >
                <motion.img
                  src="/dashboard.png"
                  alt="Dashboard Preview"
                  className="relative w-full rounded-3xl shadow-[0_80px_160px_rgba(0,0,0,0.45)]"
                  style={{ border: "1px solid var(--mk-border)" }}
                  initial={{ scale: 0.94 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              {/* Bottom fade into section bg */}
              <div
                className="absolute bottom-0 left-0 right-0 h-40 rounded-b-3xl"
                style={{
                  background: "linear-gradient(to top, var(--mk-bg), transparent)",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll cue — pinned to viewport, fades once the user scrolls past the fold */}
      <AnimatePresence>
        {showScrollCue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 5, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 uppercase pointer-events-none"
            style={{
              color:         "var(--mk-text-3)",
              fontSize:      "10px",
              letterSpacing: "0.14em",
            }}
          >
            <ChevronsDown className="w-3.5 h-3.5" />
            Scroll
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
