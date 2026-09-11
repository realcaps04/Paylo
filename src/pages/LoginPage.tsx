import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, LogoMark } from '@/components/ui'
import { cn } from '@/lib/cn'

function TeamIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="teamGrad" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4d94ff" />
          <stop offset="1" stopColor="#0064f0" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="15" r="5.5" stroke="url(#teamGrad)" strokeWidth="2.4" />
      <circle cx="31.5" cy="16.5" r="4.2" stroke="url(#teamGrad)" strokeWidth="2.2" opacity="0.85" />
      <path
        d="M7.5 34.5c1.6-6 5.4-9 10.5-9s8.9 3 10.5 9"
        stroke="url(#teamGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M26 28.5c1.8-2.8 4.4-4.2 7.6-4.2 3.5 0 6.2 1.8 7.6 5.2"
        stroke="url(#teamGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}

function PaymentsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="payGrad" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5aa0ff" />
          <stop offset="1" stopColor="#0064f0" />
        </linearGradient>
        <linearGradient id="bar1" x1="12" y1="28" x2="12" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8ebeff" />
          <stop offset="1" stopColor="#0064f0" />
        </linearGradient>
        <linearGradient id="bar2" x1="22" y1="18" x2="22" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6aa8ff" />
          <stop offset="1" stopColor="#0064f0" />
        </linearGradient>
        <linearGradient id="bar3" x1="32" y1="12" x2="32" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4d94ff" />
          <stop offset="1" stopColor="#0050c4" />
        </linearGradient>
      </defs>
      <path d="M10 38h28" stroke="url(#payGrad)" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="12" y="28" width="6" height="10" rx="2" fill="url(#bar1)" />
      <rect x="21" y="20" width="6" height="18" rx="2" fill="url(#bar2)" />
      <rect x="30" y="13" width="6" height="25" rx="2" fill="url(#bar3)" />
      <path
        d="M13 24c3-4 7-6 11-5s8 4 11 2"
        stroke="url(#payGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

function WorkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="workGrad" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4d94ff" />
          <stop offset="1" stopColor="#0064f0" />
        </linearGradient>
      </defs>
      <circle cx="15" cy="15" r="5" stroke="url(#workGrad)" strokeWidth="2.4" />
      <circle cx="33" cy="15" r="5" stroke="url(#workGrad)" strokeWidth="2.4" />
      <path
        d="M18.6 18.6 24 24l5.4-5.4"
        stroke="url(#workGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 24 15.5 38.5M24 24l8.5 14.5"
        stroke="url(#workGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M21.5 29.5h5"
        stroke="url(#workGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  )
}

const FEATURE_ICONS = [
  { icon: TeamIcon, key: 'team' },
  { icon: PaymentsIcon, key: 'payments' },
  { icon: WorkIcon, key: 'work' },
] as const


export function LoginPage() {
  const {
    loginWithGoogle,
    loginAsDemo,
    busy,
    loading,
    error,
    clearError,
    googleReady,
  } = useAuth()
  const navigate = useNavigate()
  const [carousel, setCarousel] = useState(0)

  const routeAfterSession = (onboarded: boolean, hasShop: boolean) => {
    if (!onboarded || !hasShop) navigate('/onboarding')
    else navigate('/app')
  }

  const handleGoogle = async (intent: 'login' | 'signup' = 'login') => {
    clearError()
    try {
      const session = await loginWithGoogle({ intent })
      routeAfterSession(session.onboarded, session.shopIds.length > 0)
    } catch {
      // error already set in context
    }
  }

  const handleDemo = async (kind: 'owner' | 'worker' | 'new') => {
    clearError()
    await loginAsDemo(kind)
    navigate(kind === 'new' ? '/onboarding' : '/app')
  }

  const authBusy = busy || loading

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-white">
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
                googleReady
                  ? 'Use Continue with Google to sign in or create your shop. Allow popups if prompted.'
                  : 'Add VITE_GOOGLE_CLIENT_ID to .env and restart the dev server.',
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
            Simple Tools for a <span className="text-[#9ec5ff]">Smarter Business</span>
          </h2>

          <div className="relative mt-10 flex w-full items-end justify-center gap-3.5 px-1">
            {FEATURE_ICONS.map((item, index) => {
              const Icon = item.icon
              const active = index === carousel
              const tilt =
                index === 0 ? (active ? -7 : -9) : index === 2 ? (active ? 7 : 9) : 0
              return (
                <div
                  key={item.key}
                  className="origin-bottom"
                  style={{ transform: `rotate(${tilt}deg)` }}
                >
                  <motion.button
                    type="button"
                    onClick={() => setCarousel(index)}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'relative flex items-center justify-center overflow-hidden rounded-[24px] border border-white/90 bg-white transition-all duration-300',
                      active
                        ? 'z-10 mb-1 h-[96px] w-[100px] shadow-[0_18px_40px_rgba(0,40,120,0.28),inset_0_1px_0_rgba(255,255,255,0.95)]'
                        : 'mb-0 h-[80px] w-[82px] opacity-90 shadow-[0_12px_28px_rgba(0,40,120,0.18)]',
                    )}
                    aria-label={item.key}
                  >
                    <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(0,100,240,0.14),transparent_58%)]" />
                    <span className="pointer-events-none absolute -bottom-7 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-[#0064f0]/15 blur-2xl" />
                    <span
                      className={cn(
                        'relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#eef5ff] via-white to-[#f8fbff] shadow-[0_6px_16px_rgba(0,100,240,0.14)] ring-1 ring-[#0064f0]/12',
                        active ? 'h-[56px] w-[56px]' : 'h-12 w-12',
                      )}
                    >
                      <Icon className={active ? 'h-8 w-8' : 'h-7 w-7'} />
                    </span>
                  </motion.button>
                </div>
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
            <div className="mt-4 whitespace-pre-line rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {!googleReady && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
              Set <code className="font-semibold">VITE_GOOGLE_CLIENT_ID</code> in{' '}
              <code>.env</code> and restart <code>npm run dev</code>.
            </div>
          )}

          <Button
            className="mt-6 h-[54px] w-full justify-between rounded-full bg-[#0064f0] px-3 text-[15px] font-semibold shadow-[0_10px_28px_rgba(0,100,240,0.35)] hover:bg-[#0050c4]"
            size="lg"
            loading={authBusy}
            disabled={!googleReady}
            onClick={() => void handleGoogle('login')}
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

          <p className="mt-7 text-center text-sm text-slate-500">
            New to Paylo?{' '}
            <button
              type="button"
              className="font-semibold text-[#0064f0] hover:underline disabled:opacity-50"
              disabled={!googleReady || authBusy}
              onClick={() => void handleGoogle('signup')}
            >
              Create your shop →
            </button>
          </p>

          <p className="mt-6 text-center text-[12px] text-slate-400">
            Shops grow better with Paylo
          </p>

          <div className="mt-3 flex justify-center gap-3 text-[11px] text-slate-300">
            <button
              type="button"
              onClick={() => void handleDemo('owner')}
              className="hover:text-slate-500"
            >
              Demo Owner
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => void handleDemo('worker')}
              className="hover:text-slate-500"
            >
              Demo Worker
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
