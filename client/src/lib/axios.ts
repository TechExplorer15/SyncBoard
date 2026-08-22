/**
 * Axios instance with auth interceptors.
 * - Attaches the access token to every request.
 * - On 401 with TOKEN_EXPIRED, silently refreshes and retries.
 * - Uses credentials: 'include' so the browser sends httpOnly cookies.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './constants';
import type { ApiError } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send httpOnly cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Token accessor — set by the Redux store so the interceptor
 * can read the current access token without importing the store
 * (avoids circular dependency).
 */
let tokenAccessor: (() => string | null) | null = null;
let tokenRefresher: (() => Promise<string | null>) | null = null;

export function setTokenAccessor(getter: () => string | null) {
  tokenAccessor = getter;
}

export function setTokenRefresher(refresher: () => Promise<string | null>) {
  tokenRefresher = refresher;
}

// --- Request interceptor: attach access token ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenAccessor?.();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: handle token expiry ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401 with TOKEN_EXPIRED, and only once
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry &&
      tokenRefresher
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await tokenRefresher();
        processQueue(null, newToken);
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
