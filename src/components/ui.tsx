import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Loader2 } from 'lucide-react'

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'h-9 px-3 text-sm',
        size === 'md' && 'h-11 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-base',
        size === 'icon' && 'h-10 w-10',
        variant === 'primary' &&
          'bg-[#0064f0] text-white shadow-sm hover:bg-[#0050c4]',
        variant === 'secondary' && 'bg-[#eef5ff] text-[#003a84] hover:bg-[#d9eaff]',
        variant === 'ghost' && 'text-ink-soft hover:bg-slate-100',
        variant === 'outline' && 'border border-surface-border bg-white text-ink hover:bg-slate-50',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-btn border border-surface-border bg-white px-3.5 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15',
          className,
        )}
        {...props}
      />
    )
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[96px] w-full rounded-btn border border-surface-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15',
        className,
      )}
      {...props}
    />
  )
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'h-11 w-full rounded-btn border border-surface-border bg-white px-3.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    )
  },
)

export function Label({
  children,
  className,
  htmlFor,
}: {
  children: ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('mb-1.5 block text-sm font-medium text-ink-soft', className)}
    >
      {children}
    </label>
  )
}

export function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string
  children: ReactNode
  error?: string
  hint?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Card({
  children,
  className,
  padding = true,
}: {
  children: ReactNode
  className?: string
  padding?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-card border border-surface-border bg-white shadow-card',
        padding && 'p-4 md:p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <p className={cn('mt-2 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl', accent)}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </Card>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone === 'neutral' && 'bg-slate-100 text-slate-700',
        tone === 'success' && 'bg-[#eef5ff] text-[#0050c4]',
        tone === 'warning' && 'bg-amber-50 text-amber-700',
        tone === 'danger' && 'bg-red-50 text-red-700',
        tone === 'brand' && 'bg-[#eef5ff] text-[#0064f0]',
      )}
    >
      {children}
    </span>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-surface-border bg-white px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%]',
        className,
      )}
    />
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Avatar({
  name,
  picture,
  size = 'md',
}: {
  name: string
  picture?: string | null
  size?: 'sm' | 'md' | 'lg'
}) {
  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        className={cn(
          'shrink-0 rounded-full object-cover',
          size === 'sm' && 'h-8 w-8',
          size === 'md' && 'h-10 w-10',
          size === 'lg' && 'h-14 w-14',
        )}
        referrerPolicy="no-referrer"
      />
    )
  }
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800',
        size === 'sm' && 'h-8 w-8 text-xs',
        size === 'md' && 'h-10 w-10 text-sm',
        size === 'lg' && 'h-14 w-14 text-base',
      )}
    >
      {initials}
    </div>
  )
}

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="inline-flex rounded-btn border border-surface-border bg-brand-50/60 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-[9px] px-3 py-1.5 text-sm font-medium transition',
            value === o.value
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full overflow-auto rounded-t-2xl bg-white shadow-soft sm:max-w-lg sm:rounded-card">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink">
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-surface-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function LogoMark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}) {
  return (
    <img
      src="/paylo_applogo.png"
      alt="Paylo"
      width={160}
      height={160}
      decoding="async"
      className={cn(
        'shrink-0 object-contain',
        size === 'sm' && 'h-8 w-8',
        size === 'md' && 'h-10 w-10',
        size === 'lg' && 'h-14 w-14',
        size === 'xl' && 'h-[88px] w-[88px]',
        size === '2xl' && 'h-[118px] w-[118px]',
        className,
      )}
    />
  )
}

export function LogoLockup({ className }: { className?: string }) {
  return (
    <img
      src="/paylo-lockup.png"
      alt="Paylo — Work Today. Grow Tomorrow."
      className={cn('mx-auto h-auto w-full max-w-[200px] object-contain', className)}
    />
  )
}

export function Logo({
  size = 'md',
  inverted = false,
  showWordmark = true,
}: {
  size?: 'sm' | 'md' | 'lg'
  inverted?: boolean
  showWordmark?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      {showWordmark && (
        <div>
          <div
            className={cn(
              'font-display font-bold tracking-tight',
              inverted ? 'text-white' : 'text-ink',
              size === 'sm' && 'text-base',
              size === 'md' && 'text-lg',
              size === 'lg' && 'text-xl',
            )}
          >
            Paylo
          </div>
          {size === 'lg' && (
            <p className={cn('text-xs', inverted ? 'text-white/75' : 'text-ink-muted')}>
              Work Today. Grow Tomorrow.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function paymentTone(status: string) {
  if (status === 'paid') return 'success' as const
  if (status === 'pending') return 'warning' as const
  if (status === 'partial') return 'brand' as const
  if (status === 'refunded') return 'danger' as const
  return 'neutral' as const
}
