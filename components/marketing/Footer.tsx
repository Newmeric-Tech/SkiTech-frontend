"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Twitter, Linkedin, Github, Mail } from "lucide-react";
import Link from "next/link";

const font = "Merriweather, serif";

const footerLinks = {
  Product: [
    { label: "Features", href: "/product" },
    { label: "Solutions", href: "/solutions" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/owner" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Request Demo", href: "/demo" },
  ],
  Access: [
    { label: "Sign In", href: "/auth/login" },
    { label: "Owner Portal", href: "/owner" },
    { label: "Manager Portal", href: "/manager" },
    { label: "Staff Portal", href: "/staff" },
  ],
};

const socials = [
  { Icon: Twitter,  href: "#", label: "Twitter"  },
  { Icon: Linkedin, href: "#", label: "LinkedIn"  },
  { Icon: Github,   href: "#", label: "GitHub"    },
  { Icon: Mail,     href: "#", label: "Email"     },
];

export function Footer() {
  const [email, setEmail]         = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "var(--mk-bg)", fontFamily: font }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, var(--mk-text-1) 1px, transparent 0)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Ambient glows */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[300px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: "var(--mk-hero-glow)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "var(--mk-accent-soft)" }}
      />

      {/* Main content */}
      <div className="relative max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

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
            <div className="mb-8">
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

            {/* Social icons */}
            <div className="flex gap-2.5">
              {socials.map(({ Icon, href, label }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  aria-label={label}
                  whileHover={{ y: -3, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-[color,border-color,background] duration-300"
                  style={{
                    border:     "1px solid var(--mk-border)",
                    background: "var(--mk-glass-bg)",
                    color:      "var(--mk-text-3)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color       = "var(--mk-text-1)";
                    el.style.borderColor = "var(--mk-border-strong)";
                    el.style.background  = "var(--mk-glass-hover)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color       = "var(--mk-text-3)";
                    el.style.borderColor = "var(--mk-border)";
                    el.style.background  = "var(--mk-glass-bg)";
                  }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
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
                      className="text-sm inline-flex items-center gap-1 transition-colors duration-300"
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
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="relative"
        style={{ borderTop: "1px solid var(--mk-border)" }}
      >
        {/* Ghost wordmark */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none overflow-hidden leading-none"
          aria-hidden
          style={{
            fontSize:      "clamp(4rem, 14vw, 11rem)",
            fontWeight:    900,
            fontStyle:     "italic",
            fontFamily:    font,
            color:         "var(--mk-text-1)",
            opacity:       0.025,
            letterSpacing: "-0.03em",
            whiteSpace:    "nowrap",
            lineHeight:    0.85,
          }}
        >
          SkiTech
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px]" style={{ fontFamily: font, color: "var(--mk-text-3)" }}>
            Built by Newmeric Tech LLC
          </p>
          <p className="text-[11px]" style={{ fontFamily: font, color: "var(--mk-text-3)" }}>
            © 2025 SkiTech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
