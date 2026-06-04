"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import OwnerOnboardingModal from "@/components/onboarding/OwnerOnboardingModal";
import PlanSelectionModal, { PLAN_SELECTED_KEY } from "@/components/onboarding/PlanSelectionModal";
import { useAuthStore } from "@/store/authStore";
import { propertiesAPI } from "@/lib/api/properties";
import { subscriptionsAPI, MyPlan } from "@/lib/api/subscriptions";

const ONBOARDING_KEY = "skitech_onboarding_complete";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPlanSelect, setShowPlanSelect] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<MyPlan | null>(null);

  useEffect(() => {
    if (user?.role !== "Tenant Admin" || typeof window === "undefined") return;

    // Check subscription — show plan selection modal if user hasn't chosen yet
    if (localStorage.getItem(PLAN_SELECTED_KEY) !== "true") {
      subscriptionsAPI.myPlan()
        .then(res => {
          setCurrentPlan(res.data);
          setShowPlanSelect(true);
        })
        .catch(() => {
          // If my-plan fails for any reason, don't block the UI
        });
    }

    // Onboarding modal: show only if no property exists yet
    if (
      user?.property_id !== null ||
      localStorage.getItem(ONBOARDING_KEY) === "true"
    ) {
      return;
    }

    propertiesAPI
      .list()
      .then((res) => {
        if (res.data.length === 0) {
          setShowOnboarding(true);
        }
      })
      .catch(() => {});
  }, [user]);

  function handleDismissOnboarding() {
    setShowOnboarding(false);
  }

  function handleDismissPlanSelect(updatedPlan?: MyPlan) {
    if (updatedPlan) setCurrentPlan(updatedPlan);
    setShowPlanSelect(false);
  }

  return (
    <>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
      <AnimatePresence>
        {showOnboarding && (
          <OwnerOnboardingModal onDismiss={handleDismissOnboarding} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPlanSelect && currentPlan && (
          <PlanSelectionModal
            currentPlan={currentPlan}
            onDismiss={handleDismissPlanSelect}
          />
        )}
      </AnimatePresence>
    </>
  );
}
