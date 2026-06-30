"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ParticleCanvas } from "./ParticleCanvas";
import { TypedWord } from "./TypedWord";

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [showPill,  setShowPill]  = useState(false);
  const [showSub,   setShowSub]   = useState(false);
  const [showCTAs,  setShowCTAs]  = useState(false);
  const [mouse,     setMouse]     = useState({ x: -9999, y: -9999 });

  /* Staggered content reveal */
  useEffect(() => {
    const t1 = setTimeout(() => setShowPill(true),  300)
    const t2 = setTimeout(() => setShowSub(true),   700)
    const t3 = setTimeout(() => setShowCTAs(true),  1000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

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
      style={{ background: "var(--mk-bg)" }}
    >
      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Mouse spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(500px circle at ${mouse.x}px ${mouse.y}px,
            var(--mk-accent-soft) 0%,
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
              className="mb-6 px-5 py-2 rounded-full border backdrop-blur-sm text-xs"
              style={{
                background:   "var(--mk-glass-bg)",
                borderColor:  "var(--mk-border)",
                color:        "var(--mk-text-2)",
              }}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Built for Owners. Made for Growth
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
                className="flex items-center gap-2 px-8 py-3.5 rounded-full transition shadow-lg hover:shadow-xl"
                style={{
                  background: "var(--mk-btn-primary-bg)",
                  color:      "var(--mk-btn-primary-text)",
                  boxShadow:  "var(--mk-shadow-lg)",
                }}
              >
                Book a Demo <ArrowRight className="w-4 h-4" />
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
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                {[
                  { icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z", label: "Fast Setup" },
                  { icon: "M12 2l7 4v6c0 5-3.8 9.7-7 10-3.2-.3-7-5-7-10V6l7-4z", label: "Enterprise Security" },
                  { icon: "M3 3v18h18M7 13l3-3 4 4 5-5", label: "Real-Time Analytics" },
                ].map(({ icon, label }, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-md transition"
                    style={{
                      background:   "var(--mk-glass-bg)",
                      border:       "1px solid var(--mk-border)",
                      color:        "var(--mk-text-1)",
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={icon} />
                    </svg>
                    <span className="text-sm font-medium">{label}</span>
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
    </section>
  );
}
