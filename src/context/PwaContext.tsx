import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  checkForUpdate: () => Promise<void>
}

const PwaContext = createContext<PwaContextValue | null>(null)

/** How often to poll for a new service worker while the app stays open */
const UPDATE_POLL_MS = 60_000

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
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  )
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(isStandalone)
  const [installDismissed, setInstallDismissed] = useState(() =>
    loadJSON('install_dismissed', false),
  )
  const [showInstallHint, setShowInstallHint] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const platform = useMemo(detectPlatform, [])

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl: string, registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        registrationRef.current = registration
      }
    },
    onNeedRefresh() {
      setNeedRefresh(true)
    },
  })

  const checkForUpdate = useCallback(async () => {
    const reg = registrationRef.current
    if (!reg) return
    try {
      await reg.update()
      if (reg.waiting) {
        setNeedRefresh(true)
      }
    } catch {
      // ignore network errors while offline
    }
  }, [setNeedRefresh])

  // Poll for updates while the app remains open
  useEffect(() => {
    void checkForUpdate()
    const id = window.setInterval(() => {
      void checkForUpdate()
    }, UPDATE_POLL_MS)
    return () => window.clearInterval(id)
  }, [checkForUpdate])

  // Recheck when the tab becomes visible / connection returns
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkForUpdate()
    }
    const onOnline = () => void checkForUpdate()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('focus', onVisible)
    }
  }, [checkForUpdate])

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

  // Lock background scroll when mandatory update is shown
  useEffect(() => {
    if (!needRefresh) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [needRefresh])

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

  const updateApp = useCallback(() => {
    void updateServiceWorker(true)
  }, [updateServiceWorker])

  const value: PwaContextValue = {
    canInstall: !!deferred && !isInstalled,
    isInstalled,
    installDismissed,
    needRefresh,
    offlineReady,
    platform,
    promptInstall,
    dismissInstall,
    updateApp,
    showInstallHint,
    setShowInstallHint,
    checkForUpdate,
  }

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}

export function usePwa() {
  const ctx = useContext(PwaContext)
  if (!ctx) throw new Error('usePwa must be used within PwaProvider')
  return ctx
}
