import { useMemo, useState } from 'react'
import { ClipboardList, ListFilter, X } from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  Select,
} from '@/components/ui'
import { formatINR, formatDate } from '@/lib/format'
import { filterByDateRange } from '@/lib/permissions'
import { cn } from '@/lib/cn'
import type { PaymentMethod } from '@/types'

const DATE_LABELS: Record<string, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  month: 'This month',
  '3m': 'Last 3 months',
}

const METHOD_LABELS: Record<string, string> = {
  upi: 'UPI',
  cash: 'Cash',
  card: 'Card',
  bank: 'Bank transfer',
  other: 'Other',
}

type Filters = {
  datePreset: string
  workerId: string
  paymentMethod: string
}

const DEFAULT_FILTERS: Filters = {
  datePreset: '30d',
  workerId: 'all',
  paymentMethod: 'all',
}

function countActiveFilters(f: Filters) {
  let n = 0
  if (f.datePreset !== DEFAULT_FILTERS.datePreset) n += 1
  if (f.workerId !== 'all') n += 1
  if (f.paymentMethod !== 'all') n += 1
  return n
}

export function TransactionsPage() {
  const { workRecords, workers } = useShop()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = filterByDateRange(workRecords, filters.datePreset)
    if (filters.workerId !== 'all') list = list.filter((r) => r.workerId === filters.workerId)
    if (filters.paymentMethod !== 'all') {
      list = list.filter((r) => (r.paymentMethod ?? 'other') === filters.paymentMethod)
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [workRecords, filters])

  const workerName = (id: string) => workers.find((w) => w.id === id)?.name ?? '—'
  const activeCount = countActiveFilters(filters)

  const openFilters = () => {
    setDraft(filters)
    setFilterOpen(true)
  }

  const applyFilters = () => {
    setFilters(draft)
    setFilterOpen(false)
  }

  const resetFilters = () => {
    setDraft(DEFAULT_FILTERS)
  }

  const clearChip = (key: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [key]: DEFAULT_FILTERS[key] }))
  }

  const chips: { key: keyof Filters; label: string }[] = []
  if (filters.datePreset !== DEFAULT_FILTERS.datePreset) {
    chips.push({ key: 'datePreset', label: DATE_LABELS[filters.datePreset] ?? filters.datePreset })
  }
  if (filters.workerId !== 'all') {
    chips.push({ key: 'workerId', label: workerName(filters.workerId) })
  }
  if (filters.paymentMethod !== 'all') {
    chips.push({
      key: 'paymentMethod',
      label: METHOD_LABELS[filters.paymentMethod] ?? filters.paymentMethod,
    })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        subtitle="All billed work across your shop"
        actions={
          <Button
            variant="outline"
            onClick={openFilters}
            className={cn(activeCount > 0 && 'border-[#0064f0]/40 bg-[#eef5ff] text-[#0064f0]')}
          >
            <ListFilter className="h-4 w-4" />
            Filter
            {activeCount > 0 && (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0064f0] px-1.5 text-[11px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openFilters}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-[#0064f0]/35 hover:text-[#0064f0]"
        >
          <ListFilter className="h-3.5 w-3.5" />
          {DATE_LABELS[filters.datePreset] ?? 'Date'}
        </button>
        {chips
          .filter((c) => c.key !== 'datePreset')
          .map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => clearChip(chip.key)}
              className="inline-flex items-center gap-1 rounded-full border border-[#cfe0ff] bg-[#eef5ff] px-3 py-1.5 text-xs font-semibold text-[#0064f0]"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="text-xs font-semibold text-slate-500 hover:text-[#0064f0]"
          >
            Clear all
          </button>
        )}
        <span className="ml-auto text-xs font-medium text-slate-400">
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try a different filter, or wait for staff to record sales."
          icon={<ClipboardList className="h-6 w-6" />}
        />
      ) : (
        <>
          <div className="space-y-2.5 md:hidden">
            {filtered.map((r) => (
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
                    {formatDate(r.createdAt)} · {workerName(r.workerId)}
                    {r.paymentMethod
                      ? ` · ${METHOD_LABELS[r.paymentMethod] ?? r.paymentMethod}`
                      : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-[#0f1a33]">{formatINR(r.totalAmount)}</p>
                </div>
              </div>
            ))}
          </div>

          <Card padding={false} className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-slate-50/80 text-ink-muted">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Worker</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-surface-border/70 last:border-0">
                      <td className="px-4 py-3 text-ink-soft">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-ink">{r.customerName}</td>
                      <td className="px-4 py-3">{workerName(r.workerId)}</td>
                      <td className="px-4 py-3 font-medium">{formatINR(r.totalAmount)}</td>
                      <td className="px-4 py-3">
                        {r.paymentMethod
                          ? METHOD_LABELS[r.paymentMethod] ?? r.paymentMethod
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Modal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter transactions"
        footer={
          <>
            <Button variant="ghost" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>Apply filters</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Date range">
            <Select
              value={draft.datePreset}
              onChange={(e) => setDraft((f) => ({ ...f, datePreset: e.target.value }))}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="month">This month</option>
              <option value="3m">Last 3 months</option>
            </Select>
          </Field>

          <Field label="Worker">
            <Select
              value={draft.workerId}
              onChange={(e) => setDraft((f) => ({ ...f, workerId: e.target.value }))}
            >
              <option value="all">All workers</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Payment method">
            <Select
              value={draft.paymentMethod}
              onChange={(e) => setDraft((f) => ({ ...f, paymentMethod: e.target.value }))}
            >
              <option value="all">All methods</option>
              {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>
                  {METHOD_LABELS[m]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
