import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const paymentStatus = v.union(
  v.literal('paid'),
  v.literal('pending'),
  v.literal('partial'),
  v.literal('refunded'),
)

const paymentMethod = v.union(
  v.literal('upi'),
  v.literal('cash'),
  v.literal('card'),
  v.literal('bank'),
  v.literal('other'),
)

export const create = mutation({
  args: {
    clientId: v.string(),
    shopId: v.string(),
    workerId: v.string(),
    workerName: v.optional(v.string()),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    serviceId: v.optional(v.string()),
    serviceName: v.string(),
    category: v.string(),
    quantity: v.number(),
    totalAmount: v.number(),
    amountPaid: v.number(),
    amountPending: v.number(),
    discount: v.number(),
    tax: v.number(),
    tip: v.number(),
    paymentStatus,
    paymentMethod: v.optional(paymentMethod),
    notes: v.optional(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('workRecords')
      .withIndex('by_client_id', (q) => q.eq('clientId', args.clientId))
      .unique()
    if (existing) return existing

    const now = Date.now()
    const id = await ctx.db.insert('workRecords', {
      ...args,
      customerName: args.customerName.trim(),
      customerPhone: args.customerPhone?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      createdAtMs: Date.parse(args.createdAt) || now,
      updatedAt: now,
    })
    return await ctx.db.get(id)
  },
})

export const listByShop = query({
  args: { shopId: v.string() },
  handler: async (ctx, args) => {
    const shopId = args.shopId.trim()
    if (!shopId) return []
    const rows = await ctx.db
      .query('workRecords')
      .withIndex('by_shop', (q) => q.eq('shopId', shopId))
      .collect()
    return rows.sort((a, b) => b.createdAtMs - a.createdAtMs)
  },
})
