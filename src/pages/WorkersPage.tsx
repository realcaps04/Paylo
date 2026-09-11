import { useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
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
import { formatINR } from '@/lib/format'
import { workerStats } from '@/lib/permissions'
import type { Role, Worker } from '@/types'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  role: 'worker' as Role,
  specialization: '',
  commissionPercent: 10,
}

export function WorkersPage() {
  const { workers, workRecords, shop, addWorker, updateWorker, removeWorker } = useShop()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Worker | null>(null)
  const [form, setForm] = useState(emptyForm)

  const team = workers.filter((w) => w.role !== 'owner' || workers.length === 1)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (w: Worker) => {
    setEditing(w)
    setForm({
      name: w.name,
      phone: w.phone,
      email: w.email,
      role: w.role === 'owner' ? 'manager' : w.role,
      specialization: w.specialization ?? '',
      commissionPercent: w.commissionPercent ?? 10,
    })
    setOpen(true)
  }

  const save = () => {
    if (!shop || !form.name.trim()) {
      toast('Name is required', 'error')
      return
    }
    if (editing) {
      updateWorker(editing.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        role: form.role,
        specialization: form.specialization.trim() || undefined,
        commissionPercent: form.commissionPercent,
      })
      toast('Worker updated')
    } else {
      addWorker({
        shopId: shop.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        role: form.role,
        employeeId: `EMP-${String(workers.length + 1).padStart(3, '0')}`,
        joiningDate: new Date().toISOString(),
        specialization: form.specialization.trim() || undefined,
        commissionPercent: form.commissionPercent,
        active: true,
        inviteStatus: 'pending',
      })
      toast('Worker added')
    }
    setOpen(false)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Workers"
        subtitle="Manage your team and track performance"
        actions={
          <Button onClick={openAdd}>
            <UserPlus className="h-4 w-4" />
            Add Worker
          </Button>
        }
      />

      {team.length === 0 ? (
        <EmptyState
          title="No workers yet"
          description="Invite stylists, technicians, or staff to start logging work."
          icon={<Users className="h-6 w-6" />}
          action={
            <Button onClick={openAdd}>
              <UserPlus className="h-4 w-4" />
              Add Worker
            </Button>
          }
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
                      {w.role}
                      {w.specialization ? ` · ${w.specialization}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">
                      {w.phone || w.email || 'No contact'}
                    </p>
                  </div>
                </div>
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
                      onClick={() => {
                        updateWorker(w.id, { active: !w.active })
                        toast(w.active ? 'Worker deactivated' : 'Worker activated')
                      }}
                    >
                      {w.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                  {w.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        removeWorker(w.id)
                        toast('Worker removed')
                      }}
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
        title={editing ? 'Edit Worker' : 'Add Worker'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? 'Save' : 'Add'}</Button>
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
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </Field>
          <Field label="Email">
            <Input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <Field label="Role">
            <Select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            >
              <option value="worker">Worker</option>
              <option value="manager">Manager</option>
            </Select>
          </Field>
          <Field label="Specialization">
            <Input
              value={form.specialization}
              onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
            />
          </Field>
          <Field label="Commission %">
            <Input
              type="number"
              min={0}
              max={100}
              value={form.commissionPercent}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  commissionPercent: Number(e.target.value) || 0,
                }))
              }
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
