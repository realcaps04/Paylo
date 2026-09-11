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

/** Update a sale — editReason is required and stored in history. */
export const update = mutation({
  args: {
    clientId: v.string(),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    totalAmount: v.optional(v.number()),
    amountPaid: v.optional(v.number()),
    amountPending: v.optional(v.number()),
    paymentStatus: v.optional(paymentStatus),
    paymentMethod: v.optional(paymentMethod),
    notes: v.optional(v.string()),
    editReason: v.string(),
    editedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reason = args.editReason.trim()
    if (reason.length < 3) throw new Error('Edit reason is required')

    const row = await ctx.db
      .query('workRecords')
      .withIndex('by_client_id', (q) => q.eq('clientId', args.clientId))
      .unique()
    if (!row) throw new Error('Sale not found')

    const now = Date.now()
    const editedAt = new Date(now).toISOString()
    const history = [
      ...(row.editHistory ?? []),
      {
        reason,
        editedAt,
        editedBy: args.editedBy,
      },
    ]

    const totalAmount = args.totalAmount ?? row.totalAmount
    const amountPaid = args.amountPaid ?? row.amountPaid
    const amountPending =
      args.amountPending ?? Math.max(0, totalAmount - amountPaid)

    await ctx.db.patch(row._id, {
      customerName: args.customerName?.trim() || row.customerName,
      customerPhone:
        args.customerPhone !== undefined
          ? args.customerPhone.trim() || undefined
          : row.customerPhone,
      totalAmount,
      amountPaid,
      amountPending,
      paymentStatus: args.paymentStatus ?? row.paymentStatus,
      paymentMethod: args.paymentMethod ?? row.paymentMethod,
      notes: args.notes !== undefined ? args.notes.trim() || undefined : row.notes,
      editReason: reason,
      editHistory: history,
      updatedAt: now,
    })

    return await ctx.db.get(row._id)
  },
})

export const remove = mutation({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('workRecords')
      .withIndex('by_client_id', (q) => q.eq('clientId', args.clientId))
      .unique()
    if (!row) return { deleted: false }
    await ctx.db.delete(row._id)
    return { deleted: true }
  },
})
