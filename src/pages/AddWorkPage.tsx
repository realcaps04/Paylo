import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { useToast } from '@/context/ToastContext'
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '@/components/ui'
import { formatINR } from '@/lib/format'
import type { PaymentMethod, PaymentStatus } from '@/types'

export function AddWorkPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { shop, customers, services, workRecords, workers, online, addWorkRecord } = useShop()
  const { toast } = useToast()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [amount, setAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid')
  const [amountPaid, setAmountPaid] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [tip, setTip] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const activeServices = services.filter((s) => s.active)

  const recentServiceIds = useMemo(() => {
    const ids: string[] = []
    for (const r of workRecords) {
      if (r.serviceId && !ids.includes(r.serviceId)) ids.push(r.serviceId)
      if (ids.length >= 4) break
    }
    return ids
  }, [workRecords])

  const quickCustomers = customers.slice(0, 6)

  const baseFromService = (id: string) => {
    const s = services.find((x) => x.id === id)
    if (!s) return
    setServiceId(id)
    setCategory(s.category)
    const total = s.defaultPrice * quantity
    setAmount(total)
    if (paymentStatus === 'paid') setAmountPaid(total)
  }

  const recalc = (qty: number, price: number, disc: number, tx: number, tp: number) => {
    const total = Math.max(0, price * qty - disc + tx + tp)
    setAmount(total)
    if (paymentStatus === 'paid') setAmountPaid(total)
    if (paymentStatus === 'pending') setAmountPaid(0)
  }

  const workerId =
    session?.workerId ??
    workers.find((w) => w.active)?.id ??
    workers[0]?.id ??
    'w_unknown'

  const handleSave = () => {
    if (!shop) {
      toast('No active shop', 'error')
      return
    }
    if (!customerName.trim()) {
      toast('Customer name is required', 'error')
      return
    }
    const service = services.find((s) => s.id === serviceId)
    const totalAmount = Math.max(0, amount)
    let paid = amountPaid
    if (paymentStatus === 'paid') paid = totalAmount
    if (paymentStatus === 'pending') paid = 0
    if (paymentStatus === 'partial') paid = Math.min(paid, totalAmount)

    const record = addWorkRecord({
      shopId: shop.id,
      workerId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      serviceId: service?.id,
      serviceName: service?.name ?? 'Custom service',
      category: category || service?.category || 'General',
      quantity,
      totalAmount,
      amountPaid: paid,
      discount,
      tax,
      tip,
      paymentStatus,
      paymentMethod,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      synced: online,
    })

    if (!record.synced) {
      toast('Saved offline — waiting for sync', 'info')
    } else {
      toast('Work saved')
    }
    setSaved(true)
  }

  const resetForm = () => {
    setCustomerName('')
    setCustomerPhone('')
    setServiceId('')
    setCategory('')
    setQuantity(1)
    setAmount(0)
    setPaymentStatus('paid')
    setAmountPaid(0)
    setDiscount(0)
    setTax(0)
    setTip(0)
    setPaymentMethod('upi')
    setNotes('')
    setSaved(false)
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0064f0]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Work saved</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {customerName} · {formatINR(amount)}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Add Another
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/work')}>
              View Today&apos;s Work
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Add Work"
        subtitle="Log a job quickly — amounts update as you go"
        actions={
          <Link to="/app/work" className="text-sm font-semibold text-brand-700 hover:underline">
            Work records
          </Link>
        }
      />

      <Card className="space-y-4">
        <Field label="Customer name">
          <Input
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Phone" hint="Optional">
          <Input
            placeholder="Phone number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </Field>

        {quickCustomers.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Recent customers
            </p>
            <div className="flex flex-wrap gap-2">
              {quickCustomers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCustomerName(c.name)
                    setCustomerPhone(c.phone)
                  }}
                  className="rounded-full border border-surface-border bg-slate-50 px-3 py-1.5 text-xs font-medium text-ink hover:border-brand-300 hover:bg-brand-50"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Field label="Service">
          <Select
            value={serviceId}
            onChange={(e) => {
              const id = e.target.value
              if (!id) {
                setServiceId('')
                return
              }
              baseFromService(id)
            }}
          >
            <option value="">Select service</option>
            {activeServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {formatINR(s.defaultPrice)}
              </option>
            ))}
          </Select>
        </Field>

        {recentServiceIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recentServiceIds.map((id) => {
              const s = services.find((x) => x.id === id)
              if (!s) return null
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => baseFromService(id)}
                  className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800"
                >
                  {s.name}
                </button>
              )
            })}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category">
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
            />
          </Field>
          <Field label="Quantity">
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                const q = Math.max(1, Number(e.target.value) || 1)
                setQuantity(q)
                const unit = services.find((s) => s.id === serviceId)?.defaultPrice ?? amount / quantity
                recalc(q, unit, discount, tax, tip)
              }}
            />
          </Field>
          <Field label="Amount">
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => {
                const v = Math.max(0, Number(e.target.value) || 0)
                setAmount(v)
                if (paymentStatus === 'paid') setAmountPaid(v)
              }}
            />
          </Field>
        </div>

        <Field label="Payment status">
          <div className="grid grid-cols-3 gap-2">
            {(['paid', 'pending', 'partial'] as PaymentStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setPaymentStatus(s)
                  if (s === 'paid') setAmountPaid(amount)
                  if (s === 'pending') setAmountPaid(0)
                }}
                className={`rounded-btn border px-3 py-2 text-sm font-semibold capitalize ${
                  paymentStatus === s
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-surface-border text-ink-soft'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        {paymentStatus === 'partial' && (
          <Field label="Amount paid">
            <Input
              type="number"
              min={0}
              max={amount}
              value={amountPaid}
              onChange={(e) => setAmountPaid(Math.max(0, Number(e.target.value) || 0))}
            />
          </Field>
        )}

        <Field label="Payment method">
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Bank transfer</option>
            <option value="other">Other</option>
          </Select>
        </Field>

        <button
          type="button"
          className="text-sm font-semibold text-brand-700 hover:underline"
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? 'Hide' : 'Show'} discount / tax / tip
        </button>

        {showMore && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Discount">
              <Input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => {
                  const d = Math.max(0, Number(e.target.value) || 0)
                  setDiscount(d)
                  const unit =
                    services.find((s) => s.id === serviceId)?.defaultPrice ??
                    (quantity ? amount / quantity : 0)
                  recalc(quantity, unit, d, tax, tip)
                }}
              />
            </Field>
            <Field label="Tax">
              <Input
                type="number"
                min={0}
                value={tax}
                onChange={(e) => {
                  const t = Math.max(0, Number(e.target.value) || 0)
                  setTax(t)
                  const unit =
                    services.find((s) => s.id === serviceId)?.defaultPrice ??
                    (quantity ? amount / quantity : 0)
                  recalc(quantity, unit, discount, t, tip)
                }}
              />
            </Field>
            <Field label="Tip">
              <Input
                type="number"
                min={0}
                value={tip}
                onChange={(e) => {
                  const t = Math.max(0, Number(e.target.value) || 0)
                  setTip(t)
                  const unit =
                    services.find((s) => s.id === serviceId)?.defaultPrice ??
                    (quantity ? amount / quantity : 0)
                  recalc(quantity, unit, discount, tax, t)
                }}
              />
            </Field>
          </div>
        )}

        <Field label="Notes" hint="Optional">
          <Textarea
            placeholder="Any notes for this job…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        <div className="flex items-center justify-between rounded-btn bg-slate-50 px-4 py-3">
          <span className="text-sm text-ink-muted">Total</span>
          <span className="font-display text-xl font-bold text-ink">{formatINR(amount)}</span>
        </div>

        <Button className="w-full" size="lg" onClick={handleSave}>
          Save Work
        </Button>
      </Card>
    </div>
  )
}
