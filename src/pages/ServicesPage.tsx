import { useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import { useToast } from '@/context/ToastContext'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Textarea,
} from '@/components/ui'
import { formatINR } from '@/lib/format'
import type { Service } from '@/types'

const emptyForm = {
  name: '',
  category: '',
  defaultPrice: 0,
  durationMinutes: 30,
  description: '',
}

export function ServicesPage() {
  const { services, shop, addService, updateService } = useShop()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    setForm({
      name: s.name,
      category: s.category,
      defaultPrice: s.defaultPrice,
      durationMinutes: s.durationMinutes,
      description: s.description,
    })
    setOpen(true)
  }

  const save = () => {
    if (!shop || !form.name.trim()) {
      toast('Service name is required', 'error')
      return
    }
    if (editing) {
      updateService(editing.id, {
        name: form.name.trim(),
        category: form.category.trim() || 'General',
        defaultPrice: form.defaultPrice,
        durationMinutes: form.durationMinutes,
        description: form.description.trim(),
      })
      toast('Service updated')
    } else {
      addService({
        shopId: shop.id,
        name: form.name.trim(),
        category: form.category.trim() || 'General',
        defaultPrice: form.defaultPrice,
        durationMinutes: form.durationMinutes,
        description: form.description.trim(),
        active: true,
      })
      toast('Service added')
    }
    setOpen(false)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Services"
        subtitle="Catalog of jobs and default prices"
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Add the services you offer so workers can bill faster."
          icon={<Package className="h-6 w-6" />}
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-semibold text-ink">{s.name}</h3>
                  <p className="text-xs text-ink-muted">{s.category}</p>
                </div>
                <Badge tone={s.active ? 'success' : 'neutral'}>
                  {s.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-brand-800">
                {formatINR(s.defaultPrice)}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                {s.durationMinutes} min
                {s.description ? ` · ${s.description}` : ''}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    updateService(s.id, { active: !s.active })
                    toast(s.active ? 'Service deactivated' : 'Service activated')
                  }}
                >
                  {s.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Service' : 'Add Service'}
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
          <Field label="Category">
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Default price (₹)">
              <Input
                type="number"
                min={0}
                value={form.defaultPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, defaultPrice: Number(e.target.value) || 0 }))
                }
              />
            </Field>
            <Field label="Duration (min)">
              <Input
                type="number"
                min={5}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    durationMinutes: Number(e.target.value) || 30,
                  }))
                }
              />
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
