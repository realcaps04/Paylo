import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export const create = mutation({
  args: {
    code: v.string(),
    shopId: v.string(),
    shopName: v.string(),
    ownerEmail: v.string(),
    workerName: v.string(),
    workerPhone: v.optional(v.string()),
    workerEmail: v.optional(v.string()),
    role: v.union(v.literal('manager'), v.literal('worker')),
    localWorkerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code)
    if (code.length !== 8) throw new Error('Invite code must be 8 characters')

    const ownerEmail = normalizeEmail(args.ownerEmail)
    if (!ownerEmail || !ownerEmail.includes('@')) {
      throw new Error('Owner email is required to store staff invite')
    }

    const existing = await ctx.db
      .query('staffInvites')
      .withIndex('by_code', (q) => q.eq('code', code))
      .unique()

    const now = Date.now()
    if (existing) {
      await ctx.db.patch(existing._id, {
        shopId: args.shopId,
        shopName: args.shopName,
        ownerEmail,
        workerName: args.workerName.trim(),
        workerPhone: args.workerPhone?.trim() || undefined,
        workerEmail: args.workerEmail ? normalizeEmail(args.workerEmail) : undefined,
        role: args.role,
        localWorkerId: args.localWorkerId ?? existing.localWorkerId,
        updatedAt: now,
      })
      return await ctx.db.get(existing._id)
    }

    const id = await ctx.db.insert('staffInvites', {
      code,
      shopId: args.shopId,
      shopName: args.shopName,
      ownerEmail,
      workerName: args.workerName.trim(),
      workerPhone: args.workerPhone?.trim() || undefined,
      workerEmail: args.workerEmail ? normalizeEmail(args.workerEmail) : undefined,
      role: args.role,
      claimed: false,
      localWorkerId: args.localWorkerId,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(id)
  },
})

/** @deprecated Prefer create — kept as an alias for older clients. */
export const upsert = mutation({
  args: {
    code: v.string(),
    shopId: v.string(),
    shopName: v.string(),
    ownerEmail: v.string(),
    workerName: v.string(),
    workerPhone: v.optional(v.string()),
    workerEmail: v.optional(v.string()),
    role: v.union(v.literal('manager'), v.literal('worker')),
    localWorkerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Delegate to the same logic as create by inlining (Convex handlers can't call each other easily)
    const code = normalizeCode(args.code)
    if (code.length !== 8) throw new Error('Invite code must be 8 characters')
    const ownerEmail = normalizeEmail(args.ownerEmail)
    if (!ownerEmail || !ownerEmail.includes('@')) {
      throw new Error('Owner email is required to store staff invite')
    }
    const now = Date.now()
    const existing = await ctx.db
      .query('staffInvites')
      .withIndex('by_code', (q) => q.eq('code', code))
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, {
        shopId: args.shopId,
        shopName: args.shopName,
        ownerEmail,
        workerName: args.workerName.trim(),
        workerPhone: args.workerPhone?.trim() || undefined,
        workerEmail: args.workerEmail ? normalizeEmail(args.workerEmail) : undefined,
        role: args.role,
        localWorkerId: args.localWorkerId ?? existing.localWorkerId,
        updatedAt: now,
      })
      return await ctx.db.get(existing._id)
    }
    const id = await ctx.db.insert('staffInvites', {
      code,
      shopId: args.shopId,
      shopName: args.shopName,
      ownerEmail,
      workerName: args.workerName.trim(),
      workerPhone: args.workerPhone?.trim() || undefined,
      workerEmail: args.workerEmail ? normalizeEmail(args.workerEmail) : undefined,
      role: args.role,
      claimed: false,
      localWorkerId: args.localWorkerId,
      createdAt: now,
      updatedAt: now,
    })
    return await ctx.db.get(id)
  },
})

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code)
    if (code.length !== 8) return null
    return await ctx.db
      .query('staffInvites')
      .withIndex('by_code', (q) => q.eq('code', code))
      .unique()
  },
})

