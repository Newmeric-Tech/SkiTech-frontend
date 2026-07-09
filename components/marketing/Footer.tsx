"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send } from "lucide-react";
import Link from "next/link";
import { SectionSeam } from "./SectionSeam";

const font = "Merriweather, serif";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Solutions", href: "/solutions" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Dashboard", href: "/owner" },
  ],
  Company: [
    { label: "About", href: "/#about-us" },
    { label: "Contact", href: "/contact" },
    { label: "Request Demo", href: "/demo" },
  ],
  Access: [
    { label: "Sign In", href: "/auth/login" },
    { label: "Owner Portal", href: "/owner" },
    { label: "Manager Portal", href: "/manager" },
    { label: "Staff Portal", href: "/staff" },
  ],
  Connect: [
    { label: "X (Twitter)", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Email", href: "#" },
  ],
};

const footerLinkClass =
  "relative inline-block text-sm transition-colors duration-300 " +
  "after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full " +
  "after:bg-current after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100 " +
  "after:transition-transform after:duration-300";

const noiseUrl =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";

export function Footer() {
  const [email, setEmail]         = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer
      className="relative overflow-hidden isolate"
      style={{ background: "var(--mk-bg)", fontFamily: font }}
    >
      <SectionSeam from="--mk-surface-1" to="--mk-bg" />

      {/* Floating card wrapper */}
      <div className="relative mx-4 mb-4 md:mx-8 md:mb-8 pt-10 md:pt-14">
        {/* Ambient glow behind the card */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[80%] h-48 rounded-full blur-[100px] opacity-60 pointer-events-none"
          style={{ background: "var(--mk-hero-glow)" }}
        />

        <div
          className="relative isolate overflow-hidden rounded-[24px] md:rounded-[36px] pt-14 md:pt-16 pb-8 px-6 md:px-16"
          style={{
            background:  "var(--mk-surface-1)",
            border:      "1px solid var(--mk-border)",
            boxShadow:   "var(--mk-shadow-lg)",
          }}
        >
          {/* Noise texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: noiseUrl, opacity: 0.5 }}
          />

          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

              {/* ── Brand col ── */}
              <div className="lg:col-span-2">
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                      border:     "1px solid var(--mk-border)",
                      background: "var(--mk-glass-bg)",
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
                      if (span) span.style.color = "var(--mk-text-1)";
                    }}
                  >
                    <span
                      className="text-[13px] transition-colors duration-300"
                      style={{ fontFamily: font, fontWeight: 900, fontStyle: "italic", color: "var(--mk-text-1)" }}
                    >
                      S
                    </span>
                  </div>
                  <span
                    style={{ fontWeight: 800, fontSize: "1.1rem", fontFamily: font, color: "var(--mk-text-1)" }}
                  >
                    SkiTech
                  </span>
                </Link>

                <p
                  className="leading-relaxed max-w-xs mb-8"
                  style={{ fontSize: "0.85rem", fontFamily: font, color: "var(--mk-text-3)" }}
                >
                  Property Operations Management System for modern property owners and managers.
                </p>

                {/* Newsletter */}
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.18em] mb-4"
                    style={{ fontFamily: font, fontWeight: 700, color: "var(--mk-text-2)" }}
                  >
                    Stay Updated
                  </p>

                  <AnimatePresence mode="wait">
                    {subscribed ? (
                      <motion.p
                        key="thanks"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="text-sm"
                        style={{ fontFamily: font, color: "var(--mk-text-2)" }}
                      >
                        ✓ You&apos;re subscribed. Thanks!
                      </motion.p>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubscribe}
                        className="flex gap-2"
                      >
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="flex-1 min-w-0 rounded-xl px-4 py-2.5 focus:outline-none transition-colors duration-300 text-sm"
                          style={{
                            background:   "var(--mk-glass-bg)",
                            border:       "1px solid var(--mk-border)",
                            color:        "var(--mk-text-1)",
                            fontFamily:   font,
                          }}
                          onFocus={(e) => {
                            (e.currentTarget as HTMLInputElement).style.borderColor = "var(--mk-border-strong)";
                          }}
                          onBlur={(e) => {
                            (e.currentTarget as HTMLInputElement).style.borderColor = "var(--mk-border)";
                          }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-opacity duration-300 hover:opacity-85"
                          style={{ background: "var(--mk-btn-primary-bg)" }}
                        >
                          <Send className="w-4 h-4" style={{ color: "var(--mk-btn-primary-text)" }} />
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Link columns ── */}
              {Object.entries(footerLinks).map(([category, links], ci) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: ci * 0.08 + 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p
                    className="text-[10.5px] uppercase tracking-[0.18em] mb-5"
                    style={{ fontFamily: font, fontWeight: 700, color: "var(--mk-text-3)" }}
                  >
                    {category}
                  </p>
                  <ul className="space-y-3.5">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className={footerLinkClass}
                          style={{ fontFamily: font, fontWeight: 400, color: "var(--mk-text-2)" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--mk-text-1)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--mk-text-2)";
                          }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* ── Bottom bar ── */}
            <div
              className="relative mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ borderTop: "1px solid var(--mk-border)" }}
            >
              <p className="text-[11px]" style={{ fontFamily: font, color: "var(--mk-text-3)" }}>
                Built by Newmeric Tech LLC
              </p>
              <p className="text-[11px]" style={{ fontFamily: font, color: "var(--mk-text-3)" }}>
                © 2025 SkiTech. All rights reserved.
              </p>
            </div>
          </div>

          {/* Huge cropped watermark */}
          <div
            className="absolute bottom-0 left-0 right-0 text-center select-none pointer-events-none overflow-hidden leading-none"
            aria-hidden
            style={{ transform: "translateY(20%)" }}
          >
            <span
              className="inline-block uppercase"
              style={{
                fontSize:            "clamp(5rem, 16vw, 14rem)",
                fontWeight:          900,
                fontFamily:          font,
                letterSpacing:       "-0.04em",
                lineHeight:          0.85,
                whiteSpace:          "nowrap",
                backgroundImage:     "var(--mk-watermark-gradient)",
                WebkitBackgroundClip: "text",
                backgroundClip:      "text",
                color:               "transparent",
                opacity:             "var(--mk-watermark-opacity)",
              }}
            >
              SkiTech
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
