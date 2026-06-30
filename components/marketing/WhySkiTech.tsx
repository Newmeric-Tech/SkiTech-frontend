"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Zap, Target, TrendingUp, Layers, ArrowUpRight } from "lucide-react";

const font = "Merriweather, serif";

const benefits = [
  {
    icon: Zap,
    title: "Automated Workflows",
    desc: "Stop wasting hours on repetitive tasks. SkiTech automates your SOPs, triggers low-stock alerts, and tracks KRAs in real time — so your team stays focused on what actually matters.",
    stat: "70% less manual work",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=85",
    tag: "Automation",
  },
  {
    icon: Target,
    title: "Multi-Property Tracking",
    desc: "Get a bird's-eye view of every property you manage — occupancy rates, revenue trends, and live operations — all in one unified dashboard. No more tab-switching between tools.",
    stat: "All properties, one screen",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=85",
    tag: "Visibility",
  },
  {
    icon: TrendingUp,
    title: "Performance Insights",
    desc: "Know exactly how every department is performing at any given moment. Daily, weekly, and monthly KRA reports give managers the data to coach teams and fix issues before they escalate.",
    stat: "Real-time compliance data",
    img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=85",
    tag: "Analytics",
  },
  {
    icon: Layers,
    title: "Built for Scale",
    desc: "Whether you're running a single boutique property or a portfolio of 50+, SkiTech scales with you. Add properties, onboard teams, and expand operations — without ever changing your tools.",
    stat: "From 1 to 50+ properties",
    img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=85",
    tag: "Scale",
  },
];

const steps = [
  {
    num: "01",
    title: "Register Property",
    desc: "Add your property details, rooms, departments, and vendor contacts in minutes using our guided setup flow.",
  },
  {
    num: "02",
    title: "Add Your Team",
    desc: "Invite managers and staff, assign them to departments, and set role-based access so everyone sees what they need.",
  },
  {
    num: "03",
    title: "Set Up SOPs & KRAs",
    desc: "Define your operational standards, create versioned SOPs, and assign key result areas to every department.",
  },
  {
    num: "04",
    title: "Monitor & Optimize",
    desc: "Track performance in real-time, receive automated alerts, and use analytics to continuously improve operations.",
  },
];

