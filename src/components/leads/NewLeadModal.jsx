import { useState } from 'react'
import { useLeadsStore } from '../../store/useLeadsStore'
import { useUIStore } from '../../store/useUIStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'

const CANAIS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'manual', label: 'Manual' },
]

const ETAPAS = [
  { value: 'new_lead', label: 'Novo Lead' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'negotiating', label: 'Negociando' },
  { value: 'closed', label: 'Fechado' },
]

const INITIAL = {
  nombre: '',
  email: '',
  telefone: '',
  canal_origen: 'instagram',
  valor_estimado: '',
  pipeline_stage: 'new_lead',
  notas: '',
}

export default function NewLeadModal() {
  const { newLeadOpen, closeNewLead } = useUIStore()
  const { addLead } = useLeadsStore()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Obrigatório'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'E-mail inválido'
    if (form.valor_estimado && isNaN(Number(form.valor_estimado)))
      e.valor_estimado = 'Deve ser um número'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    setSaveError('')
    try {
      await addLead(form)
      setForm(INITIAL)
      setErrors({})
      closeNewLead()
    } catch (err) {
      setSaveError(err?.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setForm(INITIAL)
    setErrors({})
    setSaveError('')
    closeNewLead()
  }

  return (
    <Modal
      open={newLeadOpen}
      onClose={handleClose}
      title="Novo Lead"
      width={520}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Lead'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Nome completo */}
        <Field label="Nome Completo *" error={errors.nombre}>
          <Input
            placeholder="Ex: João Silva"
            value={form.nombre}
            onChange={(e) => setField('nombre', e.target.value)}
          />
        </Field>

        {/* Email + Telefone */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="E-mail" error={errors.email}>
            <Input
              type="email"
              placeholder="contato@empresa.com"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
            />
          </Field>
          <Field label="Telefone">
            <Input
              placeholder="+55 11 9 0000-0000"
              value={form.telefone}
              onChange={(e) => setField('telefone', e.target.value)}
            />
          </Field>
        </div>

        {/* Canal + Valor */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Canal de Origem">
            <Select
              value={form.canal_origen}
              onChange={(v) => setField('canal_origen', v)}
              options={CANAIS}
            />
          </Field>
          <Field label="Valor Estimado (R$)" error={errors.valor_estimado}>
            <Input
              placeholder="Ex: 45000"
              value={form.valor_estimado}
              onChange={(e) => setField('valor_estimado', e.target.value)}
            />
          </Field>
        </div>

        {/* Etapa */}
        <Field label="Etapa do Funil">
          <Select
            value={form.pipeline_stage}
            onChange={(v) => setField('pipeline_stage', v)}
            options={ETAPAS}
          />
        </Field>

        {/* Notas */}
        <Field label="Notas">
          <textarea
            rows={3}
            placeholder="Observações sobre o lead..."
            value={form.notas}
            onChange={(e) => setField('notas', e.target.value)}
            className="w-full rounded-[10px] px-3.5 py-2.5 text-[14px] resize-none outline-none transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-focus)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)' }}
          />
        </Field>

        {saveError && (
          <p className="text-[12px] font-medium" style={{ color: 'var(--color-danger)' }}>
            {saveError}
          </p>
        )}
      </div>
    </Modal>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      {children}
      {error && (
        <span className="text-[11px]" style={{ color: 'var(--color-danger)' }}>
          {error}
        </span>
      )}
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 rounded-[10px] px-3.5 text-[14px] outline-none cursor-pointer transition-colors appearance-none"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239096a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '36px',
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-focus)' }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)' }}
    >
      {options.map((o) => (
        <option
          key={o.value}
          value={o.value}
          style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
        >
          {o.label}
        </option>
      ))}
    </select>
  )
}
