// Role → allowed portal route prefixes.
// UX-only gating (read client-side from the tab's own sessionStorage session);
// the real security boundary is backend JWT validation.
export const ROLE_ACCESS: Record<string, string[]> = {
  "Super Admin":  ["/superadmin", "/owner", "/manager", "/staff", "/operational"],
  "Tenant Admin": ["/owner", "/manager", "/staff", "/operational"],
  "Co Admin":     ["/owner", "/operational"],
  "Manager":      ["/manager", "/staff", "/operational"],
  "Staff":        ["/staff"],
};

export function canAccess(role: string | undefined, pathname: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ACCESS[role] ?? [];
  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export function loginPathFor(pathname: string): string {
  return pathname.startsWith("/superadmin") ? "/auth/superadmin-login" : "/auth/login";
}
