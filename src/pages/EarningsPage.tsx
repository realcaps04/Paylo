import { useMemo, useState } from 'react'
import { Wallet } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Segmented,
  StatCard,
  paymentTone,
} from '@/components/ui'
import { formatINR, formatDate } from '@/lib/format'
import { filterByDateRange, sumField } from '@/lib/permissions'

export function EarningsPage() {
  const { session } = useAuth()
  const { workRecords } = useShop()
  const [range, setRange] = useState('today')

  const mine = useMemo(
    () => workRecords.filter((r) => r.workerId === session?.workerId),
    [workRecords, session?.workerId],
  )

  const today = filterByDateRange(mine, 'today')
  const week = filterByDateRange(mine, 'week')
  const month = filterByDateRange(mine, 'month')
  const ranged = filterByDateRange(mine, range === 'today' ? 'today' : range === 'week' ? 'week' : 'month')

  const pending = sumField(mine, 'amountPending')

  return (
    <div className="space-y-5">
      <PageHeader
        title="Earnings"
        subtitle="Your collected and pending amounts"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today" value={formatINR(sumField(today, 'amountPaid'))} />
        <StatCard label="This week" value={formatINR(sumField(week, 'amountPaid'))} />
        <StatCard label="This month" value={formatINR(sumField(month, 'amountPaid'))} />
        <StatCard label="Pending" value={formatINR(pending)} accent="text-amber-700" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Earnings list</h2>
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { label: 'Today', value: 'today' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
            ]}
          />
        </div>

        {ranged.length === 0 ? (
          <EmptyState
            title="No earnings in this period"
            description="Log paid work to see your earnings here."
            icon={<Wallet className="h-6 w-6" />}
          />
        ) : (
          <div className="space-y-2">
            {ranged.map((r) => (
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
                  <p className="text-sm font-bold text-brand-800">
                    {formatINR(r.amountPaid)}
                  </p>
                  <Badge tone={paymentTone(r.paymentStatus)}>{r.paymentStatus}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
