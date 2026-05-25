import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary"
      >
        <Zap className="h-6 w-6 text-primary-foreground" fill="currentColor" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  </div>
)

export const InlineLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="h-5 w-5 rounded-full border-2 border-muted border-t-primary"
    />
    <span className="text-sm">{message}</span>
  </div>
)
