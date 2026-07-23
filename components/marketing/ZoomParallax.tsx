"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ParticleCanvas } from "./ParticleCanvas";
import { modules } from "./Features";

const font = "var(--mk-font-serif)";
const bodyFont = "var(--mk-font-sans)";

/* Same grain texture as Hero — keeps the two sections' --mk-bg surfaces
   visually identical so the seam between them doesn't read as a hard cut. */
const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")";

type Mod = (typeof modules)[number];
type WidgetId = "property" | "employee" | "sop" | "analytics" | "kra" | "inventory";

type CardConfig = {
  id: WidgetId;
  mod: Mod;
  position: string; // Tailwind classes for the card's resting position
  scaleEnd: number;
  xEnd: number;
  yEnd: number;
  accent: string;
  accent2: string;
  footerLabel: string;
  footerColor: string;
  footerPulse?: boolean;
};

const CARDS: CardConfig[] = [
  { id: "property", mod: modules[0], position: "-top-[24vh] -left-[20vw]", scaleEnd: 5, xEnd: -200, yEnd: -200, accent: "#6366f1", accent2: "#818cf8", footerLabel: "120 Rooms · 14 Vendors", footerColor: "var(--mk-text-3)" },
  { id: "employee", mod: modules[1], position: "-top-[2vh] -left-[32vw]",  scaleEnd: 6, xEnd: -350, yEnd: 0,    accent: "#10b981", accent2: "#34d399", footerLabel: "Live shift tracking", footerColor: "#10b981" },
  { id: "sop",      mod: modules[2], position: "-top-[24vh] left-[20vw]",  scaleEnd: 5, xEnd: 200,  yEnd: -200, accent: "#a855f7", accent2: "#6366f1", footerLabel: "Auditable submissions", footerColor: "var(--mk-text-3)" },
  { id: "analytics",mod: modules[3], position: "top-[20vh] -left-[20vw]",  scaleEnd: 6, xEnd: -200, yEnd: 200,  accent: "#0ea5e9", accent2: "#38bdf8", footerLabel: "Auto-reports generated", footerColor: "#0ea5e9" },
  { id: "kra",      mod: modules[4], position: "top-[20vh] left-[20vw]",   scaleEnd: 8, xEnd: 200,  yEnd: 200,  accent: "#f59e0b", accent2: "#fb923c", footerLabel: "Live KRA updates", footerColor: "#f59e0b" },
  { id: "inventory",mod: modules[5], position: "-top-[2vh] left-[32vw]",   scaleEnd: 9, xEnd: 350,  yEnd: 0,    accent: "#f43f5e", accent2: "#fb7185", footerLabel: "2 alerts active", footerColor: "#f43f5e", footerPulse: true },
];

const AVATARS = [
  { initials: "AS", color: "#6366f1" },
  { initials: "BK", color: "#a855f7" },
  { initials: "CS", color: "#f59e0b" },
  { initials: "DH", color: "#f43f5e" },
];

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-[9.5px]">
      <span className="truncate pr-2" style={{ color: "var(--mk-text-2)", fontFamily: bodyFont }}>
        {label}
      </span>
      <span
        className="flex shrink-0 items-center gap-1 font-bold"
        style={{ color, fontFamily: bodyFont }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {value}
      </span>
    </div>
  );
}

