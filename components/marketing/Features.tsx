"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  Building2,
  Users,
  ClipboardList,
  BarChart3,
  Shield,
  Truck,
  ArrowRight,
  X,
} from "lucide-react";

const font = "Merriweather, serif";
const EASE = [0.16, 1, 0.3, 1] as const;

const modules = [
  {
    icon: Building2,
    title: "Property Management",
    tag: "Core",
    stat: "Unified property control",
    desc: "Centralized property profiles, departments, vendor management, room tracking, and ownership details — all in one place. No more juggling spreadsheets across multiple properties.",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=85",
    chips: ["Multi-property", "Vendor tracking", "Room status", "Owner portal"],
  },
  {
    icon: Users,
    title: "Employee Management",
    tag: "People",
    stat: "Full workforce visibility",
    desc: "Workforce profiles, department mapping, shift scheduling, role assignment, and real-time staff visibility. Give every team member exactly the access they need — nothing more.",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=85",
    chips: ["Shift scheduling", "Role access", "Department map", "Attendance"],
  },
  {
    icon: ClipboardList,
    title: "SOP Management",
    tag: "Compliance",
    stat: "Versioned & auditable",
    desc: "Create, version, and distribute SOPs across every property and department. Control who sees what, track compliance, and keep your standards consistent at scale.",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=85",
    chips: ["Versioned docs", "GPS proof", "Role visibility", "Compliance %"],
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    tag: "Insights",
    stat: "Automated reporting",
    desc: "Revenue dashboards, KRA compliance tracking, occupancy metrics, and automated performance reports. Make data-driven decisions with clarity instead of guesswork.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=85",
    chips: ["Revenue charts", "Occupancy %", "KRA trends", "CSV export"],
  },
  {
    icon: Shield,
    title: "KRA Monitoring",
    tag: "Performance",
    stat: "Real-time compliance",
    desc: "Assign daily, weekly, and monthly KRAs to every department. Real-time compliance dashboards let managers spot underperformance early and course-correct before it becomes a problem.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85",
    chips: ["Daily KRAs", "Weekly KRAs", "Compliance %", "Staff ranking"],
  },
  {
    icon: Truck,
    title: "Inventory & Stock",
    tag: "Operations",
    stat: "Zero stockout surprises",
    desc: "Track stock levels across all your properties with automated low-stock alerts, full audit trails, and reorder notifications. Never run out of essentials again.",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=85",
    chips: ["Auto-alerts", "Movement log", "Audit trail", "Multi-property"],
  },
];

/* ── Tracks the desktop/mobile breakpoint so the grid can switch from a
   6-up row to a stacked accordion without a layout-shift flash on load. ── */
function useIsDesktop(breakpoint = 850) {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isDesktop;
}

type Mod = (typeof modules)[number];

