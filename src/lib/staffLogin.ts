import { api } from '../../convex/_generated/api'
import { createEmptyStore } from '@/data/demo'
import { convexHttp, convexReady } from '@/lib/convex'
import { uid } from '@/lib/format'
import { normalizeInviteCode } from '@/lib/inviteCode'
import { mergeCloudShopIntoStore, type ConvexShopDoc } from '@/lib/restoreSession'
import { loadJSON, saveJSON } from '@/lib/storage'
import type { AuthSession, Shop, Worker } from '@/types'

type ShopStore = ReturnType<typeof createEmptyStore>

export type StaffClaimResult = {
  code: string
  shopId: string
  shopName: string
  ownerEmail: string
  workerName: string
  workerPhone?: string
  workerEmail?: string
  role: 'worker' | 'manager'
  localWorkerId?: string
  shop: ConvexShopDoc | null
}

function readStore(): ShopStore {
  return loadJSON<ShopStore | null>('store', null) ?? createEmptyStore()
}

function writeStore(store: ShopStore) {
  saveJSON('store', store)
  window.dispatchEvent(new CustomEvent('paylo:store-updated', { detail: store }))
}

/** Ensure shop + staff worker exist locally after a successful invite claim. */
export function hydrateStaffMembership(input: {
  claim: StaffClaimResult
  staff: { id: string; name: string; email: string; phone?: string }
}): { shopId: string; workerId: string; shopName: string } {
  const claim = input.claim
  const preferredShopId = claim.shop ? String(claim.shop._id) : claim.shopId

  if (claim.shop) {
    mergeCloudShopIntoStore(claim.shop, {
      id: 'owner',
      name: claim.shop.shopName,
      email: claim.ownerEmail,
    })
  }

  let store = readStore()

  if (!store.shops.some((s) => s.id === preferredShopId)) {
    const shop: Shop = {
      id: preferredShopId,
      name: claim.shopName,
      categoryId: claim.shop?.categoryId ?? 'general',
      categoryName: claim.shop?.categoryName ?? 'Shop',
      ownerName: 'Owner',
      phone: claim.shop?.contactNumber ?? '',
      email: claim.ownerEmail,
      address: claim.shop?.address ?? '',
      city: claim.shop?.city ?? '',
      state: claim.shop?.state ?? '',
      pinCode: claim.shop?.pinCode ?? '',
      description: claim.shopName,
      logo: claim.shop?.logoUrl,
      hours: { open: '09:00', close: '20:00', holidays: [] },
      createdAt: new Date().toISOString(),
    }
    store = { ...store, shops: [...store.shops, shop] }
  }

  // Default services so staff can record sales immediately
  if (!store.services.some((s) => s.shopId === preferredShopId)) {
    store = {
      ...store,
      services: [
        ...store.services,
        {
          id: uid('svc'),
          shopId: preferredShopId,
          name: 'Standard Service',
          category: 'General',
          defaultPrice: 500,
          durationMinutes: 30,
          description: 'Standard service',
          active: true,
        },
        {
          id: uid('svc'),
          shopId: preferredShopId,
          name: 'Consultation',
          category: 'General',
          defaultPrice: 300,
          durationMinutes: 20,
          description: 'Consultation',
          active: true,
        },
      ],
    }
  }

  const code = normalizeInviteCode(claim.code)
  const existing =
    store.workers.find(
      (w) => w.inviteCode && normalizeInviteCode(w.inviteCode) === code,
    ) ||
    (claim.localWorkerId
      ? store.workers.find((w) => w.id === claim.localWorkerId)
      : undefined)

  let workerId = existing?.id
  if (existing) {
    store = {
      ...store,
      workers: store.workers.map((w) =>
        w.id === existing.id
          ? {
              ...w,
              shopId: preferredShopId,
              userId: input.staff.id,
              name: input.staff.name || claim.workerName || w.name,
              email: input.staff.email || w.email,
              phone: input.staff.phone || w.phone,
              role: 'worker',
              active: true,
              inviteStatus: 'joined',
              inviteCode: code,
            }
          : w,
      ),
    }
  } else {
    workerId = claim.localWorkerId || uid('w')
    const worker: Worker = {
      id: workerId,
      shopId: preferredShopId,
      userId: input.staff.id,
      name: input.staff.name || claim.workerName,
      role: 'worker',
      phone: input.staff.phone || claim.workerPhone || '',
      email: input.staff.email || claim.workerEmail || '',
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      joiningDate: new Date().toISOString().slice(0, 10),
      active: true,
      inviteStatus: 'joined',
      inviteCode: code,
    }
    store = { ...store, workers: [...store.workers, worker] }
  }

  writeStore(store)
  return {
    shopId: preferredShopId,
    workerId: workerId!,
    shopName: claim.shopName,
  }
}

export function buildStaffSession(input: {
  profile: { id: string; name: string; email: string; picture?: string | null }
  shopId: string
  workerId: string
}): AuthSession {
  return {
    user: {
      id: input.profile.id,
      name: input.profile.name,
      email: input.profile.email,
      avatar: input.profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      picture: input.profile.picture ?? undefined,
      provider: 'google',
    },
    role: 'worker',
    shopIds: [input.shopId],
    activeShopId: input.shopId,
    workerId: input.workerId,
    onboarded: true,
    roleChosen: true,
  }
}

export async function fetchClaimedStaffInvite(email: string) {
  if (!convexReady || !convexHttp || !email.trim()) return null
  try {
    return (await convexHttp.query(api.staffInvites.getClaimedByEmail, {
      staffEmail: email,
    })) as StaffClaimResult | null
  } catch {
    return null
  }
}

export async function claimStaffInviteCode(input: {
  code: string
  staffEmail: string
  staffName?: string
}) {
  if (!convexReady || !convexHttp) {
    throw new Error('Cloud database unavailable')
  }
  return (await convexHttp.mutation(api.staffInvites.claim, {
    code: normalizeInviteCode(input.code),
    staffEmail: input.staffEmail,
    staffName: input.staffName,
  })) as StaffClaimResult
}
