import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_URL } from "@/lib/env";
import {
  clearTokens,
  emitAuthLogout,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/token-storage";
import { ApiError, type ApiErrorBody } from "@/lib/api/types";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.skipAuth) {
    const token = getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post<{
    accessToken: string;
    refreshToken: string;
  }>(`${API_URL}/platform-auth/refresh`, { refreshToken });

  setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isRefreshCall = originalRequest?.url?.includes("/platform-auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuth &&
      !isRefreshCall &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newAccessToken = await refreshPromise;
        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      } catch {
        clearTokens();
        emitAuthLogout();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && isRefreshCall) {
      clearTokens();
      emitAuthLogout();
    }

    if (error.response?.data) {
      return Promise.reject(new ApiError(error.response.data));
    }

    return Promise.reject(error);
  },
);
