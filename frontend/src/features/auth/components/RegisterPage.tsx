import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Loader2, Zap } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '../types/auth.schemas'
import { useRegister } from '../hooks/use-auth'
import { ROUTES } from '@config/index'
import { cn } from '@utils/cn'

export const RegisterPage = memo(() => {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: doRegister, isPending } = useRegister()

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema), mode: 'onChange' })

  const onSubmit = (data: RegisterFormData) =>
    doRegister({
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    })

  const field = (id: keyof RegisterFormData) => ({
    className: cn(
      'w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring transition-all',
      errors[id] ? 'border-destructive' : 'border-input hover:border-muted-foreground/40'
    ),
    ...formRegister(id),
  })

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(234, 89%, 70%) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(280, 80%, 65%) 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md glass-card p-8 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">OE Ticket</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground mb-6">
          Already have one?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-sm font-medium text-foreground">Username</label>
            <input id="username" type="text" placeholder="e.g. john_doe" autoComplete="username" {...field('username')} />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>

          {/* First + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground">First name</label>
              <input id="firstName" type="text" placeholder="John" autoComplete="given-name" {...field('firstName')} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground">Last name</label>
              <input id="lastName" type="text" placeholder="Doe" autoComplete="family-name" {...field('lastName')} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email address</label>
            <input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...field('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters" autoComplete="new-password" {...field('password')} />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">Confirm password</label>
            <input id="confirmPassword" type="password" placeholder="Repeat password"
              autoComplete="new-password" {...field('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={!isPending ? { scale: 1.01 } : {}}
            whileTap={!isPending ? { scale: 0.99 } : {}}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
              'bg-primary text-primary-foreground text-sm font-medium',
              'transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isPending ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 shadow-glow-sm'
            )}
          >
            {isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
              : <>Create account<ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
})
RegisterPage.displayName = 'RegisterPage'
