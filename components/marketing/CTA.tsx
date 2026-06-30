"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const font = "Merriweather, serif";

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-32 relative overflow-hidden"
      style={{ background: "var(--mk-surface-1)", fontFamily: font }}
    >
      {/* Soft radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, var(--mk-surface-1) 0%, var(--mk-surface-2) 100%)",
        }}
      />

      {/* Large ghost "SkiTech" text */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden
      >
        <span
          style={{
            fontSize:      "clamp(6rem, 20vw, 16rem)",
            fontWeight:    900,
            fontFamily:    font,
            fontStyle:     "italic",
            color:         "var(--mk-text-1)",
            opacity:       0.028,
            letterSpacing: "-0.03em",
            lineHeight:    1,
            whiteSpace:    "nowrap",
          }}
        >
          SkiTech
        </span>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 lg:px-10 text-center">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-[10.5px] uppercase tracking-[0.22em] mb-6"
          style={{ fontWeight: 700, fontFamily: font, color: "var(--mk-text-2)" }}
        >
          Get Started
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize:      "clamp(2.2rem, 5vw, 3.4rem)",
            fontWeight:    800,
            color:         "var(--mk-text-1)",
            lineHeight:    1.1,
            letterSpacing: "-0.025em",
            fontFamily:    font,
          }}
        >
          Ready to Streamline Your{" "}
          <em style={{ fontStyle: "italic", fontWeight: 900 }}>Operations?</em>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
          className="mt-6 max-w-lg mx-auto leading-[1.85]"
          style={{ fontSize: "0.9rem", fontFamily: font, color: "var(--mk-text-2)" }}
        >
          Join property teams who have simplified their daily operations with SkiTech's
          centralized management platform. Start your free 14-day trial today.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 mx-auto h-px w-14 origin-center"
          style={{ background: "var(--mk-border)" }}
        />

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          {/* Primary */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl transition-opacity duration-300 hover:opacity-85"
              style={{
                background: "var(--mk-btn-primary-bg)",
                color:      "var(--mk-btn-primary-text)",
                fontFamily: font,
                fontWeight: 700,
                fontSize:   "0.9rem",
              }}
            >
              Request a Demo
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>

          {/* Secondary */}
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
          >
            <Link
              href="/#pricing"
              className="group inline-flex items-center gap-1.5 px-5 py-4 rounded-2xl border border-transparent transition-all duration-300"
              style={{
                color:      "var(--mk-text-2)",
                fontFamily: font,
                fontWeight: 700,
                fontSize:   "0.88rem",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--mk-border)";
                (e.currentTarget as HTMLAnchorElement).style.color       = "var(--mk-text-1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color       = "var(--mk-text-2)";
              }}
            >
              View Pricing
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-[11px] uppercase tracking-[0.16em]"
          style={{ fontFamily: font, fontWeight: 700, color: "var(--mk-text-2)" }}
        >
          No credit card required · 14-day free trial · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