export const listByOwnerEmail = query({
  args: { ownerEmail: v.string() },
  handler: async (ctx, args) => {
    const ownerEmail = normalizeEmail(args.ownerEmail)
    const all = await ctx.db.query('staffInvites').collect()
    return all.filter((row) => row.ownerEmail === ownerEmail)
  },
})

export const getClaimedByEmail = query({
  args: { staffEmail: v.string() },
  handler: async (ctx, args) => {
    const staffEmail = normalizeEmail(args.staffEmail)
    const invite = await ctx.db
      .query('staffInvites')
      .withIndex('by_claimed_email', (q) => q.eq('claimedByEmail', staffEmail))
      .first()
    if (!invite || !invite.claimed) return null

    const shop = await ctx.db
      .query('shops')
      .withIndex('by_owner_email', (q) => q.eq('ownerEmail', invite.ownerEmail))
      .first()

    return {
      code: invite.code,
      shopId: invite.shopId,
      shopName: invite.shopName,
      ownerEmail: invite.ownerEmail,
      workerName: invite.workerName,
      workerPhone: invite.workerPhone,
      workerEmail: invite.workerEmail,
      role: invite.role,
      localWorkerId: invite.localWorkerId,
      shop: shop
        ? {
            _id: shop._id,
            ownerEmail: shop.ownerEmail,
            shopName: shop.shopName,
            businessType: shop.businessType,
            logoUrl: shop.logoUrl,
            address: shop.address,
            city: shop.city,
            state: shop.state,
            pinCode: shop.pinCode,
            contactNumber: shop.contactNumber,
            categoryId: shop.categoryId,
            categoryName: shop.categoryName,
            createdAt: shop.createdAt,
          }
        : null,
    }
  },
})

export const claim = mutation({
  args: {
    code: v.string(),
    staffEmail: v.string(),
    staffName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code)
    const invite = await ctx.db
      .query('staffInvites')
      .withIndex('by_code', (q) => q.eq('code', code))
      .unique()
    if (!invite) throw new Error('Invite code not found')

    const staffEmail = normalizeEmail(args.staffEmail)
    if (invite.claimed && invite.claimedByEmail !== staffEmail) {
      throw new Error('This invite code was already used by another staff member')
    }

    const now = Date.now()
    if (!invite.claimed) {
      await ctx.db.patch(invite._id, {
        claimed: true,
        claimedByEmail: staffEmail,
        workerName: args.staffName?.trim() || invite.workerName,
        updatedAt: now,
      })
    }

    // Mark staff user as onboarded worker in users table
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', staffEmail))
      .unique()
    if (user) {
      await ctx.db.patch(user._id, {
        role: 'worker',
        onboarded: true,
        name: args.staffName?.trim() || user.name,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('users', {
        email: staffEmail,
        name: args.staffName?.trim() || invite.workerName,
        picture: null,
        role: 'worker',
        onboarded: true,
        createdAt: now,
        updatedAt: now,
      })
    }

    const shop = await ctx.db
      .query('shops')
      .withIndex('by_owner_email', (q) => q.eq('ownerEmail', invite.ownerEmail))
      .first()

    return {
      code: invite.code,
      shopId: invite.shopId,
      shopName: invite.shopName,
      ownerEmail: invite.ownerEmail,
      workerName: args.staffName?.trim() || invite.workerName,
      workerPhone: invite.workerPhone,
      workerEmail: invite.workerEmail,
      role: 'worker' as const,
      localWorkerId: invite.localWorkerId,
      shop: shop
        ? {
            _id: shop._id,
            ownerEmail: shop.ownerEmail,
            shopName: shop.shopName,
            businessType: shop.businessType,
            logoUrl: shop.logoUrl,
            address: shop.address,
            city: shop.city,
            state: shop.state,
            pinCode: shop.pinCode,
            contactNumber: shop.contactNumber,
            categoryId: shop.categoryId,
            categoryName: shop.categoryName,
            createdAt: shop.createdAt,
          }
        : null,
    }
  },
})
