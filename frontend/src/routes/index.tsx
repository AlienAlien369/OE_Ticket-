// ============================================================
// APP ROUTER — lazy loaded routes, code splitting per feature
// ============================================================

import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './guards'
import { ROUTES, PAGES } from '@config/index'
import { PageLoader } from '@components/feedback/PageLoader'
import { ErrorBoundary } from '@components/feedback/ErrorBoundary'

// ── Lazy imports — each feature chunk loaded on demand ──────────────────
const LoginPage = lazy(() =>
  import('@features/auth/components/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import('@features/auth/components/RegisterPage').then((m) => ({ default: m.RegisterPage }))
)
const ForgotPasswordPage = lazy(() =>
  import('@features/auth/components/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
)
const DashboardLayout = lazy(() =>
  import('@components/layout/DashboardLayout').then((m) => ({ default: m.DashboardLayout }))
)
const DashboardPage = lazy(() =>
  import('@features/dashboard/components/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
)
// New Token flow
const CreateProfilePage = lazy(() =>
  import('@features/token/components/CreateProfilePage').then((m) => ({
    default: m.CreateProfilePage,
  }))
)
const PhotoCapturePage = lazy(() =>
  import('@features/token/components/PhotoCapturePage').then((m) => ({
    default: m.PhotoCapturePage,
  }))
)
const TokenPrintPage = lazy(() =>
  import('@features/token/components/TokenPrintPage').then((m) => ({
    default: m.TokenPrintPage,
  }))
)
// Print
const PrintPage = lazy(() =>
  import('@features/print/components/PrintPage').then((m) => ({ default: m.PrintPage }))
)
// Access Control
const AccessControlPage = lazy(() =>
  import('@features/access-control/components/AccessControlPage').then((m) => ({
    default: m.AccessControlPage,
  }))
)

const NotFoundPage = lazy(() =>
  import('@components/feedback/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

const withSuspense = (Component: React.ComponentType) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
)

const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <RegisterPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <ForgotPasswordPage />
        </Suspense>
      </PublicRoute>
    ),
  },

  // ── Protected routes — dashboard shell ────────────────────
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <DashboardLayout />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(DashboardPage),
      },

      // New Token flow
      {
        path: 'new-token/profile',
        element: (
          <ProtectedRoute requiredPage={PAGES.NEW_TOKEN.key}>
            {withSuspense(CreateProfilePage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'new-token/photo-capture',
        element: (
          <ProtectedRoute requiredPage={PAGES.NEW_TOKEN.key}>
            {withSuspense(PhotoCapturePage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'new-token/print',
        element: (
          <ProtectedRoute requiredPage={PAGES.NEW_TOKEN.key}>
            {withSuspense(TokenPrintPage)}
          </ProtectedRoute>
        ),
      },

      // Print
      {
        path: 'print',
        element: (
          <ProtectedRoute requiredPage={PAGES.PRINT.key}>
            {withSuspense(PrintPage)}
          </ProtectedRoute>
        ),
      },

      // Access Control — super_admin only
      {
        path: 'access-control',
        element: (
          <ProtectedRoute requiredPage={PAGES.ACCESS_CONTROL.key}>
            {withSuspense(AccessControlPage)}
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Root redirect
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },

  // 404
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])

export const AppRouter = () => <RouterProvider router={router} />
