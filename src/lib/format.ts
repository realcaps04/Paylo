import { format, formatDistanceToNow, isToday, parseISO } from 'date-fns'

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatINRCompact(amount: number) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`
  }
  return formatINR(amount)
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatDate(iso: string) {
  const d = parseISO(iso)
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`
  return format(d, 'd MMM, h:mm a')
}

export function formatShortDate(iso: string) {
  return format(parseISO(iso), 'd MMM')
}

export function relativeTime(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}
