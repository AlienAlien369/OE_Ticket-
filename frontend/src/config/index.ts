// ============================================================
// CONFIG — OE Ticket centralized configuration
// ============================================================

export const APP_CONFIG = {
  name: 'OE Ticket',
  tagline: 'Card Application Management',
  description: 'Enterprise-grade token & card application management system.',
  version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
  environment: import.meta.env.MODE as 'development' | 'staging' | 'production',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  timeout: 30_000,
  retries: 3,
  retryDelay: 1_000,
} as const

export const AUTH_CONFIG = {
  tokenStorageKey: 'oe_ticket_access_token',
  userStorageKey: 'oe_ticket_user',
  tokenRefreshThreshold: 5 * 60 * 1000,
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours (matches JWT ExpiryMinutes: 480)
} as const

export const QUERY_CONFIG = {
  defaultStaleTime: 5 * 60 * 1000,
  defaultCacheTime: 10 * 60 * 1000,
  retryCount: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const

export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const

// ── Roles ─────────────────────────────────────────────────────────────────
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  DEFAULT: 'default',
} as const

// ── Pages catalogue (frontend mirror of backend PageDefinitionDto) ─────────
export const PAGES = {
  NEW_TOKEN: { key: 'new-token', displayName: 'New Token', route: '/dashboard/new-token/profile' },
  PRINT: { key: 'print', displayName: 'Print', route: '/dashboard/print' },
  ACCESS_CONTROL: { key: 'access-control', displayName: 'Access Control', route: '/dashboard/access-control' },
} as const

// ── Routes ────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  CREATE_PROFILE: '/dashboard/new-token/profile',
  PHOTO_CAPTURE: '/dashboard/new-token/photo-capture',
  TOKEN_PRINT: '/dashboard/new-token/print',
  PRINT: '/dashboard/print',
  ACCESS_CONTROL: '/dashboard/access-control',
  NOT_FOUND: '/404',
} as const

// Legacy — kept for backward compat
export const ROLE_PERMISSIONS = {
  super_admin: ['access-control', 'new-token', 'print'],
  default: ['new-token', 'print'],
} as const