function ModuleCard({
  mod,
  index,
  isExpanded,
  isDense,
  isDesktop,
  gridStyle,
  onExpand,
  onCollapse,
}: {
  mod: Mod;
  index: number;
  isExpanded: boolean;
  isDense: boolean;
  isDesktop: boolean;
  gridStyle?: React.CSSProperties;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = mod.icon;
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      layout
      transition={{ duration: 0.6, ease: EASE }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !isExpanded && onExpand()}
      role={isExpanded ? undefined : "button"}
      tabIndex={isExpanded ? undefined : 0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => {
        if (!isExpanded && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onExpand();
        }
      }}
      style={{
        ...gridStyle,
        background: isExpanded ? "var(--mk-surface-1)" : "var(--mk-surface-2)",
        border: `1px solid ${
          isExpanded
            ? "var(--mk-accent-glow)"
            : hovered
            ? "var(--mk-border-strong)"
            : "var(--mk-border)"
        }`,
        boxShadow: isExpanded
          ? "var(--mk-shadow-lg)"
          : hovered
          ? "var(--mk-shadow-md)"
          : "none",
        transform: !isExpanded && hovered ? "translateY(-4px)" : "translateY(0)",
        cursor: isExpanded ? "default" : "pointer",
        minHeight: isDesktop ? undefined : isExpanded ? 460 : 108,
        transition:
          "background 0.35s ease, border-color 0.3s ease, box-shadow 0.35s ease, transform 0.35s ease",
      }}
      className="relative overflow-hidden rounded-2xl w-full"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isExpanded ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex h-full gap-5 p-5 sm:gap-6 sm:p-7 ${
              isDesktop ? "flex-row" : "flex-col"
            }`}
          >
            {/* Image panel */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              className={`relative shrink-0 overflow-hidden rounded-xl ${
                isDesktop ? "h-full w-[52%]" : "h-[170px] w-full"
              }`}
              style={{ border: "1px solid var(--mk-border)", background: "var(--mk-surface-3)" }}
            >
              <img
                src={mod.img}
                alt={mod.title}
                className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.04]"
              />
            </motion.div>

            {/* Detail panel */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16, ease: EASE }}
                className="flex shrink-0 items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="font-mono text-[11px] font-semibold"
                    style={{ color: "var(--mk-text-3)" }}
                  >
                    {num}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em]"
                    style={{
                      color: "var(--mk-accent)",
                      background: "var(--mk-accent-soft)",
                      border: "1px solid var(--mk-accent-glow)",
                    }}
                  >
                    {mod.tag}
                  </span>
                </div>
                <button
                  aria-label={`Close ${mod.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollapse();
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 hover:rotate-90"
                  style={{ border: "1px solid var(--mk-border)", color: "var(--mk-text-2)" }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22, ease: EASE }}
                className="flex shrink-0 items-center gap-3"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--mk-accent-soft)", border: "1px solid var(--mk-border)" }}
                >
                  <Icon className="h-[18px] w-[18px]" style={{ color: "var(--mk-accent)" }} />
                </div>
                <h3
                  className="text-[1.15rem] font-bold leading-tight tracking-tight sm:text-[1.35rem]"
                  style={{ fontFamily: font, color: "var(--mk-text-1)" }}
                >
                  {mod.title}
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.28, ease: EASE }}
                className="min-h-0 flex-1 overflow-y-auto pr-1"
              >
                <p
                  className="mb-4 text-[0.85rem] leading-relaxed"
                  style={{ fontFamily: font, color: "var(--mk-text-2)" }}
                >
                  {mod.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {mod.chips.map((chip) => (
                    <span
                      key={chip}
                      className="whitespace-nowrap rounded-full px-3 py-1 text-[10.5px] font-medium"
                      style={{
                        color: "var(--mk-accent)",
                        background: "var(--mk-accent-soft)",
                        border: "1px solid var(--mk-accent-glow)",
                        fontFamily: font,
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="compact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex h-full flex-col justify-between ${isDense ? "p-5" : "p-6"}`}
          >
            <span
              className="font-mono text-[11px] font-semibold tracking-[0.15em]"
              style={{ color: "var(--mk-text-3)" }}
            >
              {num}
            </span>

            <div className={isDense ? "mb-2" : "mb-4"}>
              <div
                className={`flex items-center justify-center rounded-xl transition-transform duration-300 ${
                  isDense ? "mb-3 h-8 w-8" : "mb-4 h-9 w-9"
                } ${hovered ? "-translate-y-0.5" : ""}`}
                style={{ background: "var(--mk-accent-soft)", border: "1px solid var(--mk-border)" }}
              >
                <Icon
                  className={isDense ? "h-4 w-4" : "h-[18px] w-[18px]"}
                  style={{ color: "var(--mk-accent)" }}
                />
              </div>
              <h3
                className={isDense ? "text-[13px] font-semibold leading-snug" : "text-[15.5px] font-semibold leading-snug"}
                style={{ fontFamily: font, color: "var(--mk-text-1)" }}
              >
                {mod.title}
              </h3>
            </div>

            <div
              className={`absolute flex items-center justify-center rounded-full transition-colors duration-300 ${
                isDense ? "bottom-4 right-4 h-7 w-7" : "bottom-5 right-5 h-8 w-8"
              }`}
              style={{
                border: `1px solid ${hovered ? "var(--mk-accent)" : "var(--mk-border)"}`,
                background: hovered ? "var(--mk-accent-soft)" : "transparent",
              }}
            >
              <ArrowRight
                className="h-3.5 w-3.5"
                style={{ color: hovered ? "var(--mk-accent)" : "var(--mk-text-2)" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Features() {
  const ref = useRef(null);
  const headerInView = useInView(ref, { once: true, margin: "-60px" });
  const isDesktop = useIsDesktop();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (expandedIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedIdx(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expandedIdx]);

  const gridTemplate =
    expandedIdx === null
      ? { gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gridTemplateRows: "1fr", height: 260 }
      : { gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr) minmax(0, 1fr)", gridTemplateRows: "repeat(3, minmax(0, 1fr))", height: 560 };

  return (
    <section
      id="features"
      ref={ref}
      className="py-24 md:py-28"
      style={{ background: "var(--mk-surface-2)", fontFamily: font }}
    >
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        {/* ── Header ── */}
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-4 text-[10.5px] uppercase tracking-[0.22em]"
            style={{ fontWeight: 700, fontFamily: font, color: "var(--mk-text-2)" }}
          >
            Core Modules
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.09, ease: EASE }}
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 800,
              color: "var(--mk-text-1)",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              fontFamily: font,
            }}
          >
            Everything to Run Your{" "}
            <em style={{ fontStyle: "italic", fontWeight: 900 }}>Properties</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mt-5 max-w-md leading-relaxed"
            style={{ fontSize: "0.88rem", fontFamily: font, color: "var(--mk-text-3)" }}
          >
            Six powerful modules working together to eliminate spreadsheets and disconnected tools. Click any to explore.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={headerInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.32, ease: EASE }}
            className="mx-auto mt-7 h-px w-14 origin-center"
            style={{ background: "var(--mk-text-1)" }}
          />
        </div>

        {/* ── Modules grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className={isDesktop ? "grid gap-5" : "flex flex-col gap-4"}
          style={isDesktop ? { ...gridTemplate, transition: "height 0.6s cubic-bezier(0.16,1,0.3,1)" } : undefined}
        >
          {modules.map((mod, i) => {
            const isExpanded = expandedIdx === i;
            let gridStyle: React.CSSProperties | undefined;

            if (isDesktop && expandedIdx !== null) {
              if (isExpanded) {
                gridStyle = { gridColumn: "1", gridRow: "1 / span 3" };
              } else {
                const others = modules.map((_, idx) => idx).filter((idx) => idx !== expandedIdx);
                const pos = others.indexOf(i);
                gridStyle = { gridColumn: String(2 + (pos % 2)), gridRow: String(1 + Math.floor(pos / 2)) };
              }
            }

            return (
              <ModuleCard
                key={mod.title}
                mod={mod}
                index={i}
                isExpanded={isExpanded}
                isDense={isDesktop && expandedIdx !== null && !isExpanded}
                isDesktop={isDesktop}
                gridStyle={gridStyle}
                onExpand={() => setExpandedIdx(i)}
                onCollapse={() => setExpandedIdx(null)}
              />
            );
          })}
        </motion.div>

        {/* ── Hint ── */}
        <AnimatePresence>
          {expandedIdx === null && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.3 }}
              className="mt-8 flex items-center justify-center gap-2 text-[11px] tracking-[0.04em]"
              style={{ color: "var(--mk-text-3)", fontFamily: font }}
            >
              <ArrowRight className="h-3 w-3 -scale-x-100" />
              Click any module to explore
              <ArrowRight className="h-3 w-3" />
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
