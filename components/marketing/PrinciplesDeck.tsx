"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const font = "var(--mk-font-serif)";
const bodyFont = "var(--mk-font-sans)";
const EASE = [0.16, 1, 0.3, 1] as const;
const THROW_DISTANCE = 480;
const SWIPE_THRESHOLD = 110;

const principles = [
  { num: "I", title: "Clarity First", body: "Every decision we make removes complexity — never adds to it." },
  { num: "II", title: "Owner Obsessed", body: "Every feature originates from a real problem faced by a real property team." },
  { num: "III", title: "Speed by Design", body: "Slow decisions cost money. Our platform is architected for velocity." },
  { num: "IV", title: "Globally Minded", body: "Built for property teams across languages, timezones, and markets." },
];

const n = principles.length;

type CardPose = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotate: number;
  opacity: number;
  zIndex: number;
};

function poseForDiff(diff: number): CardPose {
  if (diff === 0) return { x: 0, y: 0, z: 0, scale: 1, rotate: 0, opacity: 1, zIndex: 40 };
  if (diff === 1) return { x: 46, y: -8, z: -20, scale: 0.94, rotate: 1.5, opacity: 0.8, zIndex: 30 };
  if (diff === 2) return { x: 0, y: -16, z: -40, scale: 0.88, rotate: 0, opacity: 0.5, zIndex: 10 };
  return { x: -46, y: -8, z: -20, scale: 0.94, rotate: -1.5, opacity: 0.8, zIndex: 30 };
}

export function PrinciplesDeck() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [throwing, setThrowing] = useState<{ index: number; x: number; rotate: number } | null>(null);
  const isAnimating = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const cycle = (direction: "next" | "prev") => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const throwX = direction === "next" ? -THROW_DISTANCE : THROW_DISTANCE;
    const throwRotate = direction === "next" ? -15 : 15;
    setThrowing({ index: currentIndex, x: throwX, rotate: throwRotate });
    setDrag(null);

    setTimeout(() => {
      setCurrentIndex((prev) => (direction === "next" ? (prev + 1) % n : (prev - 1 + n) % n));
    }, 350);

    setTimeout(() => {
      setThrowing(null);
      isAnimating.current = false;
    }, 650);
  };

  const cycleTo = (targetIndex: number) => {
    if (isAnimating.current || targetIndex === currentIndex) return;
    const distance = (targetIndex - currentIndex + n) % n;
    if (distance === 1) return cycle("next");
    if (distance === n - 1) return cycle("prev");

    isAnimating.current = true;
    setThrowing({ index: currentIndex, x: 0, rotate: 0 });
    setTimeout(() => {
      setCurrentIndex(targetIndex);
    }, 220);

    setTimeout(() => {
      setThrowing(null);
      isAnimating.current = false;
    }, 520);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimating.current) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    setDrag({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handlePointerUp = () => {
    if (!dragStart.current) return;
    const offsetX = drag?.x ?? 0;
    dragStart.current = null;

    if (Math.abs(offsetX) > SWIPE_THRESHOLD) {
      cycle(offsetX < 0 ? "next" : "prev");
    } else {
      setDrag(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Deck ── */}
      <div
        className="relative w-full flex justify-center"
        style={{ perspective: 1200, height: 340 }}
      >
        <div className="relative w-full max-w-[520px]" style={{ height: 300 }}>
          {principles.map((p, i) => {
            const diff = (i - currentIndex + n) % n;
            const isActive = diff === 0;
            const isThrown = throwing?.index === i;

            let pose = poseForDiff(diff);
            let transitionDuration = 0.65;

            if (isThrown) {
              pose = { x: throwing.x, y: -20, z: 50, scale: 1, rotate: throwing.rotate, opacity: 0, zIndex: 50 };
            } else if (isActive && drag) {
              pose = {
                ...pose,
                x: pose.x + drag.x,
                y: pose.y + drag.y,
                rotate: drag.x * 0.05,
                scale: 1.02,
              };
              transitionDuration = 0;
            }

            return (
              <motion.div
                key={p.num}
                onPointerDown={isActive ? handlePointerDown : undefined}
                onPointerMove={isActive ? handlePointerMove : undefined}
                onPointerUp={isActive ? handlePointerUp : undefined}
                onPointerCancel={isActive ? handlePointerUp : undefined}
                animate={{
                  x: pose.x,
                  y: pose.y,
                  z: pose.z,
                  scale: pose.scale,
                  rotate: pose.rotate,
                  opacity: pose.opacity,
                }}
                transition={{ duration: transitionDuration, ease: EASE }}
                style={{
                  zIndex: pose.zIndex,
                  transformOrigin: "center bottom",
                  cursor: isActive ? (drag ? "grabbing" : "grab") : "default",
                  touchAction: "none",
                  background: "var(--mk-tile-glass-bg)",
                  border: "1px solid var(--mk-tile-glass-border)",
                  boxShadow: isActive ? "var(--mk-shadow-lg)" : "var(--mk-shadow-md)",
                }}
                className="absolute inset-0 rounded-[24px] p-8 sm:p-9 flex flex-col justify-between select-none backdrop-blur-lg"
              >
                <span
                  className="leading-none"
                  style={{
                    fontFamily: font,
                    fontStyle: "italic",
                    fontWeight: 900,
                    fontSize: 52,
                    color: isActive ? "var(--mk-accent-glow)" : "var(--mk-text-3)",
                  }}
                >
                  {p.num}
                </span>
                <div>
                  <h3
                    className="mb-3"
                    style={{ fontFamily: font, fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--mk-text-1)" }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-[0.92rem] leading-relaxed"
                    style={{ fontFamily: bodyFont, fontWeight: 300, color: "var(--mk-text-2)" }}
                  >
                    {p.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col items-center gap-5 mt-4">
        <div className="flex gap-2">
          {principles.map((p, i) => (
            <button
              key={p.num}
              aria-label={`Go to principle ${i + 1}`}
              onClick={() => cycleTo(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? 20 : 6,
                background: i === currentIndex ? "var(--mk-accent)" : "var(--mk-text-3)",
                boxShadow: i === currentIndex ? "0 0 10px var(--mk-accent-glow)" : "none",
              }}
            />
          ))}
        </div>

        <div className="flex gap-4">
          <button
            aria-label="Previous principle"
            onClick={() => cycle("prev")}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
            style={{ border: "1px solid var(--mk-border)", color: "var(--mk-text-2)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--mk-accent)";
              el.style.background = "var(--mk-accent-soft)";
              el.style.color = "var(--mk-text-1)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--mk-border)";
              el.style.background = "transparent";
              el.style.color = "var(--mk-text-2)";
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Next principle"
            onClick={() => cycle("next")}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
            style={{ border: "1px solid var(--mk-border)", color: "var(--mk-text-2)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--mk-accent)";
              el.style.background = "var(--mk-accent-soft)";
              el.style.color = "var(--mk-text-1)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--mk-border)";
              el.style.background = "transparent";
              el.style.color = "var(--mk-text-2)";
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
