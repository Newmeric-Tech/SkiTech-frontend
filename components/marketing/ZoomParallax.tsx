"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { modules } from "./Features";

const font = "var(--mk-font-serif)";
const bodyFont = "var(--mk-font-sans)";

type Mod = (typeof modules)[number];

type CardConfig = {
  mod: Mod;
  position: string; // Tailwind classes for the card's resting position
  scaleEnd: number;
  xEnd: number;
  yEnd: number;
  accent: string;
};

const CARDS: CardConfig[] = [
  { mod: modules[0], position: "-top-[24vh] -left-[20vw]", scaleEnd: 5, xEnd: -200, yEnd: -200, accent: "#6366f1" },
  { mod: modules[1], position: "-top-[2vh] -left-[32vw]",  scaleEnd: 6, xEnd: -350, yEnd: 0,    accent: "#10b981" },
  { mod: modules[2], position: "-top-[24vh] left-[20vw]",  scaleEnd: 5, xEnd: 200,  yEnd: -200, accent: "#a855f7" },
  { mod: modules[3], position: "top-[20vh] -left-[20vw]",  scaleEnd: 6, xEnd: -200, yEnd: 200,  accent: "#0ea5e9" },
  { mod: modules[4], position: "top-[20vh] left-[20vw]",   scaleEnd: 8, xEnd: 200,  yEnd: 200,  accent: "#f59e0b" },
  { mod: modules[5], position: "-top-[2vh] left-[32vw]",   scaleEnd: 9, xEnd: 350,  yEnd: 0,    accent: "#f43f5e" },
];

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
        className={`relative w-[260px] rounded-2xl border p-5 backdrop-blur-xl ${card.position}`}
        style={{
          background: "var(--mk-tile-glass-bg)",
          borderColor: "var(--mk-tile-glass-border)",
          boxShadow: "var(--mk-shadow-md)",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
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
          className="text-[13px] font-semibold leading-snug"
          style={{ color: "var(--mk-text-1)", fontFamily: bodyFont }}
        >
          {card.mod.title}
        </h3>
        <p
          className="mt-1.5 text-[10.5px]"
          style={{ color: "var(--mk-text-3)", fontFamily: bodyFont }}
        >
          {card.mod.stat}
        </p>
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

  return (
    <section ref={sectionRef} className="relative h-[250vh]" style={{ background: "var(--mk-bg)" }}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Central spotlight glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at center, var(--mk-accent-soft) 0%, transparent 70%)" }}
        />

        {/* Scroll hint */}
        <motion.div
          className="pointer-events-none absolute top-24 left-1/2 z-20 -translate-x-1/2 text-center"
          style={{ opacity: indicatorOpacity }}
        >
          <p
            className="mb-1 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "var(--mk-text-3)", fontFamily: bodyFont }}
          >
            Scroll to explore the workspace
          </p>
        </motion.div>

        {/* Center copy */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center px-6"
          style={{ scale: quoteScale }}
        >
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <p
              className="mb-4 text-[10.5px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "var(--mk-text-2)", fontFamily: bodyFont }}
            >
              Your Workspace
            </p>
            <h2
              className="italic leading-[1.25]"
              style={{
                fontFamily: font,
                fontSize: "clamp(1.7rem, 4vw, 3rem)",
                fontWeight: 600,
                color: "var(--mk-text-1)",
              }}
            >
              Every part of your operation,{" "}
              <span style={{ color: "var(--mk-accent)" }}>in one place.</span>
            </h2>
            <p
              className="mt-5 max-w-md text-[13px] leading-relaxed"
              style={{ color: "var(--mk-text-3)", fontFamily: bodyFont }}
            >
              Properties, people, procedures, and performance — six modules that
              used to live in six different tools, now unified in one workspace.
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
