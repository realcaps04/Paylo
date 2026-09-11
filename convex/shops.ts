import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const upsertForOwner = mutation({
  args: {
    ownerEmail: v.string(),
    ownerName: v.string(),
    ownerPicture: v.optional(v.union(v.string(), v.null())),
    googleId: v.optional(v.string()),
    shopName: v.string(),
    businessType: v.string(),
    logoStorageId: v.optional(v.id('_storage')),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    pinCode: v.string(),
    contactNumber: v.string(),
    alternateNumber: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    categoryId: v.string(),
    categoryName: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.ownerEmail)
    const now = Date.now()

    let user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user) {
      const userId = await ctx.db.insert('users', {
        email,
        name: args.ownerName,
        picture: args.ownerPicture ?? null,
        googleId: args.googleId,
        role: 'owner',
        onboarded: true,
        createdAt: now,
        updatedAt: now,
      })
      user = (await ctx.db.get(userId))!
    } else {
      await ctx.db.patch(user._id, {
        name: args.ownerName || user.name,
        picture: args.ownerPicture ?? user.picture,
        googleId: args.googleId ?? user.googleId,
        role: 'owner',
        onboarded: true,
        updatedAt: now,
      })
    }

    let logoUrl: string | undefined
    if (args.logoStorageId) {
      logoUrl = (await ctx.storage.getUrl(args.logoStorageId)) ?? undefined
    }

    const existingShop = await ctx.db
      .query('shops')
      .withIndex('by_owner_email', (q) => q.eq('ownerEmail', email))
      .first()

    const payload = {
      ownerEmail: email,
      ownerUserId: user._id,
      shopName: args.shopName.trim(),
      businessType: args.businessType.trim(),
      logoStorageId: args.logoStorageId,
      logoUrl,
      address: args.address.trim(),
      city: args.city.trim(),
      state: args.state.trim(),
      pinCode: args.pinCode.trim(),
      contactNumber: args.contactNumber.trim(),
      alternateNumber: args.alternateNumber?.trim() || undefined,
      whatsappNumber: args.whatsappNumber?.trim() || undefined,
      categoryId: args.categoryId,
      categoryName: args.categoryName,
      updatedAt: now,
    }

    if (existingShop) {
      await ctx.db.patch(existingShop._id, payload)
      return existingShop._id
    }

    return await ctx.db.insert('shops', {
      ...payload,
      createdAt: now,
    })
  },
})

export const getByOwnerEmail = query({
  args: { ownerEmail: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.ownerEmail)
    const shop = await ctx.db
      .query('shops')
      .withIndex('by_owner_email', (q) => q.eq('ownerEmail', email))
      .first()
    if (!shop) return null

    let logoUrl = shop.logoUrl
    if (!logoUrl && shop.logoStorageId) {
      logoUrl = (await ctx.storage.getUrl(shop.logoStorageId)) ?? undefined
    }
    return { ...shop, logoUrl }
  },
})

/** All shops for an owner — used for multi-shop restore. */
export const listByOwnerEmail = query({
  args: { ownerEmail: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.ownerEmail)
    const shops = await ctx.db
      .query('shops')
      .withIndex('by_owner_email', (q) => q.eq('ownerEmail', email))
      .collect()

    return await Promise.all(
      shops.map(async (shop) => {
        let logoUrl = shop.logoUrl
        if (!logoUrl && shop.logoStorageId) {
          logoUrl = (await ctx.storage.getUrl(shop.logoStorageId)) ?? undefined
        }
        return { ...shop, logoUrl }
      }),
    )
  },
})

/** Always insert a new shop (additional locations). Never patches an existing one. */
export const createForOwner = mutation({
  args: {
    ownerEmail: v.string(),
    ownerName: v.string(),
    ownerPicture: v.optional(v.union(v.string(), v.null())),
    googleId: v.optional(v.string()),
    shopName: v.string(),
    businessType: v.string(),
    logoStorageId: v.optional(v.id('_storage')),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    pinCode: v.string(),
    contactNumber: v.string(),
    alternateNumber: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    categoryId: v.string(),
    categoryName: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.ownerEmail)
    const now = Date.now()

    let user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user) {
      const userId = await ctx.db.insert('users', {
        email,
        name: args.ownerName,
        picture: args.ownerPicture ?? null,
        googleId: args.googleId,
        role: 'owner',
        onboarded: true,
        createdAt: now,
        updatedAt: now,
      })
      user = (await ctx.db.get(userId))!
    } else {
      await ctx.db.patch(user._id, {
        name: args.ownerName || user.name,
        picture: args.ownerPicture ?? user.picture,
        googleId: args.googleId ?? user.googleId,
        role: 'owner',
        onboarded: true,
        updatedAt: now,
      })
    }

    let logoUrl: string | undefined
    if (args.logoStorageId) {
      logoUrl = (await ctx.storage.getUrl(args.logoStorageId)) ?? undefined
    }

    return await ctx.db.insert('shops', {
      ownerEmail: email,
      ownerUserId: user._id,
      shopName: args.shopName.trim(),
      businessType: args.businessType.trim(),
      logoStorageId: args.logoStorageId,
      logoUrl,
      address: args.address.trim(),
      city: args.city.trim(),
      state: args.state.trim(),
      pinCode: args.pinCode.trim(),
      contactNumber: args.contactNumber.trim(),
      alternateNumber: args.alternateNumber?.trim() || undefined,
      whatsappNumber: args.whatsappNumber?.trim() || undefined,
      categoryId: args.categoryId,
      categoryName: args.categoryName,
      createdAt: now,
      updatedAt: now,
    })
  },
})
