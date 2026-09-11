import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, LogoMark } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/cn'
import { normalizeInviteCode } from '@/lib/inviteCode'
import { convexHttp, convexReady } from '@/lib/convex'
import { api } from '../../../convex/_generated/api'
import { mergeCloudShopIntoStore } from '@/lib/restoreSession'
import { uid } from '@/lib/format'

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
  const { store, addWorker, addShop, updateWorker } = useShop()
  const { toast } = useToast()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const join = async () => {
    setError(null)
    const trimmed = normalizeInviteCode(code)
    if (trimmed.length !== 8) {
      setError('Enter the 8-character invite code from your shop owner.')
      return
    }

    setBusy(true)
    await new Promise((r) => setTimeout(r, 150))

    try {
      // 1) Same-device / local store first
      const localInvite = store.workers.find(
        (w) =>
          w.inviteCode &&
          normalizeInviteCode(w.inviteCode) === trimmed &&
          w.role !== 'owner' &&
          w.active,
      )

      if (localInvite) {
        const shop = store.shops.find((s) => s.id === localInvite.shopId)
        if (!shop) {
          setError('This invite is no longer linked to a shop.')
          setBusy(false)
          return
        }
        updateWorker(localInvite.id, {
          userId: session?.user.id,
          name: session?.user.name || localInvite.name,
          email: session?.user.email || localInvite.email,
          phone: session?.user.phone || localInvite.phone,
          inviteStatus: 'joined',
        })
        attachShop(
          shop.id,
          localInvite.role === 'manager' ? 'manager' : 'worker',
          localInvite.id,
        )
        toast(`Joined ${shop.name}`)
        setBusy(false)
        navigate('/app')
        return
      }

      // 2) Cloud invite (other devices)
      if (convexReady && convexHttp && session?.user.email) {
        const claimed = await convexHttp.mutation(api.staffInvites.claim, {
          code: trimmed,
          staffEmail: session.user.email,
          staffName: session.user.name,
        })

        const shopId = claimed.shop ? String(claimed.shop._id) : claimed.shopId
        const shopName = claimed.shop?.shopName ?? claimed.shopName

        if (claimed.shop) {
          mergeCloudShopIntoStore(claimed.shop as Parameters<typeof mergeCloudShopIntoStore>[0], {
            id: session.user.id,
            name: claimed.shop.shopName,
            email: claimed.ownerEmail,
          })
        } else if (!store.shops.some((s) => s.id === shopId)) {
          addShop({
            id: shopId,
            name: shopName,
            categoryId: 'general',
            categoryName: 'Shop',
            ownerName: 'Owner',
            phone: '',
            email: claimed.ownerEmail,
            address: '',
            city: '',
            state: '',
            pinCode: '',
            description: shopName,
            hours: { open: '09:00', close: '20:00', holidays: [] },
            createdAt: new Date().toISOString(),
          })
        }

        const existing = store.workers.find(
          (w) => w.inviteCode && normalizeInviteCode(w.inviteCode) === trimmed,
        )
        const workerId =
          existing?.id ??
          addWorker({
            id: claimed.localWorkerId || uid('w'),
            shopId,
            userId: session.user.id,
            name: session.user.name || claimed.workerName,
            role: claimed.role,
            phone: session.user.phone || claimed.workerPhone || '',
            email: session.user.email || claimed.workerEmail || '',
            employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
            joiningDate: new Date().toISOString().slice(0, 10),
            active: true,
            inviteStatus: 'joined',
            inviteCode: trimmed,
          }).id

        if (existing) {
          updateWorker(existing.id, {
            userId: session.user.id,
            inviteStatus: 'joined',
            name: session.user.name || existing.name,
            email: session.user.email || existing.email,
          })
        }

        attachShop(shopId, claimed.role, workerId)
        toast(`Joined ${shopName}`)
        setBusy(false)
        navigate('/app')
        return
      }

      setError('No staff invite found for that code. Ask your owner for a new code.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not join with that code'
      setError(message)
    } finally {
      setBusy(false)
    }
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
            Staff Login
          </h1>
          <p className="mx-auto mt-2 max-w-[300px] text-center text-[14px] leading-relaxed text-slate-500">
            Enter the 8-character code your shop owner shared with you.
          </p>

          <div className="mt-8 rounded-[22px] bg-white p-5 shadow-[0_14px_40px_rgba(18,50,110,0.10)] ring-1 ring-slate-100">
            <label className="text-[13px] font-semibold text-[#0f1a33]">Staff invite code</label>
            <Input
              className="mt-2 h-12 rounded-xl font-mono text-center text-lg tracking-[0.2em] uppercase"
              placeholder="AB12CD34"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(normalizeInviteCode(e.target.value).slice(0, 8))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void join()
              }}
            />
            {error && (
              <p className="mt-2 text-[12.5px] leading-relaxed text-red-600">{error}</p>
            )}
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
