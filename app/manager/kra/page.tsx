"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { usersAPI } from "@/lib/api/users";
import { kraErrorMessage } from "@/lib/api/kraTasks";
import KraManagementTabs from "@/components/kra-tasks/KraManagementTabs";
import { KraEmptyState, KraErrorState, KraLoading } from "@/components/kra-tasks/KraPanelStates";

export default function KRACenterPage() {
  const { user } = useAuthStore();
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = await usersAPI.me();
      setPropertyId(me.data.property_id);
    } catch (err) {
      setError(kraErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">KRA Center</h1>
        <p className="text-slate-500 text-sm mt-1">Your own KRAs, the KRAs you assign to your team, and how they are going.</p>
      </div>

      {loading ? (
        <KraLoading />
      ) : error ? (
        <KraErrorState message={error} onRetry={load} />
      ) : (
        <KraManagementTabs
          propertyId={propertyId}
          canAssignManagers={user?.role !== "Manager"}
          showMyKras
          noProperty={
            <KraEmptyState title="No property assigned to your account">
              Ask your owner to assign you a property. You can build and assign KRAs after that.
            </KraEmptyState>
          }
        />
      )}
    </div>
  );
}
