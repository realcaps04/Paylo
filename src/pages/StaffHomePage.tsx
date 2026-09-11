import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  FileText,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  Wallet,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { useToast } from '@/context/ToastContext'
import {
  Button,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
} from '@/components/ui'
import { formatINR, greeting } from '@/lib/format'
import { filterByDateRange, sumField } from '@/lib/permissions'
import { cn } from '@/lib/cn'
import type { PaymentMethod, WorkRecord } from '@/types'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: 'UPI',
  cash: 'Cash',
  card: 'Card',
  bank: 'Bank',
  other: 'Other',
}

export function StaffHomePage() {
  const { session } = useAuth()
  const { workRecords, shop, updateWorkRecord, deleteWorkRecord } = useShop()
  const { toast } = useToast()

  const workerId = session?.workerId
  const firstName = session?.user.name?.split(' ')[0] ?? 'there'

  const mine = useMemo(
    () => workRecords.filter((r) => r.workerId === workerId),
    [workRecords, workerId],
  )
  const [range, setRange] = useState('today')
  const [editTarget, setEditTarget] = useState<WorkRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkRecord | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [editReason, setEditReason] = useState('')
  const [saving, setSaving] = useState(false)

  const today = useMemo(() => filterByDateRange(mine, 'today'), [mine])
  const todaySales = sumField(today, 'totalAmount')
  const recent = mine.slice(0, 8)

  const ranged = useMemo(() => filterByDateRange(mine, range), [mine, range])
  const rangeTotal = sumField(ranged, 'totalAmount')
  const rangeLabel =
    range === 'today'
      ? 'Today'
      : range === 'yesterday'
        ? 'Yesterday'
        : range === '7d'
          ? 'Last 7 days'
          : range === '30d'
            ? 'Last 30 days'
            : range === 'month'
              ? 'This month'
              : 'Selected period'

  const openEdit = (r: WorkRecord) => {
    setEditTarget(r)
    setCustomerName(r.customerName)
    setCustomerPhone(r.customerPhone ?? '')
    setAmount(String(r.totalAmount))
    setPaymentMethod(r.paymentMethod ?? 'upi')
    setEditReason('')
  }

  const saveEdit = () => {
    if (!editTarget) return
    if (!customerName.trim()) {
      toast('Customer name is required', 'error')
      return
    }
    const totalAmount = Math.max(0, Number(amount) || 0)
    if (totalAmount <= 0) {
      toast('Enter a valid amount', 'error')
      return
    }
    if (editReason.trim().length < 3) {
      toast('Edit reason is required (min 3 characters)', 'error')
      return
    }

    setSaving(true)
    try {
      updateWorkRecord(
        editTarget.id,
        {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          totalAmount,
          amountPaid: totalAmount,
          paymentMethod,
          paymentStatus: 'paid',
        },
        {
          editReason: editReason.trim(),
          editedBy: session?.user.email || session?.user.name,
        },
      )
      toast('Sale updated')
      setEditTarget(null)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteWorkRecord(deleteTarget.id)
    toast('Sale deleted')
    setDeleteTarget(null)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-2">
      <div>
        <p className="text-[13px] font-medium text-slate-500">{shop?.name ?? 'Your shop'}</p>
        <h1 className="mt-1 font-display text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-[#0f1a33]">
          {greeting()}, {firstName}!
        </h1>
        <p className="mt-1 text-[14px] text-slate-500">Let&apos;s keep your shop moving.</p>
      </div>

      <div className="rounded-[22px] bg-[#0064f0] px-5 py-5 text-white shadow-lg shadow-[#0064f0]/28">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-white/75">Total work amount</p>
            <p className="mt-1 font-display text-[32px] font-extrabold tracking-[-0.03em]">
              {formatINR(rangeTotal)}
            </p>
            <p className="mt-1 text-[12px] text-white/70">
              {ranged.length} bill{ranged.length === 1 ? '' : 's'} · {rangeLabel}
            </p>
          </div>
          <label className="shrink-0">
            <span className="sr-only">Date range</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-full border-0 bg-white/15 py-2 pl-3 pr-8 text-[12px] font-semibold text-white outline-none ring-1 ring-white/25 backdrop-blur-sm focus:ring-2 focus:ring-white/50"
            >
              <option value="today" className="text-[#0f1a33]">
                Today
              </option>
              <option value="yesterday" className="text-[#0f1a33]">
                Yesterday
              </option>
              <option value="7d" className="text-[#0f1a33]">
                Last 7 days
              </option>
              <option value="30d" className="text-[#0f1a33]">
                Last 30 days
              </option>
              <option value="month" className="text-[#0f1a33]">
                This month
              </option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Link
          to="/app/work/new"
          className="rounded-[18px] border border-slate-200/80 bg-white p-3 shadow-sm transition hover:border-[#0064f0]/30"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShoppingCart className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <p className="mt-2.5 text-[12px] font-bold text-[#0f1a33]">New Sale</p>
          <p className="mt-0.5 text-[10px] leading-snug text-slate-400">Create a new bill</p>
        </Link>
        <Link
          to="/app/work"
          className="rounded-[18px] border border-slate-200/80 bg-white p-3 shadow-sm transition hover:border-[#0064f0]/30"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <ClipboardList className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <p className="mt-2.5 text-[12px] font-bold text-[#0f1a33]">My Work</p>
          <p className="mt-0.5 text-[10px] leading-snug text-slate-400">See your activity</p>
        </Link>
        <Link
          to="/app/earnings"
          className="rounded-[18px] border border-slate-200/80 bg-white p-3 shadow-sm transition hover:border-[#0064f0]/30"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Wallet className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <p className="mt-2.5 text-[12px] font-bold text-[#0f1a33]">Earnings</p>
          <p className="mt-0.5 text-[10px] leading-snug text-slate-400">Today&apos;s totals</p>
        </Link>
      </div>

      <section>
        <h2 className="mb-2.5 font-display text-base font-bold text-[#0f1a33]">
          Today&apos;s Summary
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-[18px] border border-slate-200/80 bg-white px-3 py-3.5 text-center shadow-sm">
            <p className="font-display text-xl font-extrabold text-[#0f1a33]">{today.length}</p>
            <p className="mt-1 text-[10px] font-medium text-slate-400">Bills created</p>
          </div>
          <div className="rounded-[18px] border border-slate-200/80 bg-white px-3 py-3.5 text-center shadow-sm">
            <p className="font-display text-xl font-extrabold text-[#0f1a33]">
              {formatINR(todaySales)}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-400">Total sales</p>
          </div>
          <div className="rounded-[18px] border border-slate-200/80 bg-white px-3 py-3.5 text-center shadow-sm">
            <p className="font-display text-xl font-extrabold text-[#0f1a33]">
              {formatINR(sumField(today, 'amountPaid'))}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-400">Collected</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-[#0f1a33]">Recent Bills</h2>
          <Link to="/app/work" className="text-[12px] font-semibold text-[#0064f0]">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-600">No bills yet</p>
            <p className="mt-1 text-xs text-slate-400">Record your first sale to see it here.</p>
            <Link
              to="/app/work/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0064f0] px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Work
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-[18px] border border-slate-200/80 bg-white px-3 py-3 shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0064f0]">
                  <FileText className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0f1a33]">{r.customerName}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {format(parseISO(r.createdAt), 'h:mm a')}
                    {r.paymentMethod ? ` · ${METHOD_LABELS[r.paymentMethod]}` : ''}
                    {r.editReason ? ' · Edited' : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-[#0f1a33]">{formatINR(r.totalAmount)}</p>
                  <div className="mt-1.5 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label="Edit sale"
                      onClick={() => openEdit(r)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        'bg-[#eef5ff] text-[#0064f0] hover:bg-[#dcebff]',
                      )}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete sale"
                      onClick={() => setDeleteTarget(r)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Edit sale"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={saveEdit}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Customer name" hint="Required">
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </Field>
          <Field label="Mobile number" hint="Optional">
            <Input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </Field>
          <Field label="Amount">
            <Input
              type="number"
              min={0}
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
          <Field label="Reason for edit" hint="Required — saved for the shop owner">
            <Textarea
              placeholder="Why are you changing this sale?"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              rows={3}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete sale?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Remove sale for{' '}
          <span className="font-semibold text-[#0f1a33]">{deleteTarget?.customerName}</span>{' '}
          ({formatINR(deleteTarget?.totalAmount ?? 0)})? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
