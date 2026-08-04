"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Check, Hotel, Users, ArrowRight, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useMarketingTheme } from "@/components/marketing/ThemeProvider";

const perks = [
  "30-minute personalized walkthrough",
  "See all 6 modules in action",
  "Ask questions specific to your properties",
  "No commitment required",
];

const sizes = ["1 property", "2–5 properties", "6–15 properties", "16+ properties"];
const roles = ["Owner", "Manager", "Operations Director", "IT/Tech", "Other"];

const emptyForm = { name: "", email: "", company: "", phone: "", size: "", role: "", message: "" };

export default function DemoPage() {
  const { theme } = useMarketingTheme();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.transform = `translate3d(${e.clientX * 0.15}px, ${e.clientY * 0.15}px, 0)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(step + 1); return; }
    setSubmitting(true);
    try {
      await axios.post(`${apiBase}/v1/auth/demo-request`, form);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setForm(emptyForm);
    setStep(1);
    setSubmitted(false);
  };

  const badgeBg = theme === "dark" ? "#000000" : "#ffffff";
  const badgeColor = theme === "dark" ? "#ffffff" : "#0f172a";

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden px-4 pt-32 pb-20"
      style={{ backgroundColor: "var(--mk-bg)", fontFamily: "var(--mk-font-sans)" }}
    >
      <style>{`
        .dm-glow {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 50%;
          height: 50%;
          background: radial-gradient(circle, var(--mk-accent-glow) 0%, transparent 70%);
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .dm-glow-2 {
          position: absolute;
          bottom: -10%;
          right: -10%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%);
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
        }
        .dm-icon-badge {
          width: 52px;
          height: 52px;
          border-radius: var(--mk-radius-lg);
          background: ${badgeBg};
          color: ${badgeColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--mk-shadow-md);
          transition: transform 0.3s ease;
        }
        .dm-hero-info:hover .dm-icon-badge { transform: translateY(-4px) rotate(-5deg); }

        .dm-hero-title {
          font-family: var(--mk-font-sans);
          font-size: 46px;
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--mk-text-1);
        }
        .dm-hero-title em {
          font-family: var(--mk-font-serif);
          font-style: italic;
          font-weight: 500;
          color: var(--mk-text-1);
        }

        .dm-benefit-check {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--mk-accent-soft);
          border: 1px solid var(--mk-accent-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--mk-accent);
          flex-shrink: 0;
        }

        .dm-stat-card {
          padding: 22px;
          border-radius: var(--mk-radius-lg);
          background: var(--mk-tile-glass-bg);
          border: 1px solid var(--mk-tile-glass-border);
          box-shadow: var(--mk-shadow-md);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dm-stat-card:hover {
          transform: translateY(-6px);
          border-color: var(--mk-accent);
          box-shadow: 0 15px 30px var(--mk-accent-glow);
        }
        .dm-stat-icon {
          width: 34px;
          height: 34px;
          border-radius: var(--mk-radius-sm);
          background: var(--mk-accent-soft);
          color: var(--mk-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .dm-stat-number {
          font-family: var(--mk-font-serif);
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          color: var(--mk-text-1);
        }
        .dm-stat-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--mk-text-3);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .dm-form-card {
          position: relative;
          padding: 40px;
          border-radius: var(--mk-radius-xl);
          background: var(--mk-tile-glass-bg);
          border: 1px solid var(--mk-tile-glass-border);
          box-shadow: var(--mk-shadow-lg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .dm-stepper {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 18px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--mk-border);
        }
        .dm-step-item { display: flex; align-items: center; gap: 10px; opacity: 0.4; transition: opacity 0.3s ease; }
        .dm-step-item.is-active { opacity: 1; }
        .dm-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--mk-btn-primary-bg);
          color: var(--mk-btn-primary-text);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .dm-step-item.is-active .dm-step-num {
          background: var(--mk-accent);
          color: #ffffff;
          box-shadow: 0 0 12px var(--mk-accent-glow);
        }
        .dm-step-label { font-size: 14px; font-weight: 600; color: var(--mk-text-1); white-space: nowrap; }
        .dm-step-separator { height: 1px; width: 28px; background: var(--mk-border); flex-shrink: 0; }

        .dm-field { position: relative; width: 100%; }
        .dm-field input,
        .dm-field textarea {
          width: 100%;
          padding: 16px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          background: transparent;
          color: var(--mk-text-1);
          border: 1px solid var(--mk-border-strong);
          border-radius: var(--mk-radius-md);
          outline: none;
          transition: all 0.3s ease;
        }
        .dm-field textarea { min-height: 96px; resize: vertical; }
        .dm-field label {
          position: absolute;
          left: 14px;
          top: 18px;
          padding: 0 4px;
          color: var(--mk-text-3);
          font-size: 14px;
          font-weight: 500;
          pointer-events: none;
          transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
          transform-origin: left top;
          background: var(--mk-surface-1);
        }
        .dm-field:focus-within label,
        .dm-field.is-filled label {
          transform: translateY(-26px) scale(0.85);
          color: var(--mk-accent);
          font-weight: 600;
        }
        .dm-field:focus-within input,
        .dm-field:focus-within textarea {
          border-color: var(--mk-accent);
          box-shadow: 0 0 0 4px var(--mk-accent-soft);
        }

        .dm-select-group { display: flex; flex-direction: column; gap: 8px; }
        .dm-select-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--mk-text-3);
        }
        .dm-select-group select {
          width: 100%;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          background: transparent;
          color: var(--mk-text-1);
          border: 1px solid var(--mk-border-strong);
          border-radius: var(--mk-radius-md);
          outline: none;
          appearance: none;
          transition: all 0.3s ease;
        }
        .dm-select-group select:focus {
          border-color: var(--mk-accent);
          box-shadow: 0 0 0 4px var(--mk-accent-soft);
        }

        .dm-btn-submit {
          width: 100%;
          padding: 16px;
          border-radius: var(--mk-radius-lg);
          border: none;
          background: var(--mk-btn-primary-bg);
          color: var(--mk-btn-primary-text);
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--mk-shadow-md);
        }
        .dm-btn-submit:hover:not(:disabled) {
          background: var(--mk-accent);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px var(--mk-accent-glow);
        }
        .dm-btn-submit:hover:not(:disabled) svg { transform: translateX(4px); }
        .dm-btn-submit svg { width: 16px; height: 16px; transition: transform 0.3s ease; }
        .dm-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .dm-btn-back {
          padding: 16px;
          border-radius: var(--mk-radius-lg);
          border: 1px solid var(--mk-border-strong);
          background: transparent;
          color: var(--mk-text-2);
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.3s ease;
        }
        .dm-btn-back:hover {
          border-color: var(--mk-text-1);
          color: var(--mk-text-1);
          background: var(--mk-glass-hover);
        }

        .dm-success-icon {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: var(--mk-accent-soft);
          border: 2px solid var(--mk-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--mk-accent);
          box-shadow: 0 0 30px var(--mk-accent-glow);
        }
        .dm-checkmark {
          width: 34px;
          height: 34px;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: dmDrawCheck 0.8s ease forwards 0.3s;
        }
        @keyframes dmDrawCheck { to { stroke-dashoffset: 0; } }

        .dm-success-title {
          font-family: var(--mk-font-serif);
          font-size: 26px;
          font-weight: 700;
          color: var(--mk-text-1);
        }

        .dm-btn-done {
          padding: 12px 24px;
          border-radius: var(--mk-radius-md);
          border: 1px solid var(--mk-border-strong);
          background: var(--mk-glass-bg);
          color: var(--mk-text-1);
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .dm-btn-done:hover {
          background: var(--mk-accent-soft);
          border-color: var(--mk-accent);
          color: var(--mk-accent);
        }

        @media (max-width: 640px) {
          .dm-hero-title { font-size: 34px; }
          .dm-form-card { padding: 26px 20px; }
        }
      `}</style>

      <div className="dm-glow" ref={glowRef} />
      <div className="dm-glow-2" />

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-14 items-center">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="dm-hero-info lg:col-span-2 flex flex-col gap-6"
        >
          <div className="dm-icon-badge">
            <Calendar className="w-5 h-5" />
          </div>

          <h1 className="dm-hero-title">
            Request a <em>personalized</em> demo
          </h1>

          <p className="text-sm leading-relaxed max-w-md" style={{ color: "var(--mk-text-2)" }}>
            See how SkiTech can transform your property operations. Our team will walk you through the platform tailored to your needs.
          </p>

          <ul className="flex flex-col gap-3">
            {perks.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 text-sm font-medium"
                style={{ color: "var(--mk-text-2)" }}
              >
                <span className="dm-benefit-check">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
                {p}
              </motion.li>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-4 max-w-md mt-2">
            {[
              { icon: Hotel, val: "50+", label: "Properties" },
              { icon: Users, val: "1,200+", label: "Users" },
            ].map((s, i) => (
              <div key={i} className="dm-stat-card">
                <div className="dm-stat-icon">
                  <s.icon className="w-[18px] h-[18px]" />
                </div>
                <div className="dm-stat-number">{s.val}</div>
                <div className="dm-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column: form */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="dm-form-card">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center gap-5 py-6"
                >
                  <div className="dm-success-icon">
                    <svg className="dm-checkmark" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="14 27 21 34 38 18"></polyline>
                    </svg>
                  </div>
                  <h3 className="dm-success-title">Request Received!</h3>
                  <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--mk-text-2)" }}>
                    We&apos;ve sent a confirmation email to <strong style={{ color: "var(--mk-text-1)" }}>{form.email}</strong>. A SkiTech expert will contact you within 24 hours to schedule your personalized walkthrough.
                  </p>
                  <button type="button" onClick={handleDone} className="dm-btn-done">
                    Done
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Stepper */}
                  <div className="dm-stepper">
                    <div className={`dm-step-item ${step === 1 ? "is-active" : ""}`}>
                      <span className="dm-step-num">1</span>
                      <span className="dm-step-label">Your Details</span>
                    </div>
                    <span className="dm-step-separator" />
                    <div className={`dm-step-item ${step === 2 ? "is-active" : ""}`}>
                      <span className="dm-step-num">2</span>
                      <span className="dm-step-label">Property Info</span>
                    </div>
                  </div>

                  <form onSubmit={handleNext} className="flex flex-col gap-6">
                    {step === 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className={`dm-field ${form.name ? "is-filled" : ""}`}>
                          <input
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                          />
                          <label>Full Name *</label>
                        </div>
                        <div className={`dm-field ${form.email ? "is-filled" : ""}`}>
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                          />
                          <label>Work Email *</label>
                        </div>
                        <div className={`dm-field ${form.company ? "is-filled" : ""}`}>
                          <input
                            value={form.company}
                            onChange={e => setForm({ ...form, company: e.target.value })}
                          />
                          <label>Company Name</label>
                        </div>
                        <div className={`dm-field ${form.phone ? "is-filled" : ""}`}>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                          />
                          <label>Phone Number</label>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="dm-select-group">
                            <span className="dm-select-label">Property Portfolio Size</span>
                            <select
                              value={form.size}
                              onChange={e => setForm({ ...form, size: e.target.value })}
                            >
                              <option value="">Select size...</option>
                              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="dm-select-group">
                            <span className="dm-select-label">Your Role</span>
                            <select
                              value={form.role}
                              onChange={e => setForm({ ...form, role: e.target.value })}
                            >
                              <option value="">Select role...</option>
                              {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className={`dm-field ${form.message ? "is-filled" : ""}`}>
                          <textarea
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                          />
                          <label>What operations challenge can we solve for you?</label>
                        </div>
                      </div>
                    )}

                    {step === 1 ? (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="dm-btn-submit"
                      >
                        Continue
                        <ArrowRight />
                      </motion.button>
                    ) : (
                      <div className="grid grid-cols-[0.4fr_0.6fr] gap-4">
                        <button type="button" onClick={() => setStep(1)} className="dm-btn-back">
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          disabled={submitting}
                          className="dm-btn-submit"
                        >
                          {submitting ? "Submitting…" : "Submit Request"}
                          <ArrowRight />
                        </motion.button>
                      </div>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
