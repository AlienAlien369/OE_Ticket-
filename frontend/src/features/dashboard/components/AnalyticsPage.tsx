import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Users, Globe } from 'lucide-react'
import { Skeleton } from '@components/ui/Skeleton'

export const AnalyticsPage = () => (
  <div className="p-4 lg:p-6 space-y-6">
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
      <p className="mt-1 text-sm text-muted-foreground">Deep insights into your platform performance.</p>
    </motion.div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[
        { label: 'Page Views', value: '2.4M', icon: Globe, change: '+18%' },
        { label: 'Unique Visitors', value: '184K', icon: Users, change: '+9%' },
        { label: 'Bounce Rate', value: '24.6%', icon: TrendingUp, change: '-2.1%' },
        { label: 'Avg. Session', value: '4m 12s', icon: BarChart2, change: '+0.8%' },
      ].map((item, i) => (
        <motion.div key={item.label}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-xl border border-border bg-card p-5 card-hover">
          <item.icon className="h-5 w-5 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{item.value}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{item.change}</p>
        </motion.div>
      ))}
    </div>
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Traffic Overview</h3>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded-lg" style={{ width: `${100 - i * 12}%`, opacity: 1 - i * 0.12 }} />
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground text-center">Connect your analytics provider to see real data.</p>
    </div>
  </div>
)
