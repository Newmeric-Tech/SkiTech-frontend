"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { propertiesAPI } from "@/lib/api/properties";
import { kraErrorMessage, kraTasksAPI } from "@/lib/api/kraTasks";
import { localDateString } from "@/lib/utils/localDate";
import KraManagementTabs from "@/components/kra-tasks/KraManagementTabs";
import { KraEmptyState, KraErrorState, KraLoading } from "@/components/kra-tasks/KraPanelStates";

export default function KRAPage() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [hasOwnTasks, setHasOwnTasks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [res, ownTasks] = await Promise.all([
        propertiesAPI.list(),
        // Only decides whether the My KRAs tab appears, so a failure just leaves it out
        kraTasksAPI.myTasks(localDateString()).catch(() => []),
      ]);
      let list = (Array.isArray(res.data) ? res.data : []).map((p) => ({ id: p.id, name: p.name }));
      // A Co Admin manages one property (the server enforces it as well)
      if (user?.role === "Co Admin" && user.property_id) list = list.filter((p) => p.id === user.property_id);
      setProperties(list);
      setPropertyId((current) => current || list[0]?.id || "");
      setHasOwnTasks(ownTasks.length > 0);
    } catch (err) {
      setError(kraErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.property_id]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">KRA Monitoring</h1>
          <p className="text-slate-500 text-sm mt-1">Build KRAs for a property, assign them to staff and managers, and follow progress.</p>
        </div>
        {!loading && !error && properties.length > 0 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
            {properties.length > 1 ? (
              <select aria-label="Property" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none">
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <span className="text-sm text-slate-700">{properties[0].name}</span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <KraLoading />
      ) : error ? (
        <KraErrorState message={error} onRetry={load} />
      ) : (
        <KraManagementTabs
          propertyId={propertyId || null}
          canAssignManagers
          showMyKras={hasOwnTasks}
          noProperty={<KraEmptyState title="No properties yet">Add a property to start building KRAs.</KraEmptyState>}
        />
      )}
    </div>
  );
}
