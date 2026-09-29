"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, ROLE_ROUTES } from "@/store/authStore";
import { canAccess, loginPathFor } from "@/lib/auth/roleAccess";

// Tab-scoped route guard: reads the role from this tab's own persisted session
// (sessionStorage), so a login in another tab can't change what this tab may see.
// Renders nothing until the check passes — protected content never flashes.
export function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  // Wait for the persisted session to load from sessionStorage (client-only)
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const allowed = hydrated && isAuthenticated && canAccess(role, pathname);

  useEffect(() => {
    if (!hydrated || allowed) return;
    if (!isAuthenticated || !role) {
      router.replace(loginPathFor(pathname));
    } else {
      router.replace(ROLE_ROUTES[role] ?? "/auth/login");
    }
  }, [hydrated, allowed, isAuthenticated, role, pathname, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
