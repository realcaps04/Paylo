import type { PaymentStatus, Role, WorkRecord } from '@/types'
import { isToday, isYesterday, parseISO, startOfWeek, startOfMonth, subDays, isAfter } from 'date-fns'

export function canAccess(role: Role, feature: string): boolean {
  const map: Record<Role, string[]> = {
    owner: ['*'],
    manager: [
      'dashboard',
      'workers',
      'transactions',
      'services',
      'reports',
      'customers',
      'work',
      'payments',
    ],
    worker: ['dashboard', 'work', 'own-earnings', 'own-work'],
  }
  if (map[role].includes('*')) return true
  return map[role].includes(feature)
}

export function computePaymentStatus(
  total: number,
  paid: number,
): PaymentStatus {
  if (paid <= 0) return 'pending'
  if (paid >= total) return 'paid'
  return 'partial'
}

export function filterByDateRange(
  records: WorkRecord[],
  preset: string,
  from?: Date,
  to?: Date,
) {
  const now = new Date()
  return records.filter((r) => {
    const d = parseISO(r.createdAt)
    switch (preset) {
      case 'today':
        return isToday(d)
      case 'yesterday':
        return isYesterday(d)
      case 'week':
        return isAfter(d, startOfWeek(now, { weekStartsOn: 1 }))
      case 'month':
        return isAfter(d, startOfMonth(now))
      case '7d':
        return isAfter(d, subDays(now, 7))
      case '30d':
        return isAfter(d, subDays(now, 30))
      case '3m':
        return isAfter(d, subDays(now, 90))
      case 'custom':
        if (from && to) return d >= from && d <= to
        return true
      default:
        return true
    }
  })
}

export function sumField(records: WorkRecord[], field: keyof WorkRecord) {
  return records.reduce((acc, r) => acc + (Number(r[field]) || 0), 0)
}

export function workerStats(records: WorkRecord[], workerId: string) {
  const mine = records.filter((r) => r.workerId === workerId)
  return {
    count: mine.length,
    revenue: sumField(mine, 'totalAmount'),
    collected: sumField(mine, 'amountPaid'),
    pending: sumField(mine, 'amountPending'),
  }
}
