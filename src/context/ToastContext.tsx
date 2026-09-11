import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { uid } from '@/lib/format'

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  kind: ToastKind
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = uid('t')
    setToasts((prev) => [...prev, { id, message, kind }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-24 left-1/2 z-[100] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 md:bottom-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-card border bg-white px-4 py-3 shadow-soft',
                t.kind === 'success' && 'border-brand-100',
                t.kind === 'error' && 'border-red-100',
                t.kind === 'info' && 'border-slate-200',
              )}
            >
              {t.kind === 'success' && (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              )}
              {t.kind === 'error' && (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              )}
              {t.kind === 'info' && (
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              )}
              <p className="flex-1 text-sm font-medium text-ink">{t.message}</p>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-ink-faint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
