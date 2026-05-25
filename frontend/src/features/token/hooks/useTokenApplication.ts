// ============================================================
// TOKEN HOOKS — React Query wrappers for token operations
// ============================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tokenService, type NewTokenRequestDto } from '../services/tokenService'

export const TOKEN_QUERY_KEYS = {
  all: ['card-applications'] as const,
  list: (params?: object) => [...TOKEN_QUERY_KEYS.all, 'list', params] as const,
}

/**
 * Mutation hook — POST /api/v1/card-applications/new-token
 */
export const useCreateNewToken = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NewTokenRequestDto) => tokenService.createNewToken(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOKEN_QUERY_KEYS.all })
    },
  })
}

/**
 * Query hook — GET /api/v1/card-applications
 */
export const useCardApplications = (params?: {
  pageNumber?: number
  pageSize?: number
  search?: string
  status?: string
}) =>
  useQuery({
    queryKey: TOKEN_QUERY_KEYS.list(params),
    queryFn: () => tokenService.getCardApplications(params),
  })
