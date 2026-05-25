// ============================================================
// API CLIENT — production-grade Axios instance
// Handles: auth headers, token refresh, retry logic, errors
// ============================================================

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'
import { API_CONFIG } from '@config/index'
import type { ApiError, AuthTokens } from '@/types/index'

// Polyfill for crypto.randomUUID — works on HTTP (non-secure) contexts like
// local network dev (http://192.168.x.x) where the native API is unavailable.
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: RFC-4122 v4 UUID using Math.random
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// Token management (memory + localStorage for refresh)
let accessToken: string | null = null
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else if (token) {
      resolve(token)
    }
  })
  failedQueue = []
}

export const tokenStorage = {
  get: (): string | null => accessToken,
  set: (token: string): void => {
    accessToken = token
  },
  clear: (): void => {
    accessToken = null
    localStorage.removeItem('oe_ticket_access_token')
    localStorage.removeItem('oe_ticket_user')
  },
  setTokens: (tokens: { accessToken: string }): void => {
    accessToken = tokens.accessToken
    localStorage.setItem('oe_ticket_access_token', tokens.accessToken)
  },
  getRefreshToken: (): string | null => null,
  isExpiringSoon: (): boolean => false,
}

// Create the main API instance
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.baseUrl,
    timeout: API_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: false, // Set true for cookie-based auth
  })

  // REQUEST INTERCEPTOR: Attach access token + request ID
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.get()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      // Idempotency key for mutations
      if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
        config.headers['X-Idempotency-Key'] = generateUUID()
      }
      config.headers['X-Request-ID'] = generateUUID()
      return config
    },
    (error) => Promise.reject(error)
  )

  // RESPONSE INTERCEPTOR: Handle 401 with token refresh + retry
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      // If unauthorized and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue requests while refreshing
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return instance(originalRequest)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = tokenStorage.getRefreshToken()
          if (!refreshToken) throw new Error('No refresh token')

          // Call refresh endpoint
          const { data } = await axios.post<AuthTokens>(
            `${API_CONFIG.baseUrl}/auth/refresh`,
            { refreshToken },
            { withCredentials: false }
          )

          tokenStorage.setTokens(data)
          processQueue(null, data.accessToken)

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return instance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          tokenStorage.clear()
          window.dispatchEvent(new Event('auth:logout'))
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // Normalize error shape
      const apiError: ApiError = {
        message:
          (error.response?.data as Record<string, string>)?.message ??
          error.message ??
          'An unexpected error occurred',
        code: (error.response?.data as Record<string, string>)?.code ?? 'UNKNOWN_ERROR',
        statusCode: error.response?.status ?? 0,
        errors: (error.response?.data as Record<string, Record<string, string[]>>)?.errors,
      }

      return Promise.reject(apiError)
    }
  )

  return instance
}

export const apiClient = createApiClient()

// ============================================================
// TYPED HTTP HELPERS
// ============================================================

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((r) => r.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((r) => r.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((r) => r.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((r) => r.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((r) => r.data),
}
