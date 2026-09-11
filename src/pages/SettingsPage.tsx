import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, LogOut, Shield, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { usePwa } from '@/context/PwaContext'
import { useToast } from '@/context/ToastContext'
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Textarea,
} from '@/components/ui'

export function SettingsPage() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const { shop, updateShop } = useShop()
  const { canInstall, promptInstall, platform, isInstalled, setShowInstallHint } = usePwa()
  const { toast } = useToast()

  const [name, setName] = useState(shop?.name ?? '')
  const [phone, setPhone] = useState(shop?.phone ?? '')
  const [email, setEmail] = useState(shop?.email ?? '')
  const [address, setAddress] = useState(shop?.address ?? '')
  const [city, setCity] = useState(shop?.city ?? '')
  const [state, setState] = useState(shop?.state ?? '')
  const [pinCode, setPinCode] = useState(shop?.pinCode ?? '')
  const [description, setDescription] = useState(shop?.description ?? '')
  const [openHour, setOpenHour] = useState(shop?.hours.open ?? '09:00')
  const [closeHour, setCloseHour] = useState(shop?.hours.close ?? '20:00')
  const [notifPayments, setNotifPayments] = useState(true)
  const [notifDaily, setNotifDaily] = useState(true)
  const [notifTeam, setNotifTeam] = useState(false)

  useEffect(() => {
    if (!shop) return
    setName(shop.name)
    setPhone(shop.phone)
    setEmail(shop.email)
    setAddress(shop.address)
    setCity(shop.city)
    setState(shop.state)
    setPinCode(shop.pinCode)
    setDescription(shop.description)
    setOpenHour(shop.hours.open)
    setCloseHour(shop.hours.close)
  }, [shop])

  const saveShop = () => {
    if (!shop) return
    updateShop(shop.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      description: description.trim(),
      hours: { open: openHour, close: closeHour, holidays: shop.hours.holidays },
    })
    toast('Shop settings saved')
  }

  const handleInstall = async () => {
    if (canInstall) {
      await promptInstall()
      return
    }
    setShowInstallHint(true)
    toast(
      platform === 'ios'
        ? 'Use Share → Add to Home Screen'
        : 'Use your browser’s Install / Add to Home Screen option',
      'info',
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Settings" subtitle="Shop, profile, and app preferences" />

      {session?.role !== 'worker' && shop && (
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-ink">Shop settings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Shop name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="City">
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>
            </div>
            <Field label="State">
              <Input value={state} onChange={(e) => setState(e.target.value)} />
            </Field>
            <Field label="PIN">
              <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} />
            </Field>
            <Field label="Opens">
              <Input type="time" value={openHour} onChange={(e) => setOpenHour(e.target.value)} />
            </Field>
            <Field label="Closes">
              <Input
                type="time"
                value={closeHour}
                onChange={(e) => setCloseHour(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </div>
          </div>
          <Button onClick={saveShop}>Save shop settings</Button>
        </Card>
      )}

      <Card className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <Input value={session?.user.name ?? ''} readOnly />
          </Field>
          <Field label="Email">
            <Input value={session?.user.email ?? ''} readOnly />
          </Field>
          <Field label="Role">
            <Input value={session?.role ?? ''} readOnly className="capitalize" />
          </Field>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Notifications</h2>
        {[
          {
            key: 'payments',
            label: 'Payment alerts',
            value: notifPayments,
            set: setNotifPayments,
          },
          {
            key: 'daily',
            label: 'Daily summary',
            value: notifDaily,
            set: setNotifDaily,
          },
          {
            key: 'team',
            label: 'Team updates',
            value: notifTeam,
            set: setNotifTeam,
          },
        ].map((n) => (
          <label
            key={n.key}
            className="flex items-center justify-between rounded-btn border border-surface-border px-3 py-3 text-sm"
          >
            <span className="font-medium text-ink">{n.label}</span>
            <input
              type="checkbox"
              checked={n.value}
              onChange={(e) => n.set(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
          </label>
        ))}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Install app</h2>
        {isInstalled ? (
          <p className="text-sm text-ink-muted">Paylo is installed on this device.</p>
        ) : (
          <>
            <p className="text-sm text-ink-muted">
              {canInstall
                ? 'Install Paylo for quicker access and offline use.'
                : platform === 'ios'
                  ? 'On iPhone/iPad: tap Share, then Add to Home Screen.'
                  : platform === 'android'
                    ? 'On Android Chrome: open the browser menu and tap Install app / Add to Home screen.'
                    : 'On desktop Chrome or Edge: use the install icon in the address bar, or the browser menu.'}
            </p>
            <Button onClick={() => void handleInstall()}>
              <Download className="h-4 w-4" />
              Install App
            </Button>
          </>
        )}
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 text-ink-muted" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Security</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Password reset and two-factor authentication coming soon.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-brand-700" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Subscription</h2>
            <p className="mt-1 text-sm text-ink-muted">
              You&apos;re on the Paylo Free plan. Paid plans with advanced reports coming soon.
            </p>
          </div>
        </div>
      </Card>

      <Button variant="danger" className="w-full sm:w-auto" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}
