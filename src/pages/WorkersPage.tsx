import { useEffect, useState } from 'react'
import { Check, Copy, KeyRound, UserPlus, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useShop } from '@/context/ShopContext'
import { useToast } from '@/context/ToastContext'
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
} from '@/components/ui'
import { formatINR, uid } from '@/lib/format'
import { generateStaffInviteCode } from '@/lib/inviteCode'
import { convexHttp, convexReady } from '@/lib/convex'
import { api } from '../../convex/_generated/api'
import { workerStats } from '@/lib/permissions'
import type { Role, Worker } from '@/types'

const emptyForm = {
  name: '',
  role: 'worker' as Role,
}

async function persistInviteToDb(input: {
  code: string
  shopId: string
  shopName: string
  ownerEmail: string
  workerName: string
  workerPhone?: string
  workerEmail?: string
  role: 'manager' | 'worker'
  localWorkerId: string
}) {
  if (!convexReady || !convexHttp) {
    throw new Error('Cloud database is not configured')
  }
  return await convexHttp.mutation(api.staffInvites.create, input)
}

export function WorkersPage() {
  const { session } = useAuth()
  const { workers, workRecords, shop, addWorker, updateWorker, removeWorker } = useShop()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Worker | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [createdCode, setCreatedCode] = useState<{ name: string; code: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<
    | { type: 'deactivate' | 'activate' | 'remove'; worker: Worker }
    | null
  >(null)

  const ownerEmail = (shop?.email || session?.user.email || '').trim().toLowerCase()
  const team = workers.filter((w) => {
    if (w.role === 'owner') return false
    if (session?.user.id && w.userId === session.user.id) return false
    if (ownerEmail && w.email?.toLowerCase() === ownerEmail) return false
    return true
  })

  // Re-sync any local staff invite codes into Convex DB
  useEffect(() => {
    if (!shop || !ownerEmail.includes('@') || !convexReady || !convexHttp) return
    let cancelled = false
    void (async () => {
      for (const w of workers) {
        if (cancelled || w.role === 'owner' || !w.inviteCode) continue
        try {
          await persistInviteToDb({
            code: w.inviteCode,
            shopId: shop.id,
            shopName: shop.name,
            ownerEmail,
            workerName: w.name,
            workerPhone: w.phone || undefined,
            workerEmail: w.email || undefined,
            role: w.role === 'manager' ? 'manager' : 'worker',
            localWorkerId: w.id,
          })
        } catch {
          // Keep trying others
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [shop, ownerEmail, workers])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (w: Worker) => {
    setEditing(w)
    setForm({
      name: w.name,
      role: w.role === 'owner' ? 'manager' : w.role,
    })
    setOpen(true)
  }

  const runConfirm = () => {
    if (!confirm) return
    const { type, worker } = confirm
    if (type === 'remove') {
      removeWorker(worker.id)
      toast('Staff removed')
    } else if (type === 'deactivate') {
      updateWorker(worker.id, { active: false })
      toast('Staff deactivated')
    } else {
      updateWorker(worker.id, { active: true })
      toast('Staff activated')
    }
    setConfirm(null)
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast('Invite code copied')
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast('Could not copy code', 'error')
    }
  }

  const save = async () => {
    if (!shop || !form.name.trim()) {
      toast('Name is required', 'error')
      return
    }
    if (editing) {
      updateWorker(editing.id, {
        name: form.name.trim(),
        role: form.role,
      })
      toast('Staff updated')
      setOpen(false)
      return
    }

    if (!ownerEmail.includes('@')) {
      toast('Owner email missing — cannot save staff invite to the database', 'error')
      return
    }
    if (!convexReady || !convexHttp) {
      toast('Cloud database unavailable. Check VITE_CONVEX_URL.', 'error')
      return
    }

    setSaving(true)
    const role = form.role === 'manager' ? 'manager' : 'worker'
    const localWorkerId = uid('w')
    let inviteCode = ''
    let lastError = 'Could not save invite to database'

    try {
      for (let attempt = 0; attempt < 6; attempt++) {
        inviteCode = generateStaffInviteCode()
        try {
          await persistInviteToDb({
            code: inviteCode,
            shopId: shop.id,
            shopName: shop.name,
            ownerEmail,
            workerName: form.name.trim(),
            role,
            localWorkerId,
          })
          lastError = ''
          break
        } catch (err) {
          lastError = err instanceof Error ? err.message : lastError
          if (!/already exists/i.test(lastError)) throw err
        }
      }

      if (lastError || !inviteCode) {
        throw new Error(lastError || 'Could not generate a unique invite code')
      }

      // Verify row exists in DB before showing the code
      const stored = await convexHttp.query(api.staffInvites.getByCode, { code: inviteCode })
      if (!stored) {
        throw new Error('Invite was not found in the database after save')
      }

      const worker = addWorker({
        id: localWorkerId,
        shopId: shop.id,
        name: form.name.trim(),
        phone: '',
        email: '',
        role,
        employeeId: `EMP-${String(workers.length + 1).padStart(3, '0')}`,
        joiningDate: new Date().toISOString(),
        active: true,
        inviteStatus: 'pending',
        inviteCode: stored.code,
      })

      setOpen(false)
      setCreatedCode({ name: worker.name, code: stored.code })
      toast('Staff saved to database')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save staff invite'
      toast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staffs"
        subtitle="Manage your team and share login codes"
        actions={
          <Button onClick={openAdd}>
            <UserPlus className="h-4 w-4" />
            Add Staff
          </Button>
        }
      />

      {team.length === 0 ? (
        <EmptyState
          title="No staff yet"
          description="Add staff and share their 8-character login code so they can join your shop."
          icon={<Users className="h-6 w-6" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((w) => {
            const stats = workerStats(workRecords, w.id)
            return (
              <Card key={w.id}>
                <div className="flex items-start gap-3">
                  <Avatar name={w.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-semibold text-ink">{w.name}</h3>
                      <Badge tone={w.active ? 'success' : 'neutral'}>
                        {w.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs capitalize text-ink-muted">
                      {w.role === 'worker' ? 'Staff' : w.role}
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">
                      {w.phone || w.email || 'No contact'}
                    </p>
                  </div>
                </div>

                {w.role !== 'owner' && w.inviteCode && (
                  <div className="mt-4 rounded-[16px] border border-[#d6e6ff] bg-[#f3f8ff] px-3.5 py-3">
                    <div className="flex items-center gap-2 text-[#0064f0]">
                      <KeyRound className="h-4 w-4 shrink-0" />
                      <p className="text-[11px] font-semibold uppercase tracking-wide">
                        Staff login code
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="font-mono text-[1.35rem] font-bold tracking-[0.18em] text-[#0f1a33]">
                        {w.inviteCode}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => void copyCode(w.inviteCode!)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Share this code for staff login / join.
                    </p>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-btn bg-slate-50 p-3 text-center">
                  <div>
                    <p className="text-[11px] font-medium text-ink-faint">Jobs</p>
                    <p className="mt-0.5 text-sm font-bold text-ink">{stats.count}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-ink-faint">Revenue</p>
                    <p className="mt-0.5 text-sm font-bold text-ink">{formatINR(stats.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-ink-faint">Pending</p>
                    <p className="mt-0.5 text-sm font-bold text-amber-700">
                      {formatINR(stats.pending)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(w)}>
                    Edit
                  </Button>
                  {w.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setConfirm({
                          type: w.active ? 'deactivate' : 'activate',
                          worker: w,
                        })
                      }
                    >
                      {w.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                  {w.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirm({ type: 'remove', worker: w })}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Staff' : 'Add Staff'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void save()}>
              {editing ? 'Save' : 'Add'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Role">
            <Select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            >
              <option value="worker">Staff</option>
              <option value="manager">Manager</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={
          confirm?.type === 'remove'
            ? 'Remove staff?'
            : confirm?.type === 'deactivate'
              ? 'Deactivate staff?'
              : 'Activate staff?'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={confirm?.type === 'remove' ? 'danger' : 'primary'}
              onClick={runConfirm}
            >
              {confirm?.type === 'remove'
                ? 'Remove'
                : confirm?.type === 'deactivate'
                  ? 'Deactivate'
                  : 'Activate'}
            </Button>
          </>
        }
      >
        {confirm && (
          <p className="text-sm text-ink-muted">
            {confirm.type === 'remove' && (
              <>
                Are you sure you want to remove{' '}
                <span className="font-semibold text-ink">{confirm.worker.name}</span>? This
                cannot be undone.
              </>
            )}
            {confirm.type === 'deactivate' && (
              <>
                Are you sure you want to deactivate{' '}
                <span className="font-semibold text-ink">{confirm.worker.name}</span>? They
                won&apos;t be able to log work until activated again.
              </>
            )}
            {confirm.type === 'activate' && (
              <>
                Activate <span className="font-semibold text-ink">{confirm.worker.name}</span>{' '}
                so they can access the shop again?
              </>
            )}
          </p>
        )}
      </Modal>

      <Modal
        open={Boolean(createdCode)}
        onClose={() => {
          setCreatedCode(null)
          setCopied(false)
        }}
        title="Staff login code"
        footer={
          <Button
            onClick={() => {
              setCreatedCode(null)
              setCopied(false)
            }}
          >
            Done
          </Button>
        }
      >
        {createdCode && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Share this code with <span className="font-semibold text-ink">{createdCode.name}</span>{' '}
              so they can log in as staff.
            </p>
            <div className="rounded-[20px] border border-[#cfe0ff] bg-gradient-to-br from-[#eef5ff] to-white px-5 py-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0064f0]">
                8-character invite code
              </p>
              <p className="mt-3 font-mono text-[2rem] font-bold tracking-[0.22em] text-[#0f1a33]">
                {createdCode.code}
              </p>
              <Button
                className="mt-4"
                variant="secondary"
                onClick={() => void copyCode(createdCode.code)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy code'}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              This code is stored in the Paylo database. Staff enter it on Staff Login after
              signing in with Google.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
