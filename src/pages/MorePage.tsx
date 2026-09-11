import { Link } from 'react-router-dom'
import {
  ChartColumn,
  ChevronRight,
  CreditCard,
  Package,
  Settings,
  Users,
} from 'lucide-react'
import { Card, PageHeader } from '@/components/ui'

const LINKS = [
  { to: '/app/workers', label: 'Workers', desc: 'Manage your team', icon: Users },
  { to: '/app/services', label: 'Services', desc: 'Prices & catalog', icon: Package },
  { to: '/app/customers', label: 'Customers', desc: 'Visitor directory', icon: Users },
  { to: '/app/reports', label: 'Reports', desc: 'Insights & export', icon: ChartColumn },
  { to: '/app/payments', label: 'Payments', desc: 'Collections & dues', icon: CreditCard },
  { to: '/app/settings', label: 'Settings', desc: 'Shop & profile', icon: Settings },
]

export function MorePage() {
  return (
    <div className="space-y-5">
      <PageHeader title="More" subtitle="Shortcuts to the rest of Paylo" />
      <Card padding={false}>
        <div className="divide-y divide-surface-border">
          {LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{item.label}</span>
                <span className="block text-xs text-ink-muted">{item.desc}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-ink-faint" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