export function WhySkiTech() {
  const ref      = useRef(null);
  const stepsRef = useRef(null);
  const isInView      = useInView(ref,      { once: true, margin: "-60px" });
  const stepsInView   = useInView(stepsRef, { once: true, margin: "-60px" });

  return (
    <>
      {/* ═══ Why Section ═══ */}
      <section
        id="why-skitech"
        ref={ref}
        className="py-28"
        style={{ background: "var(--mk-surface-1)", fontFamily: font }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10">

          {/* Header */}
          <div className="text-center mb-20">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-[11px] uppercase tracking-[0.2em] mb-4"
              style={{ fontWeight: 700, fontFamily: font, color: "var(--mk-text-2)" }}
            >
              Why SkiTech
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08 }}
              style={{
                fontSize:      "clamp(2rem, 4vw, 2.8rem)",
                fontWeight:    800,
                color:         "var(--mk-text-1)",
                lineHeight:    1.12,
                letterSpacing: "-0.02em",
                fontFamily:    font,
              }}
            >
              Designed for Modern{" "}
              <em style={{ fontStyle: "italic", fontWeight: 900 }}>Property Operations</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-5 max-w-md mx-auto leading-relaxed"
              style={{ fontSize: "0.9rem", fontFamily: font, color: "var(--mk-text-2)" }}
            >
              Everything your property team needs — from SOPs to stock — under one roof.
            </motion.p>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.28, ease: "easeOut" }}
              className="mt-7 mx-auto h-px w-12 origin-center"
              style={{ background: "var(--mk-text-1)" }}
            />
          </div>

          {/* Benefit Cards */}
          <div className="flex flex-col gap-5">
            {benefits.map((b, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 56 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 + 0.05 }}
                  className="group flex flex-col md:flex-row rounded-3xl overflow-hidden cursor-default transition-[border-color,box-shadow] duration-500"
                  style={{
                    background:  "var(--mk-surface-1)",
                    border:      "1px solid var(--mk-border)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "var(--mk-border-strong)";
                    el.style.boxShadow   = "var(--mk-shadow-lg)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "var(--mk-border)";
                    el.style.boxShadow   = "none";
                  }}
                >
                  {/* Image */}
                  <div
                    className={`relative w-full md:w-[320px] lg:w-[380px] shrink-0 overflow-hidden ${
                      !isEven ? "md:order-2" : ""
                    }`}
                    style={{ background: "var(--mk-surface-2)" }}
                  >
                    <img
                      src={b.img}
                      alt={b.title}
                      className="w-full h-56 md:h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                    />
                    {/* Side fade */}
                    <div
                      className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-500"
                      style={{
                        background: isEven
                          ? "linear-gradient(to right, transparent, color-mix(in srgb, var(--mk-surface-1) 25%, transparent))"
                          : "linear-gradient(to left, transparent, color-mix(in srgb, var(--mk-surface-1) 25%, transparent))",
                      }}
                    />
                    {/* Tag */}
                    <div className="absolute top-4 left-4 z-20">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-[11px] uppercase tracking-widest backdrop-blur-sm"
                        style={{
                          background:  "var(--mk-glass-bg)",
                          border:      "1px solid var(--mk-glass-border)",
                          color:       "var(--mk-text-1)",
                          fontFamily:  font,
                          fontWeight:  700,
                        }}
                      >
                        {b.tag}
                      </span>
                    </div>
                    {/* Bottom sweep */}
                    <div
                      className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out z-20"
                      style={{ background: "var(--mk-accent)" }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between p-8 lg:p-10 xl:p-12 flex-1 min-w-0">
                    <div>
                      <div className="flex items-start gap-5 mb-5">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-400 mt-0.5"
                          style={{ border: "1px solid var(--mk-border)", background: "transparent" }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.background  = "var(--mk-btn-primary-bg)";
                            el.style.borderColor = "transparent";
                            const svg = el.querySelector("svg");
                            if (svg) (svg as SVGElement).style.color = "var(--mk-btn-primary-text)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.background  = "transparent";
                            el.style.borderColor = "var(--mk-border)";
                            const svg = el.querySelector("svg");
                            if (svg) (svg as SVGElement).style.color = "var(--mk-text-1)";
                          }}
                        >
                          <b.icon
                            className="w-5 h-5 transition-colors duration-400"
                            style={{ color: "var(--mk-text-1)" }}
                          />
                        </div>
                        <h3
                          className="leading-snug"
                          style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: font, color: "var(--mk-text-1)" }}
                        >
                          {b.title}
                        </h3>
                      </div>
                      <p
                        className="leading-[1.85] mb-8"
                        style={{ fontSize: "0.9rem", fontFamily: font, color: "var(--mk-text-2)" }}
                      >
                        {b.desc}
                      </p>
                    </div>
                    <div
                      className="flex items-center justify-between pt-5"
                      style={{ borderTop: "1px solid var(--mk-border)" }}
                    >
                      <span
                        className="text-[11px] uppercase tracking-widest"
                        style={{ fontFamily: font, fontWeight: 700, color: "var(--mk-text-2)" }}
                      >
                        {b.stat}
                      </span>
                      <div
                        className="flex items-center gap-1.5 transition-colors duration-300"
                        style={{ color: "var(--mk-text-2)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.color = "var(--mk-text-1)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.color = "var(--mk-text-2)";
                        }}
                      >
                        <span className="text-[12px]" style={{ fontFamily: font, fontWeight: 700 }}>
                          Learn more
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section
        ref={stepsRef}
        className="py-28 relative overflow-hidden"
        style={{ background: "var(--mk-bg)", fontFamily: font }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, var(--mk-text-1) 1px, transparent 0)`,
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-10">

          {/* Header */}
          <div className="text-center mb-20">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={stepsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-[11px] uppercase tracking-[0.2em] mb-4"
              style={{ fontWeight: 700, fontFamily: font, color: "var(--mk-text-2)" }}
            >
              How It Works
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={stepsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08 }}
              style={{
                fontSize:      "clamp(2rem, 4vw, 2.8rem)",
                fontWeight:    800,
                color:         "var(--mk-text-1)",
                lineHeight:    1.12,
                letterSpacing: "-0.02em",
                fontFamily:    font,
              }}
            >
              Up and Running in{" "}
              <em style={{ fontStyle: "italic", fontWeight: 900 }}>4 Simple Steps</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={stepsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-5 max-w-md mx-auto leading-relaxed"
              style={{ fontSize: "0.9rem", fontFamily: font, color: "var(--mk-text-2)" }}
            >
              No long onboarding. No IT team required. Set up, invite your team, and go.
            </motion.p>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={stepsInView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.28, ease: "easeOut" }}
              className="mt-7 mx-auto h-px w-12 origin-center"
              style={{ background: "var(--mk-border-strong)" }}
            />
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
            {/* Connector line (desktop) */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={stepsInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="hidden lg:block absolute top-[34px] left-[calc(12.5%+8px)] right-[calc(12.5%+8px)] h-px origin-left"
              style={{ background: "var(--mk-border)" }}
            />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.12 + 0.25 }}
                className="group text-center"
              >
                {/* Number badge */}
                <div
                  className="w-[68px] h-[68px] mx-auto rounded-2xl flex items-center justify-center mb-6 transition-all duration-400"
                  style={{
                    border:      "1px solid var(--mk-border)",
                    background:  "var(--mk-glass-bg)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background  = "var(--mk-btn-primary-bg)";
                    el.style.borderColor = "var(--mk-btn-primary-bg)";
                    const span = el.querySelector("span");
                    if (span) span.style.color = "var(--mk-btn-primary-text)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background  = "var(--mk-glass-bg)";
                    el.style.borderColor = "var(--mk-border)";
                    const span = el.querySelector("span");
                    if (span) span.style.color = "var(--mk-text-2)";
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize:   "1.05rem",
                      fontFamily: font,
                      color:      "var(--mk-text-2)",
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                <h3
                  className="mb-3"
                  style={{ fontWeight: 800, fontSize: "0.98rem", fontFamily: font, color: "var(--mk-text-1)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ fontSize: "0.855rem", fontFamily: font, color: "var(--mk-text-2)" }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