function ProgressRow({ label, value, accent, accent2 }: { label: string; value: number; accent: string; accent2: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[9.5px]">
        <span className="truncate pr-2" style={{ color: "var(--mk-text-2)", fontFamily: bodyFont }}>
          {label}
        </span>
        <span
          className="shrink-0 rounded px-1 font-bold"
          style={{ color: accent, background: `${accent}1a`, fontFamily: bodyFont }}
        >
          {value}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mk-border)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${accent}, ${accent2})` }}
        />
      </div>
    </div>
  );
}

function CardWidget({ card }: { card: CardConfig }) {
  switch (card.id) {
    case "property":
      return (
        <div className="space-y-1.5">
          <StatRow label="Grand Horizon Hotel" value="Active" color="var(--mk-success)" />
          <StatRow label="Alpine Heights Villa" value="Cleaning" color="var(--mk-warning)" />
        </div>
      );
    case "employee":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[9.5px]">
            <span style={{ color: "var(--mk-text-3)", fontFamily: bodyFont }}>Active Staff</span>
            <span
              className="rounded px-1.5 py-0.5 font-bold"
              style={{ color: "var(--mk-success)", background: "rgba(34,197,94,0.12)", fontFamily: bodyFont }}
            >
              19 On duty
            </span>
          </div>
          <div className="flex items-center -space-x-1.5">
            {AVATARS.map((a) => (
              <div
                key={a.initials}
                className="flex h-5 w-5 items-center justify-center rounded-full border text-[7px] font-bold text-white"
                style={{ background: a.color, borderColor: "var(--mk-surface-1)" }}
              >
                {a.initials}
              </div>
            ))}
            <span className="ml-2 text-[8px]" style={{ color: "var(--mk-text-3)", fontFamily: bodyFont }}>
              +15 on duty
            </span>
          </div>
        </div>
      );
    case "sop":
      return <ProgressRow label="Standard Check-in v2.1" value={96} accent={card.accent} accent2={card.accent2} />;
    case "kra":
      return <ProgressRow label="Task Completion" value={82} accent={card.accent} accent2={card.accent2} />;
    case "analytics":
      return (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[9.5px]" style={{ color: "var(--mk-text-3)", fontFamily: bodyFont }}>
              Weekly Revenue
            </span>
            <span
              className="flex items-center gap-0.5 text-[9.5px] font-bold"
              style={{ color: "var(--mk-success)", fontFamily: bodyFont }}
            >
              <ArrowUp className="h-2.5 w-2.5" /> 18.4%
            </span>
          </div>
          <svg className="h-8 w-full overflow-visible" viewBox="0 0 100 30" fill="none">
            <path
              d="M0,25 Q15,22 30,12 T60,18 T90,5 T100,2"
              stroke={card.accent}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    case "inventory":
      return (
        <div className="space-y-1.5">
          <StatRow label="Linen Bedsheets" value="Low (4)" color={card.accent} />
          <StatRow label="Toiletries Packs" value="Safe (450)" color="var(--mk-success)" />
        </div>
      );
  }
}

function ParallaxCard({ card, progress }: { card: CardConfig; progress: MotionValue<number> }) {
  const scale = useTransform(progress, [0, 1], [1, card.scaleEnd]);
  const x = useTransform(progress, [0, 1], [0, card.xEnd]);
  const y = useTransform(progress, [0, 1], [0, card.yEnd]);
  const opacity = useTransform(progress, [0, 0.62], [1, 0]);
  const Icon = card.mod.icon;

  return (
    <motion.div
      className="parallax-item pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center"
      style={{ scale, x, y, opacity }}
    >
      <div
        className={`relative w-[280px] rounded-2xl border p-5 backdrop-blur-xl ${card.position}`}
        style={{
          background: "var(--mk-tile-glass-bg)",
          borderColor: "var(--mk-tile-glass-border)",
          boxShadow: "var(--mk-shadow-md)",
        }}
      >
        <div className="mb-3.5 flex items-center justify-between">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: `${card.accent}1a`, border: `1px solid ${card.accent}33`, color: card.accent }}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
            style={{ color: card.accent, background: `${card.accent}14`, border: `1px solid ${card.accent}33`, fontFamily: bodyFont }}
          >
            {card.mod.tag}
          </span>
        </div>

        <h3
          className="mb-2 text-[13px] font-semibold leading-snug"
          style={{ color: "var(--mk-text-1)", fontFamily: bodyFont }}
        >
          {card.mod.title}
        </h3>

        <div className="border-t pt-2.5" style={{ borderColor: "var(--mk-border)" }}>
          <CardWidget card={card} />
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-2.5" style={{ borderColor: "var(--mk-border)" }}>
          <span
            className="flex items-center gap-1.5 text-[8.5px] font-bold"
            style={{ color: card.footerColor, fontFamily: bodyFont }}
          >
            {card.footerPulse && (
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: card.accent }}
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: card.accent }} />
              </span>
            )}
            {card.footerLabel}
          </span>
          <span className="text-[9.5px] font-bold" style={{ color: card.accent, fontFamily: bodyFont }}>
            Explore ↗
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function ZoomParallax() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const quoteScale = useTransform(scrollYProgress, [0, 1], [0.4, 1]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  /* Glow fades in rather than snapping to full strength at the very top of the
     section — avoids a hard color-temperature cut where Hero's neutral glow
     meets this section's indigo one. */
  const glowOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={sectionRef} className="relative h-[250vh]" style={{ background: "var(--mk-bg)" }}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Grain texture — matches Hero so the section boundary blends seamlessly */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ backgroundImage: GRAIN_URL, opacity: 0.4 }}
        />

        {/* Constellation particle background — same as Hero */}
        <ParticleCanvas />

        {/* Central spotlight glow — fades in with scroll, see glowOpacity above */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, var(--mk-accent-soft) 0%, transparent 70%)",
            opacity: glowOpacity,
          }}
        />

        {/* Scroll hint */}
        <motion.div
          className="pointer-events-none absolute top-24 left-1/2 z-20 -translate-x-1/2 text-center"
          style={{ opacity: indicatorOpacity }}
        >
          <p
            className="mb-2 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "var(--mk-text-3)", fontFamily: bodyFont }}
          >
            Scroll to expand workspace
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto flex justify-center"
          >
            <ArrowDown className="h-4 w-4" style={{ color: "var(--mk-accent)" }} />
          </motion.div>
        </motion.div>

        {/* Center copy */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 flex h-full w-full items-center justify-center px-6"
          style={{ scale: quoteScale }}
        >
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2
              className="italic leading-[1.25]"
              style={{
                fontFamily: font,
                fontSize: "clamp(1.7rem, 4vw, 3rem)",
                fontWeight: 600,
                color: "var(--mk-text-1)",
              }}
            >
              &ldquo;SkiTech isn&apos;t just a tool &mdash;
              <br />
              it&apos;s your{" "}
              <span
                className="not-italic font-bold"
                style={{
                  fontFamily: bodyFont,
                  backgroundImage: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                growth partner.
              </span>
              &rdquo;
            </h2>
            <p
              className="mt-5 max-w-md text-[13px] leading-relaxed"
              style={{ color: "var(--mk-text-3)", fontFamily: bodyFont }}
            >
              Built for owners and teams who aim to grow. SkiTech goes beyond
              management — empowering smarter decisions, streamlined workflows,
              and intelligent insights at every step.
            </p>
          </div>
        </motion.div>

        {/* Floating module cards */}
        {CARDS.map((card) => (
          <ParallaxCard key={card.mod.title} card={card} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
