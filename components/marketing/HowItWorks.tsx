"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";

const font = "Merriweather, serif";

const steps = [
  {
    num: "01",
    tag: "Onboarding",
    title: "Set up your property",
    desc: "Add your property details, configure departments, rooms, and vendor relationships — all in under an hour. No technical setup required.",
  },
  {
    num: "02",
    tag: "Access Control",
    title: "Invite your team",
    desc: "Send secure role-based invites to owners, managers, and staff. Each person gets exactly the access they need — nothing more.",
  },
  {
    num: "03",
    tag: "Compliance",
    title: "Define your SOPs",
    desc: "Create, version, and distribute standard operating procedures across every department. Your standards, applied consistently at scale.",
  },
  {
    num: "04",
    tag: "Growth",
    title: "Track and grow",
    desc: "Monitor KRAs in real-time, analyse revenue trends, and surface operational opportunities before they become problems.",
  },
];

function Step({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-7 ${index < steps.length - 1 ? "pb-14" : ""}`}
    >
      {/* Step number */}
      <div className="shrink-0 w-8 text-right pt-0.5">
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            fontFamily: font,
            letterSpacing: "0.1em",
            color: "var(--mk-text-3)",
          }}
        >
          {step.num}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Tag */}
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9.5px] uppercase tracking-[0.14em] mb-3"
          style={{
            background: "var(--mk-accent-soft)",
            border: "1px solid var(--mk-border)",
            color: "var(--mk-accent)",
            fontFamily: font,
            fontWeight: 700,
          }}
        >
          {step.tag}
        </span>

        {/* Title */}
        <h3
          style={{
            fontSize: "1.18rem",
            fontWeight: 800,
            fontFamily: font,
            color: "var(--mk-text-1)",
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
            marginBottom: "0.55rem",
          }}
        >
          {step.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "0.84rem",
            fontFamily: font,
            color: "var(--mk-text-2)",
            lineHeight: 1.85,
          }}
        >
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.75", "end 0.25"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 18 });
  const barScaleY = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-28 relative overflow-hidden"
      style={{ background: "var(--mk-bg)", fontFamily: font }}
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <div ref={headerRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="text-[10.5px] uppercase tracking-[0.22em] mb-4"
            style={{ fontWeight: 700, fontFamily: font, color: "var(--mk-text-2)" }}
          >
            How it works
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.09, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 800,
              color: "var(--mk-text-1)",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              fontFamily: font,
            }}
          >
            Up and Running in{" "}
            <em style={{ fontStyle: "italic", fontWeight: 900 }}>Four Steps</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="mt-5 max-w-xs mx-auto leading-relaxed"
            style={{ fontSize: "0.88rem", fontFamily: font, color: "var(--mk-text-3)" }}
          >
            No long onboarding calls. Most teams are operational within a day.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={headerInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 mx-auto h-px w-14 origin-center"
            style={{ background: "var(--mk-text-1)" }}
          />
        </div>

        {/* ── Body: progress rail + steps ── */}
        <div className="flex gap-8 lg:gap-12">

          {/* Left: scroll-driven progress rail (desktop only) */}
          <div className="hidden md:flex flex-col items-center pt-1 shrink-0">
            <div
              className="relative w-px flex-1"
              style={{ background: "var(--mk-border)" }}
            >
              {/* Animated fill */}
              <motion.div
                className="absolute top-0 left-0 w-full origin-top"
                style={{
                  background: "var(--mk-accent)",
                  scaleY: barScaleY,
                  height: "100%",
                }}
              />

              {/* Step dots */}
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="absolute -left-[3px] w-[7px] h-[7px] rounded-full"
                  style={{
                    top: `${(i / (steps.length - 1)) * 100}%`,
                    background: "var(--mk-bg)",
                    border: "2px solid var(--mk-accent)",
                    transform: "translateY(-50%)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: step list */}
          <div className="flex-1">
            {steps.map((step, i) => (
              <Step key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
