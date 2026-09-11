import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createDemoStore, createEmptyStore } from '@/data/demo'
import { computePaymentStatus } from '@/lib/permissions'
import { uid } from '@/lib/format'
import { loadJSON, saveJSON } from '@/lib/storage'
import type {
  AppNotification,
  Customer,
  PaymentEntry,
  PaymentMethod,
  PaymentStatus,
  Service,
  Shop,
  WorkRecord,
  Worker,
} from '@/types'
import { useAuth } from './AuthContext'

export interface ShopStore {
  shops: Shop[]
  workers: Worker[]
  customers: Customer[]
  services: Service[]
  workRecords: WorkRecord[]
  payments: PaymentEntry[]
  notifications: AppNotification[]
}

interface ShopContextValue {
  store: ShopStore
  shop: Shop | null
  workers: Worker[]
  customers: Customer[]
  services: Service[]
  workRecords: WorkRecord[]
  payments: PaymentEntry[]
  notifications: AppNotification[]
  online: boolean
  syncing: boolean
  pendingSyncCount: number
  seedDemo: () => void
  resetStore: () => void
  addShop: (shop: Shop) => void
  updateShop: (id: string, patch: Partial<Shop>) => void
  addWorker: (worker: Omit<Worker, 'id'> & { id?: string }) => Worker
  updateWorker: (id: string, patch: Partial<Worker>) => void
  removeWorker: (id: string) => void
  addService: (service: Omit<Service, 'id'> & { id?: string }) => Service
  updateService: (id: string, patch: Partial<Service>) => void
  removeService: (id: string) => void
  addCustomer: (customer: Omit<Customer, 'id'> & { id?: string }) => Customer
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  addWorkRecord: (
    input: Omit<WorkRecord, 'id' | 'synced' | 'amountPending' | 'paymentStatus'> & {
      paymentStatus?: PaymentStatus
      synced?: boolean
    },
  ) => WorkRecord
  updateWorkRecord: (id: string, patch: Partial<WorkRecord>) => void
  deleteWorkRecord: (id: string) => void
  recordPayment: (
    workRecordId: string,
    amount: number,
    method: PaymentMethod,
    type?: PaymentEntry['type'],
  ) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'> & { id?: string }) => void
  syncOfflineQueue: () => Promise<void>
}

const ShopContext = createContext<ShopContextValue | null>(null)

