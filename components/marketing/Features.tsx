"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Building2, Users, ClipboardList, BarChart3, Shield, Truck, ArrowUpRight } from "lucide-react";

const font = "Merriweather, serif";

const modules = [
  {
    icon: Building2,
    title: "Property Management",
    desc: "Centralized property profiles, departments, vendor management, room tracking, and ownership details — all in one place. No more juggling spreadsheets across multiple properties.",
    stat: "Unified property control",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=85",
    tag: "Core",
  },
  {
    icon: Users,
    title: "Employee Management",
    desc: "Workforce profiles, department mapping, shift scheduling, role assignment, and real-time staff visibility. Give every team member exactly the access they need — nothing more.",
    stat: "Full workforce visibility",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=85",
    tag: "People",
  },
  {
    icon: ClipboardList,
    title: "SOP Management",
    desc: "Create, version, and distribute SOPs across every property and department. Control who sees what, track compliance, and keep your standards consistent at scale.",
    stat: "Versioned & auditable",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=85",
    tag: "Compliance",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    desc: "Revenue dashboards, KRA compliance tracking, occupancy metrics, and automated performance reports. Make data-driven decisions with clarity instead of guesswork.",
    stat: "Automated reporting",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=85",
    tag: "Insights",
  },
  {
    icon: Shield,
    title: "KRA Monitoring",
    desc: "Assign daily, weekly, and monthly KRAs to every department. Real-time compliance dashboards let managers spot underperformance early and course-correct before it becomes a problem.",
    stat: "Real-time compliance",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85",
    tag: "Performance",
  },
  {
    icon: Truck,
    title: "Inventory & Stock",
    desc: "Track stock levels across all your properties with automated low-stock alerts, full audit trails, and reorder notifications. Never run out of essentials again.",
    stat: "Zero stockout surprises",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=85",
    tag: "Operations",
  },
];

function FeatureStrip({ mod, index }: { mod: (typeof modules)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  /* Rows 1,3,5 (0-indexed 0,2,4) → image left; rows 2,4,6 → image right */
  const imageLeft = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}
      className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl transition-[transform,box-shadow,border-color] duration-300 ease-out"
      style={{
        background:  "var(--mk-surface-1)",
        border:      "1px solid var(--mk-border)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform   = "translateY(-2px)";
        el.style.boxShadow   = "inset 3px 0 0 var(--mk-accent), var(--mk-shadow-md)";
        el.style.borderColor = "var(--mk-border-strong)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform   = "";
        el.style.boxShadow   = "";
        el.style.borderColor = "var(--mk-border)";
      }}
    >
      {/* ── Image panel ── */}
      <div
        className={`relative shrink-0 overflow-hidden h-48 sm:h-auto w-full sm:w-[280px] ${
          !imageLeft ? "sm:order-2" : ""
        }`}
      >
        <img
          src={mod.img}
          alt={mod.title}
          className="w-full h-full object-cover transition-[filter,transform] duration-500 ease-out group-hover:brightness-110 group-hover:scale-[1.03]"
        />

        {/* Category glass badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[9.5px] uppercase tracking-[0.15em] backdrop-blur-md"
            style={{
              background: "var(--mk-glass-bg)",
              border:     "1px solid var(--mk-glass-border)",
              color:      "var(--mk-text-1)",
              fontFamily: font,
              fontWeight: 700,
            }}
          >
            {mod.tag}
          </span>
        </div>
      </div>

      {/* ── Text panel ── */}
      <div className="flex flex-col justify-center gap-3 px-7 py-5 flex-1 min-w-0">

        {/* Icon + title row */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--mk-accent-soft)",
              border:     "1px solid var(--mk-border)",
            }}
          >
            <mod.icon
              className="w-[15px] h-[15px]"
              style={{ color: "var(--mk-accent)" }}
            />
          </div>
          <h3
            style={{
              fontSize:      "1.05rem",
              fontWeight:    800,
              fontFamily:    font,
              color:         "var(--mk-text-1)",
              lineHeight:    1.25,
            }}
          >
            {mod.title}
          </h3>
        </div>

        {/* Description — clamped to 2 lines */}
        <p
          className="line-clamp-2 leading-relaxed"
          style={{
            fontSize:   "0.82rem",
            fontFamily: font,
            color:      "var(--mk-text-2)",
          }}
        >
          {mod.desc}
        </p>

        {/* Footer: stat tag + explore link */}
        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: "1px solid var(--mk-border)" }}
        >
          <span
            className="text-[9.5px] uppercase tracking-[0.14em]"
            style={{ fontFamily: font, fontWeight: 700, color: "var(--mk-text-3)" }}
          >
            {mod.stat}
          </span>

          <div
            className="flex items-center gap-1 cursor-pointer transition-colors duration-300"
            style={{ color: "var(--mk-text-2)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.color = "var(--mk-text-1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.color = "var(--mk-text-2)";
            }}
          >
            <span
              className="text-[11px]"
              style={{ fontFamily: font, fontWeight: 700 }}
            >
              Explore
            </span>
            <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
          </div>
        </div>
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
      <div className="max-w-5xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="text-center mb-14">
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

        {/* ── Strip list ── */}
        <div className="flex flex-col gap-3">
          {modules.map((mod, i) => (
            <FeatureStrip key={i} mod={mod} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
