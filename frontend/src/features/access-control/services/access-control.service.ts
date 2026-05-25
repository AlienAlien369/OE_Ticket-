// ============================================================
// ACCESS CONTROL SERVICE — page permission API calls
// ============================================================

import { api } from '@features/auth/services/api-client'
import type { PagePermissionMatrix } from '@/types/index'

interface UpsertPermissionPayload {
  roleName: string
  pageKey: string
  pageDisplayName: string
  isEnabled: boolean
}

interface BackendMatrixResponse {
  success: boolean
  data: PagePermissionMatrix
}

export const accessControlService = {
  getMatrix: async (): Promise<PagePermissionMatrix> => {
    const response = await api.get<BackendMatrixResponse>('/access-control/matrix')
    if (!response.success) throw new Error('Failed to load permissions matrix')
    return response.data
  },

  upsertPermission: async (payload: UpsertPermissionPayload): Promise<void> => {
    const response = await api.put<{ success: boolean; message: string }>(
      '/access-control/permissions',
      payload
    )
    if (!response.success) throw new Error(response.message ?? 'Failed to update permission')
  },
}
