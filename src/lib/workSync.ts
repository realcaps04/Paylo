import { api } from '../../convex/_generated/api'
import { convexHttp, convexReady } from '@/lib/convex'
import type { PaymentMethod, PaymentStatus, WorkRecord } from '@/types'

export type CloudWorkRecord = {
  _id: string
  clientId: string
  shopId: string
  workerId: string
  workerName?: string
  customerName: string
  customerPhone?: string
  serviceId?: string
  serviceName: string
  category: string
  quantity: number
  totalAmount: number
  amountPaid: number
  amountPending: number
  discount: number
  tax: number
  tip: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  notes?: string
  editReason?: string
  editHistory?: { reason: string; editedAt: string; editedBy?: string }[]
  createdAt: string
}

export function mapCloudWorkRecord(row: CloudWorkRecord): WorkRecord {
  return {
    id: row.clientId,
    shopId: row.shopId,
    workerId: row.workerId,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    category: row.category,
    quantity: row.quantity,
    totalAmount: row.totalAmount,
    amountPaid: row.amountPaid,
    amountPending: row.amountPending,
    discount: row.discount,
    tax: row.tax,
    tip: row.tip,
    paymentStatus: row.paymentStatus,
    paymentMethod: row.paymentMethod,
    notes: row.notes,
    editReason: row.editReason,
    editHistory: row.editHistory,
    createdAt: row.createdAt,
    synced: true,
  }
}

export async function pushWorkRecordToCloud(
  record: WorkRecord,
  workerName?: string,
): Promise<boolean> {
  if (!convexReady || !convexHttp) return false
  try {
    await convexHttp.mutation(api.workRecords.create, {
      clientId: record.id,
      shopId: record.shopId,
      workerId: record.workerId,
      workerName,
      customerName: record.customerName,
      customerPhone: record.customerPhone,
      serviceId: record.serviceId,
      serviceName: record.serviceName,
      category: record.category,
      quantity: record.quantity,
      totalAmount: record.totalAmount,
      amountPaid: record.amountPaid,
      amountPending: record.amountPending,
      discount: record.discount,
      tax: record.tax,
      tip: record.tip,
      paymentStatus: record.paymentStatus,
      paymentMethod: record.paymentMethod,
      notes: record.notes,
      createdAt: record.createdAt,
    })
    return true
  } catch {
    return false
  }
}

export async function pushWorkUpdateToCloud(input: {
  record: WorkRecord
  editReason: string
  editedBy?: string
}): Promise<boolean> {
  if (!convexReady || !convexHttp) return false
  try {
    await convexHttp.mutation(api.workRecords.update, {
      clientId: input.record.id,
      customerName: input.record.customerName,
      customerPhone: input.record.customerPhone,
      totalAmount: input.record.totalAmount,
      amountPaid: input.record.amountPaid,
      amountPending: input.record.amountPending,
      paymentStatus: input.record.paymentStatus,
      paymentMethod: input.record.paymentMethod,
      notes: input.record.notes,
      editReason: input.editReason,
      editedBy: input.editedBy,
    })
    return true
  } catch {
    return false
  }
}

export async function deleteWorkFromCloud(clientId: string): Promise<boolean> {
  if (!convexReady || !convexHttp) return false
  try {
    await convexHttp.mutation(api.workRecords.remove, { clientId })
    return true
  } catch {
    return false
  }
}

export async function fetchWorkRecordsForShop(shopId: string): Promise<WorkRecord[]> {
  if (!convexReady || !convexHttp || !shopId.trim()) return []
  try {
    const rows = (await convexHttp.query(api.workRecords.listByShop, {
      shopId,
    })) as CloudWorkRecord[]
    return rows.map(mapCloudWorkRecord)
  } catch {
    return []
  }
}

/** Merge cloud rows into local list without dropping unsynced local drafts. */
export function mergeWorkRecords(
  local: WorkRecord[],
  cloud: WorkRecord[],
  shopId: string,
): WorkRecord[] {
  const byId = new Map<string, WorkRecord>()

  for (const row of local) {
    if (row.shopId === shopId) byId.set(row.id, row)
  }
  for (const row of cloud) {
    const existing = byId.get(row.id)
    if (!existing || existing.synced) {
      byId.set(row.id, { ...row, synced: true })
    }
  }

  const otherShops = local.filter((r) => r.shopId !== shopId)
  const forShop = Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  return [...forShop, ...otherShops]
}
