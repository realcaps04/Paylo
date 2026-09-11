import { useMemo, useState } from 'react'
import { CreditCard, IndianRupee } from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import { useToast } from '@/context/ToastContext'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  StatCard,
  paymentTone,
} from '@/components/ui'
import { formatINR, formatDate, relativeTime } from '@/lib/format'
import { sumField } from '@/lib/permissions'
import type { PaymentMethod, WorkRecord } from '@/types'

export function PaymentsPage() {
  const { workRecords, payments, recordPayment } = useShop()
  const { toast } = useToast()
  const [markPaidId, setMarkPaidId] = useState<string | null>(null)
  const [partialId, setPartialId] = useState<string | null>(null)
  const [partialAmount, setPartialAmount] = useState(0)
  const [method, setMethod] = useState<PaymentMethod>('upi')

  const totalRevenue = sumField(workRecords, 'totalAmount')
  const collected = sumField(workRecords, 'amountPaid')
  const pending = sumField(workRecords, 'amountPending')
  const refunded = payments
    .filter((p) => p.type === 'refund')
    .reduce((a, p) => a + p.amount, 0)

  const methodBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    workRecords.forEach((r) => {
      if (!r.paymentMethod || r.amountPaid <= 0) return
      map[r.paymentMethod] = (map[r.paymentMethod] ?? 0) + r.amountPaid
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [workRecords])

  const outstanding = workRecords.filter(
    (r) => r.paymentStatus === 'pending' || r.paymentStatus === 'partial',
  )

  const findRecord = (id: string | null): WorkRecord | undefined =>
    workRecords.find((r) => r.id === id)

  const confirmMarkPaid = () => {
    const r = findRecord(markPaidId)
    if (!r) return
    const due = r.amountPending
    if (due > 0) recordPayment(r.id, due, method, 'payment')
    toast('Marked as paid')
    setMarkPaidId(null)
  }

  const confirmPartial = () => {
    const r = findRecord(partialId)
    if (!r || partialAmount <= 0) return
    recordPayment(r.id, Math.min(partialAmount, r.amountPending), method, 'partial')
    toast('Partial payment recorded')
    setPartialId(null)
    setPartialAmount(0)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments"
        subtitle="Track collections, pending dues, and payment history"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatINR(totalRevenue)} />
        <StatCard label="Collected" value={formatINR(collected)} accent="text-brand-700" />
        <StatCard label="Pending" value={formatINR(pending)} accent="text-amber-700" />
        <StatCard label="Refunded" value={formatINR(refunded)} accent="text-red-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">
            Payment methods
          </h2>
          {methodBreakdown.length === 0 ? (
            <p className="text-sm text-ink-muted">No collections yet</p>
          ) : (
            <div className="space-y-3">
              {methodBreakdown.map(([m, amt]) => (
                <div key={m} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 capitalize text-ink-soft">
                    <IndianRupee className="h-3.5 w-3.5 text-brand-700" />
                    {m}
                  </span>
                  <span className="font-semibold">{formatINR(amt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">
            Pending & partial
          </h2>
          {outstanding.length === 0 ? (
            <EmptyState
              title="All caught up"
              description="No pending or partial payments right now."
              icon={<CreditCard className="h-6 w-6" />}
            />
          ) : (
            <div className="space-y-2">
              {outstanding.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-btn border border-surface-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.customerName}</p>
                    <p className="text-xs text-ink-muted">
                      {r.serviceName} · Due {formatINR(r.amountPending)} ·{' '}
                      <Badge tone={paymentTone(r.paymentStatus)}>{r.paymentStatus}</Badge>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setMethod(r.paymentMethod ?? 'upi')
                        setMarkPaidId(r.id)
                      }}
                    >
                      Mark as Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMethod(r.paymentMethod ?? 'upi')
                        setPartialAmount(Math.min(500, r.amountPending))
                        setPartialId(r.id)
                      }}
                    >
                      Record Partial
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Payment history</h2>
        {payments.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">No payment entries yet</p>
        ) : (
          <div className="space-y-2">
            {payments.slice(0, 20).map((p) => {
              const wr = workRecords.find((r) => r.id === p.workRecordId)
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-btn border border-surface-border px-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {wr?.customerName ?? 'Payment'} · {formatINR(p.amount)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {p.type} · {p.method} · {relativeTime(p.createdAt)}
                    </p>
                  </div>
                  <span className="text-xs text-ink-faint">{formatDate(p.createdAt)}</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal
        open={!!markPaidId}
        onClose={() => setMarkPaidId(null)}
        title="Mark as Paid"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMarkPaidId(null)}>
              Cancel
            </Button>
            <Button onClick={confirmMarkPaid}>Confirm</Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-ink-muted">
          Collect the remaining {formatINR(findRecord(markPaidId)?.amountPending ?? 0)} for{' '}
          {findRecord(markPaidId)?.customerName}.
        </p>
        <Field label="Payment method">
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
            <option value="other">Other</option>
          </Select>
        </Field>
      </Modal>

      <Modal
        open={!!partialId}
        onClose={() => setPartialId(null)}
        title="Record Partial Payment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPartialId(null)}>
              Cancel
            </Button>
            <Button onClick={confirmPartial}>Save</Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-ink-muted">
          Outstanding: {formatINR(findRecord(partialId)?.amountPending ?? 0)}
        </p>
        <div className="space-y-3">
          <Field label="Amount">
            <Input
              type="number"
              min={1}
              value={partialAmount}
              onChange={(e) => setPartialAmount(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Payment method">
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank</option>
              <option value="other">Other</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
