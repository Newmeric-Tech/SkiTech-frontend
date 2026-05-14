"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sun, Moon } from "lucide-react";
import Link from "next/link";

const menuLinks = [
  {
    label: "Home",
    href: "/",
    number: "01",
    tag: "Start here",
    img: "https://images.unsplash.com/photo-1497366754035-f200581374c7?auto=format&fit=crop&w=900&q=80",
    caption: "Start here",
    sub: "Your journey begins",
  },
  {
    label: "About Us",
    href: "/about",
    number: "02",
    tag: "Our story",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    caption: "Our story",
    sub: "The people behind SkiTech",
  },
  {
    label: "Features",
    href: "/features",
    number: "03",
    tag: "What we do",
    img: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=900&q=80",
    caption: "What we do",
    sub: "Powerful tools, refined",
  },
  {
    label: "Solutions",
    href: "/solutions",
    number: "04",
    tag: "For you",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    caption: "For you",
    sub: "Tailored to your needs",
  },
  {
    label: "Why SkiTech",
    href: "/why-skitec",
    number: "05",
    tag: "The case",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    caption: "The case",
    sub: "Why we stand apart",
  },
  {
    label: "Pricing",
    href: "/pricing",
    number: "06",
    tag: "Fair & clear",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    caption: "Fair & clear",
    sub: "Transparent pricing",
  },
  {
    label: "FAQs",
    href: "/faqs",
    number: "07",
    tag: "Got questions?",
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
    caption: "Got questions?",
    sub: "We have answers",
  },
];

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80";

