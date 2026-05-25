import { useCallback, useEffect, useRef } from 'react'

/** Debounce a callback */
export function useDebounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => fn(...args), delay)
    },
    [fn, delay]
  ) as T
}

/** Log Web Vitals in development */
export const measureWebVitals = () => {
  if (import.meta.env.PROD) return
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(console.log)
    onFCP(console.log)
    onLCP(console.log)
    onTTFB(console.log)
    onINP(console.log)
  })
}

/** Intersection Observer hook for lazy loading */
export const useIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const ref = useRef<Element | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([entry]) => callback(entry), options)
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [callback, options])
  return ref
}
