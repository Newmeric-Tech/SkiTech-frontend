"use client";

import { useAuthStore } from "@/store/authStore";
import { Lock, Zap } from "lucide-react";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  planName?: string;
}

export function FeatureGate({ feature, children, planName }: FeatureGateProps) {
  const { features, user } = useAuthStore();

  // Super admins bypass all gates
  if (user?.role === "Super Admin") return <>{children}</>;

  if (features[feature]) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-10 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-black">Feature Locked</h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            The <span className="font-semibold text-black">{formatFeatureName(feature)}</span> module
            is not included in your current subscription plan.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-1">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Upgrade Required</p>
          <p className="text-sm text-amber-700">
            Contact your administrator to upgrade your plan and unlock this feature.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
          <Zap className="w-3.5 h-3.5" />
          <span>Powered by Skitec Subscription Plans</span>
        </div>
      </div>
    </div>
  );
}

function formatFeatureName(feature: string): string {
  const names: Record<string, string> = {
    inventory: "Inventory Management",
    kra: "KRA Monitoring",
    reports: "Reports & Analytics",
    sop: "SOP Management",
    governance: "Governance",
  };
  return names[feature] || feature.charAt(0).toUpperCase() + feature.slice(1);
}
