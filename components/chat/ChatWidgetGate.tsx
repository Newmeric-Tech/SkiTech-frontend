"use client";

import { usePathname } from "next/navigation";
import ChatWidget from "./ChatWidget";

/** Routes that belong to authenticated dashboards */
const AUTHENTICATED_PREFIXES = ["/manager", "/owner", "/staff", "/superadmin"];

/**
 * Renders the ChatWidget only when the user is on an authenticated route.
 * On the landing/marketing pages and /auth/* it returns null.
 */
export default function ChatWidgetGate() {
  const pathname = usePathname();
  const isAuthenticated = AUTHENTICATED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isAuthenticated) return null;
  return <ChatWidget />;
}
