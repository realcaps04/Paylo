import { uid } from '@/lib/format'
import type { Customer, WorkRecord } from '@/types'

/** Stable identity for a shop customer: phone when present, otherwise name. */
export function customerKey(name: string, phone?: string | null) {
  const p = (phone ?? '').replace(/\D/g, '')
  if (p.length >= 8) return `p:${p}`
  return `n:${name.trim().toLowerCase()}`
}

/**
 * Rebuild shop customers from sales so each transaction contributes to
 * Total Customers (unique people), including sales synced from staff devices.
 */
export function rebuildShopCustomers(input: {
  customers: Customer[]
  workRecords: WorkRecord[]
  shopId: string
}): Customer[] {
  const { customers, workRecords, shopId } = input
  const otherShops = customers.filter((c) => c.shopId !== shopId)

  const existingByKey = new Map<string, Customer>()
  for (const c of customers) {
    if (c.shopId !== shopId) continue
    existingByKey.set(customerKey(c.name, c.phone), c)
  }

  const byKey = new Map<
    string,
    {
      id: string
      name: string
      phone: string
      email?: string
      notes?: string
      totalVisits: number
      totalSpent: number
      pendingAmount: number
      lastVisit: string
    }
  >()

  const sales = [...workRecords]
    .filter((r) => r.shopId === shopId && r.customerName.trim())
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  for (const r of sales) {
    const key = customerKey(r.customerName, r.customerPhone)
    const prev = byKey.get(key)
    const existing = existingByKey.get(key)
    if (prev) {
      byKey.set(key, {
        ...prev,
        // Prefer latest non-empty name/phone
        name: r.customerName.trim() || prev.name,
        phone: (r.customerPhone ?? '').trim() || prev.phone,
        totalVisits: prev.totalVisits + 1,
        totalSpent: prev.totalSpent + r.amountPaid,
        pendingAmount: prev.pendingAmount + r.amountPending,
        lastVisit:
          new Date(r.createdAt).getTime() >= new Date(prev.lastVisit).getTime()
            ? r.createdAt
            : prev.lastVisit,
      })
    } else {
      byKey.set(key, {
        id: existing?.id ?? uid('c'),
        name: r.customerName.trim(),
        phone: (r.customerPhone ?? '').trim(),
        email: existing?.email,
        notes: existing?.notes,
        totalVisits: 1,
        totalSpent: r.amountPaid,
        pendingAmount: r.amountPending,
        lastVisit: r.createdAt,
      })
    }
  }

  const fromSales: Customer[] = Array.from(byKey.entries()).map(([key, row]) => {
    void key
    return {
      id: row.id,
      shopId,
      name: row.name,
      phone: row.phone,
      email: row.email,
      notes: row.notes,
      totalVisits: row.totalVisits,
      totalSpent: row.totalSpent,
      pendingAmount: row.pendingAmount,
      lastVisit: row.lastVisit,
    }
  })

  const saleKeys = new Set(byKey.keys())
  // Keep manually added customers that never appear in a sale yet
  const manualOnly = customers.filter((c) => {
    if (c.shopId !== shopId) return false
    return !saleKeys.has(customerKey(c.name, c.phone))
  })

  return [...otherShops, ...fromSales, ...manualOnly]
}
