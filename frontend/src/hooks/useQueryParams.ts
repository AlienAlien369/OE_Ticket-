import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Type-safe URL search params helper */
export const useQueryParams = <T extends Record<string, string | number | boolean | undefined>>() => {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = Object.fromEntries(searchParams.entries()) as Partial<T>

  const setParams = useCallback(
    (updates: Partial<T>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(updates).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            next.delete(key)
          } else {
            next.set(key, String(value))
          }
        })
        return next
      })
    },
    [setSearchParams]
  )

  const clearParams = useCallback(() => setSearchParams({}), [setSearchParams])

  return { params, setParams, clearParams }
}
