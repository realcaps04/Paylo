import { Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Headphones,
  Loader2,
  Store,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LogoMark } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
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
  { icon: CreditCard, top: 'Accept', bottom: 'Payments' },
  { icon: BarChart3, top: 'Track', bottom: 'Your Sales' },
  { icon: Store, top: 'Grow', bottom: 'Your Shop' },
] as const

/** Shop + payments-chart scene, drawn to match the brand illustration. */
function ShopScene({ className }: { className?: string }) {
  const scallops = Array.from({ length: 6 }, (_, i) => i)

  return (
    <svg viewBox="0 0 340 236" className={className} aria-hidden>
      <defs>
        <linearGradient id="ps-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eaf1fd" />
        </linearGradient>
        <linearGradient id="ps-roof" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dfe9fb" />
        </linearGradient>
        <linearGradient id="ps-awning" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f8bff" />
          <stop offset="100%" stopColor="#0058de" />
        </linearGradient>
        <linearGradient id="ps-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8ec3ff" />
          <stop offset="100%" stopColor="#0064f0" />
        </linearGradient>
        <linearGradient id="ps-leaf" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f9c5c" />
          <stop offset="100%" stopColor="#4cc07c" />
        </linearGradient>
        <linearGradient id="ps-door" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2b3a58" />
          <stop offset="100%" stopColor="#1b2740" />
        </linearGradient>
        <clipPath id="ps-awning-clip">
          <path
            d={`M 90 76 H 254 V 100 ${scallops
              .map(() => 'q -13.67 13 -27.33 0')
              .join(' ')} Z`}
          />
        </clipPath>
      </defs>

      {/* Payments card behind the shop */}
      <g transform="rotate(-7 256 72)">
        <rect x="192" y="16" width="126" height="112" rx="15" fill="#ffffff" />
        <rect
          x="192"
          y="16"
          width="126"
          height="112"
          rx="15"
          fill="none"
          stroke="#dce8fd"
          strokeWidth="1.5"
        />
        <text
          x="208"
          y="42"
          fill="#7c8ba5"
          fontSize="12"
          fontWeight="600"
          fontFamily="inherit"
        >
          Payments
        </text>
        <rect x="240" y="86" width="14" height="22" rx="4" fill="url(#ps-bar)" opacity="0.5" />
        <rect x="258" y="74" width="14" height="34" rx="4" fill="url(#ps-bar)" opacity="0.7" />
        <rect x="276" y="62" width="14" height="46" rx="4" fill="url(#ps-bar)" opacity="0.88" />
        <rect x="294" y="48" width="14" height="60" rx="4" fill="url(#ps-bar)" />
        <path
          d="M236 100 C 262 96 276 74 302 48"
          fill="none"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M236 100 C 262 96 276 74 302 48"
          fill="none"
          stroke="#0064f0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M289 46 L 305 45 L 302 60"
          fill="none"
          stroke="#0064f0"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Ground shadow + plinth */}
      <ellipse cx="168" cy="212" rx="104" ry="11" fill="#0064f0" opacity="0.09" />
      <rect x="76" y="196" width="188" height="16" rx="8" fill="#e2ebf9" />
      <rect x="80" y="194" width="180" height="7" rx="3.5" fill="#f2f7ff" />

      {/* Shop body */}
      <rect x="96" y="102" width="150" height="96" rx="5" fill="url(#ps-body)" />
      <rect x="232" y="102" width="14" height="96" fill="#e6eefc" opacity="0.55" />

      {/* Roof slab */}
      <rect x="84" y="62" width="176" height="15" rx="7.5" fill="url(#ps-roof)" />
      <rect x="88" y="62" width="168" height="6" rx="3" fill="#ffffff" />

      {/* Striped awning with scalloped hem */}
      <g clipPath="url(#ps-awning-clip)">
        {scallops.map((i) => (
          <rect
            key={i}
            x={90 + i * 27.34}
            y={76}
            width={27.4}
            height={36}
            fill={i % 2 === 0 ? 'url(#ps-awning)' : '#ffffff'}
          />
        ))}
      </g>
      <path
        d={`M 90 76 H 254 V 100 ${scallops.map(() => 'q -13.67 13 -27.33 0').join(' ')} Z`}
        fill="none"
        stroke="#cfe0fb"
        strokeWidth="1.2"
      />

      {/* Door */}
      <rect x="142" y="136" width="38" height="62" rx="5" fill="url(#ps-door)" />
      <rect x="147" y="141" width="10" height="52" rx="4" fill="#ffffff" opacity="0.07" />
      <circle cx="174" cy="168" r="2.1" fill="#9db2d4" />
      <rect x="137" y="194" width="48" height="7" rx="3.5" fill="#dae4f5" />

      {/* Window */}
      <rect x="196" y="134" width="40" height="34" rx="6" fill="#c2dcff" />
      <rect
        x="196"
        y="134"
        width="40"
        height="34"
        rx="6"
        fill="none"
        stroke="#9ac6ff"
        strokeWidth="1.6"
      />
      <path d="M216 134 V168 M196 151 H236" stroke="#ffffff" strokeWidth="3" />

      {/* Potted plant */}
      <path
        d="M120 174 C 111 160 112 145 121 134 C 129 146 128 162 120 174 Z"
        fill="url(#ps-leaf)"
      />
      <path
        d="M119 175 C 108 168 101 155 103 143 C 114 149 121 163 119 175 Z"
        fill="url(#ps-leaf)"
        opacity="0.88"
      />
      <path
        d="M121 175 C 132 169 139 157 137 145 C 126 151 119 163 121 175 Z"
        fill="url(#ps-leaf)"
        opacity="0.72"
      />
      <path d="M108 176 H134 L130 198 H112 Z" fill="#dee6f4" />
      <rect x="105" y="171" width="32" height="8" rx="4" fill="#eef3fc" />
    </svg>
  )
}

