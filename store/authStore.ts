"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/config/app";

// ── Types ─────────────────────────────────────────────────────────────────────
interface User {
  user_id: string;
  tenant_id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string, selectedRole?: string) => Promise<string>;
  logout: () => void;
  clearError: () => void;
}

// ── JWT Decoder (SAFE) ─────────────────────────────────────────────────────────
function decodeJWT(token: string): User | null {
  try {
    if (!token) return null;

    const base64 = token.split(".")[1];
    if (!base64) return null;

    const decoded = JSON.parse(atob(base64));

    return {
      user_id: decoded.user_id,
      tenant_id: decoded.tenant_id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (err) {
    console.error("JWT decode failed:", err);
    return null;
  }
}

// ── Role → Route Map ──────────────────────────────────────────────────────────
export const ROLE_ROUTES: Record<string, string> = {
  "Super Admin": "/superadmin",
  "Tenant Admin": "/owner",
  "Manager": "/manager",
  "Staff": "/staff",
};

// ── Role → Storage Key Map ────────────────────────────────────────────────────
function getRoleStorageKey(jwtRole: string): string {
  const roleMap: Record<string, string> = {
    "Super Admin": "superadmin",
    "Tenant Admin": "owner",
    "Manager": "manager",
    "Staff": "staff",
  };
  return roleMap[jwtRole] || jwtRole?.toLowerCase() || "staff";
}

// ── Cookie setter helper ──────────────────────────────────────────────────────
function setAuthCookie(user: User) {
  const cookieValue = JSON.stringify({
    state: {
      user,
      isAuthenticated: true,
    },
  });

  document.cookie = `skitech_auth=${encodeURIComponent(
    cookieValue
  )}; path=/; max-age=86400; SameSite=Lax`;
}

// ── Auth Store ────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, selectedRole?: string) => {
        set({ isLoading: true, error: null });

        try {
          const res = await api.post("/v1/auth/login", {
            email,
            password,
            expected_role: selectedRole || null,
          });

          const { access_token, refresh_token } = res.data;

          // 🔥 CRITICAL: Store tokens FIRST
          localStorage.setItem("skitech_access_token", access_token);
          localStorage.setItem("skitech_refresh_token", refresh_token);

          console.log("✅ Access token stored:", access_token);

          const user = decodeJWT(access_token);
          if (!user) {
            throw new Error("Invalid token received");
          }

          // Store role for layout checks
          localStorage.setItem(
            "skitech_role",
            getRoleStorageKey(user.role)
          );

          // Set cookie for middleware
          setAuthCookie(user);

          set({
            user,
            access_token,
            refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return ROLE_ROUTES[user.role] || "/staff";
        } catch (err: any) {
          console.error("Login error:", err);

          const message =
            err?.response?.data?.detail ||
            err?.message ||
            "Login failed. Please try again.";

          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
          });

          throw new Error(message);
        }
      },

      logout: () => {
        localStorage.removeItem("skitech_access_token");
        localStorage.removeItem("skitech_refresh_token");
        localStorage.removeItem("skitech_role");

        document.cookie = "skitech_auth=; path=/; max-age=0";

        set({
          user: null,
          access_token: null,
          refresh_token: null,
          isAuthenticated: false,
          error: null,
        });

        window.location.href = "/auth/login";
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "skitech_auth",
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);