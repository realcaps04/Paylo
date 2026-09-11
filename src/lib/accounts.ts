import type { Role } from '@/types'
import { loadJSON, saveJSON } from '@/lib/storage'

export type UserAccountRecord = {
  userId: string
  email: string
  name: string
  picture?: string | null
  role: Role
  shopIds: string[]
  workerId?: string
  onboarded: boolean
  updatedAt: string
}

type AccountsMap = Record<string, UserAccountRecord>

function keyForEmail(email: string) {
  return email.trim().toLowerCase()
}

export function getAccountByEmail(email: string): UserAccountRecord | null {
  const all = loadJSON<AccountsMap>('accounts', {})
  return all[keyForEmail(email)] ?? null
}

export function upsertAccount(record: UserAccountRecord) {
  const all = loadJSON<AccountsMap>('accounts', {})
  all[keyForEmail(record.email)] = {
    ...record,
    updatedAt: new Date().toISOString(),
  }
  saveJSON('accounts', all)
}

export function syncAccountFromSession(input: {
  userId: string
  email: string
  name: string
  picture?: string | null
  role: Role
  shopIds: string[]
  workerId?: string
  onboarded: boolean
}) {
  upsertAccount({
    ...input,
    updatedAt: new Date().toISOString(),
  })
}
