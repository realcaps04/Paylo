import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Plus,
  UserPlus,
  Users,
  Wallet,
  ClipboardList,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { Card, PageHeader } from '@/components/ui'
import { formatINR, formatDate, greeting } from '@/lib/format'
import { filterByDateRange, sumField } from '@/lib/permissions'
import { cn } from '@/lib/cn'
import type { PaymentMethod } from '@/types'

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function methodLabel(method?: PaymentMethod) {
  if (!method) return 'Unpaid'
  const map: Record<PaymentMethod, string> = {
    cash: 'Cash Payment',
    upi: 'UPI Payment',
    card: 'Card Payment',
    bank: 'Bank Transfer',
    other: 'Other',
  }
  return map[method]
}

function OwnerDashboard() {
  const { session } = useAuth()
  const { workRecords, workers, customers, services } = useShop()

  const todayRecords = useMemo(
    () => filterByDateRange(workRecords, 'today'),
    [workRecords],
  )
  const yesterdayRecords = useMemo(
    () => filterByDateRange(workRecords, 'yesterday'),
    [workRecords],
  )

  const todaySales = sumField(todayRecords, 'amountPaid')
  const yesterdaySales = sumField(yesterdayRecords, 'amountPaid')
  const salesDelta = pctChange(todaySales, yesterdaySales)

  const totalCustomers = customers.length
  const shopStaff = workers.filter((w) => {
    if (!w.active || w.role === 'owner') return false
    // Owner account must never count as staff
    if (session?.user.id && w.userId === session.user.id) return false
    if (session?.user.email && w.email?.toLowerCase() === session.user.email.toLowerCase()) {
      return false
    }
    return true
  }).length
  const totalServices = services.filter((s) => s.active).length

  const recent = useMemo(
    () =>
      [...workRecords]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 5),
    [workRecords],
  )

  const quickActions = [
    {
      to: '/app/workers',
      label: 'Add Staff',
      icon: UserPlus,
      tone: 'bg-[#efeaff] text-[#6b4ad6]',
    },
  ] as const

  return (
    <div className="space-y-5 pb-2">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative col-span-2 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#1a7bff] via-[#0064f0] to-[#0047b8] p-4 text-white shadow-lg shadow-[#0064f0]/25">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <svg className="absolute -right-2 bottom-2 h-20 w-28" viewBox="0 0 120 80" fill="none">
              <path
                d="M0 55 C20 50 30 30 45 35 C60 40 70 20 85 25 C100 30 110 15 120 20"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0 65 C25 60 35 45 50 50 C65 55 75 40 90 42 C105 44 112 35 120 38"
                stroke="white"
                strokeOpacity="0.35"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="relative">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <BarChart3 className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </div>
            <p className="text-[13px] font-medium text-white/85">Today&apos;s Sales</p>
            <p className="mt-1 font-display text-[1.55rem] font-bold tracking-tight">
              {formatINR(todaySales)}
            </p>
            <p
              className={cn(
                'mt-2 inline-flex items-center gap-0.5 text-xs font-semibold',
                salesDelta >= 0 ? 'text-[#b8f5c8]' : 'text-[#ffc9c9]',
              )}
            >
              {salesDelta >= 0 && <ArrowUpRight className="h-3.5 w-3.5" />}
              {salesDelta >= 0 ? '+' : ''}
              {salesDelta}% vs yesterday
            </p>
          </div>
        </div>

        <Link
          to="/app/customers"
          className="flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-[#cfe0ff]"
        >
          <div>
            <p className="text-[13px] font-medium text-slate-500">Total Customers</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-[#0f1a33]">
              {totalCustomers}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">{totalServices} services</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0064f0]">
            <Users className="h-5 w-5" />
          </span>
        </Link>

        <Link
          to="/app/workers"
          className="flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-[#cfe0ff]"
        >
          <div>
            <p className="text-[13px] font-medium text-slate-500">Shop Staff</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-[#0f1a33]">
              {shopStaff}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0064f0]">
            <UserPlus className="h-5 w-5" />
          </span>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="flex justify-end">
        {quickActions.map((a) => (
          <Link key={a.to} to={a.to} className="flex flex-col items-center gap-2 py-1">
            <span
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-[1.03]',
                a.tone,
              )}
            >
              <a.icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="text-center text-[11px] font-semibold text-[#0f1a33]">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent transactions */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#0f1a33]">Recent Transactions</h2>
          <Link
            to="/app/transactions"
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-[#0064f0]"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recent.length === 0 && (
            <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-600">No sales yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Sales recorded by your staff will show up here.
              </p>
            </div>
          )}
          {recent.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-[20px] border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0064f0]">
                <span className="font-display text-sm font-bold">
                  {r.customerName
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0f1a33]">{r.customerName}</p>
                <p className="truncate text-xs text-slate-500">
                  {format(parseISO(r.createdAt), 'h:mm a')} · {methodLabel(r.paymentMethod)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-[#0f1a33]">{formatINR(r.totalAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grow team banner */}
      <Link
        to="/app/workers"
        className="flex items-center gap-4 overflow-hidden rounded-[22px] bg-gradient-to-r from-[#e8f1ff] via-[#eef5ff] to-[#f3f7ff] px-4 py-4 transition hover:from-[#dcebff]"
      >
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <span className="absolute left-0 top-1 h-8 w-8 rounded-full bg-[#9dc4ff]" />
          <span className="absolute right-0 top-0 h-9 w-9 rounded-full bg-[#6ea6ff]" />
          <span className="absolute bottom-0 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#0064f0] text-white shadow">
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold text-[#0f1a33]">Grow your team</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            Add staff members and give them access to help manage your shop.
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-[#0064f0]" />
      </Link>
    </div>
  )
}

function WorkerDashboard() {
  const { session } = useAuth()
  const { workRecords, shop } = useShop()
  const workerId = session?.workerId

  const mine = useMemo(
    () => workRecords.filter((r) => r.workerId === workerId),
    [workRecords, workerId],
  )
  const today = useMemo(() => filterByDateRange(mine, 'today'), [mine])
  const earnings = sumField(today, 'amountPaid')

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${session?.user.name?.split(' ')[0] ?? 'there'}`}
        subtitle={shop?.name ?? 'Your work today'}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="rounded-[22px] border-0 bg-gradient-to-br from-[#1a7bff] to-[#0064f0] p-4 text-white shadow-lg shadow-[#0064f0]/25">
          <p className="text-sm text-white/80">Today&apos;s Earnings</p>
          <p className="mt-1 font-display text-2xl font-bold">{formatINR(earnings)}</p>
          <p className="mt-2 text-xs text-white/70">{today.length} jobs today</p>
        </Card>
        <Card className="rounded-[22px] p-4">
          <p className="text-sm text-slate-500">All-time jobs</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#0f1a33]">{mine.length}</p>
        </Card>
      </div>

      <Link
        to="/app/work/new"
        className="flex items-center justify-center gap-3 rounded-[22px] bg-[#0064f0] px-6 py-7 text-white shadow-lg shadow-[#0064f0]/30 transition hover:bg-[#0050c4]"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
        <span className="font-display text-2xl font-bold">Add Work</span>
      </Link>

      <Card className="rounded-[22px]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent Work</h2>
          <Link to="/app/work" className="text-sm font-semibold text-[#0064f0]">
            See all
          </Link>
        </div>
        <div className="space-y-2">
          {mine.slice(0, 6).map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{r.customerName}</p>
                <p className="text-xs text-ink-muted">{formatDate(r.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatINR(r.totalAmount)}</p>
              </div>
            </div>
          ))}
          {mine.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-muted">No work logged yet</p>
          )}
        </div>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          to="/app/earnings"
          className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm font-medium hover:bg-slate-50"
        >
          <Wallet className="h-4 w-4 text-[#0064f0]" />
          View Earnings
        </Link>
        <Link
          to="/app/work"
          className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm font-medium hover:bg-slate-50"
        >
          <ClipboardList className="h-4 w-4 text-[#0064f0]" />
          My Work Records
        </Link>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { session } = useAuth()
  if (session?.role === 'worker') return <WorkerDashboard />
  return <OwnerDashboard />
}