function hydrateStore(hasDemoSession: boolean): ShopStore {
  const saved = loadJSON<ShopStore | null>('store', null)
  if (saved) return saved
  return hasDemoSession ? createDemoStore() : createEmptyStore()
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [store, setStore] = useState<ShopStore>(() =>
    hydrateStore(true),
  )
  const [online, setOnline] = useState(navigator.onLine)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    saveJSON('store', store)
  }, [store])

  useEffect(() => {
    const onStoreUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ShopStore>).detail
      if (detail) setStore(detail)
    }
    window.addEventListener('paylo:store-updated', onStoreUpdated)
    return () => window.removeEventListener('paylo:store-updated', onStoreUpdated)
  }, [])

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const activeShopId = session?.activeShopId ?? null

  const shop = useMemo(
    () => store.shops.find((s) => s.id === activeShopId) ?? null,
    [store.shops, activeShopId],
  )

  const filterShop = <T extends { shopId: string }>(items: T[]) =>
    activeShopId ? items.filter((i) => i.shopId === activeShopId) : []

  const workers = useMemo(() => filterShop(store.workers), [store.workers, activeShopId])
  const customers = useMemo(() => filterShop(store.customers), [store.customers, activeShopId])
  const services = useMemo(() => filterShop(store.services), [store.services, activeShopId])
  const workRecords = useMemo(
    () =>
      filterShop(store.workRecords).sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    [store.workRecords, activeShopId],
  )
  const payments = useMemo(() => filterShop(store.payments), [store.payments, activeShopId])
  const notifications = useMemo(
    () =>
      filterShop(store.notifications).sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    [store.notifications, activeShopId],
  )

  const pendingSyncCount = store.workRecords.filter((w) => !w.synced).length

  const patchStore = useCallback((updater: (prev: ShopStore) => ShopStore) => {
    setStore(updater)
  }, [])

  const seedDemo = useCallback(() => setStore(createDemoStore()), [])
  const resetStore = useCallback(() => setStore(createEmptyStore()), [])

  const addShop = useCallback((s: Shop) => {
    patchStore((prev) => ({ ...prev, shops: [...prev.shops, s] }))
  }, [patchStore])

  const updateShop = useCallback((id: string, patch: Partial<Shop>) => {
    patchStore((prev) => ({
      ...prev,
      shops: prev.shops.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }, [patchStore])

  const addWorker = useCallback((worker: Omit<Worker, 'id'> & { id?: string }) => {
    const w: Worker = { ...worker, id: worker.id ?? uid('w') }
    patchStore((prev) => ({ ...prev, workers: [...prev.workers, w] }))
    return w
  }, [patchStore])

  const updateWorker = useCallback((id: string, patch: Partial<Worker>) => {
    patchStore((prev) => ({
      ...prev,
      workers: prev.workers.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }))
  }, [patchStore])

  const removeWorker = useCallback((id: string) => {
    patchStore((prev) => ({
      ...prev,
      workers: prev.workers.filter((w) => w.id !== id),
    }))
  }, [patchStore])

  const addService = useCallback((service: Omit<Service, 'id'> & { id?: string }) => {
    const s: Service = { ...service, id: service.id ?? uid('s') }
    patchStore((prev) => ({ ...prev, services: [...prev.services, s] }))
    return s
  }, [patchStore])

  const updateService = useCallback((id: string, patch: Partial<Service>) => {
    patchStore((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }, [patchStore])

  const removeService = useCallback((id: string) => {
    patchStore((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }))
  }, [patchStore])

  const addCustomer = useCallback((customer: Omit<Customer, 'id'> & { id?: string }) => {
    const c: Customer = { ...customer, id: customer.id ?? uid('c') }
    patchStore((prev) => ({ ...prev, customers: [...prev.customers, c] }))
    return c
  }, [patchStore])

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    patchStore((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  }, [patchStore])

  const addWorkRecord = useCallback(
    (
      input: Omit<WorkRecord, 'id' | 'synced' | 'amountPending' | 'paymentStatus'> & {
        paymentStatus?: PaymentStatus
        synced?: boolean
      },
    ) => {
      const amountPending = Math.max(0, input.totalAmount - input.amountPaid)
      const paymentStatus =
        input.paymentStatus ?? computePaymentStatus(input.totalAmount, input.amountPaid)
      const record: WorkRecord = {
        ...input,
        id: uid('wr'),
        amountPending,
        paymentStatus,
        synced: input.synced ?? online,
      }
      patchStore((prev) => {
        let customers = prev.customers
        if (input.customerName) {
          const existing = customers.find(
            (c) =>
              c.shopId === input.shopId &&
              (c.phone === input.customerPhone || c.name === input.customerName),
          )
          if (existing) {
            customers = customers.map((c) =>
              c.id === existing.id
                ? {
                    ...c,
                    totalVisits: c.totalVisits + 1,
                    totalSpent: c.totalSpent + input.amountPaid,
                    pendingAmount: c.pendingAmount + amountPending,
                    lastVisit: input.createdAt,
                  }
                : c,
            )
          } else if (input.customerPhone || input.customerName) {
            customers = [
              ...customers,
              {
                id: uid('c'),
                shopId: input.shopId,
                name: input.customerName,
                phone: input.customerPhone ?? '',
                totalVisits: 1,
                totalSpent: input.amountPaid,
                pendingAmount: amountPending,
                lastVisit: input.createdAt,
              },
            ]
          }
        }
        return {
          ...prev,
          workRecords: [record, ...prev.workRecords],
          customers,
        }
      })
      return record
    },
    [online, patchStore],
  )

  const updateWorkRecord = useCallback((id: string, patch: Partial<WorkRecord>) => {
    patchStore((prev) => ({
      ...prev,
      workRecords: prev.workRecords.map((w) => {
        if (w.id !== id) return w
        const next = { ...w, ...patch }
        next.amountPending = Math.max(0, next.totalAmount - next.amountPaid)
        next.paymentStatus =
          patch.paymentStatus ??
          computePaymentStatus(next.totalAmount, next.amountPaid)
        return next
      }),
    }))
  }, [patchStore])

  const deleteWorkRecord = useCallback((id: string) => {
    patchStore((prev) => ({
      ...prev,
      workRecords: prev.workRecords.filter((w) => w.id !== id),
      payments: prev.payments.filter((p) => p.workRecordId !== id),
    }))
  }, [patchStore])

  const recordPayment = useCallback(
    (
      workRecordId: string,
      amount: number,
      method: PaymentMethod,
      type: PaymentEntry['type'] = 'payment',
    ) => {
      const entry: PaymentEntry = {
        id: uid('p'),
        workRecordId,
        shopId: activeShopId ?? '',
        amount,
        method,
        type,
        createdAt: new Date().toISOString(),
      }
      patchStore((prev) => {
        const workRecords = prev.workRecords.map((w) => {
          if (w.id !== workRecordId) return w
          const amountPaid =
            type === 'refund'
              ? Math.max(0, w.amountPaid - amount)
              : w.amountPaid + amount
          const amountPending = Math.max(0, w.totalAmount - amountPaid)
          return {
            ...w,
            amountPaid,
            amountPending,
            paymentStatus:
              type === 'refund' && amountPaid === 0
                ? ('refunded' as PaymentStatus)
                : computePaymentStatus(w.totalAmount, amountPaid),
            paymentMethod: method,
          }
        })
        return {
          ...prev,
          workRecords,
          payments: [entry, ...prev.payments],
        }
      })
    },
    [activeShopId, patchStore],
  )

  const markNotificationRead = useCallback((id: string) => {
    patchStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }))
  }, [patchStore])

  const markAllNotificationsRead = useCallback(() => {
    patchStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.shopId === activeShopId ? { ...n, read: true } : n,
      ),
    }))
  }, [activeShopId, patchStore])

  const addNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'> & { id?: string }) => {
      const item: AppNotification = {
        ...n,
        id: n.id ?? uid('n'),
        read: false,
        createdAt: new Date().toISOString(),
      }
      patchStore((prev) => ({
        ...prev,
        notifications: [item, ...prev.notifications],
      }))
    },
    [patchStore],
  )

  const syncOfflineQueue = useCallback(async () => {
    if (!online || pendingSyncCount === 0) return
    setSyncing(true)
    await new Promise((r) => setTimeout(r, 800))
    patchStore((prev) => ({
      ...prev,
      workRecords: prev.workRecords.map((w) => ({ ...w, synced: true })),
    }))
    setSyncing(false)
  }, [online, pendingSyncCount, patchStore])

  useEffect(() => {
    if (online && pendingSyncCount > 0) {
      void syncOfflineQueue()
    }
  }, [online, pendingSyncCount, syncOfflineQueue])

  const value: ShopContextValue = {
    store,
    shop,
    workers,
    customers,
    services,
    workRecords,
    payments,
    notifications,
    online,
    syncing,
    pendingSyncCount,
    seedDemo,
    resetStore,
    addShop,
    updateShop,
    addWorker,
    updateWorker,
    removeWorker,
    addService,
    updateService,
    removeService,
    addCustomer,
    updateCustomer,
    addWorkRecord,
    updateWorkRecord,
    deleteWorkRecord,
    recordPayment,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    syncOfflineQueue,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}
