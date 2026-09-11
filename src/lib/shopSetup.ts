import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { convexReady } from '@/lib/convex'

export type ShopSetupPayload = {
  ownerEmail: string
  ownerName: string
  ownerPicture?: string | null
  googleId?: string
  shopName: string
  businessType: string
  logoStorageId?: Id<'_storage'>
  address: string
  city: string
  state: string
  pinCode: string
  contactNumber: string
  alternateNumber?: string
  whatsappNumber?: string
  categoryId: string
  categoryName: string
}

/** Hook for Convex shop setup — no-ops safely when Convex URL is missing. */
export function useShopSetupApi() {
  const generateUploadUrl = useMutation(api.shops.generateUploadUrl)
  const upsertForOwner = useMutation(api.shops.upsertForOwner)
  const upsertUser = useMutation(api.users.upsertByEmail)

  return {
    ready: convexReady,
    upsertUser: async (input: {
      email: string
      name: string
      picture?: string | null
      googleId?: string
      role: 'owner' | 'manager' | 'worker'
    }) => {
      if (!convexReady) return null
      return await upsertUser(input)
    },
    uploadLogo: async (file: File) => {
      if (!convexReady) return undefined
      const postUrl = await generateUploadUrl()
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'image/png' },
        body: file,
      })
      if (!result.ok) throw new Error('Logo upload failed')
      const json = (await result.json()) as { storageId: Id<'_storage'> }
      return json.storageId
    },
    saveShop: async (payload: ShopSetupPayload) => {
      if (!convexReady) return null
      return await upsertForOwner(payload)
    },
  }
}
