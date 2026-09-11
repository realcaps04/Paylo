import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export const upsertByEmail = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    picture: v.optional(v.union(v.string(), v.null())),
    googleId: v.optional(v.string()),
    role: v.union(v.literal('owner'), v.literal('manager'), v.literal('worker')),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    const now = Date.now()
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name || existing.name,
        picture: args.picture ?? existing.picture,
        googleId: args.googleId ?? existing.googleId,
        // Keep established role/onboarded for returning users
        role: existing.onboarded ? existing.role : args.role,
        updatedAt: now,
      })
      return existing._id
    }

    return await ctx.db.insert('users', {
      email,
      name: args.name,
      picture: args.picture ?? null,
      googleId: args.googleId,
      role: args.role,
      onboarded: false,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()
  },
})

export const markOnboarded = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal('owner'), v.literal('manager'), v.literal('worker')),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()
    if (!user) throw new Error('User not found')
    await ctx.db.patch(user._id, {
      onboarded: true,
      role: args.role,
      updatedAt: Date.now(),
    })
    return user._id
  },
})
