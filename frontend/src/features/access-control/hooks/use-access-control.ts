import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { accessControlService } from '../services/access-control.service'

const MATRIX_QUERY_KEY = ['access-control', 'matrix'] as const

export const usePagePermissionMatrix = () => {
  return useQuery({
    queryKey: MATRIX_QUERY_KEY,
    queryFn: () => accessControlService.getMatrix(),
    staleTime: 30 * 1000,
  })
}

export const useUpsertPagePermission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: accessControlService.upsertPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATRIX_QUERY_KEY })
      toast.success('Permission updated')
    },
    onError: () => {
      toast.error('Failed to update permission')
    },
  })
}
