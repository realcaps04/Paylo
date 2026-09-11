import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { CATEGORY_GROUPS, SHOP_CATEGORIES } from '@/data/categories'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { usePwa } from '@/context/PwaContext'
import { useToast } from '@/context/ToastContext'
import {
  Button,
  Card,
  Field,
  Input,
  Label,
  Logo,
  Select,
  Textarea,
} from '@/components/ui'
import { cn } from '@/lib/cn'
import { uid } from '@/lib/format'
import type { Worker } from '@/types'

const STEPS = [
  { id: 1, label: 'Business' },
  { id: 2, label: 'Category' },
  { id: 3, label: 'Details' },
  { id: 4, label: 'Team' },
  { id: 5, label: 'Finish' },
] as const

const SALON_CATEGORY_IDS = new Set([
  'beauty-parlour',
  'unisex-salon',
  'mens-salon',
  'womens-salon',
  'barber',
  'spa',
  'nail',
  'makeup',
  'skincare',
])

type DraftWorker = {
  key: string
  name: string
  phone: string
  email: string
  role: 'worker' | 'manager'
}

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { session, attachShop, setOnboarded } = useAuth()
  const { addShop, addWorker, addService } = useShop()
  const { setShowInstallHint } = usePwa()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState(session?.user.name ?? '')
  const [categoryId, setCategoryId] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(session?.user.email ?? '')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [description, setDescription] = useState('')
  const [openHour, setOpenHour] = useState('09:00')
  const [closeHour, setCloseHour] = useState('20:00')
  const [workers, setWorkers] = useState<DraftWorker[]>([])
  const [inviteName, setInviteName] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase()
    if (!q) return SHOP_CATEGORIES
    return SHOP_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q),
    )
  }, [categoryQuery])

  const canNext = () => {
    if (step === 1) return shopName.trim().length > 1 && ownerName.trim().length > 1
    if (step === 2) {
      if (showCustom) return customCategory.trim().length > 1
      return !!categoryId
    }
    if (step === 3) return phone.trim().length >= 8 && city.trim().length > 0
    return true
  }

  const addInvite = () => {
    if (!inviteName.trim()) return
    setWorkers((prev) => [
      ...prev,
      {
        key: uid('dw'),
        name: inviteName.trim(),
        phone: invitePhone.trim(),
        email: inviteEmail.trim(),
        role: 'worker',
      },
    ])
    setInviteName('')
    setInvitePhone('')
    setInviteEmail('')
  }

  const finish = async () => {
    setSaving(true)
    const shopId = uid('shop')
    const resolvedCategoryId = showCustom ? 'custom' : categoryId
    const resolvedCategoryName = showCustom
      ? customCategory.trim()
      : categoryName || SHOP_CATEGORIES.find((c) => c.id === categoryId)?.name || 'Business'

    const ownerWorkerId = uid('w')
    addShop({
      id: shopId,
      name: shopName.trim(),
      categoryId: resolvedCategoryId,
      categoryName: resolvedCategoryName,
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      description: description.trim(),
      hours: { open: openHour, close: closeHour, holidays: [] },
      createdAt: new Date().toISOString(),
    })

    const owner: Omit<Worker, 'id'> & { id?: string } = {
      id: ownerWorkerId,
      shopId,
      userId: session?.user.id,
      name: ownerName.trim(),
      role: 'owner',
      phone: phone.trim(),
      email: email.trim(),
      employeeId: 'EMP-000',
      joiningDate: new Date().toISOString(),
      specialization: 'Owner',
      active: true,
      inviteStatus: 'joined',
    }
    addWorker(owner)

    workers.forEach((w, i) => {
      addWorker({
        shopId,
        name: w.name,
        role: w.role,
        phone: w.phone,
        email: w.email,
        employeeId: `EMP-${String(i + 1).padStart(3, '0')}`,
        joiningDate: new Date().toISOString(),
        active: true,
        inviteStatus: w.email || w.phone ? 'pending' : 'none',
      })
    })

    const defaults = SALON_CATEGORY_IDS.has(resolvedCategoryId)
      ? [
          { name: 'Haircut', category: 'Hair', price: 350, mins: 30 },
          { name: 'Facial', category: 'Skin', price: 800, mins: 45 },
          { name: 'Beard Trim', category: 'Grooming', price: 150, mins: 15 },
        ]
      : [
          { name: 'Service A', category: 'General', price: 500, mins: 30 },
          { name: 'Consultation', category: 'General', price: 300, mins: 20 },
          { name: 'Standard Job', category: 'General', price: 1000, mins: 60 },
        ]

    defaults.forEach((s) => {
      addService({
        shopId,
        name: s.name,
        category: s.category,
        defaultPrice: s.price,
        durationMinutes: s.mins,
        description: `${s.name} for ${resolvedCategoryName}`,
        active: true,
      })
    })

    attachShop(shopId, 'owner', ownerWorkerId)
    setOnboarded(true)
    setShowInstallHint(true)
    toast('Your shop is ready!')
    setSaving(false)
    navigate('/app')
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <p className="text-sm text-ink-muted">
            Step {step} of {STEPS.length}
          </p>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                'flex min-w-[88px] flex-1 flex-col gap-1.5',
                s.id > step && 'opacity-40',
              )}
            >
              <div
                className={cn(
                  'h-1.5 rounded-full',
                  s.id <= step ? 'bg-brand-600' : 'bg-slate-200',
                )}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {String(s.id).padStart(2, '0')} {s.label}
              </span>
            </div>
          ))}
        </div>

        <Card className="!p-0 overflow-hidden shadow-soft">
          <div className="border-b border-surface-border px-5 py-4 md:px-7">
            <h1 className="font-display text-xl font-bold text-ink md:text-2xl">
              {step === 1 && 'Tell us about your business'}
              {step === 2 && 'What kind of shop is this?'}
              {step === 3 && 'Shop details'}
              {step === 4 && 'Invite your team'}
              {step === 5 && 'Your shop is ready!'}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {step === 1 && 'We’ll use this on receipts and your dashboard.'}
              {step === 2 && 'Pick a category so we can set smart defaults.'}
              {step === 3 && 'Customers and workers will see these details.'}
              {step === 4 && 'You can always invite more people later.'}
              {step === 5 && 'Review and jump into your Paylo dashboard.'}
            </p>
          </div>

          <div className="px-5 py-6 md:px-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Shop name">
                      <Input
                        placeholder="e.g. Main Salon"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        autoFocus
                      />
                    </Field>
                    <Field label="Owner name">
                      <Input
                        placeholder="Your full name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                      <Input
                        className="pl-9"
                        placeholder="Search categories…"
                        value={categoryQuery}
                        onChange={(e) => setCategoryQuery(e.target.value)}
                      />
                    </div>

                    {CATEGORY_GROUPS.map((group) => {
                      const items = filteredCategories.filter((c) => c.group === group)
                      if (items.length === 0) return null
                      return (
                        <div key={group}>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                            {group}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {items.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setShowCustom(false)
                                  setCategoryId(c.id)
                                  setCategoryName(c.name)
                                }}
                                className={cn(
                                  'rounded-btn border px-3 py-3 text-left transition',
                                  categoryId === c.id && !showCustom
                                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                                    : 'border-surface-border bg-white hover:border-brand-200',
                                )}
                              >
                                <p className="text-sm font-semibold text-ink">{c.name}</p>
                                <p className="mt-0.5 text-xs text-ink-muted">{c.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    <div className="rounded-btn border border-dashed border-surface-border p-4">
                      {!showCustom ? (
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => {
                            setShowCustom(true)
                            setCategoryId('custom')
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Add Custom Category
                        </Button>
                      ) : (
                        <Field label="Custom category name">
                          <Input
                            placeholder="e.g. Pet Grooming"
                            value={customCategory}
                            onChange={(e) => {
                              setCustomCategory(e.target.value)
                              setCategoryName(e.target.value)
                            }}
                            autoFocus
                          />
                        </Field>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone">
                      <Input
                        placeholder="+91 9XXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </Field>
                    <Field label="Email">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Address">
                        <Input
                          placeholder="Street, landmark"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </Field>
                    </div>
                    <Field label="City">
                      <Input value={city} onChange={(e) => setCity(e.target.value)} />
                    </Field>
                    <Field label="State">
                      <Input value={state} onChange={(e) => setState(e.target.value)} />
                    </Field>
                    <Field label="PIN code">
                      <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Opens">
                        <Input
                          type="time"
                          value={openHour}
                          onChange={(e) => setOpenHour(e.target.value)}
                        />
                      </Field>
                      <Field label="Closes">
                        <Input
                          type="time"
                          value={closeHour}
                          onChange={(e) => setCloseHour(e.target.value)}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Description" hint="Optional">
                        <Textarea
                          placeholder="What makes your shop special?"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5">
                    {workers.length > 0 && (
                      <div className="space-y-2">
                        {workers.map((w) => (
                          <div
                            key={w.key}
                            className="flex items-center justify-between rounded-btn border border-surface-border bg-slate-50 px-3 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-ink">{w.name}</p>
                              <p className="text-xs text-ink-muted">
                                {[w.phone, w.email].filter(Boolean).join(' · ') || 'No contact yet'}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="text-ink-faint hover:text-red-600"
                              onClick={() =>
                                setWorkers((prev) => prev.filter((x) => x.key !== w.key))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="rounded-card border border-surface-border p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-brand-700" />
                        <p className="text-sm font-semibold text-ink">Invite a worker</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Name">
                          <Input
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            placeholder="Worker name"
                          />
                        </Field>
                        <Field label="Phone">
                          <Input
                            value={invitePhone}
                            onChange={(e) => setInvitePhone(e.target.value)}
                            placeholder="Phone"
                          />
                        </Field>
                        <Field label="Email">
                          <Input
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Email"
                          />
                        </Field>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={addInvite}>
                          Add to team
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setStep(5)}>
                          Skip for now
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-4">
                    <div className="rounded-card bg-brand-50/70 p-5">
                      <p className="font-display text-lg font-bold text-brand-900">
                        {shopName || 'Your shop'} is ready!
                      </p>
                      <p className="mt-1 text-sm text-brand-800/80">
                        {categoryName || 'Custom'} · {city || 'India'}
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {[
                        'Shop profile created',
                        'Default services seeded',
                        workers.length
                          ? `${workers.length} team member${workers.length > 1 ? 's' : ''} invited`
                          : 'You can invite workers anytime',
                        'Dashboard unlocked',
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-ink-soft"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eef5ff] text-[#0064f0]">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Label htmlFor="hours-note">Business hours</Label>
                    <Select id="hours-note" disabled value="hours">
                      <option value="hours">
                        Open {openHour} – {closeHour}
                      </option>
                    </Select>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-surface-border px-5 py-4 md:px-7">
            <Button
              variant="ghost"
              disabled={step === 1 || saving}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {step < 5 ? (
              <Button
                disabled={!canNext()}
                onClick={() => setStep((s) => Math.min(5, s + 1))}
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button loading={saving} onClick={() => void finish()}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
