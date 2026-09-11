import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ShieldCheck, Store, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LogoMark } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'

function ProgressDots({ active }: { active: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 4 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-[5px] w-7 rounded-full transition-colors',
            i < active ? 'bg-[#0064f0]' : 'bg-slate-200',
          )}
        />
      ))}
    </div>
  )
}

function OwnerShopArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 168 118" className={className} aria-hidden>
      <defs>
        <linearGradient id="role-awning" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f8bff" />
          <stop offset="100%" stopColor="#0058de" />
        </linearGradient>
        <clipPath id="role-awning-clip">
          <path d="M22 28 H146 V46 q-12.4 10 -24.8 0 q-12.4 10 -24.8 0 q-12.4 10 -24.8 0 q-12.4 10 -24.8 0 q-12.4 10 -24.8 0 Z" />
        </clipPath>
      </defs>
      <ellipse cx="84" cy="108" rx="58" ry="6" fill="#0064f0" opacity="0.08" />
      <rect x="28" y="52" width="112" height="52" rx="4" fill="#f4f8ff" />
      <rect x="22" y="20" width="124" height="10" rx="5" fill="#e8f0fc" />
      <g clipPath="url(#role-awning-clip)">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={22 + i * 24.8}
            y={28}
            width={24.9}
            height={28}
            fill={i % 2 === 0 ? 'url(#role-awning)' : '#ffffff'}
          />
        ))}
      </g>
      <rect x="68" y="64" width="28" height="40" rx="4" fill="#1b2740" />
      <circle cx="90" cy="84" r="1.6" fill="#9db2d4" />
      <rect x="108" y="66" width="22" height="18" rx="3" fill="#c2dcff" />
      <path d="M119 66 V84 M108 75 H130" stroke="#fff" strokeWidth="2" />
      <path
        d="M48 88 C 42 78 43 68 48 60 C 53 68 52 80 48 88 Z"
        fill="#3db56e"
      />
      <path d="M42 88 H54 L52 100 H44 Z" fill="#dfe7f5" />
      <rect x="58" y="12" width="52" height="14" rx="4" fill="#ffffff" stroke="#d7e4fb" />
      <text
        x="84"
        y="22"
        textAnchor="middle"
        fill="#5b6b86"
        fontSize="8"
        fontWeight="700"
        fontFamily="inherit"
      >
        My Shop
      </text>
    </svg>
  )
}

function StaffArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 156 118" className={className} aria-hidden>
      <ellipse cx="78" cy="108" rx="54" ry="6" fill="#0064f0" opacity="0.07" />
      {/* Counter */}
      <rect x="18" y="86" width="120" height="16" rx="5" fill="#1e2a44" />
      <rect x="22" y="82" width="112" height="6" rx="3" fill="#2b3a58" />
      {/* POS */}
      <rect x="108" y="54" width="28" height="30" rx="4" fill="#111827" />
      <rect x="112" y="58" width="20" height="14" rx="2" fill="#93c5fd" />
      <rect x="116" y="76" width="12" height="4" rx="1" fill="#374151" />
      {/* Body / apron */}
      <ellipse cx="72" cy="48" rx="22" ry="26" fill="#111827" />
      <path
        d="M54 48 C 54 70 60 86 72 90 C 84 86 90 70 90 48 Z"
        fill="#0064f0"
      />
      <circle cx="72" cy="70" r="7" fill="#ffffff" opacity="0.95" />
      <text
        x="72"
        y="73.5"
        textAnchor="middle"
        fill="#0064f0"
        fontSize="9"
        fontWeight="800"
        fontFamily="inherit"
      >
        P
      </text>
      {/* Head */}
      <circle cx="72" cy="34" r="16" fill="#f2c4a0" />
      <path
        d="M56 30 C 58 16 86 16 88 30 C 82 22 62 22 56 30 Z"
        fill="#1a1a1a"
      />
      <circle cx="66" cy="35" r="1.6" fill="#2b2b2b" />
      <circle cx="78" cy="35" r="1.6" fill="#2b2b2b" />
      <path
        d="M67 42 Q 72 45 77 42"
        fill="none"
        stroke="#c4845e"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ChooseRolePage() {
  const navigate = useNavigate()
  const { session, chooseRole, logout } = useAuth()

  const pick = (role: 'owner' | 'worker') => {
    chooseRole(role)
    if (role === 'owner') navigate('/onboarding')
    else navigate('/onboarding/join')
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#fcfdff]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-24 h-80 w-80 rounded-full bg-[#e4efff] blur-[64px]" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#e8f1ff] blur-[56px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+0.85rem)]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Back to login"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#0f1a33] transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <ProgressDots active={1} />
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Sign out
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-2.5">
            <LogoMark size="md" className="h-11 w-11" />
            <div className="flex items-end">
              <img
                src="/paylo-p-glyph.png"
                alt=""
                aria-hidden
                className="h-8 w-auto translate-y-[5px] select-none"
              />
              <span className="font-display text-[28px] font-extrabold leading-none tracking-[-0.03em] text-[#0f1a33]">
                aylo
              </span>
            </div>
          </div>
          <p className="mt-2 text-[13px] font-medium text-slate-500">
            Work Today. Grow Tomorrow.
          </p>
          {session?.user.name && (
            <p className="mt-3 text-[12px] text-slate-400">
              Signed in as {session.user.name}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.4 }}
          className="mt-7 text-center"
        >
          <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-[#0f1a33]">
            Choose Your Role
          </h1>
          <p className="mt-2 text-[15px] font-medium text-slate-500">
            Select how you&apos;ll be using Paylo
          </p>
          <p className="mt-1.5 text-[12.5px] text-slate-400">
            You can always change this later.
          </p>
        </motion.div>

        <div className="mt-7 space-y-4">
          {/* Shop Owner */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            onClick={() => pick('owner')}
            className="group relative w-full overflow-hidden rounded-[24px] bg-white p-5 text-left shadow-[0_14px_40px_rgba(18,50,110,0.10)] ring-1 ring-slate-100 transition hover:shadow-[0_18px_46px_rgba(18,50,110,0.16)] active:scale-[0.99]"
          >
            <div className="flex items-start gap-3 pr-14">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#e7f0ff]">
                <Store className="h-5 w-5 text-[#0064f0]" strokeWidth={2.2} />
              </span>
              <div>
                <h2 className="font-display text-[18px] font-bold text-[#0f1a33]">
                  Shop Owner
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                  Manage your shop, accept payments, track sales and grow your business.
                </p>
              </div>
            </div>
            <OwnerShopArt className="mx-auto mt-2 h-[108px] w-auto" />
            <span className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#0064f0] text-white shadow-[0_10px_24px_rgba(0,100,240,0.35)] transition group-hover:scale-105">
              <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
            </span>
          </motion.button>

          {/* Shop Staff */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.4 }}
            onClick={() => pick('worker')}
            className="group relative w-full overflow-hidden rounded-[24px] bg-white p-5 text-left shadow-[0_14px_40px_rgba(18,50,110,0.10)] ring-1 ring-slate-100 transition hover:shadow-[0_18px_46px_rgba(18,50,110,0.16)] active:scale-[0.99]"
          >
            <div className="flex items-start gap-3 pr-14">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#fff1e6]">
                <Users className="h-5 w-5 text-[#e67a2e]" strokeWidth={2.2} />
              </span>
              <div>
                <h2 className="font-display text-[18px] font-bold text-[#0f1a33]">
                  Shop Staff
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                  Help manage sales, create bills and assist in day-to-day operations.
                </p>
              </div>
            </div>
            <StaffArt className="mx-auto mt-1 h-[108px] w-auto" />
            <span className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#eef2f7] text-[#0f1a33] transition group-hover:bg-slate-200 group-hover:scale-105">
              <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
            </span>
          </motion.button>
        </div>

        <div className="mt-auto pt-8">
          <div className="flex items-center justify-center gap-2 text-[12px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
            Secure. Simple. Built for Businesses.
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11.5px] font-medium text-slate-400">
              Same Platform. A Stronger Tomorrow.
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
