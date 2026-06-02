"use client";
// OTP verification page for invited users

import { useState, useRef, useEffect, KeyboardEvent, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api/auth";

function VerifyInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError("");
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const chars = e.clipboardData.getData("text").slice(0, 6).split("");
    if (!chars.every((c) => /^\d$/.test(c))) return;
    const next = [...otp];
    chars.forEach((c, i) => { next[i] = c; });
    setOtp(next);
    const last = Math.min(chars.length, 5);
    inputRefs.current[last]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6 || !email) return;
    setLoading(true);
    setError("");
    try {
      await authAPI.verifyOTP(email, code);
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setError("Invalid or expired OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError("Please enter your email first."); return; }
    setResending(true);
    try {
      await authAPI.resendVerification(email);
      setTimeLeft(300);
      setOtp(["", "", "", "", "", ""]);
      setError("");
    } catch {
      setError("Failed to resend OTP. Try again.");
    } finally {
      setResending(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const isComplete = otp.join("").length === 6 && email.length > 0;

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center px-4" style={{ fontFamily: "'Merriweather', serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-black/10 p-8"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Verify Your Account</h1>
          <p className="text-neutral-500 text-sm mt-2">
            Enter the 6-digit OTP sent to your email along with your temporary password.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-neutral-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Verification OTP</label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <motion.input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  animate={error ? { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } } : {}}
                  className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 ${
                    error ? "border-red-400 bg-red-50" : "border-neutral-200 bg-white focus:border-neutral-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
              {error}
            </motion.p>
          )}

          <div className="text-center text-sm text-neutral-400">
            {timeLeft > 0 ? (
              <span>OTP expires in <span className="font-medium text-neutral-600">{formatTime(timeLeft)}</span></span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 mx-auto text-neutral-700 hover:text-black font-medium transition-colors"
              >
                {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Resend OTP
              </button>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={!isComplete || loading}
            className="w-full py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Verifying..." : "Verify & Activate Account"}
          </button>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
              <p className="text-green-600 font-bold text-xl">Account Verified!</p>
              <p className="text-neutral-500 text-sm mt-1">Redirecting to login...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function VerifyInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <VerifyInviteContent />
    </Suspense>
  );
}
