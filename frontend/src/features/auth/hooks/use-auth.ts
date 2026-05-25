// ============================================================
// AUTH HOOKS — OE Ticket business logic layer
// ============================================================

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/auth.store'
import {
  authService,
  type LoginCredentials,
  type RegisterData,
} from '../services/auth.service'
import { tokenStorage } from '../services/api-client'
import { ROUTES } from '@config/index'
import type { ApiError } from '@/types/index'

// ---- useAuth: main auth state hook ----
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, canAccessPage, isSuperAdmin, hasRole } =
    useAuthStore()

  return { user, isAuthenticated, isLoading, error, canAccessPage, isSuperAdmin, hasRole }
}

// ---- useLogin ----
export const useLogin = () => {
  const navigate = useNavigate()
  const { setUser, setToken, setLoading, setError } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onMutate: () => setLoading(true),
    onSuccess: ({ user, token }) => {
      tokenStorage.set(token)
      setToken(token)
      setUser(user)
      queryClient.clear()
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate(ROUTES.DASHBOARD, { replace: true })
    },
    onError: (error: ApiError) => {
      const msg = error.message ?? 'Login failed. Please check your credentials.'
      setError(msg)
      toast.error(msg)
    },
    onSettled: () => setLoading(false),
  })
}

// ---- useRegister ----
export const useRegister = () => {
  const navigate = useNavigate()
  const { setUser, setToken, setLoading, setError } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onMutate: () => setLoading(true),
    onSuccess: ({ user, token }) => {
      tokenStorage.set(token)
      setToken(token)
      setUser(user)
      toast.success('Account created successfully! Welcome to OE Ticket.')
      navigate(ROUTES.DASHBOARD, { replace: true })
    },
    onError: (error: ApiError) => {
      const msg = error.message ?? 'Registration failed.'
      setError(msg)
      toast.error(msg)
    },
    onSettled: () => setLoading(false),
  })
}

// ---- useLogout ----
export const useLogout = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => authService.logout(),
    onSuccess: () => {
      tokenStorage.clear()
      logout()
      queryClient.clear()
      navigate(ROUTES.LOGIN, { replace: true })
      toast.success('Signed out successfully')
    },
    onError: () => {
      tokenStorage.clear()
      logout()
      queryClient.clear()
      navigate(ROUTES.LOGIN, { replace: true })
    },
  })
}

// ---- useForgotPassword (placeholder — backend endpoint not wired yet) ----
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (_email: string) => {
      toast('Password reset coming soon.')
    },
  })
}
