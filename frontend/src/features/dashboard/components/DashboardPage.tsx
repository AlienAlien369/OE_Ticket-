// ============================================================
// DASHBOARD PAGE — metrics grid, charts, activity feed
// Features: skeleton loading, animated counters, recharts
// ============================================================

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Zap } from 'lucide-react'
import { useAuthStore } from '@features/auth/store/auth.store'
import { Skeleton } from '@components/ui/Skeleton'
import { cn } from '@utils/cn'

// ---- Mock data (replace with real React Query calls) ----
const REVENUE_DATA = [
  { month: 'Jan', revenue: 42000, mrr: 38000 },
  { month: 'Feb', revenue: 48000, mrr: 42000 },
  { month: 'Mar', revenue: 55000, mrr: 49000 },
  { month: 'Apr', revenue: 51000, mrr: 47000 },
  { month: 'May', revenue: 62000, mrr: 57000 },
  { month: 'Jun', revenue: 78000, mrr: 71000 },
  { month: 'Jul', revenue: 85000, mrr: 79000 },
]

const CONVERSION_DATA = [
  { day: 'Mon', conversions: 24 },
  { day: 'Tue', conversions: 31 },
  { day: 'Wed', conversions: 28 },
  { day: 'Thu', conversions: 42 },
  { day: 'Fri', conversions: 38 },
  { day: 'Sat', conversions: 19 },
  { day: 'Sun', conversions: 15 },
]

const RECENT_ACTIVITY = [
  { id: '1', user: 'Priya Sharma', action: 'Created a new workspace', time: '2m ago', avatar: 'PS' },
  { id: '2', user: 'Alex Thompson', action: 'Upgraded to Pro plan', time: '14m ago', avatar: 'AT' },
  { id: '3', user: 'Maria Garcia', action: 'Invited 3 team members', time: '1h ago', avatar: 'MG' },
  { id: '4', user: 'James Liu', action: 'Published integration docs', time: '3h ago', avatar: 'JL' },
  { id: '5', user: 'Sarah Kim', action: 'Resolved support ticket #482', time: '5h ago', avatar: 'SK' },
]

// ---- Metric card ----
interface MetricCardProps {
  label: string
  value: string
  change: number
  icon: React.ComponentType<{ className?: string | undefined }>
  color: string
  isLoading?: boolean
}

const MetricCard = memo(
  ({ label, value, change, icon: Icon, color, isLoading }: MetricCardProps) => {
    const isPositive = change >= 0

    if (isLoading) {
      return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative overflow-hidden rounded-xl border border-border bg-card p-5',
          'hover:shadow-md transition-shadow duration-200 card-hover'
        )}
      >
        {/* Icon background */}
        <div
          className={cn(
            'absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg opacity-10',
            color
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <div className="mt-2 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </motion.div>
    )
  }
)
MetricCard.displayName = 'MetricCard'

// ---- Activity item ----
const ActivityItem = memo(
  ({ item, index }: { item: (typeof RECENT_ACTIVITY)[0]; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 py-3 border-b border-border last:border-0"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
        {item.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.user}</p>
        <p className="text-xs text-muted-foreground truncate">{item.action}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
    </motion.div>
  )
)
ActivityItem.displayName = 'ActivityItem'

// ---- Custom chart tooltip ----
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null

  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg border border-border">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          {p.name}: <span className="text-foreground font-medium">${p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

// ============================================================
// DASHBOARD PAGE
// ============================================================
export const DashboardPage = () => {
  const { user } = useAuthStore()
  const isLoading = false // Replace with actual loading state

  const metrics = useMemo(
    () => [
      {
        label: 'Monthly Revenue',
        value: '$85,420',
        change: 12.5,
        icon: DollarSign,
        color: 'bg-emerald-500',
      },
      {
        label: 'Active Users',
        value: '12,847',
        change: 8.2,
        icon: Users,
        color: 'bg-blue-500',
      },
      {
        label: 'Conversion Rate',
        value: '4.6%',
        change: -1.3,
        icon: Activity,
        color: 'bg-violet-500',
      },
      {
        label: 'Avg. Session',
        value: '6m 42s',
        change: 3.1,
        icon: Zap,
        color: 'bg-amber-500',
      },
    ],
    []
  )

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">All systems operational</span>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <motion.div key={metric.label} style={{ animationDelay: `${i * 0.05}s` }}>
            <MetricCard {...metric} isLoading={isLoading} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue and MRR</p>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
              +12.5% MoM
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(234, 89%, 60%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(234, 89%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280, 80%, 65%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(280, 80%, 65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="hsl(234, 89%, 60%)"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
              <Area
                type="monotone"
                dataKey="mrr"
                name="MRR"
                stroke="hsl(280, 80%, 65%)"
                strokeWidth={2}
                fill="url(#mrrGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Conversions Bar Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground">Weekly Conversions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">This week vs average</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CONVERSION_DATA} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg border border-border">
                      <p className="font-medium">{label}</p>
                      <p className="text-muted-foreground">
                        Conversions:{' '}
                        <span className="text-foreground font-medium">{payload[0]?.value}</span>
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="conversions"
                fill="hsl(234, 89%, 60%)"
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </button>
        </div>
        <div className="divide-y divide-border">
          {RECENT_ACTIVITY.map((item, i) => (
            <ActivityItem key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
