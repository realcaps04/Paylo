import { Wifi, WifiOff } from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import { cn } from '@/lib/cn'

export function ConnectionStatus({ className }: { className?: string }) {
  const { online, syncing, pendingSyncCount } = useShop()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        online
          ? 'border-[#d9eaff] bg-[#eef5ff] text-[#0050c4]'
          : 'border-amber-100 bg-amber-50 text-amber-700',
        className,
      )}
    >
      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {online ? (syncing ? 'Syncing…' : 'Online') : 'Offline'}
      {pendingSyncCount > 0 && online && (
        <span className="text-ink-faint">· {pendingSyncCount}</span>
      )}
    </div>
  )
}
