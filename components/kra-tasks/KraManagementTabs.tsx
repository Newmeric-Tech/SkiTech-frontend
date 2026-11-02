"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KraProgressPanel from "./KraProgressPanel";
import KraTasksPanel from "./KraTasksPanel";
import MyKras from "./MyKras";

/** The tabs of the manager and owner KRA pages */
export default function KraManagementTabs({ propertyId, canAssignManagers, showMyKras, noProperty }: {
  propertyId: string | null;
  canAssignManagers: boolean;
  showMyKras: boolean;
  /** Shown in the management tabs while there is no property to work with */
  noProperty: ReactNode;
}) {
  return (
    <Tabs defaultValue={showMyKras ? "my" : "tasks"} className="gap-4">
      <div className="overflow-x-auto">
        <TabsList className="h-10">
          {showMyKras && <TabsTrigger value="my" className="px-3">My KRAs</TabsTrigger>}
          <TabsTrigger value="tasks" className="px-3">KRA Tasks</TabsTrigger>
          <TabsTrigger value="progress" className="px-3">Progress</TabsTrigger>
        </TabsList>
      </div>
      {showMyKras && <TabsContent value="my"><MyKras /></TabsContent>}
      <TabsContent value="tasks">
        {propertyId
          ? <KraTasksPanel key={propertyId} propertyId={propertyId} canAssignManagers={canAssignManagers} />
          : noProperty}
      </TabsContent>
      <TabsContent value="progress">
        {propertyId ? <KraProgressPanel key={propertyId} propertyId={propertyId} /> : noProperty}
      </TabsContent>
    </Tabs>
  );
}
