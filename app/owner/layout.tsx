"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import OwnerOnboardingModal from "@/components/onboarding/OwnerOnboardingModal";
import { useAuthStore } from "@/store/authStore";
import { propertiesAPI } from "@/lib/api/properties";

const ONBOARDING_KEY = "skitech_onboarding_complete";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Only show for Tenant Admin with no property assigned and
    // only if onboarding hasn't been completed yet.
    if (
      user?.role !== "Tenant Admin" ||
      user?.property_id !== null ||
      typeof window === "undefined" ||
      localStorage.getItem(ONBOARDING_KEY) === "true"
    ) {
      return;
    }

    // Double-check: confirm the tenant truly has no properties yet.
    propertiesAPI
      .list()
      .then((res) => {
        if (res.data.length === 0) {
          setShowOnboarding(true);
        }
      })
      .catch(() => {
        // If the request fails (e.g. network), don't block the UI.
      });
  }, [user]);

  function handleDismissOnboarding() {
    setShowOnboarding(false);
  }

  return (
    <>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
      <AnimatePresence>
        {showOnboarding && (
          <OwnerOnboardingModal onDismiss={handleDismissOnboarding} />
        )}
      </AnimatePresence>
    </>
  );
}
