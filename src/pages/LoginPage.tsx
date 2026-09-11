import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Mail, Scissors, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Field, Input, LogoMark } from '@/components/ui'

const FEATURE_ICONS = [
  { icon: Users, key: 'team' },
  { icon: BarChart3, key: 'payments' },
  { icon: Scissors, key: 'work' },
]

export function LoginPage() {
  const { loginWithGoogle, loginWithEmail, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [emailMode, setEmailMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [carousel, setCarousel] = useState(0)

  const goAfterAuth = (kind: 'owner' | 'worker' | 'new') => {
    navigate(kind === 'new' ? '/onboarding' : '/app')
  }

  const handleGoogle = async (kind: 'owner' | 'worker' | 'new' = 'owner') => {
    clearError()
    await loginWithGoogle(kind as never)
    goAfterAuth(kind)
  }

  const handleEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    await loginWithEmail(email, password)
    navigate('/app')
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-white">
      {/* Blue hero */}
      <section className="relative flex flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,#2f78ff_0%,#0064f0_48%,#0050c4_100%)] px-5 pb-28 pt-safe pt-4 text-white sm:px-8">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute left-1/2 top-40 h-48 w-48 -translate-x-1/2 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute right-8 top-52 h-28 w-28 rounded-full border border-white/10" />

        <div className="relative z-10 flex items-center justify-end">
          <button
            type="button"
            className="rounded-full px-2 py-1 text-sm font-medium text-white/90 hover:bg-white/10"
            onClick={() =>
              window.alert(
                'Need help? Email support@paylo.app or use Demo Owner / Demo Worker below to explore.',
              )
            }
          >
            Help?
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 mx-auto mt-6 flex w-full max-w-md flex-1 flex-col items-center text-center"
        >
          <LogoMark
            size="xl"
            className="h-[76px] w-[76px] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          />
          <h1 className="mt-4 font-display text-[34px] font-extrabold tracking-tight">Paylo</h1>
          <p className="mt-2 text-[15px] font-medium text-white/85">
            Manage Your Shop, Effortlessly
          </p>
          <h2 className="mt-5 max-w-[280px] font-display text-[26px] font-bold leading-[1.2] tracking-tight sm:text-[28px]">
            Simple Tools for a{' '}
            <span className="text-[#9ec5ff]">Smarter Business</span>
          </h2>

          {/* Icon cards — labels intentionally omitted */}
          <div className="relative mt-10 flex w-full items-end justify-center gap-3 px-1">
            {FEATURE_ICONS.map((item, index) => {
              const Icon = item.icon
              const active = index === carousel
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCarousel(index)}
                  className={
                    active
                      ? 'z-10 mb-1 flex h-[88px] w-[92px] items-center justify-center rounded-[22px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition'
                      : 'mb-0 flex h-[76px] w-[78px] items-center justify-center rounded-[20px] bg-white/95 shadow-[0_10px_28px_rgba(15,23,42,0.12)] opacity-95 transition'
                  }
                  style={
                    index === 0
                      ? { transform: active ? 'rotate(-6deg)' : 'rotate(-8deg)' }
                      : index === 2
                        ? { transform: active ? 'rotate(6deg)' : 'rotate(8deg)' }
                        : undefined
                  }
                  aria-label={item.key}
                >
                  <Icon
                    className={active ? 'h-8 w-8 text-[#0064f0]' : 'h-7 w-7 text-[#0064f0]'}
                    strokeWidth={2}
                  />
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {FEATURE_ICONS.map((item, index) => (
              <button
                key={item.key}
                type="button"
                aria-label={`Slide ${index + 1}`}
                onClick={() => setCarousel(index)}
                className={
                  index === carousel
                    ? 'h-2 w-2 rounded-full bg-white'
                    : 'h-2 w-2 rounded-full bg-white/40'
                }
              />
            ))}
          </div>
        </motion.div>

        {/* Soft wave into white panel */}
        <svg
          className="absolute bottom-0 left-0 right-0 h-16 w-full text-white"
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,64 C180,96 360,16 540,40 C720,64 900,96 1080,56 C1260,16 1380,40 1440,48 L1440,96 L0,96 Z"
          />
        </svg>
      </section>

      {/* Auth panel */}
      <section className="relative z-10 -mt-2 flex flex-col bg-white px-6 pb-safe pb-8 pt-2 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="mx-auto w-full max-w-md"
        >
          <h3 className="text-center font-display text-[22px] font-bold text-ink">Get Started</h3>
          <p className="mx-auto mt-2 max-w-[300px] text-center text-[14px] leading-relaxed text-slate-500">
            Sign in with your Google account to continue and start managing your shop.
          </p>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            className="mt-6 h-[54px] w-full justify-between rounded-full bg-[#0064f0] px-3 text-[15px] font-semibold shadow-[0_10px_28px_rgba(0,100,240,0.35)] hover:bg-[#0050c4]"
            size="lg"
            loading={loading && !emailMode}
            onClick={() => void handleGoogle('owner')}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </span>
              Continue with Google
            </span>
            <span className="mr-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>

          <div className="my-5 flex items-center gap-3 text-[11px] font-semibold tracking-wide text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            OR
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {!emailMode ? (
            <button
              type="button"
              onClick={() => setEmailMode(true)}
              className="flex h-[54px] w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 text-left text-[15px] font-semibold text-ink shadow-sm transition hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-ink" />
                Sign in with Email
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          ) : (
            <form onSubmit={handleEmail} className="space-y-3">
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@shop.com"
                  required
                  className="rounded-full"
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="rounded-full"
                />
              </Field>
              <Button type="submit" className="w-full rounded-full" loading={loading}>
                Sign In
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-slate-500 hover:text-ink"
                onClick={() => setEmailMode(false)}
              >
                Back
              </button>
            </form>
          )}

          <p className="mt-7 text-center text-sm text-slate-500">
            New to Paylo?{' '}
            <button
              type="button"
              className="font-semibold text-[#0064f0] hover:underline"
              onClick={() => void handleGoogle('new')}
            >
              Create your shop →
            </button>
          </p>

          <p className="mt-6 text-center text-[12px] text-slate-400">
            Shops grow better with Paylo
          </p>

          <div className="mt-3 flex justify-center gap-3 text-[11px] text-slate-300">
            <button type="button" onClick={() => void handleGoogle('owner')} className="hover:text-slate-500">
              Demo Owner
            </button>
            <span>·</span>
            <button type="button" onClick={() => void handleGoogle('worker')} className="hover:text-slate-500">
              Demo Worker
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