export function LoginPage() {
  const { loginWithGoogle, loginAsDemo, busy, loading, error, clearError, googleReady } =
    useAuth()
  const navigate = useNavigate()
  const authBusy = busy || loading

  const handleGoogle = async () => {
    clearError()
    try {
      const session = await loginWithGoogle({ intent: 'login' })
      if (!session.onboarded || session.shopIds.length === 0) navigate('/onboarding')
      else navigate('/app')
    } catch {
      // surfaced through auth context
    }
  }

  const handleDemo = async (kind: 'owner' | 'worker') => {
    clearError()
    await loginAsDemo(kind)
    navigate('/app')
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#fcfdff]">
      {/* Soft brand background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-24 h-80 w-80 rounded-full bg-[#e4efff] blur-[64px]" />
        <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-[#edf4ff] blur-[52px]" />
        <div className="absolute -right-32 top-[36%] h-[400px] w-[400px] rounded-full bg-[#eef5ff] blur-[56px]" />
        <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#e2edff] blur-[60px]" />
        <div className="absolute bottom-16 -left-20 h-44 w-44 rounded-full bg-[#eff5ff] blur-[50px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
        {/* Need help */}
        <div className="flex justify-end">
          <a
            href="mailto:support@paylo.app?subject=Paylo%20Help"
            className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-[13px] font-medium text-slate-600 transition hover:text-[#0064f0]"
          >
            <Headphones className="h-[18px] w-[18px] text-[#3d5675]" strokeWidth={2.1} />
            Need Help?
          </a>
        </div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mt-3 flex flex-col items-center"
        >
          <LogoMark size="2xl" className="drop-shadow-[0_18px_36px_rgba(0,86,214,0.22)]" />
          <div className="mt-4 flex items-baseline justify-center">
            <img
              src="/paylo-p-glyph.png"
              alt=""
              aria-hidden
              className="h-[52px] w-auto translate-y-[10px] select-none"
            />
            <span className="font-display text-[46px] font-extrabold leading-none tracking-[-0.03em] text-[#0f1a33]">
              aylo
            </span>
          </div>
          <p className="mt-3 text-[15px] font-medium text-slate-500">
            Work Today. Grow Tomorrow.
          </p>
        </motion.div>

        {/* Value proposition + illustration */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' }}
          className="mt-8 flex items-center gap-1"
        >
          <div className="w-[53%] shrink-0">
            <h1 className="font-display text-[28px] font-extrabold leading-[1.14] tracking-[-0.025em] text-[#0f1a33]">
              Smarter Payments for{' '}
              <span className="text-[#0064f0]">Growing Shops</span>
            </h1>
            <p className="mt-4 text-[14px] leading-[1.6] text-slate-500">
              Accept payments, track sales and manage your shop — all in one simple app.
            </p>
          </div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="-mr-6 w-[47%] min-w-0"
          >
            <ShopScene className="h-auto w-full" />
          </motion.div>
        </motion.div>

        {/* Feature strip */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45, ease: 'easeOut' }}
          className="mt-8 flex items-start"
        >
          {FEATURES.map(({ icon: Icon, top, bottom }, index) => (
            <Fragment key={bottom}>
              {index > 0 && <div className="mt-3 h-14 w-px shrink-0 bg-slate-200" />}
              <div className="flex flex-1 flex-col items-center gap-2.5 px-1 text-center">
                <span className="flex h-[54px] w-[54px] items-center justify-center rounded-[17px] bg-[#e7f0ff] shadow-[0_6px_18px_rgba(0,100,240,0.10)]">
                  <Icon className="h-[26px] w-[26px] text-[#0064f0]" strokeWidth={2.1} />
                </span>
                <span className="text-[12.5px] font-medium leading-[1.35] text-slate-600">
                  {top}
                  <br />
                  {bottom}
                </span>
              </div>
            </Fragment>
          ))}
        </motion.div>

        {/* Sign in */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.45, ease: 'easeOut' }}
          className="mt-auto pt-9"
        >
          {error && (
            <div className="mb-4 whitespace-pre-line rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-center text-[13px] leading-relaxed text-red-700">
              {error}
            </div>
          )}

          {!googleReady && (
            <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-center text-[12px] text-amber-800">
              Set <code className="font-semibold">VITE_GOOGLE_CLIENT_ID</code> in{' '}
              <code>.env</code> and restart the app.
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleGoogle()}
            disabled={!googleReady || authBusy}
            className={cn(
              'grid h-[68px] w-full grid-cols-[30px_1fr_30px] items-center gap-3 rounded-full bg-white px-[22px]',
              'ring-1 ring-slate-100/90 shadow-[0_16px_40px_rgba(18,50,110,0.13)] transition',
              'hover:shadow-[0_18px_46px_rgba(18,50,110,0.2)] active:scale-[0.99]',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <GoogleGlyph className="h-[30px] w-[30px]" />
            <span className="whitespace-nowrap text-center font-display text-[16.5px] font-bold tracking-[-0.01em] text-[#0f1a33]">
              {authBusy ? 'Signing you in…' : 'Continue with Google'}
            </span>
            <span className="flex items-center justify-end text-[#0f1a33]">
              {authBusy ? (
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.4} />
              ) : (
                <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2.3} />
              )}
            </span>
          </button>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11.5px] font-medium text-slate-400">
              Trusted by thousands of shop owners
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="mt-3 flex justify-center gap-3 text-[10px] text-slate-300">
            <button
              type="button"
              onClick={() => void handleDemo('owner')}
              className="transition hover:text-slate-500"
            >
              Demo Owner
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => void handleDemo('worker')}
              className="transition hover:text-slate-500"
            >
              Demo Worker
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
