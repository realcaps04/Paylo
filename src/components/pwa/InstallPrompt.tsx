import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePwa } from '@/context/PwaContext'
import { Button, LogoMark } from '@/components/ui'

export function InstallPrompt() {
  const {
    canInstall,
    installDismissed,
    showInstallHint,
    promptInstall,
    dismissInstall,
    isInstalled,
    platform,
  } = usePwa()

  const visible =
    !isInstalled &&
    !installDismissed &&
    (canInstall || showInstallHint)

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="fixed bottom-24 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2 lg:bottom-6"
      >
        <div className="flex items-start gap-3 rounded-card border border-brand-100 bg-white p-4 shadow-soft">
          <LogoMark size="md" className="rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold text-ink">Install Paylo</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {canInstall
                ? 'Get faster access to your shop management tools.'
                : platform === 'ios'
                  ? 'Tap Share → Add to Home Screen to install Paylo.'
                  : 'Open this site in Chrome or Edge, then use Install / Add to Home Screen.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {canInstall && (
                <Button size="sm" onClick={() => void promptInstall()}>
                  Install App
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={dismissInstall}>
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissInstall}
            className="text-ink-faint hover:text-ink"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
