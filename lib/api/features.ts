import api from "@/lib/config/app";

export const featuresAPI = {
  list: () => api.get<Record<string, boolean>>("/v1/features/"),
  toggle: (featureName: string, isEnabled: boolean) =>
    api.patch(`/v1/features/${featureName}`, null, { params: { is_enabled: isEnabled } }),
};
