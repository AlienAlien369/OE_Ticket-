import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../types/auth.schemas'
import { useForgotPassword } from '../hooks/use-auth'
import { ROUTES } from '@config/index'
import { cn } from '@utils/cn'

export const ForgotPasswordPage = memo(() => {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword()
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })
  const onSubmit = (data: ForgotPasswordFormData) => forgotPassword(data.email)

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(234, 89%, 70%) 0%, transparent 70%)' }} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm glass-card p-8 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-foreground">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We sent password reset instructions to <strong className="text-foreground">{getValues('email')}</strong>
              </p>
              <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Forgot password?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your email and we'll send a reset link.
                </p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">Email address</label>
                  <input id="email" type="email" placeholder="you@company.com" autoComplete="email"
                    className={cn('w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring transition-all',
                      errors.email ? 'border-destructive' : 'border-input')}
                    {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isPending}
                  className={cn('w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
                    'bg-primary text-primary-foreground text-sm font-medium transition-all',
                    isPending ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 shadow-glow-sm')}>
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : 'Send reset link'}
                </button>
              </form>
              <Link to={ROUTES.LOGIN} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
})
ForgotPasswordPage.displayName = 'ForgotPasswordPage'
