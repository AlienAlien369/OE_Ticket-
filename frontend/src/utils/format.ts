import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (date: string | Date, pattern = 'MMM d, yyyy') =>
  format(typeof date === 'string' ? parseISO(date) : date, pattern)

export const formatRelativeTime = (date: string | Date) =>
  formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true })

export const formatCurrency = (value: number, currency = 'USD', locale = 'en-US') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)

export const formatNumber = (value: number, locale = 'en-US') =>
  new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const truncate = (str: string, length: number) =>
  str.length > length ? `${str.slice(0, length)}...` : str

export const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
