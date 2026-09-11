import { api } from '../../convex/_generated/api'
import { convexHttp, convexReady } from '@/lib/convex'
import { createEmptyStore } from '@/data/demo'
import { uid } from '@/lib/format'
import { loadJSON, saveJSON } from '@/lib/storage'
import type { AuthSession, Role, Shop } from '@/types'

type ShopStore = ReturnType<typeof createEmptyStore>

export type ConvexShopDoc = {
  _id: string
  ownerEmail: string
  shopName: string
  businessType: string
  logoUrl?: string
  address: string
  city: string
  state: string
  pinCode: string
  contactNumber: string
  categoryId: string
  categoryName: string
  createdAt: number
}

export type ConvexUserDoc = {
  _id: string
  email: string
  name: string
  picture?: string | null
  role: Role
  onboarded: boolean
}

export async function fetchCloudMembership(email: string): Promise<{
  user: ConvexUserDoc | null
  shop: ConvexShopDoc | null
}> {
  if (!convexReady || !convexHttp || !email.trim()) {
    return { user: null, shop: null }
  }
  try {
    const [user, shop] = await Promise.all([
      convexHttp.query(api.users.getByEmail, { email }),
      convexHttp.query(api.shops.getByOwnerEmail, { ownerEmail: email }),
    ])
    return {
      user: (user as ConvexUserDoc | null) ?? null,
      shop: (shop as ConvexShopDoc | null) ?? null,
    }
  } catch {
    return { user: null, shop: null }
  }
}

export function mapConvexShop(shop: ConvexShopDoc, ownerName: string): Shop {
  return {
    id: String(shop._id),
    name: shop.shopName,
    categoryId: shop.categoryId,
    categoryName: shop.categoryName,
    ownerName,
    phone: shop.contactNumber,
    email: shop.ownerEmail,
    address: shop.address,
    city: shop.city,
    state: shop.state,
    pinCode: shop.pinCode,
    description: `${shop.businessType} · ${shop.categoryName}`,
    logo: shop.logoUrl,
    hours: { open: '09:00', close: '20:00', holidays: [] },
    createdAt: new Date(shop.createdAt).toISOString(),
  }
}

/** Merge a Convex shop into the local shop store (localStorage + return patched store). */
export function mergeCloudShopIntoStore(
  shop: ConvexShopDoc,
  owner: { id: string; name: string; email: string },
): ShopStore {
  const prev = loadJSON<ShopStore | null>('store', null) ?? createEmptyStore()
  const mapped = mapConvexShop(shop, owner.name)
  const shops = prev.shops.some((s) => s.id === mapped.id)
    ? prev.shops.map((s) => (s.id === mapped.id ? { ...s, ...mapped } : s))
    : [...prev.shops, mapped]

  let workers = prev.workers
  const hasOwner = workers.some((w) => w.shopId === mapped.id && w.role === 'owner')
  if (!hasOwner) {
    workers = [
      ...workers,
      {
        id: uid('w'),
        shopId: mapped.id,
        userId: owner.id,
        name: owner.name,
        role: 'owner' as const,
        phone: shop.contactNumber,
        email: owner.email,
        employeeId: 'OWN-001',
        joiningDate: new Date().toISOString().slice(0, 10),
        active: true,
        inviteStatus: 'joined' as const,
      },
    ]
  }

  let services = prev.services
  if (!services.some((s) => s.shopId === mapped.id)) {
    services = [
      ...services,
      {
        id: uid('svc'),
        shopId: mapped.id,
        name: 'Standard Service',
        category: 'General',
        defaultPrice: 500,
        durationMinutes: 30,
        description: `Standard service for ${shop.categoryName}`,
        active: true,
      },
      {
        id: uid('svc'),
        shopId: mapped.id,
        name: 'Consultation',
        category: 'General',
        defaultPrice: 300,
        durationMinutes: 20,
        description: `Consultation for ${shop.categoryName}`,
        active: true,
      },
    ]
  }

  const next = { ...prev, shops, workers, services }
  saveJSON('store', next)
  window.dispatchEvent(new CustomEvent('paylo:store-updated', { detail: next }))
  return next
}

export function isReturningMember(input: {
  localOnboarded?: boolean
  localShopIds?: string[]
  cloudUser: ConvexUserDoc | null
  cloudShop: ConvexShopDoc | null
}) {
  if (input.cloudShop) return true
  if (input.cloudUser?.onboarded) return true
  if (input.localOnboarded && (input.localShopIds?.length ?? 0) > 0) return true
  return false
}

export function buildReturningSession(input: {
  profile: {
    id: string
    name: string
    email: string
    picture?: string | null
  }
  provider: 'google' | 'email'
  local?: {
    userId?: string
    role: Role
    shopIds: string[]
    workerId?: string
  } | null
  cloudUser: ConvexUserDoc | null
  cloudShop: ConvexShopDoc | null
}): AuthSession {
  const cloudShopId = input.cloudShop ? String(input.cloudShop._id) : null
  const shopIds = cloudShopId
    ? [cloudShopId, ...(input.local?.shopIds ?? []).filter((id) => id !== cloudShopId)]
    : [...(input.local?.shopIds ?? [])]

  if (input.cloudShop) {
    mergeCloudShopIntoStore(input.cloudShop, {
      id: input.local?.userId || input.profile.id,
      name: input.profile.name,
      email: input.profile.email,
    })
  }

  return {
    user: {
      id: input.local?.userId || input.profile.id,
      name: input.profile.name,
      email: input.profile.email,
      avatar: input.profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      picture: input.profile.picture ?? undefined,
      provider: input.provider,
    },
    role: input.local?.role ?? input.cloudUser?.role ?? 'owner',
    shopIds,
    activeShopId: shopIds[0] ?? null,
    workerId: input.local?.workerId,
    onboarded: true,
    roleChosen: true,
  }
}
