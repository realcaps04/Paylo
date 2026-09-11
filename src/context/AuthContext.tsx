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
import { getAccountByEmail, syncAccountFromSession } from '@/lib/accounts'
import {
  getGoogleClientId,
  googleSetupHint,
  signInWithGooglePopup,
} from '@/lib/googleAuth'
import { convex, convexReady } from '@/lib/convex'
import { api } from '../../convex/_generated/api'
import {
  buildReturningSession,
  fetchCloudMembership,
  isReturningMember,
} from '@/lib/restoreSession'
import { loadJSON, removeKey, saveJSON } from '@/lib/storage'
import { uid } from '@/lib/format'
import { createDemoStore } from '@/data/demo'

interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  busy: boolean
  error: string | null
  googleReady: boolean
  /** Real Google OAuth — login or signup based on existing account */
  loginWithGoogle: (opts?: { intent?: 'login' | 'signup' }) => Promise<AuthSession>
  /** Local demo personas for exploring the UI */
  loginAsDemo: (kind: 'owner' | 'worker' | 'new') => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  logout: () => void
  setOnboarded: (value: boolean) => void
  setActiveShop: (shopId: string) => void
  attachShop: (shopId: string, role: Role, workerId?: string) => void
  chooseRole: (role: Role) => void
  clearRoleChoice: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_USERS: Record<
  string,
  {
    user: User
    role: Role
    shopIds: string[]
    workerId?: string
    onboarded: boolean
  }
