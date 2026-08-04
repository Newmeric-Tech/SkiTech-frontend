"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Zap, Eye, EyeOff, ArrowRight, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { GoogleLogin } from "@react-oauth/google";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export default function LoginPage() {
  const [role, setRole] = useState<"owner" | "co-admin" | "manager" | "staff" | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [dark, setDark] = useState(true);
  const router = useRouter();
  const glowRef = useRef<HTMLDivElement>(null);

  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.transform = `translate3d(${e.clientX * 0.15}px, ${e.clientY * 0.15}px, 0)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !email || !password) return;
    clearError();
    try {
      const redirectPath = await login(email, password, role);
      router.push(redirectPath);
    } catch {
      // error is already set in store
    }
  };

  const roleConfig = [
    { id: "owner" as const,     label: "Owner",     desc: "Full property control" },
    { id: "co-admin" as const,  label: "Co Admin",  desc: "Property partner access" },
    { id: "manager" as const,   label: "Manager",   desc: "Daily operations" },
    { id: "staff" as const,     label: "Staff",     desc: "Assigned tasks" },
  ];

  return (
    <div className={`${playfairDisplay.variable} ${plusJakartaSans.variable} st-page ${dark ? "dark" : ""}`}>
      <style>{`
        .st-page {
          --st-bg: #f7f7f9;
          --st-surface-card: #ffffff;
          --st-border: rgba(0, 0, 0, 0.08);
          --st-border-input: rgba(0, 0, 0, 0.12);
          --st-border-hover: rgba(0, 0, 0, 0.25);
          --st-accent: #4f46e5;
          --st-accent-soft: rgba(79, 70, 229, 0.08);
          --st-accent-glow: rgba(79, 70, 229, 0.15);
          --st-text-1: #0f172a;
          --st-text-2: #334155;
          --st-text-3: #64748b;
          --st-text-inverse: #ffffff;
          --st-card-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(252, 252, 253, 0.95) 100%);
          --st-glass-bg: rgba(0, 0, 0, 0.01);
          --st-glass-hover: rgba(0, 0, 0, 0.04);
          --st-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
          --st-glow-intensity: 0.08;

          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: var(--st-bg);
          color: var(--st-text-1);
          font-family: var(--font-plus-jakarta), system-ui, sans-serif;
          transition: background-color 0.4s ease, color 0.4s ease;
        }

        .st-page.dark {
          --st-bg: #060608;
          --st-surface-card: #121218;
          --st-border: rgba(255, 255, 255, 0.06);
          --st-border-input: rgba(255, 255, 255, 0.12);
          --st-border-hover: rgba(255, 255, 255, 0.25);
          --st-accent: #6366f1;
          --st-accent-soft: rgba(99, 102, 241, 0.1);
          --st-accent-glow: rgba(99, 102, 241, 0.25);
          --st-text-1: #ffffff;
          --st-text-2: rgba(255, 255, 255, 0.7);
          --st-text-3: rgba(255, 255, 255, 0.45);
          --st-text-inverse: #060608;
          --st-card-bg: linear-gradient(135deg, rgba(22, 22, 30, 0.85) 0%, rgba(10, 10, 14, 0.98) 100%);
          --st-glass-bg: rgba(255, 255, 255, 0.02);
          --st-glass-hover: rgba(255, 255, 255, 0.06);
          --st-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          --st-glow-intensity: 0.15;
        }

        .st-ambient-glow {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 50%;
          height: 50%;
          background: radial-gradient(circle, var(--st-accent-glow) 0%, rgba(0,0,0,0) 70%);
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .st-ambient-glow-2 {
          position: absolute;
          bottom: -10%;
          right: -10%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(168, 85, 247, var(--st-glow-intensity)) 0%, rgba(0,0,0,0) 70%);
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
        }

        .st-header-actions {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 100;
        }

        .st-theme-toggle {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px 6px 6px;
          border-radius: 30px;
          border: 1px solid var(--st-border);
          background: var(--st-glass-bg);
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          color: var(--st-text-2);
          transition: all 0.3s ease;
        }
        .st-theme-toggle:hover {
          border-color: var(--st-border-hover);
          background: var(--st-glass-hover);
        }
        .st-theme-toggle-track {
          position: relative;
          width: 40px;
          height: 22px;
          border-radius: 999px;
          background: var(--st-accent-soft);
          flex-shrink: 0;
        }
        .st-theme-toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--st-accent);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .st-page.dark .st-theme-toggle-slider {
          transform: translateX(18px);
        }

        .st-content-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 90px 24px 40px;
          display: grid;
          grid-template-columns: 1fr 1px 1.1fr;
          gap: 48px;
          align-items: center;
          min-height: 100vh;
        }

        .st-hero-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
        }

        .st-logo-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .st-page.dark .st-logo-badge {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #0f172a;
        }

        .st-hero-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--st-accent);
          text-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }

        .st-hero-title {
          font-family: var(--font-plus-jakarta), system-ui, sans-serif;
          font-size: 40px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: var(--st-text-1);
        }
        .st-hero-title em {
          font-family: var(--font-playfair), serif;
          font-style: italic;
          font-weight: 500;
          color: var(--st-text-2);
        }

        .st-hero-desc {
          font-size: 14.5px;
          line-height: 1.5;
          color: var(--st-text-2);
          max-width: 440px;
        }

        .st-hotel-card {
          width: 100%;
          max-width: 420px;
          padding: 20px;
          border-radius: 20px;
          background: var(--st-card-bg);
          border: 1px solid var(--st-border);
          box-shadow: var(--st-shadow);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .st-hotel-card:hover {
          transform: translateY(-4px);
          border-color: var(--st-accent);
          box-shadow: 0 15px 30px rgba(99, 102, 241, 0.08);
        }
        .st-hotel-header { display: flex; align-items: center; gap: 12px; }
        .st-hotel-icon-badge {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }
        .st-page.dark .st-hotel-icon-badge {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #0f172a;
        }
        .st-hotel-name { font-size: 14px; font-weight: 700; color: var(--st-text-1); }
        .st-hotel-sub { font-size: 11px; font-weight: 600; color: var(--st-text-3); }

        .st-stats-row-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .st-stat-pill {
          background: var(--st-glass-bg);
          border: 1px solid var(--st-border);
          border-radius: 12px;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .st-hotel-card:hover .st-stat-pill {
          background: var(--st-glass-hover);
          border-color: var(--st-border-hover);
        }
        .st-stat-pill-num {
          font-family: var(--font-playfair), serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--st-text-1);
          line-height: 1;
        }
        .st-stat-pill-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--st-text-3);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .st-vertical-divider {
          width: 1px;
          background: var(--st-border);
          height: 70%;
          align-self: center;
        }

        .st-signin-card {
          padding: 28px 32px;
          border-radius: 24px;
          background: var(--st-card-bg);
          border: 1px solid var(--st-border);
          box-shadow: var(--st-shadow);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          max-width: 440px;
          justify-self: end;
        }

        .st-signin-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--st-text-3);
        }
        .st-signin-title {
          font-family: var(--font-playfair), serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--st-text-1);
        }
        .st-signin-sub { font-size: 12.5px; color: var(--st-text-2); }

        .st-role-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--st-text-3);
          text-transform: uppercase;
        }
        .st-role-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .st-role-btn {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--st-border-input);
          background: transparent;
          color: var(--st-text-1);
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .st-role-btn:hover { border-color: var(--st-accent); background: var(--st-accent-soft); }
        .st-role-btn.is-selected {
          border-color: var(--st-accent);
          background: var(--st-accent-soft);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.05);
        }
        .st-role-radio-circle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--st-border-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.25s ease;
        }
        .st-role-btn.is-selected .st-role-radio-circle { border-color: var(--st-accent); }
        .st-role-radio-inner-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--st-accent);
          transform: scale(0);
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .st-role-btn.is-selected .st-role-radio-inner-dot { transform: scale(1); }
        .st-role-card-name { font-size: 12px; font-weight: 700; color: var(--st-text-1); }
        .st-role-card-desc { font-size: 9px; font-weight: 500; color: var(--st-text-3); }

        .st-input-group { position: relative; width: 100%; }
        .st-input-group input {
          width: 100%;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          background: transparent;
          color: var(--st-text-1);
          border: 1px solid var(--st-border-input);
          border-radius: 10px;
          outline: none;
          transition: all 0.3s ease;
        }
        .st-input-group input.st-has-icon { padding-right: 42px; }
        .st-input-group label {
          position: absolute;
          left: 12px;
          top: 14px;
          padding: 0 4px;
          color: var(--st-text-3);
          font-size: 13px;
          font-weight: 500;
          pointer-events: none;
          transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
          transform-origin: left top;
          background: var(--st-surface-card);
        }
        .st-input-group input:focus ~ label,
        .st-input-group input:not(:placeholder-shown) ~ label {
          transform: translateY(-22px) scale(0.85);
          color: var(--st-accent);
          font-weight: 600;
        }
        .st-input-group input:focus {
          border-color: var(--st-accent);
          box-shadow: 0 0 0 3px var(--st-accent-soft);
        }
        .st-btn-toggle-password {
          position: absolute;
          right: 12px;
          top: 12px;
          background: none;
          border: none;
          color: var(--st-text-3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }
        .st-btn-toggle-password:hover { color: var(--st-text-1); }
        .st-forgot-link {
          position: absolute;
          right: 4px;
          top: -20px;
          font-size: 11px;
          font-weight: 600;
          color: var(--st-text-3);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .st-forgot-link:hover { color: var(--st-accent); }

        .st-btn-signin-submit {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: var(--st-text-1);
          color: var(--st-text-inverse);
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--st-shadow);
        }
        .st-btn-signin-submit:hover:not(:disabled) {
          background: var(--st-accent);
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(99, 102, 241, 0.3);
        }
        .st-btn-signin-submit:hover:not(:disabled) svg { transform: translateX(3px); }
        .st-btn-signin-submit svg { width: 14px; height: 14px; transition: transform 0.3s ease; }
        .st-btn-signin-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        .st-divider-row { display: flex; align-items: center; gap: 12px; width: 100%; }
        .st-divider-line { flex: 1; height: 1px; background: var(--st-border); }
        .st-divider-text { font-size: 9px; font-weight: 700; color: var(--st-text-3); letter-spacing: 0.1em; }

        .st-sso-section { display: flex; flex-direction: column; gap: 10px; align-items: center; text-align: center; }
        .st-sso-desc { font-size: 11.5px; font-weight: 500; color: var(--st-text-3); }
        .st-sso-wrap {
          width: 100%;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid var(--st-border-input);
          background: var(--st-glass-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }
        .st-sso-wrap:hover { border-color: var(--st-border-hover); background: var(--st-glass-hover); }

        .st-promo-footer { font-size: 12px; font-weight: 500; color: var(--st-text-2); text-align: center; }
        .st-promo-footer a { color: var(--st-text-1); font-weight: 700; text-decoration: none; transition: color 0.2s ease; }
        .st-promo-footer a:hover { color: var(--st-accent); }

        @media (max-width: 1024px) {
          .st-content-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .st-vertical-divider { display: none; }
          .st-hero-info { align-items: center; text-align: center; }
          .st-hero-desc { max-width: 500px; margin: 0 auto; }
          .st-hotel-card { margin: 0 auto; }
          .st-signin-card { margin: 0 auto; justify-self: center; }
        }

        @media (max-width: 768px) {
          .st-content-container { padding-top: 80px; gap: 30px; }
          .st-hero-title { font-size: 32px; }
          .st-signin-card { padding: 24px 20px; }
        }
      `}</style>

      <div className="st-ambient-glow" ref={glowRef} />
      <div className="st-ambient-glow-2" />

      {/* Theme toggle */}
      <div className="st-header-actions">
        <button onClick={toggleDark} className="st-theme-toggle" aria-label="Toggle light/dark theme">
          <span className="st-theme-toggle-track">
            <span className="st-theme-toggle-slider">
              {dark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            </span>
          </span>
          <span>{dark ? "Dark" : "Light"}</span>
        </button>
      </div>

      <main className="st-content-container">
        {/* Left Column */}
        <section className="st-hero-info">
          <Link href="/" className="flex items-center gap-3" aria-label="SkiTech home">
            <div className="st-logo-badge">
              <Zap className="w-[18px] h-[18px] fill-current" />
            </div>
            <span className="text-[22px] font-extrabold tracking-tight" style={{ color: "var(--st-text-1)" }}>
              SkiTech
            </span>
          </Link>

          <div className="flex flex-col gap-2.5">
            <span className="st-hero-eyebrow">Property OS</span>
            <h1 className="st-hero-title">
              Operations <br />
              <em>at your fingertips.</em>
            </h1>
          </div>

          <p className="st-hero-desc">
            Manage properties, staff, SOPs, KRAs, and inventory — all from one command center.
          </p>

          <div className="st-hotel-card">
            <div className="st-hotel-header">
              <div className="st-hotel-icon-badge">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="st-hotel-name">Grand Horizon Hotel</span>
                <span className="st-hotel-sub">3 properties · 47 staff</span>
              </div>
            </div>
            <div className="st-stats-row-grid">
              {[
                { l: "KRA Score", v: "94%" },
                { l: "Occupancy", v: "87%" },
                { l: "Tasks", v: "42/50" },
              ].map((s, i) => (
                <div key={i} className="st-stat-pill">
                  <span className="st-stat-pill-num">{s.v}</span>
                  <span className="st-stat-pill-label">{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="st-vertical-divider" />

        {/* Right Column */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="st-signin-card"
        >
          <div className="flex flex-col gap-1">
            <span className="st-signin-eyebrow">Sign In</span>
            <h2 className="st-signin-title">Welcome back</h2>
            <p className="st-signin-sub">Select your role and sign in to continue</p>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <span className="st-role-label">I am a</span>
              <div className="st-role-grid">
                {roleConfig.map(({ id, label, desc }) => (
                  <motion.button
                    key={id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole(id)}
                    className={`st-role-btn ${role === id ? "is-selected" : ""}`}
                  >
                    <span className="st-role-radio-circle">
                      <span className="st-role-radio-inner-dot" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="st-role-card-name">{label}</span>
                      <span className="st-role-card-desc">{desc}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Email */}
              <div className="st-input-group">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="email">Email Address *</label>
              </div>

              {/* Password */}
              <div className="st-input-group">
                <Link href="/auth/forgot-password" className="st-forgot-link">
                  Forgot password?
                </Link>
                <input
                  type={showPass ? "text" : "password"}
                  id="password"
                  placeholder=" "
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="st-has-icon"
                />
                <label htmlFor="password">Password *</label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="st-btn-toggle-password"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={!role || !email || !password || isLoading}
              className="st-btn-signin-submit"
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight />
                </>
              )}
            </motion.button>
          </form>

          <div className="st-divider-row">
            <span className="st-divider-line" />
            <span className="st-divider-text">OR</span>
            <span className="st-divider-line" />
          </div>

          <div className="st-sso-section">
            {!role && <span className="st-sso-desc">Select a role above to sign in with Google</span>}
            <div className={`st-sso-wrap transition-opacity duration-200 ${!role ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) return;
                  clearError();
                  try {
                    const redirectPath = await googleLogin(
                      credentialResponse.credential,
                      role || undefined
                    );
                    router.push(redirectPath);
                  } catch {
                    // error is set in store
                  }
                }}
                onError={() => {
                  // handled by store error state
                }}
                theme={dark ? "filled_black" : "outline"}
                size="large"
                text="signin_with"
                shape="rectangular"
                width="360"
              />
            </div>
          </div>

          <p className="st-promo-footer">
            Don&apos;t have an account? <Link href="/demo">Request Demo</Link>
          </p>
        </motion.section>
      </main>
    </div>
  );
}
