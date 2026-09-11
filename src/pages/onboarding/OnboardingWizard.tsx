import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Camera,
  Dumbbell,
  Grid2X2,
  Home,
  LayoutGrid,
  MapPin,
  Monitor,
  Phone,
  ScanLine,
  Search,
  ShoppingCart,
  Shirt,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import { BUSINESS_TYPES, INDIAN_STATES, ONBOARDING_CATEGORIES } from '@/data/onboarding'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { usePwa } from '@/context/PwaContext'
import { useToast } from '@/context/ToastContext'
import { useShopSetupApi } from '@/lib/shopSetup'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { uid } from '@/lib/format'
import type { Id } from '../../../convex/_generated/dataModel'

const STEP_META = [
  {
    title: "Let's Set Up Your Shop",
    subtitle: 'Tell us some basic details about your shop to get started.',
  },
  {
    title: 'Add Your Shop Address',
    subtitle: 'This helps us set your location and appear in local searches.',
  },
  {
    title: 'Add Contact Details',
    subtitle: 'Customers will use this to reach your shop.',
  },
  {
    title: 'Select Shop Category',
    subtitle: 'Choose the category that best describes your shop.',
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
    <div className="flex flex-1 items-center gap-1.5 px-4">
      {Array.from({ length: 4 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-[5px] flex-1 rounded-full transition-colors',
            i < step ? 'bg-[#0064f0]' : 'bg-slate-200',
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
}: {
  icon: ReactNode
  children: ReactNode
  label?: string
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-semibold text-[#0f1a33]">{label}</span>
      )}
      <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] focus-within:border-[#0064f0] focus-within:ring-2 focus-within:ring-[#0064f0]/15">
        <span className="text-[#0064f0]">{icon}</span>
        {children}
      </div>
    </label>
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
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#fcfdff]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-[#e8f1ff] blur-[60px]" />
        <div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-[#eef5ff] blur-[50px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Back"
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#0f1a33] hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <ProgressBar step={step} />
          <button
            type="button"
            onClick={skip}
            className="shrink-0 rounded-full px-2 py-1.5 text-[12.5px] font-semibold text-slate-500 hover:text-[#0064f0]"
          >
            Skip for now
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="mt-6 flex flex-1 flex-col"
          >
            <h1 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-[#0f1a33]">
              {STEP_META[step - 1].title}
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
              {STEP_META[step - 1].subtitle}
            </p>

            <div className="mt-6 flex-1 space-y-3.5">
              {step === 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-[#f4f7fb] px-4 py-8 text-center transition hover:border-[#0064f0]/50 hover:bg-[#eef5ff]"
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Shop logo preview"
                        className="h-20 w-20 rounded-2xl object-cover shadow-sm"
                      />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0064f0] shadow-sm">
                        <Camera className="h-6 w-6" strokeWidth={2} />
                      </span>
                    )}
                    <span className="mt-3 text-[14px] font-semibold text-[#0f1a33]">
                      {logoPreview ? 'Change Shop Logo' : 'Add Shop Logo'}
                    </span>
                    <span className="mt-1 text-[12px] text-slate-400">PNG, JPG (Max 2MB)</span>
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
                      className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                    />
                  </FieldShell>

                  <FieldShell
                    icon={<Grid2X2 className="h-[18px] w-[18px]" />}
                    label="Business Type"
                  >
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full bg-transparent text-[14px] outline-none"
                    >
                      <option value="">Select business type</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                </>
              )}

              {step === 2 && (
                <>
                  <FieldShell icon={<MapPin className="h-[18px] w-[18px]" />} label="Address">
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your shop address"
                      className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                    />
                  </FieldShell>
                  <FieldShell icon={<Building2 className="h-[18px] w-[18px]" />} label="City">
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                    />
                  </FieldShell>
                  <FieldShell icon={<BookOpen className="h-[18px] w-[18px]" />} label="State">
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full bg-transparent text-[14px] outline-none"
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                  <FieldShell icon={<ScanLine className="h-[18px] w-[18px]" />} label="PIN Code">
                    <input
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter PIN code"
                      inputMode="numeric"
                      className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
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
                      className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                    />
                  </FieldShell>
                  <FieldShell
                    icon={<Phone className="h-[18px] w-[18px]" />}
                    label="Alternate Number (Optional)"
                  >
                    <input
                      value={alternateNumber}
                      onChange={(e) => setAlternateNumber(e.target.value)}
                      placeholder="Enter alternate number"
                      inputMode="tel"
                      className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                    />
                  </FieldShell>
                  <FieldShell
                    icon={
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] bg-[#25D366] text-[10px] font-bold text-white">
                        W
                      </span>
                    }
                    label="WhatsApp Number (Optional)"
                  >
                    <input
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Enter WhatsApp number"
                      inputMode="tel"
                      className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                    />
                  </FieldShell>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5">
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
                            'flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-[18px] border bg-white px-2 py-3 text-center transition',
                            active
                              ? 'border-[#0064f0] shadow-[0_8px_24px_rgba(0,100,240,0.14)]'
                              : 'border-slate-200 hover:border-slate-300',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-xl',
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

        <div className="mt-4 space-y-3">
          <Button
            className="h-12 w-full justify-center gap-2 rounded-2xl bg-[#0064f0] text-[15px] font-semibold shadow-[0_12px_28px_rgba(0,100,240,0.28)]"
            loading={saving}
            onClick={goNext}
          >
            {step === 4 ? 'Complete Setup' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-center text-[12px] text-slate-400">You can always edit this later.</p>
          {session?.user.email && (
            <p className="text-center text-[11px] text-slate-300">
              Saving for {session.user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
