'use client';

import { Suspense, useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, CheckCircle2, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authAPI, errorStatus, isNoResponse, SERVER_WAKING_MESSAGE } from "@/lib/api/auth";

// Same rule as POST /auth/reset-password; change-password is stricter (see the hint below)
const MIN_PASSWORD_LENGTH = 8;
const BAD_CODE_MESSAGE = "That code is wrong or has expired. Request a new one.";

function resetErrorMessage(err: unknown) {
  if (isNoResponse(err)) return SERVER_WAKING_MESSAGE;
  const status = errorStatus(err);
  // 404 (no such account) answers like a bad code, so nothing reveals whether the account exists
  if (status === 400 || status === 404) return BAD_CODE_MESSAGE;
  if (status === 422) return `Check the email address, and use at least ${MIN_PASSWORD_LENGTH} characters for the new password.`;
  return "Something went wrong. Please try again.";
}

const inputClass = "w-full bg-[#f8f7f4] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!/^\d{6}$/.test(code)) { setError("Enter the 6-digit code from the email."); return; }
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`The new password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    setError("");
    try {
      await authAPI.resetPassword(email.trim().toLowerCase(), code, form.password);
      setDone(true);
    } catch (err) {
      setError(resetErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordFields = [
    { key: "password", label: "New Password", autoComplete: "new-password" },
    { key: "confirm", label: "Confirm Password", autoComplete: "new-password" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-black/5 rounded-full blur-[130px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-2xl p-8 shadow-2xl shadow-black/10">
          <div className="w-12 h-12 rounded-xl bg-[#f8f7f4] flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-black" />
          </div>

          {!done ? (
            <>
              <h1 className="text-black mb-1 font-extrabold text-[1.4rem]">Set new password</h1>
              <p className="text-neutral-500 text-sm mb-7">Enter the code we emailed you and choose a new password.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className="block text-neutral-700 text-sm mb-2 font-medium">Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className={inputClass}
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="reset-code" className="block text-neutral-700 text-sm mb-2 font-medium">6-digit code</label>
                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\s/g, "")); setError(""); }}
                    className={`${inputClass} tracking-[0.3em]`}
                    placeholder="123456"
                  />
                </div>
                {passwordFields.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={`reset-${field.key}`} className="block text-neutral-700 text-sm mb-2 font-medium">{field.label}</label>
                    <div className="relative">
                      <input
                        id={`reset-${field.key}`}
                        type={show[field.key] ? "text" : "password"}
                        required
                        autoComplete={field.autoComplete}
                        value={form[field.key]}
                        onChange={e => { setForm({ ...form, [field.key]: e.target.value }); setError(""); }}
                        className={`${inputClass} pr-12`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        aria-label={show[field.key] ? "Hide password" : "Show password"}
                        onClick={() => setShow({ ...show, [field.key]: !show[field.key] })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                      >
                         {show[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-neutral-500 text-xs">
                  At least {MIN_PASSWORD_LENGTH} characters. Use an uppercase letter, a lowercase letter and a number:
                  changing your password later from Settings requires them.
                </p>
                {error ? (
                  <p className="text-red-500 text-xs" role="alert">{error}</p>
                ) : form.password && form.confirm && form.password !== form.confirm && (
                  <p className="text-red-500 text-xs">Passwords do not match.</p>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white py-3.5 rounded-xl shadow-md font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Resetting…" : "Reset Password"}
                </motion.button>
                <p className="text-neutral-500 text-xs text-center">
                  No code, or it expired?{" "}
                  <Link href="/auth/forgot-password" className="text-black font-semibold hover:text-black/70">
                    Request a new one
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#f8f7f4] flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-black mb-2 font-extrabold text-[1.3rem]">Password reset!</h2>
              <p className="text-neutral-500 text-sm mb-6">Your password has been updated. Sign in to continue.</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm shadow-md font-semibold"
              >
                Sign In →
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
