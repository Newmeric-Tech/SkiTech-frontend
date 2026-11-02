import axios from "axios";
import api from "@/lib/config/app";

export const SERVER_WAKING_MESSAGE = "Server is waking up, please try again in a moment.";

/** No answer at all (network error or timeout), as when the backend is cold-starting */
export const isNoResponse = (err: unknown) => axios.isAxiosError(err) && !err.response;

/** HTTP status of a failed request, if the server answered */
export const errorStatus = (err: unknown) => (axios.isAxiosError(err) ? err.response?.status : undefined);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/v1/auth/login", { email, password }),

  register: (data: {
    email: string;
    password: string;
    role: string;
    tenant_id: string;
  }) => api.post("/v1/auth/register", data),

  verifyOTP: (email: string, otp: string) =>
    api.post("/v1/auth/verify-otp", { email, otp }),

  forgotPassword: (email: string) =>
    api.post("/v1/auth/forgot-password", { email }),

  resendVerification: (email: string) =>
    api.post("/v1/auth/resend-verification", { email }),

  resetPassword: (email: string, otp: string, new_password: string) =>
    api.post("/v1/auth/reset-password", { email, otp, new_password }),

  refreshToken: (refresh_token: string) =>
    api.post("/v1/auth/refresh", { refresh_token }),

  logout: () => api.post("/v1/auth/logout"),
};