import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  paymentTone,
} from '@/components/ui'
import { formatINR, formatDate } from '@/lib/format'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim().toLowerCase()
  const { workers, customers, services, workRecords } = useShop()

  const results = useMemo(() => {
    if (!q) {
      return { workers: [], customers: [], services: [], transactions: [] }
    }
    return {
      workers: workers.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.phone.includes(q) ||
          w.email.toLowerCase().includes(q),
      ),
      customers: customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email ?? '').toLowerCase().includes(q),
      ),
      services: services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      ),
      transactions: workRecords.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.serviceName.toLowerCase().includes(q) ||
          (r.customerPhone ?? '').includes(q),
      ),
    }
  }, [q, workers, customers, services, workRecords])

  const total =
    results.workers.length +
    results.customers.length +
    results.services.length +
    results.transactions.length

  return (
    <div className="space-y-5">
      <PageHeader
        title="Search"
        subtitle={q ? `Results for “${params.get('q')}”` : 'Type a query in the header search'}
      />

      {!q ? (
        <EmptyState
          title="Search Paylo"
          description="Find workers, customers, services, and transactions."
          icon={<SearchIcon className="h-6 w-6" />}
        />
      ) : total === 0 ? (
        <EmptyState
          title="No matches"
          description="Try another name, phone, or service."
          icon={<SearchIcon className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-5">
          {results.workers.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Workers</h2>
                <Link to="/app/workers" className="text-sm font-semibold text-brand-700">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {results.workers.map((w) => (
                  <Card key={w.id} className="!py-3">
                    <p className="font-semibold text-ink">{w.name}</p>
                    <p className="text-xs capitalize text-ink-muted">
                      {w.role} · {w.phone || w.email}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.customers.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Customers</h2>
                <Link to="/app/customers" className="text-sm font-semibold text-brand-700">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {results.customers.map((c) => (
                  <Card key={c.id} className="!py-3">
                    <p className="font-semibold text-ink">{c.name}</p>
                    <p className="text-xs text-ink-muted">
                      {c.phone} · Spent {formatINR(c.totalSpent)}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.services.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Services</h2>
                <Link to="/app/services" className="text-sm font-semibold text-brand-700">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {results.services.map((s) => (
                  <Card key={s.id} className="!py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-ink">{s.name}</p>
                        <p className="text-xs text-ink-muted">{s.category}</p>
                      </div>
                      <p className="font-semibold text-brand-800">
                        {formatINR(s.defaultPrice)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.transactions.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Transactions</h2>
                <Link
                  to="/app/transactions"
                  className="text-sm font-semibold text-brand-700"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {results.transactions.slice(0, 12).map((r) => (
                  <Card key={r.id} className="!py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{r.customerName}</p>
                        <p className="text-xs text-ink-muted">
                          {r.serviceName} · {formatDate(r.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatINR(r.totalAmount)}</p>
                        <Badge tone={paymentTone(r.paymentStatus)}>{r.paymentStatus}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
