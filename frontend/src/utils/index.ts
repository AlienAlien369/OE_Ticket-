// ============================================================
// UTILS — formatting, debounce, storage, misc helpers
// ============================================================

import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ---- Formatting ----
export const formatCurrency = (
  value: number,
  currency = 'USD',
  locale = 'en-US'
): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    value
  )

export const formatNumber = (value: number, locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export const formatPercent = (value: number, decimals = 1): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`

export const formatDate = (date: string | Date, pattern = 'MMM d, yyyy'): string =>
  format(typeof date === 'string' ? parseISO(date) : date, pattern)

export const formatRelativeTime = (date: string | Date): string =>
  formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true })

// ---- Debounce ----
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ---- String utils ----
export const truncate = (str: string, length: number): string =>
  str.length > length ? `${str.slice(0, length)}…` : str

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

export const slugify = (str: string): string =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const getInitials = (name: string, maxChars = 2): string =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, maxChars)

// ---- Object utils ----
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> =>
  Object.fromEntries(keys.map((k) => [k, obj[k]])) as Pick<T, K>

// ---- URL utils ----
export const buildQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })
  const str = query.toString()
  return str ? `?${str}` : ''
}

// ---- Async utils ----
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    await sleep(delay)
    return retry(fn, retries - 1, delay * 2)
  }
}

// ---- Storage utils (type-safe wrapper) ----
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : null
    } catch {
      return null
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn('localStorage write failed')
    }
  },
  remove: (key: string): void => {
    localStorage.removeItem(key)
  },
  clear: (): void => {
    localStorage.clear()
  },
}

// ---- Environment ----
export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD
