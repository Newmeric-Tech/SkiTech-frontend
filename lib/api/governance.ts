import api from "@/lib/config/app";

export const governanceAPI = {
  listWorkflows: () => api.get("/v1/governance/workflows"),
  createWorkflow: (data: any) => api.post("/v1/governance/workflows", data),
  listInstances: () => api.get("/v1/governance/instances"),
  createInstance: (data: any) => api.post("/v1/governance/instances", data),
  approve: (instanceId: string) =>
    api.put(`/v1/governance/instances/${instanceId}/approve`),
  reject: (instanceId: string, reason: string) =>
    api.put(`/v1/governance/instances/${instanceId}/reject`, { reason }),
};