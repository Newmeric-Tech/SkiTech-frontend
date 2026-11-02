"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usersAPI } from "@/lib/api/users";
import { errorStatus, isNoResponse, SERVER_WAKING_MESSAGE } from "@/lib/api/auth";

const STRENGTH_MESSAGE = "Password must have at least 8 characters, with an uppercase letter, a lowercase letter and a digit";

/** Friendly text for a failed change-password request; never the server's own text */
function changePasswordErrorMessage(err: unknown) {
  if (isNoResponse(err)) return SERVER_WAKING_MESSAGE;
  const status = errorStatus(err);
  if (status === 400) {
    const detail = (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
    // The backend answers 400 both for a wrong password and for an account with no password set
    return typeof detail === "string" && detail.includes("no password")
      ? "This account has no password yet. Use “Forgot your current password?” to set one."
      : "Current password is incorrect";
  }
  if (status === 422) return STRENGTH_MESSAGE;
  return "Failed to update password";
}

const inputClass = "w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 transition-all";

/** Manager and Staff "Settings": change password only */
export default function AccountSettings() {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdSaving) return;
    if (newPwd !== confirmPwd) { toast.error("Passwords do not match"); return; }
    if (newPwd.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(newPwd) || !/[a-z]/.test(newPwd) || !/\d/.test(newPwd)) { toast.error(STRENGTH_MESSAGE); return; }
    setPwdSaving(true);
    try {
      await usersAPI.changePassword({ current_password: currentPwd, new_password: newPwd });
      toast.success("Password updated");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      toast.error(changePasswordErrorMessage(err));
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account.</p>
      </div>

      <form onSubmit={handleChangePassword}
        className="max-w-xl bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
        <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Change Password</h2>
        <div className="space-y-5">
          <div>
            <label htmlFor="current-password" className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Current Password</label>
            <input id="current-password" type="password" autoComplete="current-password" value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" className={inputClass} />
            <Link href="/auth/forgot-password" className="inline-block text-xs text-neutral-500 hover:text-black underline mt-1.5">
              Forgot your current password?
            </Link>
          </div>
          <div>
            <label htmlFor="new-password" className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>New Password</label>
            <input id="new-password" type="password" autoComplete="new-password" value={newPwd}
              onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" className={inputClass} />
            <p className="text-neutral-400 text-xs mt-1">Minimum 8 characters with uppercase, lowercase, and digit</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Confirm New Password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" className={inputClass} />
          </div>
          <button type="submit" disabled={pwdSaving || !currentPwd || !newPwd || !confirmPwd}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm shadow-md disabled:opacity-50" style={{ fontWeight: 600 }}>
            {pwdSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {pwdSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
