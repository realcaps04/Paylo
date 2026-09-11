export type Role = 'owner' | 'manager' | 'worker'

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'refunded'
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank' | 'other'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  provider: 'google' | 'email'
}

export interface ShopCategoryItem {
  id: string
  name: string
  description: string
  group: string
  icon: string
}

export interface BusinessHours {
  open: string
  close: string
  holidays: string[]
}

export interface Shop {
  id: string
  name: string
  categoryId: string
  categoryName: string
  ownerName: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  pinCode: string
  description: string
  logo?: string
  coverImage?: string
  hours: BusinessHours
  createdAt: string
}

export interface Worker {
  id: string
  shopId: string
  userId?: string
  name: string
  role: Role
  phone: string
  email: string
  employeeId: string
  joiningDate: string
  specialization?: string
  commissionPercent?: number
  avatar?: string
  active: boolean
  inviteStatus: 'joined' | 'pending' | 'none'
}

export interface Customer {
  id: string
  shopId: string
  name: string
  phone: string
  email?: string
  totalVisits: number
  totalSpent: number
  pendingAmount: number
  lastVisit: string
  notes?: string
}

export interface Service {
  id: string
  shopId: string
  name: string
  category: string
  defaultPrice: number
  durationMinutes: number
  description: string
  active: boolean
}

export interface WorkRecord {
  id: string
  shopId: string
  workerId: string
  customerId?: string
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
  createdAt: string
  synced: boolean
  offlineId?: string
}

export interface PaymentEntry {
  id: string
  workRecordId: string
  shopId: string
  amount: number
  method: PaymentMethod
  type: 'payment' | 'refund' | 'partial'
  note?: string
  createdAt: string
}

export interface AppNotification {
  id: string
  shopId: string
  title: string
  body: string
  type:
    | 'payment'
    | 'worker'
    | 'invite'
    | 'reminder'
    | 'summary'
    | 'system'
  read: boolean
  createdAt: string
}

export interface AuthSession {
  user: User
  role: Role
  shopIds: string[]
  activeShopId: string | null
  workerId?: string
  onboarded: boolean
}

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | '7d'
  | '30d'
  | '3m'
  | 'custom'
