import api from "@/lib/config/app";

export interface PlanFeatures {
  reports: boolean;
  kra: boolean;
  sop: boolean;
  attendance: boolean;
  vendor_management: boolean;
  inventory: boolean;
  governance: boolean;
  employee_scheduling: boolean;
  chat: boolean;
  employee_ranking: boolean;
  master_log: boolean;
  [key: string]: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  max_properties: number | null;
  max_users: number | null;
  features: PlanFeatures | null;
}

export interface MyPlan {
  subscription_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  plan: SubscriptionPlan;
  features: PlanFeatures;
}

export const subscriptionsAPI = {
  myPlan: () => api.get<MyPlan>("/v1/subscriptions/my-plan"),
  plans: () => api.get<SubscriptionPlan[]>("/v1/subscriptions/plans"),
  selectPlan: (planId: string) =>
    api.post<MyPlan>("/v1/subscriptions/select-plan", { plan_id: planId }),
  assignPlan: (tenantId: string, planId: string) =>
    api.post("/v1/subscriptions/assign", { tenant_id: tenantId, plan_id: planId }),
  createCheckoutSession: (planId: string) =>
    api.post<{ session_url: string; session_id: string }>(
      "/v1/subscriptions/create-checkout-session",
      { plan_id: planId }
    ),
  verifySession: (sessionId: string) =>
    api.post<MyPlan>("/v1/subscriptions/verify-session", { session_id: sessionId }),
  createPortalSession: () =>
    api.post<{ portal_url: string }>("/v1/subscriptions/create-portal-session"),
};
