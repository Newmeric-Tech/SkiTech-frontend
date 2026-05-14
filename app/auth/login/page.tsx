"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap, Eye, EyeOff, ArrowRight, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [role, setRole] = useState<"owner" | "manager" | "staff" | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [dark, setDark] = useState(false);
  const router = useRouter();

  const { login, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
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
    { id: "owner" as const, label: "Owner", desc: "Full property control" },
    { id: "manager" as const, label: "Manager", desc: "Daily operations" },
    { id: "staff" as const, label: "Staff", desc: "Assigned tasks" },
  ];

  return (
    <div
      className="min-h-screen bg-[#f5f4f0] dark:bg-[#111111] flex relative overflow-hidden"
      style={{ fontFamily: "'Merriweather', serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&display=swap');
        .dot-grid {
          background-image: radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        html.dark .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
        }
        .dot-grid::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 75% 75% at 50% 50%, transparent 25%, #f5f4f0 100%);
          pointer-events: none;
          z-index: 1;
        }
        html.dark .dot-grid::before {
          background: radial-gradient(ellipse 75% 75% at 50% 50%, transparent 25%, #111111 100%);
        }
        .input-field {
          background: rgba(0,0,0,0.03);
          border: 1.5px solid rgba(0,0,0,0.15);
          color: #111;
          transition: all 0.2s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: rgba(0,0,0,0.5);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .input-field::placeholder { color: rgba(0,0,0,0.35); }
        html.dark .input-field {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          color: #f0f0f0;
        }
        html.dark .input-field:focus {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.05);
        }
        html.dark .input-field::placeholder { color: rgba(255,255,255,0.3); }
        .role-btn {
          border: 1.5px solid rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.6);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .role-btn:hover {
          border-color: rgba(0,0,0,0.3);
          background: rgba(255,255,255,0.9);
        }
        .role-btn.selected {
          border-color: #111;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        html.dark .role-btn {
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
        }
        html.dark .role-btn:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
        }
        html.dark .role-btn.selected {
          border-color: #e0e0e0;
          background: rgba(255,255,255,0.1);
          box-shadow: 0 2px 12px rgba(0,0,0,0.5);
        }
      `}</style>

      <div className="dot-grid absolute inset-0" />
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-black/[0.025] dark:bg-white/[0.015] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="absolute top-6 right-6 z-20 flex items-center justify-center w-9 h-9 rounded-lg border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/5 text-neutral-600 dark:text-[#c0c0c0] hover:bg-black/5 dark:hover:bg-white/10 transition-all backdrop-blur"
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-14 relative z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-md shadow-black/15">
            <Zap className="w-5 h-5 text-white dark:text-black fill-white dark:fill-black" />
          </div>
          <span className="text-black dark:text-[#f0f0f0] font-black text-lg tracking-tight">SkiTech</span>
        </Link>
        <div>
          <p className="text-black/50 dark:text-[#707070] uppercase tracking-[0.2em] text-[10px] mb-5 font-bold">Property OS</p>
          <h2 className="text-black dark:text-[#f0f0f0] mb-5 font-black leading-[1.1] tracking-tight" style={{ fontSize: "2.6rem" }}>
            Operations<br />
            <span className="text-black/40 dark:text-[#555555] font-light italic">at your fingertips.</span>
          </h2>
          <p className="text-black/60 dark:text-[#a0a0a0] text-sm leading-relaxed max-w-xs font-light">
            Manage properties, staff, SOPs, KRAs, and inventory — all from one command center.
          </p>
        </div>
        <div className="rounded-2xl p-6 border border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#1c1c1c]/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-black dark:bg-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-white dark:text-black fill-white dark:fill-black" />
            </div>
            <div>
              <p className="text-black dark:text-[#f0f0f0] text-sm font-bold">Grand Horizon Hotel</p>
              <p className="text-black/55 dark:text-[#707070] text-xs font-light">3 properties · 47 staff</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "KRA Score", v: "94%" },
              { l: "Occupancy", v: "87%" },
              { l: "Tasks", v: "42/50" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center border border-black/[0.08] dark:border-white/[0.08] bg-[#f5f4f0] dark:bg-[#151515]">
                <div className="text-black dark:text-[#f0f0f0] font-black text-lg">{s.v}</div>
                <div className="text-black/55 dark:text-[#707070] text-[10px] mt-0.5 font-light leading-tight">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-px bg-black/10 dark:bg-white/10 my-12 relative z-10" />

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[560px]"
        >
          <div className="rounded-3xl p-10 border border-black/10 dark:border-white/10 bg-white/85 dark:bg-[#1c1c1c]/90 backdrop-blur-xl shadow-xl shadow-black/[0.08] dark:shadow-black/40">
            <div className="mb-9">
              <p className="text-black/50 dark:text-[#707070] uppercase tracking-[0.2em] text-[10px] mb-2 font-bold">Sign in</p>
              <h1 className="text-black dark:text-[#f0f0f0] font-black text-3xl leading-tight tracking-tight">Welcome back</h1>
              <p className="text-black/55 dark:text-[#a0a0a0] text-sm mt-1.5 font-light italic">Select your role and sign in to continue</p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Role Selection */}
              <div>
                <label className="block text-black/55 dark:text-[#707070] text-[10px] uppercase tracking-widest mb-3 font-bold">
                  I am a
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {roleConfig.map(({ id, label, desc }) => (
                    <motion.button
                      key={id}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setRole(id)}
                      className={`role-btn rounded-xl px-4 py-4 flex flex-col gap-2.5 text-left ${role === id ? "selected" : ""}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        role === id
                          ? "border-black dark:border-[#e0e0e0] bg-black dark:bg-[#e0e0e0]"
                          : "border-black/30 dark:border-white/25 bg-transparent"
                      }`}>
                        {role === id && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />}
                      </div>
                      <div>
                        <p className={`font-bold text-sm leading-tight transition-colors duration-200 ${
                          role === id ? "text-black dark:text-[#f0f0f0]" : "text-black/60 dark:text-[#a0a0a0]"
                        }`}>{label}</p>
                        <p className="text-black/45 dark:text-[#707070] text-[11px] font-light leading-tight mt-0.5">{desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="border-t border-black/[0.08] dark:border-white/[0.08]" />

              {/* Email */}
              <div>
                <label className="block text-black/55 dark:text-[#707070] text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full rounded-xl px-4 py-3.5 text-sm"
                  placeholder="you@company.com"
                  style={{ fontFamily: "'Merriweather', serif" }}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-black/55 dark:text-[#707070] text-[10px] uppercase tracking-widest font-bold">Password</label>
                  <Link href="/auth/forgot-password" className="text-black/50 dark:text-[#707070] text-xs hover:text-black dark:hover:text-[#f0f0f0] transition-colors font-light italic">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full rounded-xl px-4 py-3.5 pr-12 text-sm"
                    placeholder="Enter your password"
                    style={{ fontFamily: "'Merriweather', serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-[#707070] hover:text-black dark:hover:text-[#f0f0f0] transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={!role || !email || !password || isLoading}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm shadow-lg shadow-black/15 hover:bg-neutral-800 dark:hover:bg-[#e0e0e0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? "Signing in..." : (<>Sign In <ArrowRight className="w-4 h-4" /></>)}
              </motion.button>
            </form>

            <p className="text-center text-black/50 dark:text-[#707070] text-xs mt-7 font-light">
              Don&apos;t have an account?{" "}
              <Link href="/demo" className="text-black dark:text-[#f0f0f0] font-bold hover:text-black/70 dark:hover:text-[#c8c8c8] transition-colors">
                Request Demo
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