> = {
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

function ensureDemoData() {
  const store = loadJSON<{ shops?: unknown[] } | null>('store', null)
  if (!store?.shops?.length) {
    saveJSON('store', createDemoStore())
  }
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const googleReady = Boolean(getGoogleClientId())

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const saved = loadJSON<AuthSession | null>('session', null)
      if (!saved) {
        if (!cancelled) {
          setSession(null)
          setLoading(false)
        }
        return
      }

      let next = saved
      const needsRestore = !saved.onboarded || !saved.activeShopId || saved.shopIds.length === 0
      if (needsRestore && saved.user.email) {
        const { user, shop } = await fetchCloudMembership(saved.user.email)
        if (isReturningMember({ cloudUser: user, cloudShop: shop })) {
          next = buildReturningSession({
            profile: {
              id: saved.user.id,
              name: saved.user.name || user?.name || 'User',
              email: saved.user.email,
              picture: saved.user.picture ?? user?.picture,
            },
            provider: saved.user.provider === 'email' ? 'email' : 'google',
            local: {
              userId: saved.user.id,
              role: saved.role,
              shopIds: saved.shopIds,
              workerId: saved.workerId,
            },
            cloudUser: user,
            cloudShop: shop,
          })
          saveJSON('session', next)
          syncAccountFromSession({
            userId: next.user.id,
            email: next.user.email,
            name: next.user.name,
            picture: next.user.picture ?? null,
            role: next.role,
            shopIds: next.shopIds,
            workerId: next.workerId,
            onboarded: next.onboarded,
          })
        }
      } else if (saved.onboarded && saved.user.email) {
        const { shop } = await fetchCloudMembership(saved.user.email)
        if (shop) {
          buildReturningSession({
            profile: {
              id: saved.user.id,
              name: saved.user.name,
              email: saved.user.email,
              picture: saved.user.picture,
            },
            provider: saved.user.provider === 'email' ? 'email' : 'google',
            local: {
              userId: saved.user.id,
              role: saved.role,
              shopIds: saved.shopIds,
              workerId: saved.workerId,
            },
            cloudUser: null,
            cloudShop: shop,
          })
        }
      }

      if (!cancelled) {
        setSession(next)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback((next: AuthSession | null) => {
    setSession(next)
    if (next) {
      saveJSON('session', next)
      if (next.user.provider === 'google' || next.user.provider === 'email') {
        syncAccountFromSession({
          userId: next.user.id,
          email: next.user.email,
          name: next.user.name,
          picture: next.user.picture ?? null,
          role: next.role,
          shopIds: next.shopIds,
          workerId: next.workerId,
          onboarded: next.onboarded,
        })
      }
    } else {
      removeKey('session')
    }
  }, [])

  const loginWithGoogle = useCallback(
    async (opts?: { intent?: 'login' | 'signup' }) => {
      setError(null)
      setBusy(true)
      try {
        const profile = await signInWithGooglePopup()
        const existing = getAccountByEmail(profile.email)
        const { user: cloudUser, shop: cloudShop } = await fetchCloudMembership(profile.email)

        const returning = isReturningMember({
          localOnboarded: existing?.onboarded,
          localShopIds: existing?.shopIds,
          cloudUser,
          cloudShop,
        })

        // Existing shop owners always skip onboarding — even if UI said "signup"
        if (returning) {
          const next = buildReturningSession({
            profile,
            provider: 'google',
            local: existing
              ? {
                  userId: existing.userId,
                  role: existing.role,
                  shopIds: existing.shopIds,
                  workerId: existing.workerId,
                }
              : null,
            cloudUser,
            cloudShop,
          })

          if (convexReady && convex) {
            try {
              await convex.mutation(api.users.upsertByEmail, {
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                googleId: profile.id,
                role: next.role,
              })
            } catch {
              // Local auth still works if Convex is briefly unreachable
            }
          }

          persist(next)
          return next
        }

        const forceSignup = opts?.intent === 'signup'
        const next: AuthSession = {
          user: {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: initials(profile.name),
            picture: profile.picture,
            provider: 'google',
          },
          role: 'owner',
          shopIds: forceSignup ? [] : existing?.shopIds ?? [],
          activeShopId: forceSignup ? null : existing?.shopIds?.[0] ?? null,
          workerId: forceSignup ? undefined : existing?.workerId,
          onboarded: false,
          roleChosen: false,
        }

        if (!next.shopIds.length) {
          next.onboarded = false
          next.activeShopId = null
          next.roleChosen = false
        }

        if (convexReady && convex) {
          try {
            await convex.mutation(api.users.upsertByEmail, {
              email: profile.email,
              name: profile.name,
              picture: profile.picture,
              googleId: profile.id,
              role: next.role,
            })
          } catch {
            // Local auth still works if Convex is briefly unreachable
          }
        }

        persist(next)
        return next
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Google sign-in failed'
        if (!/cancelled/i.test(message)) {
          if (
            message.includes('origin') ||
            message.includes('redirect') ||
            message.includes('400') ||
            message.includes('missing_token')
          ) {
            setError(`${message}\n\n${googleSetupHint()}`)
          } else {
            setError(message)
          }
        }
        throw err
      } finally {
        setBusy(false)
      }
    },
    [persist],
  )

  const loginAsDemo = useCallback(
    async (kind: 'owner' | 'worker' | 'new') => {
      setError(null)
      setBusy(true)
      await new Promise((r) => setTimeout(r, 500))
      if (kind !== 'new') ensureDemoData()
      const pick = DEMO_USERS[kind]
      persist({
        user: pick.user,
        role: pick.role,
        shopIds: [...pick.shopIds],
        activeShopId: pick.shopIds[0] ?? null,
        workerId: pick.workerId,
        onboarded: pick.onboarded,
        roleChosen: pick.onboarded,
      })
      setBusy(false)
    },
    [persist],
  )

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null)
      setBusy(true)
      await new Promise((r) => setTimeout(r, 500))
      if (!email || !password || password.length < 4) {
        setError('Invalid email or password.')
        setBusy(false)
        return
      }

      const existing = getAccountByEmail(email)
      const { user: cloudUser, shop: cloudShop } = await fetchCloudMembership(email)

      if (
        isReturningMember({
          localOnboarded: existing?.onboarded,
          localShopIds: existing?.shopIds,
          cloudUser,
          cloudShop,
        })
      ) {
        persist(
          buildReturningSession({
            profile: {
              id: existing?.userId || uid('u'),
              name: existing?.name || cloudUser?.name || email.split('@')[0],
              email,
              picture: existing?.picture ?? cloudUser?.picture,
            },
            provider: 'email',
            local: existing
              ? {
                  userId: existing.userId,
                  role: existing.role,
                  shopIds: existing.shopIds,
                  workerId: existing.workerId,
                }
              : null,
            cloudUser,
            cloudShop,
          }),
        )
        setBusy(false)
        return
      }

      // Demo shortcut for exploring without Google
      const isWorker = email.toLowerCase().includes('anjali')
      ensureDemoData()
      const pick = isWorker ? DEMO_USERS.worker : DEMO_USERS.owner
      persist({
        user: { ...pick.user, email, provider: 'email' },
        role: pick.role,
        shopIds: [...pick.shopIds],
        activeShopId: pick.shopIds[0] ?? null,
        workerId: pick.workerId,
        onboarded: true,
        roleChosen: true,
      })
      setBusy(false)
    },
    [persist],
  )

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

  const chooseRole = useCallback(
    (role: Role) => {
      if (!session) return
      persist({
        ...session,
        role,
        roleChosen: true,
        onboarded: false,
        activeShopId: null,
        shopIds: role === 'owner' ? session.shopIds : [],
      })
    },
    [persist, session],
  )

  const clearRoleChoice = useCallback(() => {
    if (!session) return
    persist({
      ...session,
      roleChosen: false,
      onboarded: false,
      activeShopId: null,
    })
  }, [persist, session])

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
        roleChosen: true,
      })
    },
    [persist, session],
  )

  const value = useMemo(
    () => ({
      session,
      loading,
      busy,
      error,
      googleReady,
      loginWithGoogle,
      loginAsDemo,
      loginWithEmail,
      logout,
      setOnboarded,
      setActiveShop,
      attachShop,
      chooseRole,
      clearRoleChoice,
      clearError: () => setError(null),
    }),
    [
      session,
      loading,
      busy,
      error,
      googleReady,
      loginWithGoogle,
      loginAsDemo,
      loginWithEmail,
      logout,
      setOnboarded,
      setActiveShop,
      attachShop,
      chooseRole,
      clearRoleChoice,
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
