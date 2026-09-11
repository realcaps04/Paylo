import { useMemo, useState } from 'react'
import { Search, UserPlus, Users } from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import { useToast } from '@/context/ToastContext'
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Textarea,
} from '@/components/ui'
import { formatINR, formatShortDate, relativeTime } from '@/lib/format'

export function CustomersPage() {
  const { customers, workRecords, shop, addCustomer } = useShop()
  const { toast } = useToast()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        (c.email ?? '').toLowerCase().includes(query),
    )
  }, [customers, q])

  const save = () => {
    if (!shop || !name.trim()) {
      toast('Customer name is required', 'error')
      return
    }
    addCustomer({
      shopId: shop.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      totalVisits: 0,
      totalSpent: 0,
      pendingAmount: 0,
      lastVisit: new Date().toISOString(),
    })
    toast('Customer added')
    setOpen(false)
    setName('')
    setPhone('')
    setEmail('')
    setNotes('')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        subtitle="People who visit your shop"
        actions={
          <Button onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          className="pl-9"
          placeholder="Search by name or phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Add customers manually or they’ll appear when you log work."
          icon={<Users className="h-6 w-6" />}
          action={
            <Button onClick={() => setOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add Customer
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const history = workRecords.filter(
              (r) => r.customerId === c.id || r.customerPhone === c.phone,
            )
            const isOpen = expanded === c.id
            return (
              <Card key={c.id} className="cursor-pointer" padding>
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-ink">{c.name}</h3>
                      <p className="text-xs text-ink-muted">{c.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-ink-faint">Visits</p>
                      <p className="font-bold text-ink">{c.totalVisits}</p>
                    </div>
                    <div>
                      <p className="text-ink-faint">Spent</p>
                      <p className="font-bold text-ink">{formatINR(c.totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-ink-faint">Pending</p>
                      <p className="font-bold text-amber-700">{formatINR(c.pendingAmount)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-ink-faint">
                    Last visit {formatShortDate(c.lastVisit)} · {relativeTime(c.lastVisit)}
                  </p>
                </button>
                {isOpen && (
                  <div className="mt-4 border-t border-surface-border pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      Recent visits
                    </p>
                    {history.length === 0 ? (
                      <p className="text-sm text-ink-muted">No work history yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {history.slice(0, 5).map((r) => (
                          <div
                            key={r.id}
                            className="flex justify-between text-sm text-ink-soft"
                          >
                            <span>{r.serviceName}</span>
                            <span className="font-medium">{formatINR(r.totalAmount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {c.notes && (
                      <p className="mt-2 text-xs text-ink-muted">Note: {c.notes}</p>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Customer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Add</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
