import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Camera,
  Check,
  ChevronDown,
  Dumbbell,
  Grid2X2,
  Home,
  ImagePlus,
  LayoutGrid,
  MapPin,
  Monitor,
  Phone,
  ScanLine,
  Search,
  ShoppingCart,
  Shirt,
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import { BUSINESS_TYPES, INDIAN_STATES, ONBOARDING_CATEGORIES } from '@/data/onboarding'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { usePwa } from '@/context/PwaContext'
import { useToast } from '@/context/ToastContext'
import { useShopSetupApi } from '@/lib/shopSetup'
import { Button, LogoMark } from '@/components/ui'
import { cn } from '@/lib/cn'
import { uid } from '@/lib/format'
import type { Id } from '../../../convex/_generated/dataModel'

const STEP_META = [
  {
    title: "Let's Set Up Your Shop",
    subtitle: 'Tell us some basic details about your shop to get started.',
    badge: 'Shop identity',
  },
  {
    title: 'Add Your Shop Address',
    subtitle: 'This helps us set your location and appear in local searches.',
    badge: 'Location',
  },
  {
    title: 'Add Contact Details',
    subtitle: 'Customers will use this to reach your shop.',
    badge: 'Contact',
  },
  {
    title: 'Select Shop Category',
    subtitle: 'Choose the category that best describes your shop.',
    badge: 'Category',
  },
] as const

const CATEGORY_ICONS: Record<string, typeof ShoppingCart> = {
  cart: ShoppingCart,
  hanger: Shirt,
  monitor: Monitor,
  burger: UtensilsCrossed,
  bottle: Store,
  home: Home,
  dumbbell: Dumbbell,
  book: BookOpen,
  grid: LayoutGrid,
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex flex-1 items-center gap-1.5 px-3">
      {Array.from({ length: 4 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-300',
            i < step
              ? 'bg-[linear-gradient(90deg,#3b8bff,#0064f0)] shadow-[0_0_10px_rgba(0,100,240,0.35)]'
              : 'bg-slate-200/90',
          )}
        />
      ))}
    </div>
  )
}

function FieldShell({
  icon,
  children,
  label,
  hint,
}: {
  icon: ReactNode
  children: ReactNode
  label?: string
  hint?: string
}) {
  return (
    <label className="block">
      {(label || hint) && (
        <span className="mb-2 flex items-center justify-between gap-2">
          {label && (
            <span className="text-[13px] font-semibold text-[#0f1a33]">{label}</span>
          )}
          {hint && <span className="text-[11px] font-medium text-slate-400">{hint}</span>}
        </span>
      )}
      <div className="flex h-[52px] items-center gap-3 rounded-[18px] border border-slate-200/90 bg-[#fbfcfe] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition focus-within:border-[#0064f0] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(0,100,240,0.10)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-[#0064f0]">
          {icon}
        </span>
        {children}
      </div>
    </label>
  )
}

