import { useState } from 'react'
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
import type { PaymentMethod } from '@/types'

export function AddWorkPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { shop, customers, workers, online, addWorkRecord } = useShop()
  const { toast } = useToast()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [savedAmount, setSavedAmount] = useState(0)

  const quickCustomers = customers.slice(0, 6)

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
    const totalAmount = Math.max(0, Number(amount) || 0)
    if (totalAmount <= 0) {
      toast('Enter the amount collected', 'error')
      return
    }

    addWorkRecord({
      shopId: shop.id,
      workerId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      serviceName: 'Sale',
      category: 'General',
      quantity: 1,
      totalAmount,
      amountPaid: totalAmount,
      discount: 0,
      tax: 0,
      tip: 0,
      paymentStatus: 'paid',
      paymentMethod,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    })

    if (!online) {
      toast('Saved offline — will sync for the shop owner', 'info')
    } else {
      toast('Work saved · visible to shop owner')
    }
    setSavedAmount(totalAmount)
    setSaved(true)
  }

  const resetForm = () => {
    setCustomerName('')
    setCustomerPhone('')
    setAmount('')
    setPaymentMethod('upi')
    setNotes('')
    setSaved(false)
    setSavedAmount(0)
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
            {customerName} · {formatINR(savedAmount)}
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
        subtitle="Record a sale — name and amount are enough"
        actions={
          <Link to="/app/work" className="text-sm font-semibold text-brand-700 hover:underline">
            Work records
          </Link>
        }
      />

      <Card className="space-y-4">
        <Field label="Customer name" hint="Required">
          <Input
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            autoFocus
            required
          />
        </Field>
        <Field label="Mobile number" hint="Optional">
          <Input
            type="tel"
            inputMode="tel"
            placeholder="Mobile number"
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

        <Field label="Amount">
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>

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

        <Field label="Notes" hint="Optional">
          <Textarea
            placeholder="Any notes for this sale…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        <div className="flex items-center justify-between rounded-btn bg-slate-50 px-4 py-3">
          <span className="text-sm text-ink-muted">Total</span>
          <span className="font-display text-xl font-bold text-ink">
            {formatINR(Math.max(0, Number(amount) || 0))}
          </span>
        </div>

        <Button className="w-full" size="lg" onClick={handleSave}>
          Save Work
        </Button>
      </Card>
    </div>
  )
}
