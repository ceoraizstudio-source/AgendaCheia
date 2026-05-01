import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { useServicesStore } from '../store/useServicesStore'
import Button from '../components/ui/Button'

const EMPTY = { nome: '', descricao: '', preco: '' }

export default function Services() {
  const { services, loading, fetchServices, addService, updateService, deleteService, toggleAtivo } = useServicesStore()
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { fetchServices() }, [])

  const openNew = () => {
    setEditId(null)
    setForm(EMPTY)
    setError(null)
    setShowForm(true)
  }

  const openEdit = (sv) => {
    setEditId(sv.id)
    setForm({ nome: sv.nome, descricao: sv.descricao || '', preco: sv.preco ?? '' })
    setError(null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY)
    setError(null)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) { setError('Nome é obrigatório'); return }
    setSaving(true)
    setError(null)
    try {
      if (editId) {
        await updateService(editId, form)
      } else {
        await addService(form)
      }
      closeForm()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir este serviço?')) return
    await deleteService(id)
  }

  const fmt = (v) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="flex justify-center">
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px]">Serviços</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Cadastre os serviços que você oferece. O agente irá apresentá-los aos leads automaticamente.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openNew}>
          <Plus size={15} strokeWidth={2} />
          Novo Serviço
        </Button>
      </div>

      {/* Form inline */}
      {showForm && (
        <div
          className="rounded-[14px] p-5 flex flex-col gap-4"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-[14px] font-semibold">{editId ? 'Editar Serviço' : 'Novo Serviço'}</p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[12px] mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Nome *</label>
              <input
                className="w-full rounded-[10px] px-3 py-2 text-[13px] outline-none"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                placeholder="Ex: Consulta de Nutrição"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-[12px] mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Descrição</label>
              <textarea
                className="w-full rounded-[10px] px-3 py-2 text-[13px] outline-none resize-none"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                rows={2}
                placeholder="Descreva brevemente o serviço..."
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-[12px] mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Preço (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-[10px] px-3 py-2 text-[13px] outline-none"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                placeholder="0,00"
                value={form.preco}
                onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
              />
            </div>
          </div>

          {error && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={closeForm}>
              <X size={14} /> Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : <><Check size={14} /> Salvar</>}
            </Button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : services.length === 0 ? (
        <div
          className="rounded-[14px] p-10 flex flex-col items-center gap-3 text-center"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px dashed var(--color-border)' }}
        >
          <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>Nenhum serviço cadastrado ainda</p>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Clique em "Novo Serviço" para começar
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((sv) => (
            <div
              key={sv.id}
              className="rounded-[14px] px-5 py-4 flex items-center gap-4"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                opacity: sv.ativo ? 1 : 0.5,
              }}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate">{sv.nome}</p>
                {sv.descricao && (
                  <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {sv.descricao}
                  </p>
                )}
              </div>

              {/* Preço */}
              <p
                className="text-[15px] font-semibold shrink-0"
                style={{ color: 'var(--color-accent)' }}
              >
                {fmt(sv.preco)}
              </p>

              {/* Ações */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleAtivo(sv.id)}
                  className="p-2 rounded-[8px] cursor-pointer hover:bg-white/5 transition-colors"
                  style={{ color: sv.ativo ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                  title={sv.ativo ? 'Desativar' : 'Ativar'}
                >
                  {sv.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
                <button
                  onClick={() => openEdit(sv)}
                  className="p-2 rounded-[8px] cursor-pointer hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <Pencil size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDelete(sv.id)}
                  className="p-2 rounded-[8px] cursor-pointer hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  )
}
