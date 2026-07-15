// lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  handleUnauthorized,
  useAuthStore,
} from "../store/authStore";
import { ApiErrorResponse, normalizeError } from "@/types/api";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

function subscribeToRefresh(cb: (token: string) => void) {
  pendingQueue.push(cb);
}

function onRefreshed(token: string) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      originalRequest?.url?.includes("/api/auth/login/") ||
      originalRequest?.url?.includes("/api/auth/token/refresh/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        handleUnauthorized();
        return Promise.reject(normalizeError(error));
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // queue this request until the in-flight refresh resolves
        return new Promise((resolve) => {
          subscribeToRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/token/refresh/`,
          { refresh: refreshToken },
        );
        const { access: newAccessToken, refresh: newRefreshToken } = data; // NOT wrapped in { success, data } — confirmed raw shape
        useAuthStore
          .getState()
          .setTokens({ access: newAccessToken, refresh: newRefreshToken });
        onRefreshed(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        handleUnauthorized();
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);
