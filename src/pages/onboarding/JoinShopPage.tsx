import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, LogoMark } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { useToast } from '@/context/ToastContext'
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

export function JoinShopPage() {
  const navigate = useNavigate()
  const { session, attachShop, clearRoleChoice } = useAuth()
  const { store, addWorker, seedDemo } = useShop()
  const { toast } = useToast()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const join = async () => {
    setError(null)
    const trimmed = code.trim().toLowerCase()
    if (!trimmed) {
      setError('Enter the invite code from your shop owner.')
      return
    }

    setBusy(true)
    await new Promise((r) => setTimeout(r, 200))

    let shops = store.shops
    if (!shops.length) {
      seedDemo()
      // seedDemo updates store asynchronously via setState; also check after microtask
      await new Promise((r) => setTimeout(r, 50))
      shops = store.shops.length ? store.shops : shops
    }

    // Prefer current store; if still empty after seed, match known demo ids
    const list = store.shops.length ? store.shops : shops
    const shop =
      list.find((s) => s.id.toLowerCase() === trimmed) ||
      list.find((s) => s.id.toLowerCase().endsWith(trimmed)) ||
      list.find((s) =>
        s.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .includes(trimmed.replace(/\s+/g, '-')),
      )

    // Fallback for demo codes when store just seeded in same tick
    if (!shop && (trimmed === 'shop_main' || trimmed === 'main-salon' || trimmed === 'main salon')) {
      seedDemo()
      const worker = addWorker({
        shopId: 'shop_main',
        userId: session?.user.id,
        name: session?.user.name ?? 'Staff',
        role: 'worker',
        phone: session?.user.phone ?? '',
        email: session?.user.email ?? '',
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        joiningDate: new Date().toISOString().slice(0, 10),
        active: true,
        inviteStatus: 'joined',
      })
      attachShop('shop_main', 'worker', worker.id)
      toast('Joined Main Salon')
      setBusy(false)
      navigate('/app')
      return
    }

    if (!shop) {
      setBusy(false)
      setError('No shop found for that code. Ask your owner for the correct invite.')
      return
    }

    const worker = addWorker({
      shopId: shop.id,
      userId: session?.user.id,
      name: session?.user.name ?? 'Staff',
      role: 'worker',
      phone: session?.user.phone ?? '',
      email: session?.user.email ?? '',
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      joiningDate: new Date().toISOString().slice(0, 10),
      active: true,
      inviteStatus: 'joined',
    })

    attachShop(shop.id, 'worker', worker.id)
    toast(`Joined ${shop.name}`)
    setBusy(false)
    navigate('/app')
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
            aria-label="Back"
            onClick={() => {
              clearRoleChoice()
              navigate('/onboarding/role')
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#0f1a33] transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <ProgressDots active={2} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1e6]">
            <Store className="h-7 w-7 text-[#e67a2e]" strokeWidth={2.1} />
          </div>
          <h1 className="mt-5 text-center font-display text-[26px] font-extrabold tracking-[-0.03em] text-[#0f1a33]">
            Join Your Shop
          </h1>
          <p className="mx-auto mt-2 max-w-[300px] text-center text-[14px] leading-relaxed text-slate-500">
            Ask your shop owner for an invite code, then enter it below to start working in
            Paylo.
          </p>

          <div className="mt-8 rounded-[22px] bg-white p-5 shadow-[0_14px_40px_rgba(18,50,110,0.10)] ring-1 ring-slate-100">
            <label className="text-[13px] font-semibold text-[#0f1a33]">Invite code</label>
            <Input
              className="mt-2 h-12 rounded-xl"
              placeholder="e.g. shop_main or Main Salon"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void join()
              }}
            />
            {error && (
              <p className="mt-2 text-[12.5px] leading-relaxed text-red-600">{error}</p>
            )}
            <p className="mt-3 text-[12px] text-slate-400">
              Demo tip: try{' '}
              <button
                type="button"
                className="font-semibold text-[#0064f0]"
                onClick={() => setCode('shop_main')}
              >
                shop_main
              </button>
            </p>
            <Button
              className="mt-5 h-12 w-full justify-between rounded-full bg-[#0064f0] px-4"
              loading={busy}
              onClick={() => void join()}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <button
            type="button"
            onClick={() => {
              clearRoleChoice()
              navigate('/onboarding/role')
            }}
            className="mt-6 w-full text-center text-[13px] font-medium text-slate-500 hover:text-[#0064f0]"
          >
            Not staff? Choose Shop Owner instead
          </button>
        </motion.div>

        <div className="mt-auto flex justify-center pt-10">
          <LogoMark size="sm" className="opacity-40" />
        </div>
      </div>
    </div>
  )
}
