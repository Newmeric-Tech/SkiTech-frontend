"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/config/app";

// ── Types ─────────────────────────────────────────────────────────────────────
interface User {
  user_id: string;
  tenant_id: string;
  property_id: string | null;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

export interface PlanFeatures {
  // Core
  reports: boolean;
  kra: boolean;
  sop: boolean;
  // Operational
  attendance: boolean;
  vendor_management: boolean;
  inventory: boolean;
  governance: boolean;
  // Upcoming
  employee_scheduling: boolean;
  chat: boolean;
  employee_ranking: boolean;
  master_log: boolean;
  [key: string]: boolean;
}

const DEFAULT_FEATURES: PlanFeatures = {
  reports: false,
  kra: false,
  sop: false,
  attendance: false,
  vendor_management: false,
  inventory: false,
  governance: false,
  employee_scheduling: false,
  chat: false,
  employee_ranking: false,
  master_log: false,
};

interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  features: PlanFeatures;

  login: (email: string, password: string, selectedRole?: string) => Promise<string>;
  googleLogin: (credential: string, selectedRole?: string) => Promise<string>;
  logout: () => void;
  clearError: () => void;
  refreshFeatures: () => Promise<void>;
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
      property_id: decoded.property_id ?? null,
      email: decoded.email,
      role: decoded.role,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
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
  "Co Admin": "/owner",
  "Manager": "/manager",
  "Staff": "/staff",
};

// ── Role → Storage Key Map ────────────────────────────────────────────────────
function getRoleStorageKey(jwtRole: string): string {
  const roleMap: Record<string, string> = {
    "Super Admin": "superadmin",
    "Tenant Admin": "owner",
    "Co Admin": "owner",
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
    (set, get) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      features: DEFAULT_FEATURES,

      login: async (email: string, password: string, selectedRole?: string) => {
        set({ isLoading: true, error: null });

        try {
          const res = await api.post("/v1/auth/login", {
            email,
            password,
            expected_role: selectedRole || null,
          });

          const { access_token, refresh_token } = res.data;

          // Store tokens FIRST so subsequent API calls are authenticated
          localStorage.setItem("skitech_access_token", res.data.access_token);
          localStorage.setItem("skitech_refresh_token", res.data.refresh_token);

          const user = decodeJWT(access_token);
          if (!user) {
            throw new Error("Invalid token received");
          }

          // Store role for layout checks
          localStorage.setItem("skitech_role", getRoleStorageKey(user.role));

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

          // Fetch subscription features (non-blocking — fail gracefully)
          if (user.role === "Super Admin") {
            // Super admins have unrestricted access to all features
            const allEnabled: PlanFeatures = {
              reports: true, kra: true, sop: true,
              attendance: true, vendor_management: true, inventory: true, governance: true,
              employee_scheduling: true, chat: true, employee_ranking: true, master_log: true,
            };
            set({ features: allEnabled });
          } else {
            try {
              const planRes = await api.get("/v1/subscriptions/my-plan");
              const features = planRes.data?.features ?? DEFAULT_FEATURES;
              set({ features });
            } catch {
              set({ features: DEFAULT_FEATURES });
            }
          }

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

      googleLogin: async (credential: string, selectedRole?: string) => {
        set({ isLoading: true, error: null });

        try {
          const res = await api.post("/v1/auth/google", {
            credential,
            expected_role: selectedRole || null,
          });

          const { access_token, refresh_token } = res.data;

          localStorage.setItem("skitech_access_token", access_token);
          localStorage.setItem("skitech_refresh_token", refresh_token);

          const user = decodeJWT(access_token);
          if (!user) throw new Error("Invalid token received");

          localStorage.setItem("skitech_role", getRoleStorageKey(user.role));
          setAuthCookie(user);

          set({ user, access_token, refresh_token, isAuthenticated: true, isLoading: false, error: null });

          // Fetch subscription features
          if (user.role === "Super Admin") {
            const allEnabled: PlanFeatures = {
              reports: true, kra: true, sop: true,
              attendance: true, vendor_management: true, inventory: true, governance: true,
              employee_scheduling: true, chat: true, employee_ranking: true, master_log: true,
            };
            set({ features: allEnabled });
          } else {
            try {
              const planRes = await api.get("/v1/subscriptions/my-plan");
              set({ features: planRes.data?.features ?? DEFAULT_FEATURES });
            } catch {
              set({ features: DEFAULT_FEATURES });
            }
          }

          return ROLE_ROUTES[user.role] || "/staff";
        } catch (err: any) {
          const message =
            err?.response?.data?.detail ||
            err?.message ||
            "Google sign-in failed. Please try again.";
          set({ isLoading: false, error: message, isAuthenticated: false });
          throw new Error(message);
        }
      },

      refreshFeatures: async () => {
        const { user } = get();
        if (user?.role === "Super Admin") {
          set({ features: {
            reports: true, kra: true, sop: true,
            attendance: true, vendor_management: true, inventory: true, governance: true,
            employee_scheduling: true, chat: true, employee_ranking: true, master_log: true,
          }});
          return;
        }
        try {
          const planRes = await api.get("/v1/subscriptions/my-plan");
          const features = planRes.data?.features ?? DEFAULT_FEATURES;
          set({ features });
        } catch {
          set({ features: DEFAULT_FEATURES });
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
          features: DEFAULT_FEATURES,
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
        features: state.features,
      }),
    }
  )
);
