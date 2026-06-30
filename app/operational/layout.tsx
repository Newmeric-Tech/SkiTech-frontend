"use client";

import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { useState, useEffect } from "react";

export default function OperationalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | null>(null);
  
  useEffect(() => {
    setRole(sessionStorage.getItem("skitech_role")?.toLowerCase() || "owner");
  }, []);

  if (!role) {
    return null; // Or a loading spinner
  }

  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}