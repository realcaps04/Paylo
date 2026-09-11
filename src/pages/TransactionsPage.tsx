import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus } from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Select,
  paymentTone,
} from '@/components/ui'
import { formatINR, formatDate } from '@/lib/format'
import { filterByDateRange } from '@/lib/permissions'

export function TransactionsPage() {
  const { workRecords, workers, services } = useShop()
  const [datePreset, setDatePreset] = useState('30d')
  const [workerId, setWorkerId] = useState('all')
  const [status, setStatus] = useState('all')
  const [serviceId, setServiceId] = useState('all')

  const filtered = useMemo(() => {
    let list = filterByDateRange(workRecords, datePreset)
    if (workerId !== 'all') list = list.filter((r) => r.workerId === workerId)
    if (status !== 'all') list = list.filter((r) => r.paymentStatus === status)
    if (serviceId !== 'all') list = list.filter((r) => r.serviceId === serviceId)
    return list
  }, [workRecords, datePreset, workerId, status, serviceId])

  const workerName = (id: string) => workers.find((w) => w.id === id)?.name ?? '—'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        subtitle="All billed work across your shop"
        actions={
          <Link to="/app/work/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Work
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={datePreset} onChange={(e) => setDatePreset(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="month">This month</option>
            <option value="3m">Last 3 months</option>
          </Select>
          <Select value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
            <option value="all">All workers</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="refunded">Refunded</option>
          </Select>
          <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="all">All services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try a different filter or log a new job."
          icon={<ClipboardList className="h-6 w-6" />}
          action={
            <Link to="/app/work/new">
              <Button>Add Work</Button>
            </Link>
          }
        />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-slate-50/80 text-ink-muted">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Worker</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                  <th className="px-4 py-3 font-medium">Pending</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-surface-border/70 last:border-0">
                    <td className="px-4 py-3 text-ink-soft">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-ink">{r.customerName}</td>
                    <td className="px-4 py-3">{workerName(r.workerId)}</td>
                    <td className="px-4 py-3">{r.serviceName}</td>
                    <td className="px-4 py-3 font-medium">{formatINR(r.totalAmount)}</td>
                    <td className="px-4 py-3">{formatINR(r.amountPaid)}</td>
                    <td className="px-4 py-3 text-amber-700">{formatINR(r.amountPending)}</td>
                    <td className="px-4 py-3 capitalize">{r.paymentMethod ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge tone={paymentTone(r.paymentStatus)}>{r.paymentStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
