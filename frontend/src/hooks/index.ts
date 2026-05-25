// ============================================================
// SHARED CUSTOM HOOKS
// ============================================================

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type RefObject,
  type Dispatch,
  type SetStateAction,
} from 'react'

// ---- useDebounce ----
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// ---- useLocalStorage ----
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch {
        console.warn(`useLocalStorage: failed to set "${key}"`)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    setStoredValue(initialValue)
    window.localStorage.removeItem(key)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

// ---- useMediaQuery ----
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)')

// ---- useOnClickOutside ----
export const useOnClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// ---- useDisclosure (for modals/drawers) ----
export const useDisclosure = (initial = false) => {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((s) => !s), [])

  return { isOpen, open, close, toggle }
}

// ---- usePrevious ----
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>(undefined)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

// ---- useIsFirstRender ----
export const useIsFirstRender = (): boolean => {
  const isFirst = useRef(true)
  if (isFirst.current) {
    isFirst.current = false
    return true
  }
  return false
}

// ---- useInterval ----
export const useInterval = (callback: () => void, delay: number | null): void => {
  const savedCallback = useRef(callback)
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

// ---- usePageTitle ----
export const usePageTitle = (title: string): void => {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — Nexus` : 'Nexus'
    return () => {
      document.title = prev
    }
  }, [title])
}

// ---- usePerformanceMonitor ----
export const usePerformanceMonitor = (label: string) => {
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      if (duration > 100) {
        console.warn(`[Perf] "${label}" took ${duration.toFixed(1)}ms to unmount`)
      }
    }
  }, [label])
}
