import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bolt,
  FileText,
  HelpCircle,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, LogoMark } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

function GoogleGlyph() {
  return (
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
  )
}

const FEATURES = [
  { icon: BarChart3, label: 'Track Payments' },
  { icon: Users, label: 'Manage Team' },
  { icon: FileText, label: 'Record Transactions' },
] as const

const TRUST = [
  { icon: ShieldCheck, label: 'Secure & Reliable' },
  { icon: Bolt, label: 'Fast & Simple' },
  { icon: Users, label: 'Built for Shop Owners' },
] as const

function PhonePreview() {
  const rows = [
    { title: 'Order Payment', status: 'Paid', tone: 'paid' as const },
    { title: 'Advance Payment', status: 'Paid', tone: 'paid' as const },
    { title: 'Balance Payment', status: 'Pending', tone: 'pending' as const },
  ]

  return (
    <div className="relative mx-auto mt-5 h-[210px] w-full max-w-[340px]">
      {/* Left chart float */}
      <motion.div
        initial={{ opacity: 0, x: -12, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.25, duration: 0.45 }}
        className="absolute left-0 top-10 z-20 flex h-[72px] w-[72px] items-end justify-center gap-1 rounded-2xl bg-white/95 px-2.5 pb-2.5 pt-3 shadow-[0_12px_28px_rgba(0,40,120,0.22)]"
      >
        <span className="h-5 w-2.5 rounded-sm bg-[#8ec5ff]" />
        <span className="h-8 w-2.5 rounded-sm bg-[#4d94ff]" />
        <span className="h-11 w-2.5 rounded-sm bg-[#0064f0]" />
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0064f0] text-white shadow-md">
          <ArrowRight className="h-3.5 w-3.5 -rotate-45" strokeWidth={2.75} />
        </span>
      </motion.div>

      {/* Phone */}
      <motion.div
        initial={{ opacity: 0, y: 18, rotate: 4 }}
        animate={{ opacity: 1, y: 0, rotate: 7 }}
        transition={{ delay: 0.12, type: 'spring', stiffness: 180, damping: 20 }}
        className="absolute left-1/2 top-2 z-10 w-[168px] -translate-x-[46%] overflow-hidden rounded-[28px] border-[5px] border-[#0b1f4d]/90 bg-white shadow-[0_24px_50px_rgba(0,30,90,0.35)]"
      >
        <div className="flex items-center gap-1.5 border-b border-slate-100 bg-[#f8fbff] px-3 py-2.5">
          <img src="/paylo_applogo.png" alt="" className="h-5 w-5 object-contain" />
          <span className="text-[11px] font-bold tracking-tight text-[#0f172a]">Paylo</span>
        </div>
        <div className="space-y-2 bg-white px-2.5 py-2.5">
          {rows.map((row) => (
            <div
              key={row.title}
              className="flex items-center justify-between rounded-xl bg-[#f4f8ff] px-2.5 py-2"
            >
              <div>
                <p className="text-[10px] font-semibold text-slate-800">{row.title}</p>
                <p className="text-[8px] text-slate-400">Today</p>
              </div>
              <span
                className={
                  row.tone === 'paid'
                    ? 'rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-700'
                    : 'rounded-full bg-sky-100 px-1.5 py-0.5 text-[8px] font-semibold text-sky-700'
                }
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Receipt float */}
      <motion.div
        initial={{ opacity: 0, x: 14, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="absolute right-1 top-8 z-20 flex h-[78px] w-[58px] flex-col gap-1.5 rounded-xl bg-white px-2.5 py-3 shadow-[0_12px_28px_rgba(0,40,120,0.22)]"
      >
        <span className="h-1.5 w-full rounded-full bg-slate-200" />
        <span className="h-1.5 w-[80%] rounded-full bg-slate-200" />
        <span className="h-1.5 w-[65%] rounded-full bg-slate-200" />
        <span className="mt-auto h-2 w-full rounded-full bg-[#0064f0]/80" />
      </motion.div>

      {/* Script slogan */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="absolute bottom-1 right-0 z-20 max-w-[132px] text-right font-[Caveat,cursive] text-[22px] font-bold leading-[1.05] text-white drop-shadow-[0_2px_8px_rgba(0,40,100,0.35)]"
      >
        Smarter Shops
        <br />
        Brighter Tomorrows
        <span className="mt-0.5 block text-[18px] font-normal leading-none opacity-80">
          ~~~
        </span>
      </motion.p>
    </div>
  )
}

export function LoginPage() {
  const { loginWithGoogle, loginAsDemo, busy, loading, error, clearError, googleReady } =
    useAuth()
  const navigate = useNavigate()

  const routeAfterSession = (onboarded: boolean, hasShop: boolean) => {
    if (!onboarded || !hasShop) navigate('/onboarding')
    else navigate('/app')
  }

  const handleGoogle = async () => {
    clearError()
    try {
      const session = await loginWithGoogle({ intent: 'login' })
      routeAfterSession(session.onboarded, session.shopIds.length > 0)
    } catch {
      // error shown via context
    }
  }

  const handleDemo = async (kind: 'owner' | 'worker') => {
    clearError()
    await loginAsDemo(kind)
    navigate('/app')
  }

  const authBusy = busy || loading

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#0064f0]">
      {/* Hero */}
      <section className="relative flex flex-1 flex-col overflow-hidden bg-[linear-gradient(165deg,#2b8cff_0%,#0064f0_48%,#0052d6_100%)] px-5 pb-8 pt-safe pt-4 text-white sm:px-8">
        <div className="pointer-events-none absolute -left-28 top-16 h-80 w-80 rounded-full bg-[#7ec8ff]/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-40 left-1/2 h-56 w-[120%] -translate-x-1/2 rounded-[100%] bg-[#4aa7ff]/25 blur-2xl" />
        <svg
          className="pointer-events-none absolute -bottom-6 left-0 right-0 h-40 w-full opacity-40"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="rgba(255,255,255,0.12)"
            d="M0,120 C280,40 480,180 720,110 C980,40 1200,150 1440,80 L1440,200 L0,200 Z"
          />
          <path
            fill="rgba(255,255,255,0.08)"
            d="M0,150 C320,90 560,190 820,140 C1080,90 1260,170 1440,130 L1440,200 L0,200 Z"
          />
        </svg>

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col">
          <div className="flex justify-end">
            <a
              href="mailto:support@paylo.app?subject=Paylo%20Help"
              className="inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[12px] font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              Need Help?
              <HelpCircle className="h-4 w-4" strokeWidth={2} />
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-2 flex flex-col items-center text-center"
          >
            <LogoMark
              size="xl"
              className="h-[78px] w-[78px] drop-shadow-[0_16px_36px_rgba(0,20,80,0.4)]"
            />
            <h1 className="mt-3 font-display text-[34px] font-extrabold tracking-tight">
              Paylo
            </h1>
            <p className="mt-1 text-[13px] font-medium text-white/80">
              Manage Payments. Grow Your Shop.
            </p>
            <h2 className="mt-5 max-w-[300px] font-display text-[26px] font-bold leading-[1.2] tracking-tight sm:text-[28px]">
              Everything Your Shop Needs In One Place
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="mt-5 grid grid-cols-3 gap-2.5"
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-[18px] border border-white/25 bg-white/15 px-2 py-3.5 shadow-[0_8px_24px_rgba(0,30,90,0.12)] backdrop-blur-md"
              >
                <Icon className="h-6 w-6 text-white" strokeWidth={2.1} />
                <span className="text-center text-[10px] font-semibold leading-tight text-white">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          <PhonePreview />
        </div>
      </section>

      {/* Bottom CTA sheet */}
      <section className="relative z-20 -mt-1 rounded-t-[32px] bg-white px-5 pb-safe pb-6 pt-6 shadow-[0_-12px_40px_rgba(0,40,120,0.12)] sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="mx-auto w-full max-w-md"
        >
          {error && (
            <div className="mb-3 whitespace-pre-line rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {!googleReady && (
            <div className="mb-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
              Set <code className="font-semibold">VITE_GOOGLE_CLIENT_ID</code> in{' '}
              <code>.env</code> and restart the app.
            </div>
          )}

          <Button
            className="h-[56px] w-full justify-between rounded-[18px] bg-[#0064f0] px-3.5 text-[15px] font-semibold shadow-[0_14px_32px_rgba(0,100,240,0.38)] hover:bg-[#0056d6]"
            size="lg"
            loading={authBusy}
            disabled={!googleReady}
            onClick={() => void handleGoogle()}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                <GoogleGlyph />
              </span>
              Continue with Google
            </span>
            <ArrowRight className="mr-1 h-5 w-5" strokeWidth={2.25} />
          </Button>

          <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200">
            {TRUST.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 px-2 text-center">
                <Icon className="h-4 w-4 text-[#0064f0]" strokeWidth={2.25} />
                <span className="text-[10px] font-medium leading-snug text-slate-500">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-[12px] font-medium text-slate-400">
            Work Today. Grow Tomorrow.
          </p>

          <div className="mt-3 flex justify-center gap-3 text-[10px] text-slate-300">
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
