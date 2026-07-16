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
          className="relative isolate overflow-hidden rounded-[24px] md:rounded-[36px] pt-10 md:pt-12 pb-6 px-6 md:px-16"
          style={{
            backgroundImage: "var(--mk-footer-wash)",
            border:      "1px solid var(--mk-border)",
            boxShadow:   "var(--mk-shadow-lg)",
          }}
        >
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.9fr_1fr_1fr_1fr_1fr] gap-8">

              {/* ── Brand col ── */}
              <div>
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
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
                  className="leading-relaxed max-w-xs mb-6"
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
                        className="relative flex items-center gap-1.5 p-1.5 rounded-full overflow-hidden w-full max-w-md"
                        style={{
                          background: "var(--mk-glass-bg)",
                          border:     "1px solid var(--mk-glass-border)",
                          boxShadow:
                            "var(--mk-shadow-md), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.06)",
                          backdropFilter:       "blur(20px) saturate(180%)",
                          WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        }}
                      >
                        {/* liquid sheen */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-full"
                          style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 45%)",
                          }}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="relative z-10 flex-1 min-w-0 rounded-full px-4 py-2.5 bg-transparent focus:outline-none transition-colors duration-300 text-sm"
                          style={{
                            color:      "var(--mk-text-1)",
                            fontFamily: font,
                          }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-opacity duration-300 hover:opacity-85"
                          style={{
                            background: "var(--mk-btn-primary-bg)",
                            boxShadow:  "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.15)",
                          }}
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
              className="relative mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3"
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
                fontSize:            "clamp(4rem, 12vw, 9rem)",
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
