import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Briefcase,
  ChartColumn,
  CreditCard,
  Home,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Users,
  Wallet,
  ClipboardList,
  Package,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { usePwa } from '@/context/PwaContext'
import { Avatar, Badge, Button, Logo } from '@/components/ui'
import { cn } from '@/lib/cn'
import { canAccess } from '@/lib/permissions'
import type { Role } from '@/types'

function ownerNav(role: Role) {
  const all = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true, feature: 'dashboard' },
    { to: '/app/transactions', label: 'Transactions', icon: ClipboardList, feature: 'transactions' },
    { to: '/app/work', label: 'Work Records', icon: Briefcase, feature: 'work' },
    { to: '/app/workers', label: 'Workers', icon: Users, feature: 'workers' },
    { to: '/app/services', label: 'Services', icon: Package, feature: 'services' },
    { to: '/app/customers', label: 'Customers', icon: Users, feature: 'customers' },
    { to: '/app/reports', label: 'Reports', icon: ChartColumn, feature: 'reports' },
    { to: '/app/payments', label: 'Payments', icon: CreditCard, feature: 'payments' },
    { to: '/app/settings', label: 'Shop Settings', icon: Settings, feature: 'settings' },
  ]
  return all.filter((i) => canAccess(role, i.feature) || role === 'owner')
}

function workerNav() {
  return [
    { to: '/app', label: 'Home', icon: Home, end: true },
    { to: '/app/work', label: 'My Work', icon: Briefcase },
    { to: '/app/work/new', label: 'Add Work', icon: Plus, primary: true },
    { to: '/app/earnings', label: 'Earnings', icon: Wallet },
    { to: '/app/settings', label: 'Profile', icon: Settings },
  ]
}

function mobileOwnerNav() {
  return [
    { to: '/app', label: 'Home', icon: Home, end: true },
    { to: '/app/work', label: 'Work', icon: Briefcase },
    { to: '/app/work/new', label: 'Add', icon: Plus, primary: true },
    { to: '/app/transactions', label: 'Txns', icon: ClipboardList },
    { to: '/app/more', label: 'More', icon: MoreHorizontal },
  ]
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, setActiveShop } = useAuth()
  const { shop, store, notifications, online, syncing } = useShop()
  const { canInstall, promptInstall } = usePwa()
  const navigate = useNavigate()
  const [shopOpen, setShopOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [search, setSearch] = useState('')
  const role = session?.role ?? 'worker'
  const isWorker = role === 'worker'
  const sideNav = isWorker ? workerNav().filter((n) => !('primary' in n && n.primary)) : ownerNav(role)
  const bottomNav = isWorker ? workerNav() : mobileOwnerNav()
  const unread = notifications.filter((n) => !n.read).length

  const shops = store.shops.filter((s) => session?.shopIds.includes(s.id))

  return (
    <div className="min-h-dvh bg-white">
      {!online && (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
          You&apos;re offline — changes will sync when you reconnect
        </div>
      )}
      {online && syncing && (
        <div className="bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white">
          Back online — syncing…
        </div>
      )}

      <div className="mx-auto flex min-h-dvh max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-surface-border bg-white px-3 py-4 lg:flex">
          <div className="px-2 pb-4">
            <Logo />
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {sideNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-ink-soft hover:bg-slate-50 hover:text-ink',
                  )
                }
              >
                <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto space-y-2 border-t border-surface-border pt-3">
            <div className="flex items-center gap-2 px-2 text-xs text-ink-muted">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  online ? 'bg-[#0064f0]' : 'bg-amber-500',
                )}
              />
              {online ? 'Online' : 'Offline'}
            </div>
            {canInstall && (
              <Button variant="secondary" className="w-full" onClick={() => void promptInstall()}>
                Install App
              </Button>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-surface-border bg-white/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
              <div className="lg:hidden">
                <Logo size="sm" />
              </div>

              {!isWorker && shops.length > 0 && (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setShopOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-btn border border-surface-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
                  >
                    {shop?.name ?? 'Select shop'}
                    <span className="text-ink-faint">▼</span>
                  </button>
                  {shopOpen && (
                    <div className="absolute left-0 top-full z-40 mt-1 w-56 rounded-card border border-surface-border bg-white p-1 shadow-soft">
                      {shops.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={cn(
                            'flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50',
                            s.id === shop?.id && 'bg-brand-50 font-semibold text-brand-800',
                          )}
                          onClick={() => {
                            setActiveShop(s.id)
                            setShopOpen(false)
                          }}
                        >
                          {s.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="mt-1 flex w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-700 hover:bg-brand-50"
                        onClick={() => {
                          setShopOpen(false)
                          navigate('/onboarding')
                        }}
                      >
                        + Add Another Shop
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && search.trim()) {
                      navigate(`/app/search?q=${encodeURIComponent(search.trim())}`)
                    }
                  }}
                  placeholder="Search workers, customers, services…"
                  className="h-10 w-full rounded-btn border border-surface-border bg-brand-50/50 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:bg-white"
                />
              </div>

              <div className="relative ml-auto md:ml-0">
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-btn border border-surface-border bg-white hover:bg-slate-50"
                >
                  <Bell className="h-4 w-4 text-ink-soft" />
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full z-40 mt-1 w-80 rounded-card border border-surface-border bg-white p-2 shadow-soft">
                    <div className="mb-2 flex items-center justify-between px-2">
                      <p className="text-sm font-semibold">Notifications</p>
                      <Badge tone="brand">{unread} new</Badge>
                    </div>
                    <div className="max-h-72 space-y-1 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="px-2 py-6 text-center text-sm text-ink-muted">
                          No notifications yet
                        </p>
                      )}
                      {notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            'rounded-lg px-3 py-2',
                            !n.read ? 'bg-brand-50/60' : 'hover:bg-slate-50',
                          )}
                        >
                          <p className="text-sm font-medium text-ink">{n.title}</p>
                          <p className="text-xs text-ink-muted">{n.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate('/app/settings')}
                className="flex items-center gap-2 rounded-btn border border-surface-border bg-white px-2 py-1.5 hover:bg-slate-50"
              >
                <Avatar
                  name={session?.user.name ?? 'U'}
                  picture={session?.user.picture}
                  size="sm"
                />
                <span className="hidden text-sm font-medium text-ink md:inline">
                  {session?.user.name?.split(' ')[0]}
                </span>
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6 mb-nav lg:mb-0">{children}</main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-border bg-white/95 pb-safe backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-2">
          {bottomNav.map((item) => {
            const primary = 'primary' in item && item.primary
            if (primary) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="-mt-6 flex flex-col items-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0064f0] text-white shadow-float">
                    <Plus className="h-6 w-6" strokeWidth={2.5} />
                  </span>
                  <span className="mt-1 text-[10px] font-semibold text-[#0064f0]">Add Work</span>
                </NavLink>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? Boolean(item.end) : false}
                className={({ isActive }) =>
                  cn(
                    'flex min-w-[56px] flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium',
                    isActive ? 'text-brand-700' : 'text-ink-faint',
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