function FancySelect({
  icon,
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  icon: ReactNode
  label: string
  value: string
  placeholder: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative block">
      <span className="mb-2 block text-[13px] font-semibold text-[#0f1a33]">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-[52px] w-full items-center gap-3 rounded-[18px] border bg-[#fbfcfe] px-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition',
          open
            ? 'border-[#0064f0] bg-white shadow-[0_0_0_4px_rgba(0,100,240,0.10)]'
            : 'border-slate-200/90 hover:border-slate-300',
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-[#0064f0]">
          {icon}
        </span>
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-[14px] font-medium',
            value ? 'text-[#0f1a33]' : 'text-slate-400',
          )}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-slate-400 transition-transform',
            open && 'rotate-180 text-[#0064f0]',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 z-40 mt-2 max-h-56 overflow-auto rounded-[20px] border border-slate-200/90 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,40,100,0.14)]"
          >
            {options.map((option) => {
              const active = value === option
              return (
                <li key={option}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-[14px] px-3.5 py-2.5 text-left text-[14px] font-medium transition',
                      active
                        ? 'bg-[#eef5ff] text-[#0064f0]'
                        : 'text-[#0f1a33] hover:bg-slate-50',
                    )}
                  >
                    <span>{option}</span>
                    {active && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0064f0] text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { session, attachShop, clearRoleChoice, logout } = useAuth()
  const { addShop, addWorker, addService } = useShop()
  const { setShowInstallHint } = usePwa()
  const { toast } = useToast()
  const shopApi = useShopSetupApi()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [shopName, setShopName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [alternateNumber, setAlternateNumber] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappSameAsContact, setWhatsappSameAsContact] = useState(false)
  const [categoryId, setCategoryId] = useState('general-store')
  const [categoryQuery, setCategoryQuery] = useState('')

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase()
    if (!q) return ONBOARDING_CATEGORIES
    return ONBOARDING_CATEGORIES.filter((c) => c.name.toLowerCase().includes(q))
  }, [categoryQuery])

  const canNext = () => {
    if (step === 1) return shopName.trim().length > 1 && Boolean(businessType)
    if (step === 2) {
      return (
        address.trim().length > 2 &&
        city.trim().length > 1 &&
        Boolean(stateName) &&
        pinCode.trim().length >= 4
      )
    }
    if (step === 3) return contactNumber.trim().length >= 8
    if (step === 4) return Boolean(categoryId)
    return true
  }

  const onLogoPick = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose a PNG or JPG image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB.')
      return
    }
    setError(null)
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const finish = async () => {
    if (!session?.user.email) {
      setError('Missing signed-in email. Please sign in again.')
      return
    }
    const category = ONBOARDING_CATEGORIES.find((c) => c.id === categoryId)
    if (!category) {
      setError('Select a shop category.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      let logoStorageId: Id<'_storage'> | undefined
      if (logoFile && shopApi.ready) {
        logoStorageId = await shopApi.uploadLogo(logoFile)
      }

      const convexShopId = await shopApi.saveShop({
        ownerEmail: session.user.email,
        ownerName: session.user.name,
        ownerPicture: session.user.picture,
        googleId: session.user.id,
        shopName: shopName.trim(),
        businessType,
        logoStorageId,
        address: address.trim(),
        city: city.trim(),
        state: stateName,
        pinCode: pinCode.trim(),
        contactNumber: contactNumber.trim(),
        alternateNumber: alternateNumber.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
        categoryId: category.id,
        categoryName: category.name,
      })

      const shopId = convexShopId ? String(convexShopId) : uid('shop')
      const ownerWorkerId = uid('w')

      addShop({
        id: shopId,
        name: shopName.trim(),
        categoryId: category.id,
        categoryName: category.name,
        ownerName: session.user.name,
        phone: contactNumber.trim(),
        email: session.user.email,
        address: address.trim(),
        city: city.trim(),
        state: stateName,
        pinCode: pinCode.trim(),
        description: `${businessType} · ${category.name}`,
        logo: logoPreview ?? undefined,
        hours: { open: '09:00', close: '20:00', holidays: [] },
        createdAt: new Date().toISOString(),
      })

      addWorker({
        id: ownerWorkerId,
        shopId,
        userId: session.user.id,
        name: session.user.name,
        role: 'owner',
        phone: contactNumber.trim(),
        email: session.user.email,
        employeeId: 'OWN-001',
        joiningDate: new Date().toISOString().slice(0, 10),
        active: true,
        inviteStatus: 'joined',
      })

      ;[
        { name: 'Standard Service', category: 'General', price: 500, mins: 30 },
        { name: 'Consultation', category: 'General', price: 300, mins: 20 },
      ].forEach((s) => {
        addService({
          shopId,
          name: s.name,
          category: s.category,
          defaultPrice: s.price,
          durationMinutes: s.mins,
          description: `${s.name} for ${category.name}`,
          active: true,
        })
      })

      attachShop(shopId, 'owner', ownerWorkerId)
      setShowInstallHint(true)
      toast(shopApi.ready ? 'Shop saved to Paylo cloud' : 'Shop created locally')
      navigate('/app')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save shop'
      setError(message)
      toast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const goNext = () => {
    setError(null)
    if (!canNext()) {
      setError('Please fill the required fields to continue.')
      return
    }
    if (step < 4) setStep((s) => s + 1)
    else void finish()
  }

  const goBack = () => {
    setError(null)
    if (step === 1) {
      clearRoleChoice()
      navigate('/onboarding/role')
      return
    }
    setStep((s) => s - 1)
  }

  const skip = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[linear-gradient(180deg,#f7faff_0%,#fcfdff_42%,#ffffff_100%)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-24 h-80 w-80 rounded-full bg-[#dcecff] blur-[70px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-[#eaf2ff] blur-[60px]" />
        <div className="absolute bottom-0 left-1/2 h-40 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,100,240,0.08),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+1.1rem)] pt-[calc(env(safe-area-inset-top)+0.7rem)]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Back"
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#0f1a33] shadow-sm ring-1 ring-slate-200/80 transition hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <ProgressBar step={step} />
          <button
            type="button"
            onClick={skip}
            className="shrink-0 rounded-full bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200/80 transition hover:text-[#0064f0]"
          >
            Skip for now
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <LogoMark size="sm" className="h-9 w-9" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0064f0]">
              Step {step} of 4 · {STEP_META[step - 1].badge}
            </p>
            <p className="text-[12px] font-medium text-slate-400">Shop owner setup</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-5 flex flex-1 flex-col"
          >
            <h1 className="font-display text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-[#0f1a33]">
              {STEP_META[step - 1].title}
            </h1>
            <p className="mt-2 max-w-[340px] text-[14px] leading-relaxed text-slate-500">
              {STEP_META[step - 1].subtitle}
            </p>

            <div className="mt-5 flex-1 space-y-3.5 rounded-[28px] bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,40,100,0.08)] ring-1 ring-white/90 backdrop-blur-sm sm:p-5">
              {step === 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[22px] border border-dashed border-[#b7d2ff] bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4ff_100%)] px-4 py-8 text-center transition hover:border-[#0064f0]/55 hover:shadow-[0_12px_28px_rgba(0,100,240,0.10)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#cfe2ff]/50 blur-2xl transition group-hover:bg-[#b7d4ff]/70"
                    />
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Shop logo preview"
                          className="h-[88px] w-[88px] rounded-[22px] object-cover shadow-[0_12px_28px_rgba(15,40,100,0.18)] ring-4 ring-white"
                        />
                        <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#0064f0] text-white shadow-md">
                          <Camera className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    ) : (
                      <span className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-[#0064f0] shadow-[0_10px_24px_rgba(0,100,240,0.16)] ring-1 ring-[#dbe8ff]">
                        <ImagePlus className="h-7 w-7" strokeWidth={1.9} />
                      </span>
                    )}
                    <span className="relative mt-4 text-[15px] font-bold text-[#0f1a33]">
                      {logoPreview ? 'Change Shop Logo' : 'Add Shop Logo'}
                    </span>
                    <span className="relative mt-1 text-[12px] text-slate-400">
                      PNG, JPG · Max 2MB
                    </span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => onLogoPick(e.target.files?.[0] ?? null)}
                  />

                  <FieldShell icon={<Store className="h-[18px] w-[18px]" />} label="Shop Name">
                    <input
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Enter your shop name"
                      className="w-full bg-transparent text-[14px] font-medium text-[#0f1a33] outline-none placeholder:font-normal placeholder:text-slate-400"
                    />
                  </FieldShell>

                  <FancySelect
                    icon={<Grid2X2 className="h-[18px] w-[18px]" />}
                    label="Business Type"
                    value={businessType}
                    placeholder="Select business type"
                    options={BUSINESS_TYPES}
                    onChange={setBusinessType}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <FieldShell icon={<MapPin className="h-[18px] w-[18px]" />} label="Address">
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your shop address"
                      className="w-full bg-transparent text-[14px] font-medium text-[#0f1a33] outline-none placeholder:font-normal placeholder:text-slate-400"
                    />
                  </FieldShell>
                  <FieldShell icon={<Building2 className="h-[18px] w-[18px]" />} label="City">
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="w-full bg-transparent text-[14px] font-medium text-[#0f1a33] outline-none placeholder:font-normal placeholder:text-slate-400"
                    />
                  </FieldShell>
                  <FancySelect
                    icon={<BookOpen className="h-[18px] w-[18px]" />}
                    label="State"
                    value={stateName}
                    placeholder="Select state"
                    options={INDIAN_STATES}
                    onChange={setStateName}
                  />
                  <FieldShell icon={<ScanLine className="h-[18px] w-[18px]" />} label="PIN Code">
                    <input
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter PIN code"
                      inputMode="numeric"
                      className="w-full bg-transparent text-[14px] font-medium text-[#0f1a33] outline-none placeholder:font-normal placeholder:text-slate-400"
                    />
                  </FieldShell>
                </>
              )}

              {step === 3 && (
                <>
                  <FieldShell
                    icon={<Phone className="h-[18px] w-[18px]" />}
                    label="Contact Number"
                  >
                    <input
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Enter phone number"
                      inputMode="tel"
                      className="w-full bg-transparent text-[14px] font-medium text-[#0f1a33] outline-none placeholder:font-normal placeholder:text-slate-400"
                    />
                  </FieldShell>
                  <FieldShell
                    icon={<Phone className="h-[18px] w-[18px]" />}
                    label="Alternate Number"
                    hint="Optional"
                  >
                    <input
                      value={alternateNumber}
                      onChange={(e) => setAlternateNumber(e.target.value)}
                      placeholder="Enter alternate number"
                      inputMode="tel"
                      className="w-full bg-transparent text-[14px] font-medium text-[#0f1a33] outline-none placeholder:font-normal placeholder:text-slate-400"
                    />
                  </FieldShell>
                  <FieldShell
                    icon={
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-[#25D366] text-[10px] font-bold text-white">
                        W
                      </span>
                    }
                    label="WhatsApp Number"
                    hint="Optional"
                  >
                    <input
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Enter WhatsApp number"
                      inputMode="tel"
                      className="w-full bg-transparent text-[14px] font-medium text-[#0f1a33] outline-none placeholder:font-normal placeholder:text-slate-400"
                    />
                  </FieldShell>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="flex h-[52px] items-center gap-3 rounded-[18px] border border-slate-200/90 bg-[#fbfcfe] px-3.5">
                    <Search className="h-[18px] w-[18px] text-slate-400" />
                    <input
                      value={categoryQuery}
                      onChange={(e) => setCategoryQuery(e.target.value)}
                      placeholder="Search categories"
                      className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {filteredCategories.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat.icon] ?? LayoutGrid
                      const active = categoryId === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryId(cat.id)}
                          className={cn(
                            'relative flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-[20px] border bg-white px-2 py-3 text-center transition',
                            active
                              ? 'border-[#0064f0] bg-[#f3f8ff] shadow-[0_10px_28px_rgba(0,100,240,0.16)]'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                          )}
                        >
                          {active && (
                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0064f0] text-white">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          )}
                          <span
                            className={cn(
                              'flex h-11 w-11 items-center justify-center rounded-[14px]',
                              active ? 'bg-[#e7f0ff] text-[#0064f0]' : 'bg-slate-50 text-slate-500',
                            )}
                          >
                            <Icon className="h-5 w-5" strokeWidth={2.1} />
                          </span>
                          <span
                            className={cn(
                              'text-[11.5px] font-semibold leading-tight',
                              active ? 'text-[#0064f0]' : 'text-slate-600',
                            )}
                          >
                            {cat.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="mt-3 text-center text-[12.5px] leading-relaxed text-red-600">{error}</p>
        )}

        <div className="mt-5 space-y-3">
          <Button
            className="h-[54px] w-full justify-center gap-2 rounded-[18px] bg-[linear-gradient(90deg,#1a7bff_0%,#0064f0_100%)] text-[15px] font-semibold shadow-[0_14px_32px_rgba(0,100,240,0.32)] hover:brightness-105"
            loading={saving}
            onClick={goNext}
          >
            {step === 4 ? 'Complete Setup' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-[12px] text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-[#0064f0]/70" />
            You can always edit this later.
          </div>

          {session?.user.email && (
            <div className="mx-auto flex max-w-full items-center gap-2 rounded-full bg-[#f1f6ff] px-3 py-1.5 text-[11px] font-medium text-slate-500 ring-1 ring-[#d9e7ff]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" />
              <span className="truncate">Saving for {session.user.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
