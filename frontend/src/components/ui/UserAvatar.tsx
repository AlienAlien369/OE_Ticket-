import { memo } from 'react'
import { cn } from '@utils/cn'
import type { User } from '@/types/index'

interface UserAvatarProps {
  user?: User | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

const getInitials = (name?: string) =>
  name
    ? name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?'

const colorFromString = (str: string) => {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export const UserAvatar = memo(({ user, size = 'md', className }: UserAvatarProps) => {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={cn('rounded-full object-cover shrink-0', sizeMap[size], className)}
      />
    )
  }

  const initials = getInitials(user?.name)
  const colorClass = colorFromString(user?.name ?? 'default')

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 font-semibold text-white',
        sizeMap[size],
        colorClass,
        className
      )}
      aria-label={user?.name ?? 'User avatar'}
    >
      {initials}
    </div>
  )
})
UserAvatar.displayName = 'UserAvatar'
