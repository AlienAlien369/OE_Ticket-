// ============================================================
// ROUTE GUARDS — ProtectedRoute, PublicRoute, Can
// ============================================================

import { memo, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/auth.store'
import { ROUTES } from '@config/index'

interface ProtectedRouteProps {
  children: ReactNode
  /** Page-based RBAC — key must match a PageKey in config/index.ts */
  requiredPage?: string
  fallback?: ReactNode
}

/**
 * Redirects unauthenticated users to login.
 * Optionally enforces page-based RBAC.
 */
export const ProtectedRoute = memo(
  ({ children, requiredPage, fallback }: ProtectedRouteProps) => {
    const location = useLocation()
    const { isAuthenticated, canAccessPage } = useAuthStore()

    if (!isAuthenticated) {
      return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    }

    if (requiredPage && !canAccessPage(requiredPage)) {
      return fallback ? <>{fallback}</> : <Navigate to={ROUTES.DASHBOARD} replace />
    }

    return <>{children}</>
  }
)
ProtectedRoute.displayName = 'ProtectedRoute'

/**
 * Redirects authenticated users away from public routes (login/register).
 */
export const PublicRoute = memo(({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <>{children}</>
})
PublicRoute.displayName = 'PublicRoute'

/**
 * Conditional render based on page access — no redirect.
 * Use within pages to show/hide UI elements.
 */
export const Can = memo(
  ({
    page,
    children,
    fallback = null,
  }: {
    page?: string
    children: ReactNode
    fallback?: ReactNode
  }) => {
    const { canAccessPage } = useAuthStore()
    if (page && !canAccessPage(page)) return <>{fallback}</>
    return <>{children}</>
  }
)
Can.displayName = 'Can'
