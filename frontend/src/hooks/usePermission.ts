import { useAuthStore } from '@features/auth/store/auth.store'

/** Page-based permission check hook */
export const usePermission = (pageKey: string) => {
  return useAuthStore((s) => s.canAccessPage(pageKey))
}

export const useIsAdmin = () => {
  return useAuthStore((s) => s.isSuperAdmin())
}

export const useHasRole = (role: string | string[]) => {
  return useAuthStore((s) => s.hasRole(role))
}
