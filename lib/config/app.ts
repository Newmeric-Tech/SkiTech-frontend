import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

// ── Base URL ──────────────────────────────────────────────
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Axios Instance ────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 35000, // 35s — accommodates Render free-tier cold-start (~30s)
});

// ── Request Interceptor — attach JWT token ────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("skitech_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — handle token expiry ────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried → try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't redirect if already on an auth page
      if (window.location.pathname.startsWith("/auth")) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("skitech_refresh_token");
      if (!refreshToken) {
        // No refresh token → clear only auth keys, don't wipe entire storage
        localStorage.removeItem("skitech_access_token");
        localStorage.removeItem("skitech_refresh_token");
        localStorage.removeItem("skitech_role");
        localStorage.removeItem("skitech_auth");
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = res.data;
        localStorage.setItem("skitech_access_token", access_token);
        localStorage.setItem("skitech_refresh_token", refresh_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch {
        // Refresh failed → clear only auth keys, don't wipe entire storage
        localStorage.removeItem("skitech_access_token");
        localStorage.removeItem("skitech_refresh_token");
        localStorage.removeItem("skitech_role");
        localStorage.removeItem("skitech_auth");
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
