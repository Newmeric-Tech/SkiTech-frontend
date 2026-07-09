"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Star } from "lucide-react";
import { SectionSeam } from "./SectionSeam";

const font = "Merriweather, serif";

const testimonials = [
  {
    stars: 5,
    quote:
      "SkiTech transformed how we manage our three properties. The centralized dashboard gives me clarity I never had before.",
    name: "Sarah Mitchell",
    role: "General Manager, Grand Horizon Property",
    initials: "SM",
  },
  {
    stars: 5,
    quote:
      "The SOP management alone saved us hours every week. Our compliance went from 72% to 94% in just two months.",
    name: "James Chen",
    role: "Operations Director, Skyline Suites",
    initials: "JC",
  },
  {
    stars: 5,
    quote:
      "Finally, a platform that understands hospitality. The KRA tracking and revenue insights are exactly what we needed.",
    name: "Priya Sharma",
    role: "Finance Manager, The Amiras Residence",
    initials: "PS",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-70px" });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-28 relative overflow-hidden isolate"
      style={{ background: "var(--mk-bg)", fontFamily: font }}
    >
      <SectionSeam from="--mk-surface-1" to="--mk-bg" />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, var(--mk-text-1) 1px, transparent 0)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Centered radial glow — gives glass cards a visible backdrop to blur against */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.08) 0%, transparent 62%)",
        }}
      />

      {/* Ambient corner glows */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "var(--mk-accent-soft)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "var(--mk-accent-soft)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="text-[10.5px] uppercase tracking-[0.22em] mb-4"
            style={{ fontWeight: 700, fontFamily: font, color: "var(--mk-text-2)" }}
          >
            Testimonials
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.09, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize:      "clamp(2rem, 4vw, 2.8rem)",
              fontWeight:    800,
              color:         "var(--mk-text-1)",
              lineHeight:    1.12,
              letterSpacing: "-0.02em",
              fontFamily:    font,
            }}
          >
            Trusted by{" "}
            <em style={{ fontStyle: "italic", fontWeight: 900 }}>Property Teams</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="mt-5 max-w-sm mx-auto leading-relaxed"
            style={{ fontSize: "0.88rem", fontFamily: font, color: "var(--mk-text-2)" }}
          >
            Hear from the operations teams already running on SkiTech.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 mx-auto h-px w-14 origin-center"
            style={{ background: "var(--mk-border-strong)" }}
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 52, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.8,
                delay: i * 0.13 + 0.1,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.55 },
              }}
              whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              className="group relative flex flex-col rounded-3xl p-8 cursor-default overflow-hidden transition-[background,border-color] duration-500"
              style={{
                background:   "var(--mk-tile-glass-bg)",
                border:       "1px solid var(--mk-tile-glass-border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background    = "var(--mk-tile-glass-bg-hover)";
                (e.currentTarget as HTMLDivElement).style.borderColor   = "var(--mk-border-strong)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background    = "var(--mk-tile-glass-bg)";
                (e.currentTarget as HTMLDivElement).style.borderColor   = "var(--mk-tile-glass-border)";
              }}
            >
              {/* Corner glow on hover */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-y-1/2 translate-x-1/2"
                style={{ background: "var(--mk-accent-soft)" }}
              />

              {/* Stars */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.13 + 0.4 }}
                className="flex gap-1 mb-6"
              >
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5"
                    style={{ fill: "var(--mk-accent)", color: "var(--mk-accent)" }}
                  />
                ))}
              </motion.div>

              {/* Quote mark */}
              <div
                className="mb-3 leading-none select-none"
                style={{
                  fontSize:   "4rem",
                  fontFamily: "Georgia, serif",
                  lineHeight: 1,
                  color:      "var(--mk-text-3)",
                }}
                aria-hidden
              >
                "
              </div>

              {/* Quote text */}
              <p
                className="leading-[1.85] flex-1 mb-8"
                style={{ fontSize: "0.875rem", fontFamily: font, color: "var(--mk-text-2)" }}
              >
                {t.quote}
              </p>

              {/* Author */}
              <div
                className="flex items-center gap-3.5 pt-5"
                style={{ borderTop: "1px solid var(--mk-border)" }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-400"
                  style={{
                    background:  "var(--mk-glass-bg)",
                    border:      "1px solid var(--mk-border)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = "var(--mk-btn-primary-bg)";
                    el.style.borderColor = "var(--mk-btn-primary-bg)";
                    const span = el.querySelector("span");
                    if (span) span.style.color = "var(--mk-btn-primary-text)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = "var(--mk-glass-bg)";
                    el.style.borderColor = "var(--mk-border)";
                    const span = el.querySelector("span");
                    if (span) span.style.color = "var(--mk-text-2)";
                  }}
                >
                  <span
                    className="text-[11px]"
                    style={{ fontFamily: font, fontWeight: 800, letterSpacing: "0.04em", color: "var(--mk-text-2)" }}
                  >
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p
                    className="text-[13px] leading-tight mb-0.5"
                    style={{ fontFamily: font, fontWeight: 700, color: "var(--mk-text-1)" }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-[11px] leading-tight"
                    style={{ fontFamily: font, fontWeight: 400, color: "var(--mk-text-2)" }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
