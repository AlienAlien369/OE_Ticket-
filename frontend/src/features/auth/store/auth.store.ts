// ============================================================
// AUTH STORE — Zustand with immer-style updates
// OE Ticket: JWT + page-based RBAC
// ============================================================

import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User } from '@/types/index'
import { SYSTEM_ROLES } from '@config/index'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  /** Check if the user can access a given page by its key */
  canAccessPage: (pageKey: string) => boolean
  isSuperAdmin: () => boolean
  hasRole: (role: string | string[]) => boolean
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          // State
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,

          // Actions
          setUser: (user) =>
            set((state) => {
              state.user = user
              state.isAuthenticated = user !== null
              state.error = null
            }),

          setToken: (token) =>
            set((state) => {
              state.token = token
            }),

          setLoading: (loading) =>
            set((state) => {
              state.isLoading = loading
            }),

          setError: (error) =>
            set((state) => {
              state.error = error
              state.isLoading = false
            }),

          logout: () =>
            set((state) => {
              state.user = null
              state.token = null
              state.isAuthenticated = false
              state.error = null
              state.isLoading = false
            }),

          clearError: () =>
            set((state) => {
              state.error = null
            }),

          // ── RBAC helpers ────────────────────────────────────────────────
          canAccessPage: (pageKey: string) => {
            const { user } = get()
            if (!user) return false
            // super_admin always has access to everything
            if (user.roles.includes(SYSTEM_ROLES.SUPER_ADMIN)) return true
            return user.accessiblePages.includes(pageKey)
          },

          isSuperAdmin: () => {
            const { user } = get()
            return user?.roles.includes(SYSTEM_ROLES.SUPER_ADMIN) ?? false
          },

          hasRole: (role: string | string[]) => {
            const { user } = get()
            if (!user) return false
            const roles = Array.isArray(role) ? role : [role]
            return roles.some((r) => user.roles.includes(r))
          },
        })),
        {
          name: 'oe-ticket-auth',
          partialize: (state) => ({
            user: state.user,
            token: state.token,
            isAuthenticated: state.isAuthenticated,
          }),
        }
      )
    ),
    { name: 'AuthStore' }
  )
)

// Selectors
export const selectUser = (state: AuthStore) => state.user
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated
export const selectIsLoading = (state: AuthStore) => state.isLoading
export const selectAuthError = (state: AuthStore) => state.error
export const selectToken = (state: AuthStore) => state.token
