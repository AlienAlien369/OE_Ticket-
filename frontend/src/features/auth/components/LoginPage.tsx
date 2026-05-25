// ============================================================
// LOGIN PAGE — production-grade, animated, accessible
// Inspired by: Linear, Vercel, Loom
// ============================================================

import { memo, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Zap } from 'lucide-react'
import { loginSchema, type LoginFormData } from '../types/auth.schemas'
import { useLogin } from '../hooks/use-auth'
import { ROUTES } from '@config/index'
import { cn } from '@utils/cn'

// ---- Animated background orbs ----
const BackgroundOrbs = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    {/* Large gradient blob — top left */}
    <motion.div
      className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
      style={{
        background: 'radial-gradient(circle, hsl(234, 89%, 70%) 0%, transparent 70%)',
      }}
      animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -20, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Medium blob — bottom right */}
    <motion.div
      className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-25 dark:opacity-15"
      style={{
        background: 'radial-gradient(circle, hsl(280, 80%, 65%) 0%, transparent 70%)',
      }}
      animate={{ scale: [1, 1.15, 1], x: [0, -15, 0], y: [0, 15, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    {/* Small accent — center right */}
    <motion.div
      className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full opacity-20 dark:opacity-10"
      style={{
        background: 'radial-gradient(circle, hsl(190, 90%, 60%) 0%, transparent 70%)',
      }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    />
    {/* Grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
      style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  </div>
))
BackgroundOrbs.displayName = 'BackgroundOrbs'

// ---- Social / SSO button ----
const SsoButton = memo(
  ({
    onClick,
    icon,
    label,
  }: {
    onClick: () => void
    icon: React.ReactNode
    label: string
  }) => (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center justify-center gap-2.5 w-full px-4 py-2.5',
        'rounded-lg border border-border bg-background',
        'text-sm font-medium text-foreground',
        'hover:bg-muted transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {icon}
      {label}
    </motion.button>
  )
)
SsoButton.displayName = 'SsoButton'

// ---- Input field ----
interface InputFieldProps {
  id: string
  label: string
  type: string
  placeholder: string
  autoComplete?: string
  error?: string | undefined
  showPasswordToggle?: boolean
  isPasswordVisible?: boolean
  onPasswordToggle?: () => void
  registration: object
}

const InputField = memo(
  ({
    id,
    label,
    type,
    placeholder,
    autoComplete,
    error,
    showPasswordToggle,
    isPasswordVisible,
    onPasswordToggle,
    registration,
  }: InputFieldProps) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPasswordToggle && isPasswordVisible ? 'text' : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg text-sm',
            'bg-background border transition-all duration-150',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
            error
              ? 'border-destructive focus:ring-destructive/30'
              : 'border-input hover:border-muted-foreground/40 focus:border-ring'
          )}
          {...registration}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onPasswordToggle}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
)
InputField.displayName = 'InputField'

// ============================================================
// MAIN LOGIN PAGE COMPONENT
// ============================================================
export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending, error: loginError } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const onSubmit = useCallback(
    (data: LoginFormData) => {
      login({ usernameOrEmail: data.usernameOrEmail, password: data.password })
    },
    [login]
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <BackgroundOrbs />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'relative w-full max-w-md',
          'glass-card p-8',
          'shadow-2xl'
        )}
      >
        {/* Logo / Brand */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Zap className="h-4.5 w-4.5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">OE Ticket</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Sign in to your account
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to={ROUTES.REGISTER}
                  className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
                >
                  Create one free
                </Link>
              </p>
            </div>
          </motion.div>

          {/* SSO Buttons — removed, OE Ticket uses username/password only */}

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-medium px-1">OR</span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>

          {/* Server error */}
          <AnimatePresence>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    {(loginError as { message?: string })?.message ?? 'Invalid credentials. Please try again.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <InputField
              id="usernameOrEmail"
              label="Username or Email"
              type="text"
              placeholder="super_admin or you@example.com"
              autoComplete="username"
              error={errors.usernameOrEmail?.message}
              registration={register('usernameOrEmail')}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={cn(
                    'w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm',
                    'bg-background border transition-all duration-150',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.password
                      ? 'border-destructive focus:ring-destructive/30'
                      : 'border-input hover:border-muted-foreground/40 focus:border-ring'
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {errors.password && (
                  <motion.p
                    id="password-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1.5 text-xs text-destructive"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-input bg-background text-primary cursor-pointer"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isPending || !isValid}
              whileHover={!isPending ? { scale: 1.01 } : {}}
              whileTap={!isPending ? { scale: 0.99 } : {}}
              className={cn(
                'relative w-full flex items-center justify-center gap-2',
                'px-4 py-2.5 rounded-lg',
                'bg-primary text-primary-foreground',
                'text-sm font-medium',
                'transition-all duration-150',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isPending || !isValid
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:opacity-90 shadow-glow-sm hover:shadow-glow'
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Privacy Policy
            </a>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}
