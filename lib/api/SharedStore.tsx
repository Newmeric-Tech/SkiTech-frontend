"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { inventoryAPI } from "@/lib/api/inventory";
import { sopAPI } from "@/lib/api/sop";
import { useAuthStore } from "@/store/authStore";

// ── Types ─────────────────────────────────────────────────
export interface SOPStep { id: number; text: string; }

export interface SOP {
  id: string;
  title: string;
  dept: string;
  category_id: string;
  status: "active" | "review" | "draft" | "archived" | "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  updated: string;
  description?: string;
  assignedTo: string[];
  due_date?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  item_name: string;
  category?: string;
  property_id: string;
  quantity: number;
  reorder_level?: number;
  unit?: string;
  status: "ok" | "low" | "critical";
}

export interface RestockRequest {
  id: number;
  itemId: string;
  itemName: string;
  requestedQty: number;
  currentStock: number;
  unit: string;
  property: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

// ── Helper ────────────────────────────────────────────────
export function computeStatus(
  quantity: number,
  reorder_level?: number
): "ok" | "low" | "critical" {
  if (!reorder_level) return "ok";
  if (quantity === 0 || quantity < reorder_level * 0.3) return "critical";
  if (quantity < reorder_level) return "low";
  return "ok";
}

// ── Context ───────────────────────────────────────────────
interface SharedStoreCtx {
  sops: SOP[];
  sopLoading: boolean;
  addSOP: (sop: any) => Promise<void>;
  updateSOP: (sop: any) => Promise<void>;
  archiveSOP: (id: string) => Promise<void>;
  refreshSOPs: () => Promise<void>;

  inventoryItems: InventoryItem[];
  inventoryLoading: boolean;
  addInventoryItem: (item: any) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  refreshInventory: () => Promise<void>;

  restockRequests: RestockRequest[];
  addRestockRequest: (req: Omit<RestockRequest, "id" | "requestedAt" | "status">) => void;
  approveRestockRequest: (id: number) => Promise<void>;
  rejectRestockRequest: (id: number, reason?: string) => void;
  pendingCount: number;

  propertyId: string | null;
  setPropertyId: (id: string) => void;
}

const SharedStoreContext = createContext<SharedStoreCtx | null>(null);

export function SharedStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  const [propertyId, setPropertyId] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem("skitech_property_id")
      : null
  );

  const [sops, setSOPs] = useState<SOP[]>([]);
  const [sopLoading, setSopLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);

  // ── Fetch SOPs ────────────────────────────────────────
  const refreshSOPs = async () => {
    if (!propertyId) return;
    setSopLoading(true);
    try {
      const res = await sopAPI.listSOPs(propertyId);
      const mapped = res.data.map((s: any) => ({
        id: s.id,
        title: s.title,
        dept: s.department_id || "General",
        category_id: s.category_id,
        status: s.status,
        priority: s.priority,
        updated: new Date(s.updated_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric"
        }),
        description: s.description,
        assignedTo: s.assigned_employee_id ? [s.assigned_employee_id] : [],
        due_date: s.due_date,
      }));
      setSOPs(mapped);
    } catch (err) {
      console.error("Failed to fetch SOPs:", err);
    } finally {
      setSopLoading(false);
    }
  };

  // ── Fetch Inventory ───────────────────────────────────
  const refreshInventory = async () => {
    if (!propertyId) return;
    setInventoryLoading(true);
    try {
      const res = await inventoryAPI.list(propertyId);
      const mapped = res.data.map((item: any) => ({
        id: item.id,
        name: item.item_name,
        item_name: item.item_name,
        property_id: item.property_id,
        quantity: item.quantity,
        reorder_level: item.reorder_level,
        unit: item.unit,
        status: computeStatus(item.quantity, item.reorder_level),
      }));
      setInventoryItems(mapped);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setInventoryLoading(false);
    }
  };

  // ── Auto fetch when propertyId changes ───────────────
  useEffect(() => {
    if (propertyId) {
      refreshSOPs();
      refreshInventory();
    }
  }, [propertyId]);

  // ── SOP Actions ───────────────────────────────────────
  const addSOP = async (data: any) => {
    if (!propertyId) return;
    await sopAPI.createSOP(propertyId, data);
    await refreshSOPs();
  };

  const updateSOP = async (data: any) => {
    await sopAPI.updateSOP(data.id, data);
    await refreshSOPs();
  };

  const archiveSOP = async (id: string) => {
    await sopAPI.updateSOP(id, { status: "completed" });
    await refreshSOPs();
  };

  // ── Inventory Actions ─────────────────────────────────
  const addInventoryItem = async (data: any) => {
    if (!propertyId) return;
    await inventoryAPI.create(propertyId, data);
    await refreshInventory();
  };

  const updateStock = async (id: string, newStock: number) => {
    const item = inventoryItems.find((i) => i.id === id);
    if (!item) return;
    await inventoryAPI.adjustStock(id, { new_quantity: newStock });
    await refreshInventory();
  };

  // ── Restock Requests (local for now) ──────────────────
  const addRestockRequest = (req: Omit<RestockRequest, "id" | "requestedAt" | "status">) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });
    setRestockRequests((prev) => [
      { ...req, id: Date.now(), requestedAt: dateStr, status: "pending" },
      ...prev,
    ]);
  };

  const approveRestockRequest = async (id: number) => {
    const req = restockRequests.find((r) => r.id === id);
    if (!req) return;
    await inventoryAPI.addStock(req.itemId, {
      quantity: req.requestedQty,
      notes: req.reason,
    });
    setRestockRequests((prev) =>
      prev.map((r) => (r.id !== id ? r : { ...r, status: "approved" }))
    );
    await refreshInventory();
  };

  const rejectRestockRequest = (id: number, reason?: string) =>
    setRestockRequests((prev) =>
      prev.map((r) =>
        r.id !== id ? r : { ...r, status: "rejected", rejectionReason: reason }
      )
    );

  const pendingCount = restockRequests.filter((r) => r.status === "pending").length;

  const handleSetPropertyId = (id: string) => {
    localStorage.setItem("skitech_property_id", id);
    setPropertyId(id);
  };

  return (
    <SharedStoreContext.Provider value={{
      sops, sopLoading, addSOP, updateSOP, archiveSOP, refreshSOPs,
      inventoryItems, inventoryLoading, addInventoryItem, updateStock, refreshInventory,
      restockRequests, addRestockRequest, approveRestockRequest, rejectRestockRequest,
      pendingCount,
      propertyId, setPropertyId: handleSetPropertyId,
    }}>
      {children}
    </SharedStoreContext.Provider>
  );
}

export function useSharedStore() {
  const ctx = useContext(SharedStoreContext);
  if (!ctx) throw new Error("useSharedStore must be used inside SharedStoreProvider");
  return ctx;
}