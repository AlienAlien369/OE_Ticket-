import { QueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { QUERY_CONFIG } from '@config/index'
import type { ApiError } from '@/types/index'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_CONFIG.defaultStaleTime,
      gcTime: QUERY_CONFIG.defaultCacheTime,
      retry: (failureCount, error) => {
        const apiError = error as ApiError
        // Don't retry on 4xx client errors
        if (apiError?.statusCode && apiError.statusCode >= 400 && apiError.statusCode < 500) {
          return false
        }
        return failureCount < QUERY_CONFIG.retryCount
      },
      retryDelay: QUERY_CONFIG.retryDelay,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        const apiError = error as ApiError
        // Global mutation error toast (can be overridden per-mutation)
        if (apiError?.message && (apiError.statusCode ?? 0) >= 500) {
          toast.error('A server error occurred. Please try again.')
        }
      },
    },
  },
})
