import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthSession, Role, User } from '@/types'
import { loadJSON, removeKey, saveJSON } from '@/lib/storage'
import { uid } from '@/lib/format'

interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  error: string | null
  loginWithGoogle: (asRole?: Role) => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  logout: () => void
  setOnboarded: (value: boolean) => void
  setActiveShop: (shopId: string) => void
  attachShop: (shopId: string, role: Role, workerId?: string) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_USERS: Record<string, { user: User; role: Role; shopIds: string[]; workerId?: string; onboarded: boolean }> = {
  owner: {
    user: {
      id: 'u_owner',
      name: 'Priya Sharma',
      email: 'priya@mainsalon.in',
      phone: '+91 98765 43210',
      avatar: 'PS',
      provider: 'google',
    },
    role: 'owner',
    shopIds: ['shop_main', 'shop_barber'],
    workerId: 'w_owner',
    onboarded: true,
  },
  worker: {
    user: {
      id: 'u_anjali',
      name: 'Anjali Mehta',
      email: 'anjali@mainsalon.in',
      phone: '+91 98111 22334',
      avatar: 'AM',
      provider: 'google',
    },
    role: 'worker',
    shopIds: ['shop_main'],
    workerId: 'w_anjali',
    onboarded: true,
  },
  new: {
    user: {
      id: 'u_new',
      name: 'Alex Rivera',
      email: 'alex.rivera@gmail.com',
      avatar: 'AR',
      provider: 'google',
    },
    role: 'owner',
    shopIds: [],
    onboarded: false,
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = loadJSON<AuthSession | null>('session', null)
    setSession(saved)
    setLoading(false)
  }, [])

  const persist = useCallback((next: AuthSession | null) => {
    setSession(next)
    if (next) saveJSON('session', next)
    else removeKey('session')
  }, [])

  const loginWithGoogle = useCallback(async (asRole: Role | 'new' = 'owner') => {
    setError(null)
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    const key = asRole === 'worker' ? 'worker' : asRole === 'manager' ? 'owner' : asRole
    const demo = DEMO_USERS[key === 'owner' || key === 'worker' || key === 'new' ? key : 'owner']
    // Allow choosing fresh onboarding via asRole cast
    const pick = (asRole as string) === 'new' ? DEMO_USERS.new : demo
    persist({
      user: pick.user,
      role: pick.role,
      shopIds: [...pick.shopIds],
      activeShopId: pick.shopIds[0] ?? null,
      workerId: pick.workerId,
      onboarded: pick.onboarded,
    })
    setLoading(false)
  }, [persist])

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    if (!email || !password || password.length < 4) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }
    const isWorker = email.toLowerCase().includes('anjali')
    const pick = isWorker ? DEMO_USERS.worker : DEMO_USERS.owner
    persist({
      user: { ...pick.user, email, provider: 'email' },
      role: pick.role,
      shopIds: [...pick.shopIds],
      activeShopId: pick.shopIds[0] ?? null,
      workerId: pick.workerId,
      onboarded: true,
    })
    setLoading(false)
  }, [persist])

  const logout = useCallback(() => {
    persist(null)
  }, [persist])

  const setOnboarded = useCallback(
    (value: boolean) => {
      if (!session) return
      persist({ ...session, onboarded: value })
    },
    [persist, session],
  )

  const setActiveShop = useCallback(
    (shopId: string) => {
      if (!session) return
      persist({ ...session, activeShopId: shopId })
    },
    [persist, session],
  )

  const attachShop = useCallback(
    (shopId: string, role: Role, workerId?: string) => {
      if (!session) return
      const shopIds = session.shopIds.includes(shopId)
        ? session.shopIds
        : [...session.shopIds, shopId]
      persist({
        ...session,
        role,
        shopIds,
        activeShopId: shopId,
        workerId: workerId ?? session.workerId,
        onboarded: true,
      })
    },
    [persist, session],
  )

  const value = useMemo(
    () => ({
      session,
      loading,
      error,
      loginWithGoogle,
      loginWithEmail,
      logout,
      setOnboarded,
      setActiveShop,
      attachShop,
      clearError: () => setError(null),
    }),
    [
      session,
      loading,
      error,
      loginWithGoogle,
      loginWithEmail,
      logout,
      setOnboarded,
      setActiveShop,
      attachShop,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function createGuestUser(): User {
  return {
    id: uid('u'),
    name: 'New User',
    email: 'user@example.com',
    provider: 'google',
  }
}
