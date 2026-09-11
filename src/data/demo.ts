import type {
  AppNotification,
  Customer,
  PaymentEntry,
  Service,
  Shop,
  WorkRecord,
  Worker,
} from '@/types'

const today = new Date()
const iso = (daysAgo: number, hour = 10, minute = 0) => {
  const d = new Date(today)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const DEMO_SHOP: Shop = {
  id: 'shop_main',
  name: 'Main Salon',
  categoryId: 'unisex-salon',
  categoryName: 'Unisex Salon',
  ownerName: 'Priya Sharma',
  phone: '+91 98765 43210',
  email: 'priya@mainsalon.in',
  address: '42 MG Road, Near City Mall',
  city: 'Bengaluru',
  state: 'Karnataka',
  pinCode: '560001',
  description: 'Premium unisex salon offering hair, beauty and spa services.',
  hours: { open: '09:00', close: '20:00', holidays: ['Sunday'] },
  createdAt: iso(120),
}

export const DEMO_SHOP_2: Shop = {
  id: 'shop_barber',
  name: 'City Barber',
  categoryId: 'barber',
  categoryName: 'Barber Shop',
  ownerName: 'Priya Sharma',
  phone: '+91 98765 43211',
  email: 'hello@citybarber.in',
  address: '18 Brigade Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pinCode: '560025',
  description: 'Classic barber shop with modern grooming.',
  hours: { open: '10:00', close: '21:00', holidays: ['Monday'] },
  createdAt: iso(60),
}

export const DEMO_WORKERS: Worker[] = [
  {
    id: 'w_owner',
    shopId: 'shop_main',
    userId: 'u_owner',
    name: 'Priya Sharma',
    role: 'owner',
    phone: '+91 98765 43210',
    email: 'priya@mainsalon.in',
    employeeId: 'EMP-000',
    joiningDate: iso(365),
    specialization: 'Owner',
    active: true,
    inviteStatus: 'joined',
    avatar: 'PS',
  },
  {
    id: 'w_anjali',
    shopId: 'shop_main',
    userId: 'u_anjali',
    name: 'Anjali Mehta',
    role: 'worker',
    phone: '+91 98111 22334',
    email: 'anjali@mainsalon.in',
    employeeId: 'EMP-001',
    joiningDate: iso(200),
    specialization: 'Senior Stylist',
    commissionPercent: 15,
    active: true,
    inviteStatus: 'joined',
    avatar: 'AM',
  },
  {
    id: 'w_rahul',
    shopId: 'shop_main',
    userId: 'u_rahul',
    name: 'Rahul Kumar',
    role: 'worker',
    phone: '+91 98222 33445',
    email: 'rahul@mainsalon.in',
    employeeId: 'EMP-002',
    joiningDate: iso(150),
    specialization: 'Hair Color Specialist',
    commissionPercent: 12,
    active: true,
    inviteStatus: 'joined',
    avatar: 'RK',
  },
  {
    id: 'w_meera',
    shopId: 'shop_main',
    name: 'Meera Nair',
    role: 'worker',
    phone: '+91 98333 44556',
    email: 'meera@mainsalon.in',
    employeeId: 'EMP-003',
    joiningDate: iso(90),
    specialization: 'Facial & Skin',
    commissionPercent: 10,
    active: true,
    inviteStatus: 'joined',
    avatar: 'MN',
  },
  {
    id: 'w_vikram',
    shopId: 'shop_main',
    name: 'Vikram Das',
    role: 'manager',
    phone: '+91 98444 55667',
    email: 'vikram@mainsalon.in',
    employeeId: 'EMP-004',
    joiningDate: iso(180),
    specialization: 'Floor Manager',
    active: true,
    inviteStatus: 'joined',
    avatar: 'VD',
  },
]

export const DEMO_SERVICES: Service[] = [
  { id: 's1', shopId: 'shop_main', name: 'Haircut', category: 'Hair', defaultPrice: 350, durationMinutes: 30, description: 'Classic cut & style', active: true },
  { id: 's2', shopId: 'shop_main', name: 'Hair Coloring', category: 'Hair', defaultPrice: 1200, durationMinutes: 90, description: 'Full color service', active: true },
  { id: 's3', shopId: 'shop_main', name: 'Facial', category: 'Skin', defaultPrice: 800, durationMinutes: 45, description: 'Deep cleansing facial', active: true },
  { id: 's4', shopId: 'shop_main', name: 'Beard Trim', category: 'Grooming', defaultPrice: 150, durationMinutes: 15, description: 'Shape & trim', active: true },
  { id: 's5', shopId: 'shop_main', name: 'Hair Spa', category: 'Hair', defaultPrice: 900, durationMinutes: 60, description: 'Nourishing spa treatment', active: true },
  { id: 's6', shopId: 'shop_main', name: 'Manicure', category: 'Nails', defaultPrice: 450, durationMinutes: 40, description: 'Classic manicure', active: true },
  { id: 's7', shopId: 'shop_main', name: 'Bridal Makeup', category: 'Makeup', defaultPrice: 8500, durationMinutes: 180, description: 'Complete bridal package', active: true },
  { id: 's8', shopId: 'shop_main', name: 'Blow Dry', category: 'Hair', defaultPrice: 400, durationMinutes: 25, description: 'Wash & blow dry', active: true },
]

export const DEMO_CUSTOMERS: Customer[] = [
  { id: 'c1', shopId: 'shop_main', name: 'Arun Patel', phone: '9876501234', totalVisits: 12, totalSpent: 8400, pendingAmount: 0, lastVisit: iso(0, 11, 20) },
  { id: 'c2', shopId: 'shop_main', name: 'Sneha Reddy', phone: '9876502345', totalVisits: 8, totalSpent: 12400, pendingAmount: 400, lastVisit: iso(0, 14, 10) },
  { id: 'c3', shopId: 'shop_main', name: 'Karthik Iyer', phone: '9876503456', totalVisits: 5, totalSpent: 3200, pendingAmount: 0, lastVisit: iso(1, 16, 0) },
  { id: 'c4', shopId: 'shop_main', name: 'Divya Menon', phone: '9876504567', totalVisits: 15, totalSpent: 18600, pendingAmount: 800, lastVisit: iso(0, 12, 45) },
  { id: 'c5', shopId: 'shop_main', name: 'Rohan Shah', phone: '9876505678', totalVisits: 3, totalSpent: 1500, pendingAmount: 0, lastVisit: iso(2, 10, 0) },
  { id: 'c6', shopId: 'shop_main', name: 'Aisha Khan', phone: '9876506789', totalVisits: 7, totalSpent: 9800, pendingAmount: 1200, lastVisit: iso(0, 15, 30) },
  { id: 'c7', shopId: 'shop_main', name: 'Nisha Verma', phone: '9876507890', totalVisits: 4, totalSpent: 4500, pendingAmount: 0, lastVisit: iso(3, 11, 0) },
]

export const DEMO_WORK: WorkRecord[] = [
  { id: 'wr1', shopId: 'shop_main', workerId: 'w_anjali', customerId: 'c1', customerName: 'Arun Patel', customerPhone: '9876501234', serviceId: 's1', serviceName: 'Haircut', category: 'Hair', quantity: 1, totalAmount: 350, amountPaid: 350, amountPending: 0, discount: 0, tax: 0, tip: 0, paymentStatus: 'paid', paymentMethod: 'upi', createdAt: iso(0, 11, 20), synced: true },
  { id: 'wr2', shopId: 'shop_main', workerId: 'w_anjali', customerId: 'c2', customerName: 'Sneha Reddy', serviceId: 's3', serviceName: 'Facial', category: 'Skin', quantity: 1, totalAmount: 800, amountPaid: 400, amountPending: 400, discount: 0, tax: 0, tip: 0, paymentStatus: 'partial', paymentMethod: 'cash', createdAt: iso(0, 14, 10), synced: true },
  { id: 'wr3', shopId: 'shop_main', workerId: 'w_rahul', customerId: 'c4', customerName: 'Divya Menon', serviceId: 's2', serviceName: 'Hair Coloring', category: 'Hair', quantity: 1, totalAmount: 1200, amountPaid: 1200, amountPending: 0, discount: 0, tax: 0, tip: 50, paymentStatus: 'paid', paymentMethod: 'card', createdAt: iso(0, 12, 45), synced: true },
  { id: 'wr4', shopId: 'shop_main', workerId: 'w_meera', customerId: 'c6', customerName: 'Aisha Khan', serviceId: 's3', serviceName: 'Facial', category: 'Skin', quantity: 1, totalAmount: 800, amountPaid: 0, amountPending: 800, discount: 0, tax: 0, tip: 0, paymentStatus: 'pending', createdAt: iso(0, 15, 30), synced: true },
  { id: 'wr5', shopId: 'shop_main', workerId: 'w_anjali', customerId: 'c3', customerName: 'Karthik Iyer', serviceId: 's4', serviceName: 'Beard Trim', category: 'Grooming', quantity: 1, totalAmount: 150, amountPaid: 150, amountPending: 0, discount: 0, tax: 0, tip: 0, paymentStatus: 'paid', paymentMethod: 'upi', createdAt: iso(0, 10, 5), synced: true },
  { id: 'wr6', shopId: 'shop_main', workerId: 'w_rahul', customerId: 'c5', customerName: 'Rohan Shah', serviceId: 's1', serviceName: 'Haircut', category: 'Hair', quantity: 1, totalAmount: 350, amountPaid: 350, amountPending: 0, discount: 0, tax: 0, tip: 0, paymentStatus: 'paid', paymentMethod: 'cash', createdAt: iso(0, 9, 40), synced: true },
  { id: 'wr7', shopId: 'shop_main', workerId: 'w_meera', customerId: 'c7', customerName: 'Nisha Verma', serviceId: 's5', serviceName: 'Hair Spa', category: 'Hair', quantity: 1, totalAmount: 900, amountPaid: 900, amountPending: 0, discount: 100, tax: 0, tip: 0, paymentStatus: 'paid', paymentMethod: 'upi', createdAt: iso(1, 16, 0), synced: true },
  { id: 'wr8', shopId: 'shop_main', workerId: 'w_anjali', customerId: 'c4', customerName: 'Divya Menon', serviceId: 's6', serviceName: 'Manicure', category: 'Nails', quantity: 1, totalAmount: 450, amountPaid: 0, amountPending: 450, discount: 0, tax: 0, tip: 0, paymentStatus: 'pending', createdAt: iso(1, 13, 20), synced: true },
  { id: 'wr9', shopId: 'shop_main', workerId: 'w_rahul', customerId: 'c1', customerName: 'Arun Patel', serviceId: 's8', serviceName: 'Blow Dry', category: 'Hair', quantity: 1, totalAmount: 400, amountPaid: 400, amountPending: 0, discount: 0, tax: 0, tip: 0, paymentStatus: 'paid', paymentMethod: 'upi', createdAt: iso(1, 11, 0), synced: true },
  { id: 'wr10', shopId: 'shop_main', workerId: 'w_anjali', customerId: 'c2', customerName: 'Sneha Reddy', serviceId: 's2', serviceName: 'Hair Coloring', category: 'Hair', quantity: 1, totalAmount: 1200, amountPaid: 1200, amountPending: 0, discount: 0, tax: 0, tip: 100, paymentStatus: 'paid', paymentMethod: 'card', createdAt: iso(2, 15, 0), synced: true },
  { id: 'wr11', shopId: 'shop_main', workerId: 'w_meera', customerId: 'c6', customerName: 'Aisha Khan', serviceId: 's7', serviceName: 'Bridal Makeup', category: 'Makeup', quantity: 1, totalAmount: 8500, amountPaid: 7300, amountPending: 1200, discount: 0, tax: 0, tip: 0, paymentStatus: 'partial', paymentMethod: 'bank', createdAt: iso(3, 10, 0), synced: true },
  { id: 'wr12', shopId: 'shop_main', workerId: 'w_rahul', customerId: 'c3', customerName: 'Karthik Iyer', serviceId: 's1', serviceName: 'Haircut', category: 'Hair', quantity: 1, totalAmount: 350, amountPaid: 350, amountPending: 0, discount: 0, tax: 0, tip: 0, paymentStatus: 'paid', paymentMethod: 'cash', createdAt: iso(4, 12, 0), synced: true },
  { id: 'wr13', shopId: 'shop_main', workerId: 'w_anjali', customerId: 'c5', customerName: 'Rohan Shah', serviceId: 's4', serviceName: 'Beard Trim', category: 'Grooming', quantity: 1, totalAmount: 150, amountPaid: 150, amountPending: 0, discount: 0, tax: 0, tip: 0, paymentStatus: 'paid', paymentMethod: 'upi', createdAt: iso(5, 14, 0), synced: true },
  { id: 'wr14', shopId: 'shop_main', workerId: 'w_meera', customerId: 'c7', customerName: 'Nisha Verma', serviceId: 's3', serviceName: 'Facial', category: 'Skin', quantity: 1, totalAmount: 800, amountPaid: 800, amountPending: 0, discount: 0, tax: 0, tip: 0, paymentStatus: 'paid', paymentMethod: 'upi', createdAt: iso(6, 11, 30), synced: true },
  { id: 'wr15', shopId: 'shop_main', workerId: 'w_anjali', customerId: 'c1', customerName: 'Arun Patel', serviceId: 's5', serviceName: 'Hair Spa', category: 'Hair', quantity: 1, totalAmount: 900, amountPaid: 900, amountPending: 0, discount: 0, tax: 0, tip: 0, paymentStatus: 'paid', paymentMethod: 'card', createdAt: iso(0, 16, 15), synced: true },
]

export const DEMO_PAYMENTS: PaymentEntry[] = [
  { id: 'p1', workRecordId: 'wr1', shopId: 'shop_main', amount: 350, method: 'upi', type: 'payment', createdAt: iso(0, 11, 21) },
  { id: 'p2', workRecordId: 'wr2', shopId: 'shop_main', amount: 400, method: 'cash', type: 'partial', createdAt: iso(0, 14, 11) },
  { id: 'p3', workRecordId: 'wr3', shopId: 'shop_main', amount: 1250, method: 'card', type: 'payment', createdAt: iso(0, 12, 46) },
  { id: 'p4', workRecordId: 'wr11', shopId: 'shop_main', amount: 7300, method: 'bank', type: 'partial', createdAt: iso(3, 10, 5) },
]

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', shopId: 'shop_main', title: 'Payment received', body: '₹350 UPI payment from Arun Patel', type: 'payment', read: false, createdAt: iso(0, 11, 22) },
  { id: 'n2', shopId: 'shop_main', title: 'Pending payment reminder', body: 'Aisha Khan has ₹1,200 outstanding', type: 'reminder', read: false, createdAt: iso(0, 9, 0) },
  { id: 'n3', shopId: 'shop_main', title: 'Daily revenue summary', body: 'Yesterday you collected ₹2,150 across 4 services', type: 'summary', read: true, createdAt: iso(1, 8, 0) },
  { id: 'n4', shopId: 'shop_main', title: 'Worker joined', body: 'Meera Nair accepted the invite', type: 'worker', read: true, createdAt: iso(5, 10, 0) },
]

export function createEmptyStore() {
  return {
    shops: [] as Shop[],
    workers: [] as Worker[],
    customers: [] as Customer[],
    services: [] as Service[],
    workRecords: [] as WorkRecord[],
    payments: [] as PaymentEntry[],
    notifications: [] as AppNotification[],
  }
}

export function createDemoStore() {
  return {
    shops: [DEMO_SHOP, DEMO_SHOP_2],
    workers: DEMO_WORKERS,
    customers: DEMO_CUSTOMERS,
    services: DEMO_SERVICES,
    workRecords: DEMO_WORK,
    payments: DEMO_PAYMENTS,
    notifications: DEMO_NOTIFICATIONS,
  }
}
