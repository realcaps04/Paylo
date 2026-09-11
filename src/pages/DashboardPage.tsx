import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  ClipboardList,
  CreditCard,
  Plus,
  Users,
  Wallet,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import {
  Avatar,
  Badge,
  Button,
  Card,
  PageHeader,
  Segmented,
  StatCard,
  paymentTone,
} from '@/components/ui'
import { formatINR, formatDate, greeting } from '@/lib/format'
import { filterByDateRange, sumField, workerStats } from '@/lib/permissions'

function OwnerDashboard() {
  const { session } = useAuth()
  const { shop, workRecords, workers } = useShop()
  const [range, setRange] = useState('today')

  const todayRecords = useMemo(
    () => filterByDateRange(workRecords, 'today'),
    [workRecords],
  )
  const ranged = useMemo(
    () => filterByDateRange(workRecords, range),
    [workRecords, range],
  )

  const todayRevenue = sumField(todayRecords, 'amountPaid')
  const todayTxns = todayRecords.length
  const pending = sumField(workRecords, 'amountPending')
  const activeWorkers = workers.filter((w) => w.active && w.role !== 'owner').length

  const chartData = useMemo(() => {
    const buckets = new Map<string, number>()
    ranged.forEach((r) => {
      const key =
        range === 'today'
          ? format(parseISO(r.createdAt), 'h a')
          : format(parseISO(r.createdAt), 'd MMM')
      buckets.set(key, (buckets.get(key) ?? 0) + r.amountPaid)
    })
    return Array.from(buckets.entries()).map(([label, revenue]) => ({
      label,
      revenue,
    }))
  }, [ranged, range])

  const performance = workers
    .filter((w) => w.active)
    .map((w) => ({
      worker: w,
      ...workerStats(filterByDateRange(workRecords, '30d'), w.id),
    }))
    .sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${session?.user.name?.split(' ')[0] ?? 'there'}`}
        subtitle={shop ? `${shop.name} · ${shop.city}` : 'Your shop overview'}
        actions={
          <Link to="/app/work/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Work
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Revenue" value={formatINR(todayRevenue)} hint="Collected today" />
        <StatCard label="Transactions" value={String(todayTxns)} hint="Work logged today" />
        <StatCard label="Pending" value={formatINR(pending)} hint="Outstanding amount" accent="text-amber-700" />
        <StatCard label="Active Workers" value={String(activeWorkers)} hint="On your team" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Revenue Overview</h2>
            <p className="text-sm text-ink-muted">Collected payments over time</p>
          </div>
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { label: 'Today', value: 'today' },
              { label: '7 Days', value: '7d' },
              { label: '30 Days', value: '30d' },
              { label: '3 Months', value: '3m' },
            ]}
          />
        </div>
        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-muted">
              No revenue in this period yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0064f0" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0064f0" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value) => formatINR(Number(value ?? 0))}
                  contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0064f0"
                  strokeWidth={2.5}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Worker Performance</h2>
            <Link to="/app/workers" className="text-sm font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-ink-muted">
                  <th className="pb-2 font-medium">Worker</th>
                  <th className="pb-2 font-medium">Jobs</th>
                  <th className="pb-2 font-medium">Revenue</th>
                  <th className="pb-2 font-medium">Pending</th>
                </tr>
              </thead>
              <tbody>
                {performance.slice(0, 6).map(({ worker, count, revenue, pending: p }) => (
                  <tr key={worker.id} className="border-b border-surface-border/70 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={worker.name} size="sm" />
                        <div>
                          <p className="font-medium text-ink">{worker.name}</p>
                          <p className="text-xs text-ink-faint capitalize">{worker.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{count}</td>
                    <td className="py-3 font-medium">{formatINR(revenue)}</td>
                    <td className="py-3 text-amber-700">{formatINR(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/app/work/new', label: 'Add Work', icon: Plus },
              { to: '/app/payments', label: 'Collect Payments', icon: CreditCard },
              { to: '/app/workers', label: 'Manage Team', icon: Users },
              { to: '/app/transactions', label: 'View Transactions', icon: ClipboardList },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between rounded-btn border border-surface-border px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <a.icon className="h-4 w-4 text-brand-700" />
                  {a.label}
                </span>
                <ArrowRight className="h-4 w-4 text-ink-faint" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
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
  const pending = sumField(mine, 'amountPending')

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${session?.user.name?.split(' ')[0] ?? 'there'}`}
        subtitle={shop?.name ?? 'Your work today'}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Today's Work" value={String(today.length)} />
        <StatCard label="Earnings" value={formatINR(earnings)} accent="text-brand-700" />
        <StatCard label="Pending" value={formatINR(pending)} accent="text-amber-700" />
      </div>

      <Link
        to="/app/work/new"
        className="flex items-center justify-center gap-3 rounded-card bg-brand-600 px-6 py-8 text-white shadow-float transition hover:bg-brand-700"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
        <span className="font-display text-2xl font-bold">Add Work</span>
      </Link>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent Work</h2>
          <Link to="/app/work" className="text-sm font-semibold text-brand-700 hover:underline">
            See all
          </Link>
        </div>
        <div className="space-y-2">
          {mine.slice(0, 6).map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-btn border border-surface-border px-3 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{r.customerName}</p>
                <p className="text-xs text-ink-muted">
                  {r.serviceName} · {formatDate(r.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatINR(r.totalAmount)}</p>
                <Badge tone={paymentTone(r.paymentStatus)}>{r.paymentStatus}</Badge>
              </div>
            </div>
          ))}
          {mine.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-muted">No work logged yet</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Quick Actions</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            to="/app/earnings"
            className="flex items-center gap-2 rounded-btn border border-surface-border px-3 py-3 text-sm font-medium hover:bg-slate-50"
          >
            <Wallet className="h-4 w-4 text-brand-700" />
            View Earnings
          </Link>
          <Link
            to="/app/work"
            className="flex items-center gap-2 rounded-btn border border-surface-border px-3 py-3 text-sm font-medium hover:bg-slate-50"
          >
            <ClipboardList className="h-4 w-4 text-brand-700" />
            My Work Records
          </Link>
        </div>
      </Card>
    </div>
  )
}

export function DashboardPage() {
  const { session } = useAuth()
  if (session?.role === 'worker') return <WorkerDashboard />
  return <OwnerDashboard />
}
