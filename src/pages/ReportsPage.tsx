import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useShop } from '@/context/ShopContext'
import { useToast } from '@/context/ToastContext'
import {
  Button,
  Card,
  PageHeader,
  Select,
  StatCard,
} from '@/components/ui'
import { formatINR } from '@/lib/format'
import { filterByDateRange, sumField, workerStats } from '@/lib/permissions'

const PIE_COLORS = ['#0064f0', '#2f78ff', '#5999ff', '#8ebeff', '#0050c4', '#64748b']

export function ReportsPage() {
  const { workRecords, workers, payments } = useShop()
  const { toast } = useToast()
  const [preset, setPreset] = useState('30d')

  const ranged = useMemo(
    () => filterByDateRange(workRecords, preset),
    [workRecords, preset],
  )

  const revenue = sumField(ranged, 'amountPaid')
  const billed = sumField(ranged, 'totalAmount')
  const pending = sumField(ranged, 'amountPending')
  const jobs = ranged.length

  const revenueOverTime = useMemo(() => {
    const map = new Map<string, number>()
    ranged.forEach((r) => {
      const key = format(parseISO(r.createdAt), 'd MMM')
      map.set(key, (map.get(key) ?? 0) + r.amountPaid)
    })
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
  }, [ranged])

  const workerComparison = useMemo(
    () =>
      workers
        .filter((w) => w.active)
        .map((w) => ({
          name: w.name.split(' ')[0],
          revenue: workerStats(ranged, w.id).revenue,
        }))
        .filter((w) => w.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8),
    [workers, ranged],
  )

  const paymentPie = useMemo(() => {
    const map: Record<string, number> = {}
    ranged.forEach((r) => {
      const m = r.paymentMethod ?? 'other'
      if (r.amountPaid <= 0) return
      map[m] = (map[m] ?? 0) + r.amountPaid
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [ranged])

  const servicePopularity = useMemo(() => {
    const map = new Map<string, number>()
    ranged.forEach((r) => {
      map.set(r.serviceName, (map.get(r.serviceName) ?? 0) + r.quantity)
    })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [ranged])

  const exportReport = (formatType: 'json' | 'csv') => {
    const payload = {
      preset,
      generatedAt: new Date().toISOString(),
      summary: { revenue, billed, pending, jobs },
      records: ranged,
      payments: payments.filter((p) =>
        ranged.some((r) => r.id === p.workRecordId),
      ),
    }
    let blob: Blob
    let filename: string
    if (formatType === 'json') {
      blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      filename = `paylo-report-${preset}.json`
    } else {
      const header = 'Date,Customer,Service,Worker,Amount,Paid,Pending,Status\n'
      const rows = ranged
        .map((r) =>
          [
            r.createdAt,
            r.customerName,
            r.serviceName,
            r.workerId,
            r.totalAmount,
            r.amountPaid,
            r.amountPending,
            r.paymentStatus,
          ].join(','),
        )
        .join('\n')
      blob = new Blob([header + rows], { type: 'text/csv' })
      filename = `paylo-report-${preset}.csv`
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast(`Exported ${formatType.toUpperCase()} report`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Revenue, workers, and service insights"
        actions={
          <div className="flex flex-wrap gap-2">
            <Select
              className="w-auto"
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="3m">Last 3 months</option>
              <option value="month">This month</option>
            </Select>
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => exportReport('json')}>
              Export JSON
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected" value={formatINR(revenue)} />
        <StatCard label="Billed" value={formatINR(billed)} />
        <StatCard label="Pending" value={formatINR(pending)} accent="text-amber-700" />
        <StatCard label="Jobs" value={String(jobs)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold">Revenue over time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueOverTime}>
                <defs>
                  <linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0064f0" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0064f0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0064f0"
                  fill="url(#reportFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold">Worker comparison</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} />
                <Bar dataKey="revenue" fill="#0064f0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold">Payment methods</h2>
          <div className="h-64">
            {paymentPie.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                No payment data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {paymentPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold">Service popularity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servicePopularity} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0064f0" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
