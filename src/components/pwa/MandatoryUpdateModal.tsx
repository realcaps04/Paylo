import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { usePwa } from '@/context/PwaContext'
import { Button, LogoMark } from '@/components/ui'

export function MandatoryUpdateModal() {
  const { needRefresh, updateApp } = usePwa()
  const [updating, setUpdating] = useState(false)

  const handleUpdate = () => {
    setUpdating(true)
    try {
      updateApp()
    } catch {
      setUpdating(false)
      window.location.reload()
    }
    // Fallback reload if SW update stalls
    window.setTimeout(() => {
      window.location.reload()
    }, 4000)
  }

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/55 p-5 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="update-title"
          aria-describedby="update-desc"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="w-full max-w-sm rounded-[24px] border border-surface-border bg-white p-6 text-center shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] ring-1 ring-[#0064f0]/15">
              <LogoMark size="md" className="h-10 w-10 rounded-xl" />
            </div>

            <h2
              id="update-title"
              className="mt-4 font-display text-xl font-bold tracking-tight text-ink"
            >
              Update required
            </h2>
            <p id="update-desc" className="mt-2 text-sm leading-relaxed text-ink-muted">
              A new version of Paylo is available. Please update now to keep using the app with the
              latest features and fixes.
            </p>

            <Button
              className="mt-6 h-12 w-full rounded-full bg-[#0064f0] hover:bg-[#0050c4]"
              loading={updating}
              onClick={handleUpdate}
            >
              {!updating && <RefreshCw className="h-4 w-4" />}
              {updating ? 'Updating…' : 'Update now'}
            </Button>

            <p className="mt-3 text-xs text-ink-faint">
              This update is mandatory and cannot be skipped.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
