// ============================================================
// CORE TYPES — OE Ticket application
// ============================================================

// ── Roles ──────────────────────────────────────────────────────────────────
// System-defined roles. New roles can be added by super_admin.
export type Role = 'super_admin' | 'default' | string

// ── Page keys — must match backend PageDefinitionDto.pageKey ──────────────
export type PageKey = 'new-token' | 'print' | 'access-control'

// ── User ───────────────────────────────────────────────────────────────────
export interface User {
  id?: string
  username: string
  email: string
  firstName: string
  lastName: string
  /** Derived from firstName + lastName */
  name: string
  avatarUrl?: string
  roles: string[]
  /** Pages the user's roles are permitted to access */
  accessiblePages: string[]
  permissions: string[]
}

export interface AuthTokens {
  accessToken: string
  expiresAt?: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  errors?: string[]
}

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ── Page permission (access control matrix) ────────────────────────────────
export interface PagePermission {
  id: number
  roleId: string
  roleName: string
  pageKey: string
  pageDisplayName: string
  isEnabled: boolean
  assignedOn: string
  assignedBy: string
}

export interface PageDefinition {
  pageKey: string
  pageDisplayName: string
  isSuperAdminOnly: boolean
}

export interface PagePermissionMatrix {
  allRoles: string[]
  allPages: PageDefinition[]
  permissions: PagePermission[]
}

export interface QueryParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: string | number | boolean | undefined
}

export type ThemeMode = 'light' | 'dark' | 'system'
export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavItem[]
  requiredPage?: PageKey
  roles?: Role[]
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
}

// Legacy permission type alias (kept for backward compat with existing components)
export type Permission = string
