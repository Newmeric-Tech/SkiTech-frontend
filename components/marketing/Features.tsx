"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Building2, Users, ClipboardList, BarChart3, Shield, Truck, ArrowUpRight } from "lucide-react";
import featuresImage from "@/assets/images/29e74de416f53872ca69eea9a24e1e8b027f7ef5.png";

const font = "Merriweather, serif";

const modules = [
  {
    icon: Building2,
    title: "Property Management",
    desc: "Centralized property profiles, departments, vendor management, room tracking, and ownership details — all in one place. No more juggling spreadsheets across multiple properties.",
    stat: "Unified property control",
    bgPos: "0% 0%",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=85",
    tag: "Core",
  },
  {
    icon: Users,
    title: "Employee Management",
    desc: "Workforce profiles, department mapping, shift scheduling, role assignment, and real-time staff visibility. Give every team member exactly the access they need — nothing more.",
    stat: "Full workforce visibility",
    bgPos: "50% 0%",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=85",
    tag: "People",
  },
  {
    icon: ClipboardList,
    title: "SOP Management",
    desc: "Create, version, and distribute SOPs across every property and department. Control who sees what, track compliance, and keep your standards consistent at scale.",
    stat: "Versioned & auditable",
    bgPos: "100% 0%",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=85",
    tag: "Compliance",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    desc: "Revenue dashboards, KRA compliance tracking, occupancy metrics, and automated performance reports. Make data-driven decisions with clarity instead of guesswork.",
    stat: "Automated reporting",
    bgPos: "0% 100%",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=85",
    tag: "Insights",
  },
  {
    icon: Shield,
    title: "KRA Monitoring",
    desc: "Assign daily, weekly, and monthly KRAs to every department. Real-time compliance dashboards let managers spot underperformance early and course-correct before it becomes a problem.",
    stat: "Real-time compliance",
    bgPos: "50% 100%",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85",
    tag: "Performance",
  },
  {
    icon: Truck,
    title: "Inventory & Stock",
    desc: "Track stock levels across all your properties with automated low-stock alerts, full audit trails, and reorder notifications. Never run out of essentials again.",
    stat: "Zero stockout surprises",
    bgPos: "100% 100%",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=85",
    tag: "Operations",
  },
];

function FeatureCard({ mod, index }: { mod: (typeof modules)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 52, scale: 0.985 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.04,
        opacity: { duration: 0.6 },
      }}
      className="group flex flex-col md:flex-row rounded-3xl overflow-hidden cursor-default transition-[border-color,box-shadow] duration-500"
      style={{
        background:  "var(--mk-surface-1)",
        border:      "1px solid var(--mk-border)",
        boxShadow:   "none",
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
      {/* ── Image panel ── */}
      <div
        className={`relative w-full md:w-[340px] lg:w-[400px] shrink-0 overflow-hidden ${
          !isEven ? "md:order-2" : ""
        }`}
      >
        {/* Sprite texture overlay */}
        <div
          className="absolute inset-0 z-10 opacity-[0.09] mix-blend-multiply group-hover:opacity-[0.15] transition-opacity duration-700"
          style={{
            backgroundImage: `url(${featuresImage.src})`,
            backgroundSize: "300% 200%",
            backgroundPosition: mod.bgPos,
          }}
        />

        <img
          src={mod.img}
          alt={mod.title}
          className="w-full h-60 md:h-full object-cover transition-[transform,filter] duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:brightness-[1.04]"
        />

        {/* Scrim */}
        <div className="absolute inset-0 z-20 bg-black/[0.18] group-hover:bg-black/0 transition-colors duration-700 ease-out" />

        {/* Directional fade to section bg */}
        <div
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-600 group-hover:opacity-0"
          style={{
            background: isEven
              ? "linear-gradient(to right, transparent, transparent, var(--mk-surface-1))"
              : "linear-gradient(to left, transparent, transparent, var(--mk-surface-1))",
          }}
        />

        {/* Tag badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-4 left-4 z-30"
        >
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-[10.5px] uppercase tracking-[0.15em] backdrop-blur-md"
            style={{
              background:  "var(--mk-glass-bg)",
              border:      "1px solid var(--mk-glass-border)",
              color:       "var(--mk-text-1)",
              fontFamily:  font,
              fontWeight:  700,
            }}
          >
            {mod.tag}
          </span>
        </motion.div>

        {/* Bottom sweep line */}
        <div
          className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-30"
          style={{ background: "var(--mk-accent)" }}
        />
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col justify-between p-8 lg:p-10 xl:p-12 flex-1 min-w-0">
        <div>
          {/* Icon + heading */}
          <div className="flex items-start gap-5 mb-6">
            <motion.div
              whileHover={{ rotate: 7, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 280, damping: 16 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-[background,border-color] duration-500 mt-0.5"
              style={{ border: "1px solid var(--mk-border)", background: "transparent" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background   = "var(--mk-btn-primary-bg)";
                el.style.borderColor  = "transparent";
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
              <mod.icon
                className="w-[18px] h-[18px] transition-colors duration-500"
                style={{ color: "var(--mk-text-1)" }}
              />
            </motion.div>
            <h3
              className="leading-snug pt-2"
              style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: font, color: "var(--mk-text-1)" }}
            >
              {mod.title}
            </h3>
          </div>

          {/* Description */}
          <p
            className="leading-[1.9] mb-8"
            style={{ fontSize: "0.88rem", fontFamily: font, color: "var(--mk-text-2)" }}
          >
            {mod.desc}
          </p>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.42, ease: "easeOut" }}
          className="flex items-center justify-between pt-5"
          style={{ borderTop: "1px solid var(--mk-border)" }}
        >
          <span
            className="text-[10.5px] uppercase tracking-[0.15em]"
            style={{ fontFamily: font, fontWeight: 700, color: "var(--mk-text-3)" }}
          >
            {mod.stat}
          </span>

          <div
            className="flex items-center gap-1.5 transition-colors duration-500"
            style={{ color: "var(--mk-text-2)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.color = "var(--mk-text-1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.color = "var(--mk-text-2)";
            }}
          >
            <span className="text-[11.5px]" style={{ fontFamily: font, fontWeight: 700 }}>
              Explore
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 ease-out group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Features() {
  const ref = useRef(null);
  const headerInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-28"
      style={{ background: "var(--mk-surface-2)", fontFamily: font }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="text-[10.5px] uppercase tracking-[0.22em] mb-4"
            style={{ fontWeight: 700, fontFamily: font, color: "var(--mk-text-2)" }}
          >
            Core Modules
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
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
            Everything to Run Your{" "}
            <em style={{ fontStyle: "italic", fontWeight: 900 }}>Properties</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="mt-5 max-w-md mx-auto leading-relaxed"
            style={{ fontSize: "0.88rem", fontFamily: font, color: "var(--mk-text-3)" }}
          >
            Six powerful modules working together to eliminate spreadsheets and disconnected tools.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={headerInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 mx-auto h-px w-14 origin-center"
            style={{ background: "var(--mk-text-1)" }}
          />
        </div>

        {/* ── Card list ── */}
        <div className="flex flex-col gap-5">
          {modules.map((mod, i) => (
            <FeatureCard key={i} mod={mod} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