if (typeof window !== "undefined") {
  [DEFAULT_IMG, ...menuLinks.map((l) => l.img)].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function ImageSlide({
  src,
  alt,
  visible,
  caption,
  sub,
}: {
  src: string;
  alt: string;
  visible: boolean;
  caption?: string;
  sub?: string;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        animate={{ scale: visible ? 1 : 1.08 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        loading="eager"
      />
      {caption && sub && (
        <motion.div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)",
          }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.4, delay: visible ? 0.1 : 0 }}
        >
          <div className="px-7 pb-7">
            <motion.p
              className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-[5px]"
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 7 }}
              transition={{ duration: 0.35, delay: visible ? 0.18 : 0 }}
            >
              {caption}
            </motion.p>
            <motion.p
              className="text-white font-light leading-snug"
              style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)", letterSpacing: "-0.01em" }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 9 }}
              transition={{ duration: 0.4, delay: visible ? 0.22 : 0 }}
            >
              {sub}
            </motion.p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(saved ? saved === "dark" : prefersDark);

    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const menuTextColor = (i: number) => {
    if (dark) {
      return hovered === null ? "#f0f0f0" : hovered === i ? "#ffffff" : "rgba(255,255,255,0.12)";
    }
    return hovered === null ? "#0a0a0a" : hovered === i ? "#000" : "rgba(0,0,0,0.15)";
  };

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 dark:bg-[#1c1c1c]/95 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.07)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between h-[68px] lg:h-[76px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-[10px] flex items-center justify-center transition-all duration-300 group-hover:rounded-full group-hover:scale-105">
                <Zap className="w-[15px] h-[15px] text-white dark:text-black" fill="currentColor" strokeWidth={0} />
              </div>
              <span className="text-black dark:text-white font-semibold text-[17px] tracking-[-0.01em]">
                SkiTech
              </span>
            </Link>

            {/* Right controls */}
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center text-black/40 dark:text-white/60 hover:text-black dark:hover:text-white text-[13px] font-medium transition-colors duration-200"
              >
                Sign Up
              </Link>
              <span className="hidden md:block w-px h-3.5 bg-black/12 dark:bg-white/12" />

              {/* Theme toggle */}
              <button
                onClick={() => {
                  const next = !dark;
                  setDark(next);
                  document.documentElement.classList.toggle("dark", next);
                  localStorage.setItem("theme", next ? "dark" : "light");
                }}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/5 text-neutral-500 dark:text-[#c0c0c0] hover:bg-black/5 dark:hover:bg-white/10 transition-all backdrop-blur"
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Menu button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                className="group relative flex items-center gap-3 px-[18px] py-[9px] rounded-full bg-black dark:bg-white text-white dark:text-black overflow-hidden"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent" />
                <span className="flex flex-col justify-center gap-[4.5px] w-[16px] relative z-10">
                  <span className="block h-[1.5px] w-full bg-white dark:bg-black rounded-full" />
                  <span className="block h-[1.5px] w-[10px] bg-white/60 dark:bg-black/60 rounded-full" />
                </span>
                <span className="text-[10.5px] font-semibold tracking-[0.2em] uppercase relative z-10">
                  Menu
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* FULLSCREEN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
            style={{ backgroundColor: dark ? "#111111" : "#ffffff" }}
          >
            {/* TOP BAR */}
            <div className="flex items-center justify-between px-8 md:px-16 pt-6 pb-4 shrink-0">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 group"
              >
                <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center transition-all duration-300 group-hover:rounded-full ${dark ? "bg-white" : "bg-black"}`}>
                  <Zap className={`w-[13px] h-[13px] ${dark ? "text-black" : "text-white"}`} fill="currentColor" strokeWidth={0} />
                </div>
                <span className={`font-semibold text-[15px] ${dark ? "text-white" : "text-black"}`}>
                  SkiTech
                </span>
              </Link>

              <div className="flex items-center gap-3">
                {/* Theme toggle inside menu */}
                <button
                  onClick={() => {
                    const next = !dark;
                    setDark(next);
                    document.documentElement.classList.toggle("dark", next);
                    localStorage.setItem("theme", next ? "dark" : "light");
                  }}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                    dark ? "border-white/15 bg-white/5 text-[#c0c0c0] hover:bg-white/10" : "border-black/10 bg-black/5 text-neutral-500 hover:bg-black/10"
                  }`}
                  title={dark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>

              <motion.button
                onClick={() => setIsOpen(false)}
                whileTap={{ scale: 0.95 }}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  dark ? "border-white/12 hover:border-white/30" : "border-black/12 hover:border-black/30"
                }`}
              >
                <span className="relative w-3 h-3 flex items-center justify-center">
                  <span className={`block w-3 h-[1.5px] rotate-45 absolute transition-colors duration-200 ${dark ? "bg-white/40 group-hover:bg-white" : "bg-black/40 group-hover:bg-black"}`} />
                  <span className={`block w-3 h-[1.5px] -rotate-45 absolute transition-colors duration-200 ${dark ? "bg-white/40 group-hover:bg-white" : "bg-black/40 group-hover:bg-black"}`} />
                </span>
                <span className={`text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200 ${dark ? "text-white/40 group-hover:text-white" : "text-black/40 group-hover:text-black"}`}>
                  Close
                </span>
              </motion.button>
              </div>
            </div>

            {/* top rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              className={`h-px mx-8 md:mx-16 origin-left shrink-0 ${dark ? "bg-white/8" : "bg-black/8"}`}
            />

            {/* BODY */}
            <div className="flex-1 flex min-h-0 overflow-hidden">

              {/* LEFT — links */}
              <div className="flex-1 flex items-center min-h-0 overflow-hidden">
                <div className="w-full px-8 md:px-16">
                  {menuLinks.map((link, i) => (
                    <div key={link.label} className="relative">
                      <motion.div
                        className="absolute inset-y-0 -inset-x-8 md:-inset-x-16 pointer-events-none"
                        animate={{ opacity: hovered === i ? 1 : 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          background: dark
                            ? "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, transparent 80%)"
                            : "linear-gradient(90deg, rgba(0,0,0,0.025) 0%, transparent 80%)",
                        }}
                      />

                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        className="group flex items-center gap-5 md:gap-8 py-[10px] md:py-[12px] relative"
                      >
                        {/* ordinal + tag */}
                        <div className="flex flex-col items-end w-10 md:w-20 shrink-0">
                          <motion.span
                            animate={{ opacity: hovered === i ? 0.7 : 0.2 }}
                            transition={{ duration: 0.2 }}
                            className={`text-[10px] tracking-[0.25em] tabular-nums ${dark ? "text-white" : "text-black"}`}
                          >
                            {link.number}
                          </motion.span>
                          <motion.span
                            animate={{ opacity: hovered === i ? 0.4 : 0 }}
                            transition={{ duration: 0.2 }}
                            className={`hidden md:block text-[9px] tracking-widest uppercase mt-0.5 whitespace-nowrap ${dark ? "text-white/50" : "text-black/50"}`}
                          >
                            {link.tag}
                          </motion.span>
                        </div>

                        {/* vertical divider */}
                        <motion.div
                          className="hidden md:block w-px self-stretch"
                          animate={{
                            background: dark
                              ? hovered === i ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)"
                              : hovered === i ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.07)",
                          }}
                          transition={{ duration: 0.2 }}
                        />

                        {/* label */}
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.16 + i * 0.065,
                            duration: 0.55,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="flex-1 leading-none font-light transition-all duration-300"
                          style={{
                            fontSize: "clamp(1.65rem, 3.8vw, 3.4rem)",
                            letterSpacing: "-0.02em",
                            color: menuTextColor(i),
                          }}
                        >
                          {link.label}
                        </motion.span>

                        {/* arrow circle */}
                        <motion.div
                          className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center ${dark ? "border-white/20" : "border-black/20"}`}
                          animate={{
                            opacity: hovered === i ? 1 : 0,
                            scale: hovered === i ? 1 : 0.6,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className={`text-base leading-none ${dark ? "text-white/50" : "text-black/50"}`}>→</span>
                        </motion.div>
                      </Link>

                      {/* item rule */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          delay: 0.1 + i * 0.05,
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`h-px origin-left ${dark ? "bg-white/7" : "bg-black/7"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — image panel */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:flex w-[38%] shrink-0 items-center justify-center py-8 pr-12"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-neutral-100 shadow-[0_24px_64px_rgba(0,0,0,0.10),0_4px_16px_rgba(0,0,0,0.06)]">
                  <ImageSlide src={DEFAULT_IMG} alt="SkiTech" visible={hovered === null} />
                  {menuLinks.map((link, i) => (
                    <ImageSlide
                      key={link.label}
                      src={link.img}
                      alt={link.label}
                      visible={hovered === i}
                      caption={link.caption}
                      sub={link.sub}
                    />
                  ))}
                  <motion.div
                    className="absolute top-5 right-5 z-10 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="text-white/80 text-[9px] tracking-[0.2em] uppercase font-semibold">
                      SkiTech
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* BOTTOM BAR */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.35 }}
              className="shrink-0"
            >
              <div className={`h-px mx-8 md:mx-16 ${dark ? "bg-white/7" : "bg-black/7"}`} />
              <div className="flex items-center justify-between px-8 md:px-16 py-4">
                <span className={`text-[10px] tracking-[0.2em] uppercase ${dark ? "text-white/25" : "text-black/25"}`}>
                  © 2026 SkiTech
                </span>
                <div className="flex items-center gap-5">
                  {["Instagram ↗", "Twitter ↗", "LinkedIn ↗"].map((s) => (
                    <a
                      key={s}
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-[10px] tracking-[0.18em] uppercase transition-colors duration-200 ${dark ? "text-white/25 hover:text-white/60" : "text-black/25 hover:text-black/60"}`}
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
