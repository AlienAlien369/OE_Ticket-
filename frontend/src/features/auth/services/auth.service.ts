// ============================================================
// AUTH SERVICE — OE Ticket backend API integration
// ============================================================

import { api } from './api-client'
import { AUTH_CONFIG } from '@config/index'
import type { User } from '@/types/index'

// ── Backend response types (matching OETicket.Application DTOs) ────────────
interface BackendAuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    username: string
    email: string
    firstName: string
    lastName: string
    roles: string[]
    accessiblePages: string[]
  }
}

export interface LoginCredentials {
  usernameOrEmail: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}

/** Maps the backend auth response to the frontend User model */
const mapToUser = (data: BackendAuthResponse['data']): User => ({
  username: data.username,
  email: data.email,
  firstName: data.firstName,
  lastName: data.lastName,
  name: `${data.firstName} ${data.lastName}`,
  roles: data.roles,
  accessiblePages: data.accessiblePages,
  permissions: data.accessiblePages, // use pages as permissions
})

const persistToken = (token: string) => {
  localStorage.setItem(AUTH_CONFIG.tokenStorageKey, token)
}

const clearPersistedToken = () => {
  localStorage.removeItem(AUTH_CONFIG.tokenStorageKey)
  localStorage.removeItem(AUTH_CONFIG.userStorageKey)
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await api.post<BackendAuthResponse>('/auth/login', credentials)
    if (!response.success || !response.data) {
      throw new Error(response.message ?? 'Login failed')
    }
    persistToken(response.data.accessToken)
    const user = mapToUser(response.data)
    localStorage.setItem(AUTH_CONFIG.userStorageKey, JSON.stringify(user))
    return { user, token: response.data.accessToken }
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await api.post<BackendAuthResponse>('/auth/register', data)
    if (!response.success || !response.data) {
      throw new Error(response.message ?? 'Registration failed')
    }
    persistToken(response.data.accessToken)
    const user = mapToUser(response.data)
    localStorage.setItem(AUTH_CONFIG.userStorageKey, JSON.stringify(user))
    return { user, token: response.data.accessToken }
  },

  logout: (): void => {
    clearPersistedToken()
  },

  getPersistedToken: (): string | null =>
    localStorage.getItem(AUTH_CONFIG.tokenStorageKey),

  getPersistedUser: (): User | null => {
    try {
      const raw = localStorage.getItem(AUTH_CONFIG.userStorageKey)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  },
}
