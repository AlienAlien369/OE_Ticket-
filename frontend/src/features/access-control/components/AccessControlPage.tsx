// ============================================================
// ACCESS CONTROL PAGE — super admin role × page permission matrix
// ============================================================

import { memo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Loader2, AlertCircle, Info } from 'lucide-react'
import { usePagePermissionMatrix, useUpsertPagePermission } from '../hooks/use-access-control'
import { cn } from '@utils/cn'

// ── Toggle switch ──────────────────────────────────────────────────────────
const PermissionToggle = memo(
  ({
    enabled,
    disabled,
    onChange,
  }: {
    enabled: boolean
    disabled: boolean
    onChange: (value: boolean) => void
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        enabled ? 'bg-primary' : 'bg-muted',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0',
          'transition-transform duration-200 ease-in-out',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
)
PermissionToggle.displayName = 'PermissionToggle'

// ── Main page ──────────────────────────────────────────────────────────────
export const AccessControlPage = () => {
  const { data: matrix, isLoading, isError, refetch } = usePagePermissionMatrix()
  const { mutate: upsertPermission, isPending: isSaving } = useUpsertPagePermission()

  const isPermissionEnabled = (roleName: string, pageKey: string): boolean => {
    if (!matrix) return false
    return matrix.permissions.some(
      (p) => p.roleName === roleName && p.pageKey === pageKey && p.isEnabled
    )
  }

  const handleToggle = (roleName: string, pageKey: string, pageDisplayName: string, newValue: boolean) => {
    // super_admin cannot have access-control revoked
    if (roleName === 'super_admin' && pageKey === 'access-control' && !newValue) return

    upsertPermission({ roleName, pageKey, pageDisplayName, isEnabled: newValue })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">Failed to load permissions. <button onClick={() => refetch()} className="underline">Retry</button></p>
      </div>
    )
  }

  const roles = matrix?.allRoles ?? []
  const pages = matrix?.allPages ?? []

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Access Control</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage which pages each role can access. Changes take effect at next login.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          <strong>super_admin</strong> always has access to all pages. The Access Control page
          itself cannot be revoked from super_admin.
        </p>
      </div>

      {/* Permission matrix table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3.5 text-left font-semibold text-foreground">Page</th>
                {roles.map((role) => (
                  <th key={role} className="px-5 py-3.5 text-center font-semibold text-foreground min-w-[120px]">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      role === 'super_admin'
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {role}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((page, idx) => (
                <motion.tr
                  key={page.pageKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-foreground">{page.pageDisplayName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">{page.pageKey}</p>
                    </div>
                    {page.isSuperAdminOnly && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <ShieldCheck className="h-3 w-3" />
                        Super admin only
                      </span>
                    )}
                  </td>
                  {roles.map((role) => {
                    const enabled = isPermissionEnabled(role, page.pageKey)
                    const isLocked = role === 'super_admin'
                    return (
                      <td key={role} className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <PermissionToggle
                            enabled={isLocked ? true : enabled}
                            disabled={isLocked || isSaving}
                            onChange={(val) =>
                              handleToggle(role, page.pageKey, page.pageDisplayName, val)
                            }
                          />
                        </div>
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {isSaving && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving changes...
        </p>
      )}
    </div>
  )
}
