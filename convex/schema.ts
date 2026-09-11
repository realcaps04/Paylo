import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    picture: v.optional(v.union(v.string(), v.null())),
    googleId: v.optional(v.string()),
    role: v.union(v.literal('owner'), v.literal('manager'), v.literal('worker')),
    onboarded: v.boolean(),
    updatedAt: v.number(),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  shops: defineTable({
    ownerEmail: v.string(),
    ownerUserId: v.optional(v.id('users')),
    shopName: v.string(),
    businessType: v.string(),
    logoStorageId: v.optional(v.id('_storage')),
    logoUrl: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    pinCode: v.string(),
    contactNumber: v.string(),
    alternateNumber: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    categoryId: v.string(),
    categoryName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_owner_email', ['ownerEmail'])
    .index('by_owner_user', ['ownerUserId']),

  staffInvites: defineTable({
    code: v.string(),
    shopId: v.string(),
    shopName: v.string(),
    ownerEmail: v.string(),
    workerName: v.string(),
    workerPhone: v.optional(v.string()),
    workerEmail: v.optional(v.string()),
    role: v.union(v.literal('manager'), v.literal('worker')),
    claimed: v.boolean(),
    claimedByEmail: v.optional(v.string()),
    localWorkerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_code', ['code']),
})
