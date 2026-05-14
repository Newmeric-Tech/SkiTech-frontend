"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Loader2, RefreshCw } from "lucide-react";
import { cn } from "./utils";
import { authAPI } from "@/lib/api/auth";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  userEmail: string;
  expectedOTP?: string;
}

const COUNTDOWN_SECONDS = 30;

export function OTPModal({ isOpen, onClose, onVerify, userEmail, expectedOTP }: OTPModalProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setError(false);
      setLoading(false);
      setTimeLeft(COUNTDOWN_SECONDS);
      setCanResend(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (error) setError(false);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]!.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]!.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every((char) => /^\d$/.test(char))) {
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const lastIndex = pastedData.length - 1;
      if (lastIndex < 5 && inputRefs.current[lastIndex + 1]) {
        inputRefs.current[lastIndex + 1]!.focus();
      } else if (inputRefs.current[5]) {
        inputRefs.current[5]!.focus();
      }
    }
  };

  const handleResend = () => {
    setTimeLeft(COUNTDOWN_SECONDS);
    setCanResend(false);
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) return;
    setLoading(true);
    setError(false);

    if (expectedOTP) {
      if (enteredOtp === expectedOTP) {
        setSuccessPopup(true);
        setTimeout(() => {
          setSuccessPopup(false);
          onVerify();
        }, 1500);
      } else {
        setError(true);
        setLoading(false);
      }
    } else {
      authAPI.verifyOTP(userEmail, enteredOtp)
        .then(() => {
          setSuccessPopup(true);
          setTimeout(() => {
            setSuccessPopup(false);
            onVerify();
          }, 1500);
        })
        .catch((err: unknown) => {
          console.error("OTP verification failed:", err);
          setError(true);
          setLoading(false);
        });
    }
  };

  const isComplete = otp.join("").length === 6;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-md mx-4"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h2
                className="text-xl font-bold text-black"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Verify Email
              </h2>
              <p className="text-neutral-500 text-sm mt-1">
                Enter the 6-digit OTP sent to
              </p>
              <p className="text-neutral-700 font-medium text-sm">{userEmail}</p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  animate={
                    error
                      ? {
                          x: [0, -8, 8, -8, 8, 0],
                          transition: { duration: 0.4 },
                        }
                      : {}
                  }
                  className={cn(
                    "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20",
                    error
                      ? "border-red-500 bg-red-50 focus:border-red-500"
                      : "border-neutral-200 bg-white focus:border-neutral-900"
                  )}
                />
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center mb-4"
              >
                Invalid OTP. Please try again.
              </motion.p>
            )}

            <div className="text-center mb-6">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-sm font-medium text-neutral-700 hover:text-black transition-colors flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend OTP
                </button>
              ) : (
                <p className="text-sm text-neutral-400">
                  Resend OTP in{" "}
                  <span className="font-medium text-neutral-600">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-black/10 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={!isComplete || loading}
                className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </button>
            </div>

            <AnimatePresence>
              {successPopup && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
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
                        transition={{ duration: 0.3, delay: 0.2 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                  <p className="text-green-600 font-semibold text-lg">Verified!</p>
                  <p className="text-neutral-500 text-sm">User added successfully</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}