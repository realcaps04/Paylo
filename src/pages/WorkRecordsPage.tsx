import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
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

export function WorkRecordsPage() {
  const { session } = useAuth()
  const { workRecords, workers } = useShop()
  const [preset, setPreset] = useState('30d')
  const [status, setStatus] = useState('all')

  const isWorker = session?.role === 'worker'

  const list = useMemo(() => {
    let records = workRecords
    if (isWorker && session?.workerId) {
      records = records.filter((r) => r.workerId === session.workerId)
    }
    records = filterByDateRange(records, preset)
    if (status !== 'all') records = records.filter((r) => r.paymentStatus === status)
    return records
  }, [workRecords, isWorker, session?.workerId, preset, status])

  const workerName = (id: string) => workers.find((w) => w.id === id)?.name ?? '—'

  return (
    <div className="space-y-5">
      <PageHeader
        title={isWorker ? 'My Work' : 'Work Records'}
        subtitle={isWorker ? 'Jobs you have logged' : 'All work across the shop'}
        actions={
          isWorker ? (
            <Link to="/app/work/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add Work
              </Button>
            </Link>
          ) : undefined
        }
      />

      <Card>
        <div className="flex flex-wrap gap-3">
          <Select
            className="w-full sm:w-44"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="month">This month</option>
            <option value="3m">Last 3 months</option>
          </Select>
          <Select
            className="w-full sm:w-44"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </Select>
        </div>
      </Card>

      {list.length === 0 ? (
        <EmptyState
          title="No work records"
          description={
            isWorker
              ? 'Log your first job to see it here.'
              : 'Sales recorded by your staff will show up here.'
          }
          icon={<Briefcase className="h-6 w-6" />}
          action={
            isWorker ? (
              <Link to="/app/work/new">
                <Button>Add Work</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {list.map((r) => (
            <Card key={r.id} className="!py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink">{r.customerName}</p>
                  <p className="text-sm text-ink-muted">
                    {r.serviceName}
                    {!isWorker && ` · ${workerName(r.workerId)}`}
                    {' · '}
                    {formatDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{formatINR(r.totalAmount)}</p>
                    {!r.synced && (
                      <p className="text-[11px] font-medium text-amber-600">Offline</p>
                    )}
                  </div>
                  <Badge tone={paymentTone(r.paymentStatus)}>{r.paymentStatus}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
