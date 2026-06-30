"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function DocTabs() {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("Owner");

  useEffect(() => {
    const stored = sessionStorage.getItem("skitech_role");
    if (stored) setRole(stored);
  }, []);

  // Determine base path prefix based on the current pathname
  const getBasePath = () => {
    if (pathname.startsWith("/owner")) return "/owner/document-management";
    if (pathname.startsWith("/manager")) return "/manager/document-management";
    if (pathname.startsWith("/staff")) return "/staff/document-management";
    return "/document-management";
  };
  const basePath = getBasePath();

  const allTabs = [
    { label: "ALL", href: basePath },
    { label: "MY DOCUMENTS", href: `${basePath}/my-documents` },
    { label: "ALL UPDATES", href: `${basePath}/updates` },
  ];

  return (
    <div className="flex items-center justify-center gap-8 border-b border-black/10 pb-px mb-8">
      {allTabs.map(tab => {
        const isActive = pathname === tab.href || (tab.href !== basePath && pathname.startsWith(tab.href));
        // Special check for ALL tab to not match everything
        const isExactAll = tab.href === basePath && pathname === basePath;
        const isCurrentActive = tab.href === basePath ? isExactAll : isActive;

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`pb-4 text-xs font-bold tracking-widest transition-colors border-b-2 ${
              isCurrentActive
                ? "border-black text-black"
                : "border-transparent text-neutral-400 hover:text-black hover:border-black/30"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
