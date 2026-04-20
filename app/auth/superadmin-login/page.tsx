"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import api from "@/lib/config/app";

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/v1/auth/superadmin-login", { email, password });
      const { access_token, refresh_token } = res.data;

      // Decode token
      const base64 = access_token.split(".")[1];
      const decoded = JSON.parse(atob(base64));

      // Final safety check on frontend
      if (decoded.role !== "Super Admin") {
        setError("Access denied. This portal is restricted.");
        setLoading(false);
        return;
      }

      const user = {
        user_id: decoded.user_id,
        tenant_id: decoded.tenant_id || "",
        email: decoded.email,
        role: decoded.role,
      };

      // Store tokens
      localStorage.setItem("skitech_access_token", access_token);
      localStorage.setItem("skitech_refresh_token", refresh_token);
      localStorage.setItem("skitech_role", "superadmin");

      // Set cookie for middleware
      const cookieValue = JSON.stringify({
        state: {
          user,
          isAuthenticated: true,
        },
      });
      document.cookie = `skitech_auth=${encodeURIComponent(cookieValue)}; path=/; max-age=86400; SameSite=Lax`;

      // Navigate to superadmin dashboard
      router.push("/superadmin");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden"
      style={{ fontFamily: "'Merriweather', serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&display=swap');
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .sa-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          transition: all 0.2s ease;
        }
        .sa-input:focus {
          outline: none;
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.04);
        }
        .sa-input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <div className="grid-bg absolute inset-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-5">
            <Shield className="w-6 h-6 text-white/60" />
          </div>
          <h1 className="text-white font-black text-2xl tracking-tight">
            Restricted Access
          </h1>
          <p className="text-white/30 text-sm mt-2 font-light italic">
            Authorized personnel only
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/30 text-[10px] uppercase tracking-widest mb-2 font-bold">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sa-input w-full rounded-xl px-4 py-3.5 text-sm"
                placeholder="admin@skitec.com"
                style={{ fontFamily: "'Merriweather', serif" }}
              />
            </div>

            <div>
              <label className="block text-white/30 text-[10px] uppercase tracking-widest mb-2 font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sa-input w-full rounded-xl px-4 py-3.5 pr-12 text-sm"
                  placeholder="••••••••••••"
                  style={{ fontFamily: "'Merriweather', serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 bg-white text-black py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Authenticate
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-white/15 text-xs mt-6 font-light">
          This page is not publicly accessible.
        </p>
      </motion.div>
    </div>
  );
}