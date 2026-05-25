import type React from 'react'
import { cn } from '@utils/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  style?: React.CSSProperties
}

export const Skeleton = ({ className, variant = 'rectangular', style }: SkeletonProps) => (
  <div
    style={style}
    className={cn(
      'skeleton',
      variant === 'circular' && 'rounded-full',
      variant === 'text' && 'rounded h-4',
      variant === 'rectangular' && 'rounded-lg',
      className
    )}
    role="status"
    aria-label="Loading..."
  />
)

export const SkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card p-5 space-y-3">
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-1/3" />
  </div>
)

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    <Skeleton className="h-9 w-full rounded-lg" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full rounded-lg" style={{ opacity: 1 - i * 0.1 }} />
    ))}
  </div>
)

export const SkeletonAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' }[size]
  return <Skeleton className={cn(sizeClass, 'rounded-full')} variant="circular" />
}
