import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { loadJSON, saveJSON } from '@/lib/storage'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PwaContextValue {
  canInstall: boolean
  isInstalled: boolean
  installDismissed: boolean
  needRefresh: boolean
  offlineReady: boolean
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
  promptInstall: () => Promise<void>
  dismissInstall: () => void
  updateApp: () => void
  showInstallHint: boolean
  setShowInstallHint: (v: boolean) => void
}

const PwaContext = createContext<PwaContextValue | null>(null)

function detectPlatform(): PwaContextValue['platform'] {
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  if (/windows|macintosh|linux/.test(ua)) return 'desktop'
  return 'unknown'
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS
    navigator.standalone === true
  )
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(isStandalone)
  const [installDismissed, setInstallDismissed] = useState(() =>
    loadJSON('install_dismissed', false),
  )
  const [showInstallHint, setShowInstallHint] = useState(false)
  const platform = useMemo(detectPlatform, [])

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {
      // registered
    },
  })

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferred(null)
      setShowInstallHint(false)
    })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = useCallback(async () => {
    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === 'accepted') setDeferred(null)
      return
    }
    setShowInstallHint(true)
  }, [deferred])

  const dismissInstall = useCallback(() => {
    setInstallDismissed(true)
    saveJSON('install_dismissed', true)
    setShowInstallHint(false)
  }, [])

  const value: PwaContextValue = {
    canInstall: !!deferred && !isInstalled,
    isInstalled,
    installDismissed,
    needRefresh,
    offlineReady,
    platform,
    promptInstall,
    dismissInstall,
    updateApp: () => updateServiceWorker(true),
    showInstallHint,
    setShowInstallHint,
  }

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}

export function usePwa() {
  const ctx = useContext(PwaContext)
  if (!ctx) throw new Error('usePwa must be used within PwaProvider')
  return ctx
}
