import { useState, useEffect } from 'react'
import { ArrowUpRight, ExternalLink, Send, RefreshCw, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Users, X, Plus, Trash2 } from 'lucide-react'
import { GoogleIcon, MetaIcon, EmailMarketingIcon } from '../components/ui/BrandIcons'
import { useIntegrationsStore } from '../store/useIntegrationsStore'
import { useLeadsStore } from '../store/useLeadsStore'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabase'

const AGENT_URL = 'https://agent.metodoagendacheia.com.br'

/* ─── Tabs ────────────────────────────────────────── */
const TABS = [
  { id: 'templates', label: '📋 Templates WhatsApp' },
  { id: 'campanhas', label: '📊 Campanhas' },
]

export default function Campaigns() {
  const [activeTab, setActiveTab] = useState('templates')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px]">Campanhas</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Gerencie templates WhatsApp e acompanhe o desempenho das campanhas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-[12px] w-fit"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2 rounded-[9px] text-[13px] font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: activeTab === t.id ? 'var(--color-bg-elevated)' : 'transparent',
              color: activeTab === t.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              border: activeTab === t.id ? '1px solid var(--color-border)' : '1px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'templates' && <TabTemplates />}
      {activeTab === 'campanhas' && <TabCampanhas />}
    </div>
  )
}

/* ─── Tab Templates WhatsApp ──────────────────────── */

const STATUS_CONFIG = {
  APPROVED:  { label: 'Aprovado',  icon: CheckCircle, color: 'var(--color-success)' },
  PENDING:   { label: 'Pendente',  icon: Clock,       color: '#f5a623' },
  REJECTED:  { label: 'Rejeitado', icon: XCircle,     color: 'var(--color-danger)' },
  PAUSED:    { label: 'Pausado',   icon: Clock,       color: 'var(--color-text-muted)' },
  DISABLED:  { label: 'Desativado',icon: XCircle,     color: 'var(--color-text-muted)' },
}

const CATEGORY_LABEL = {
  MARKETING:      'Marketing',
  UTILITY:        'Utilitário',
  AUTHENTICATION: 'Autenticação',
}

function TabTemplates() {
  const { integrations, fetchIntegrations } = useIntegrationsStore()
  const { leads, fetchLeads } = useLeadsStore()
  const [templates, setTemplates]       = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [expanded, setExpanded]         = useState(null)
  const [sendModal, setSendModal]       = useState(null)
  const [createModal, setCreateModal]   = useState(false)
  const [userId, setUserId]             = useState(null)

  useEffect(() => {
    fetchIntegrations()
    fetchLeads()
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id || null)
    })
  }, [])

  const loadTemplates = async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${AGENT_URL}/api/templates?userId=${userId}`)
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Erro ao buscar templates')
      setTemplates(data.templates || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (userId) loadTemplates() }, [userId])

  const getBodyText = (tpl) => {
    const body = tpl.components?.find(c => c.type === 'BODY')
    return body?.text || ''
  }

  const getHeader = (tpl) => {
    const h = tpl.components?.find(c => c.type === 'HEADER')
    return h ? { format: h.format, text: h.text } : null
  }

  const getButtons = (tpl) => {
    const b = tpl.components?.find(c => c.type === 'BUTTONS')
    return b?.buttons || []
  }

  if (!integrations?.whatsapp_business_id) {
    return (
      <div className="rounded-[14px] p-8 text-center flex flex-col gap-3"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px dashed var(--color-border)' }}>
        <p className="text-[14px] font-medium">WhatsApp Business ID não configurado</p>
        <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
          Acesse <strong>Configurações → Integrações → Meta Business</strong> e adicione seu WhatsApp Business ID.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header com refresh */}
      <div className="flex items-center justify-between">
        <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
          {templates.length} template{templates.length !== 1 ? 's' : ''} encontrado{templates.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3">
          <button onClick={loadTemplates} disabled={loading}
            className="flex items-center gap-2 text-[13px] cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-text-secondary)' }}>
            <RefreshCw size={14} strokeWidth={1.5} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <Button variant="primary" size="sm" onClick={() => setCreateModal(true)}>
            <Plus size={14} strokeWidth={2} />
            Novo Template
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-[10px] px-4 py-3 text-[13px]"
          style={{ backgroundColor: 'rgba(255,59,48,0.08)', color: 'var(--color-danger)', border: '1px solid rgba(255,59,48,0.2)' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      )}

      {!loading && templates.length === 0 && !error && (
        <div className="rounded-[14px] p-10 text-center flex flex-col gap-2"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px dashed var(--color-border)' }}>
          <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>Nenhum template encontrado</p>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Crie templates em <a href="https://business.facebook.com/wa/manage/message-templates/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>Meta Business Manager</a> e aguarde aprovação.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {templates.map((tpl) => {
          const status = STATUS_CONFIG[tpl.status] || STATUS_CONFIG.PENDING
          const StatusIcon = status.icon
          const isOpen = expanded === tpl.name
          const bodyText = getBodyText(tpl)
          const header = getHeader(tpl)
          const buttons = getButtons(tpl)

          return (
            <div key={tpl.name} className="rounded-[14px] overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>

              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Status badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusIcon size={14} strokeWidth={1.5} style={{ color: status.color }} />
                  <span className="text-[11px] font-semibold" style={{ color: status.color }}>{status.label}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold truncate">{tpl.name}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {CATEGORY_LABEL[tpl.category] || tpl.category} · {tpl.language}
                  </p>
                </div>

                {/* Preview do body */}
                {bodyText && (
                  <p className="text-[12px] hidden lg:block max-w-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {bodyText.substring(0, 80)}
                  </p>
                )}

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  {tpl.status === 'APPROVED' && (
                    <Button variant="primary" size="sm" onClick={() => setSendModal(tpl)}>
                      <Send size={13} strokeWidth={1.5} />
                      Enviar
                    </Button>
                  )}
                  <button
                    onClick={async () => {
                      if (!confirm(`Excluir template "${tpl.name}"?`)) return
                      await fetch(`${AGENT_URL}/api/templates`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, name: tpl.name }),
                      })
                      loadTemplates()
                    }}
                    className="p-1.5 rounded-[8px] cursor-pointer hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--color-danger)' }}
                    title="Excluir template">
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                  <button onClick={() => setExpanded(isOpen ? null : tpl.name)}
                    className="p-1.5 rounded-[8px] cursor-pointer hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {isOpen ? <ChevronUp size={16} strokeWidth={1.5} /> : <ChevronDown size={16} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Expanded — preview do template */}
              {isOpen && (
                <div className="px-5 pb-5 flex flex-col gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mt-4" style={{ color: 'var(--color-text-muted)' }}>Preview</p>
                  <div className="rounded-[10px] p-4 max-w-sm flex flex-col gap-2"
                    style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                    {header?.text && (
                      <p className="text-[13px] font-bold">{header.text}</p>
                    )}
                    {header?.format === 'IMAGE' && (
                      <div className="h-24 rounded-[8px] flex items-center justify-center text-[11px]"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                        📷 Imagem de cabeçalho
                      </div>
                    )}
                    {bodyText && <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{bodyText}</p>}
                    {buttons.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-1" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                        {buttons.map((btn, i) => (
                          <div key={i} className="text-center text-[12px] font-medium py-1.5 rounded-[6px]"
                            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-accent)' }}>
                            {btn.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Componentes raw */}
                  <details className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    <summary className="cursor-pointer hover:opacity-80">Ver componentes JSON</summary>
                    <pre className="mt-2 p-3 rounded-[8px] overflow-auto text-[10px]"
                      style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                      {JSON.stringify(tpl.components, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal de envio */}
      {sendModal && (
        <SendTemplateModal
          template={sendModal}
          leads={leads}
          userId={userId}
          onClose={() => setSendModal(null)}
        />
      )}

      {/* Modal de criação */}
      {createModal && (
        <CreateTemplateModal
          userId={userId}
          onClose={() => setCreateModal(false)}
          onCreated={() => { setCreateModal(false); loadTemplates() }}
        />
      )}
    </div>
  )
}

/* ─── Modal de envio de template ─────────────────────────────── */

function SendTemplateModal({ template, leads, userId, onClose }) {
  const [selected, setSelected]   = useState([])
  const [variables, setVariables] = useState({})
  const [sending, setSending]     = useState(false)
  const [result, setResult]       = useState(null)

  // Detecta variáveis {{1}}, {{2}} no body
  const bodyText = template.components?.find(c => c.type === 'BODY')?.text || ''
  const varMatches = [...new Set(bodyText.match(/\{\{(\d+)\}\}/g) || [])]

  const approvedLeads = leads.filter(l => l.telefone)

  const toggleLead = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const handleSend = async () => {
    if (selected.length === 0) return
    setSending(true)
    try {
      const contacts = selected.map(id => {
        const lead = approvedLeads.find(l => l.id === id)
        return { phone: lead.telefone.replace(/\D/g, ''), name: lead.nombre }
      })

      // Monta components com variáveis se houver
      const components = []
      if (varMatches.length > 0) {
        components.push({
          type: 'body',
          parameters: varMatches.map((_, i) => ({
            type: 'text',
            text: variables[i + 1] || `{{${i + 1}}}`,
          })),
        })
      }

      const r = await fetch(`${AGENT_URL}/api/send-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          templateName: template.name,
          language: template.language,
          components,
          contacts,
        }),
      })
      const data = await r.json()
      setResult(data)
    } catch (e) {
      setResult({ ok: false, error: e.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-lg rounded-[16px] flex flex-col gap-0 overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <p className="text-[15px] font-semibold">Enviar Template</p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{template.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[8px] cursor-pointer hover:bg-white/5 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
          {/* Resultado */}
          {result && (
            <div className="rounded-[10px] p-4 flex flex-col gap-1"
              style={{
                backgroundColor: result.ok ? 'rgba(46,204,113,0.08)' : 'rgba(255,59,48,0.08)',
                border: `1px solid ${result.ok ? 'rgba(46,204,113,0.3)' : 'rgba(255,59,48,0.3)'}`,
                color: result.ok ? 'var(--color-success)' : 'var(--color-danger)',
              }}>
              <p className="text-[13px] font-semibold">
                {result.ok ? `✅ ${result.sent}/${result.total} mensagens enviadas` : `❌ ${result.error}`}
              </p>
              {result.ok && result.sent < result.total && (
                <p className="text-[12px]">{result.total - result.sent} falharam — verifique se os números estão no WhatsApp.</p>
              )}
            </div>
          )}

          {/* Variáveis */}
          {varMatches.length > 0 && !result && (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold">Preencha as variáveis</p>
              <p className="text-[12px] leading-relaxed px-3 py-2 rounded-[8px]"
                style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {bodyText}
              </p>
              {varMatches.map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <label className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>Variável {`{{${i+1}}}`}</label>
                  <input
                    className="rounded-[10px] px-3 py-2 text-[13px] outline-none"
                    style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    placeholder={`Valor para {{${i+1}}}`}
                    value={variables[i + 1] || ''}
                    onChange={e => setVariables(v => ({ ...v, [i + 1]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Seleção de leads */}
          {!result && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold">Selecionar Contatos</p>
                <button onClick={() => setSelected(selected.length === approvedLeads.length ? [] : approvedLeads.map(l => l.id))}
                  className="text-[12px] cursor-pointer hover:opacity-80" style={{ color: 'var(--color-accent)' }}>
                  {selected.length === approvedLeads.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {approvedLeads.length === 0 && (
                  <p className="text-[13px] text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                    Nenhum lead com telefone cadastrado
                  </p>
                )}
                {approvedLeads.map(lead => (
                  <label key={lead.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer hover:bg-white/5 transition-colors">
                    <input type="checkbox" checked={selected.includes(lead.id)} onChange={() => toggleLead(lead.id)}
                      className="w-4 h-4 cursor-pointer accent-yellow-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{lead.nombre}</p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{lead.telefone}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          {!result ? (
            <>
              <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                <Users size={12} className="inline mr-1" strokeWidth={1.5} />
                {selected.length} contato{selected.length !== 1 ? 's' : ''} selecionado{selected.length !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" size="sm" onClick={handleSend}
                  disabled={sending || selected.length === 0}>
                  {sending ? 'Enviando...' : <><Send size={13} /> Enviar agora</>}
                </Button>
              </div>
            </>
          ) : (
            <Button variant="primary" size="sm" className="ml-auto" onClick={onClose}>Fechar</Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Modal de criação de template ──────────────────────────────── */

const EMPTY_BUTTON = { type: 'QUICK_REPLY', text: '' }

function CreateTemplateModal({ userId, onClose, onCreated }) {
  const [name, setName]           = useState('')
  const [category, setCategory]   = useState('MARKETING')
  const [language, setLanguage]   = useState('pt_BR')
  const [header, setHeader]       = useState('')
  const [body, setBody]           = useState('')
  const [footer, setFooter]       = useState('')
  const [buttons, setButtons]     = useState([])
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)

  const addButton = () => setButtons(b => [...b, { ...EMPTY_BUTTON }])
  const removeButton = (i) => setButtons(b => b.filter((_, idx) => idx !== i))
  const updateButton = (i, field, value) => setButtons(b => b.map((btn, idx) => idx === i ? { ...btn, [field]: value } : btn))

  const handleCreate = async () => {
    if (!name.trim()) { setError('Nome é obrigatório'); return }
    if (!body.trim()) { setError('Corpo (Body) é obrigatório'); return }
    setSaving(true)
    setError(null)

    const components = []
    if (header.trim()) components.push({ type: 'HEADER', format: 'TEXT', text: header.trim() })
    components.push({ type: 'BODY', text: body.trim() })
    if (footer.trim()) components.push({ type: 'FOOTER', text: footer.trim() })
    if (buttons.filter(b => b.text.trim()).length > 0) {
      components.push({ type: 'BUTTONS', buttons: buttons.filter(b => b.text.trim()).map(b => ({ type: b.type, text: b.text.trim() })) })
    }

    try {
      const r = await fetch(`${AGENT_URL}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, category, language, components }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error?.error_user_msg || data.error?.message || JSON.stringify(data))
      onCreated()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-2xl rounded-[16px] flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <p className="text-[15px] font-semibold">Novo Template WhatsApp</p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>O template será enviado para revisão do Meta</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[8px] cursor-pointer hover:bg-white/5"
            style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {error && (
            <div className="rounded-[10px] px-4 py-3 text-[12px]"
              style={{ backgroundColor: 'rgba(255,59,48,0.08)', color: 'var(--color-danger)', border: '1px solid rgba(255,59,48,0.2)' }}>
              {error}
            </div>
          )}

          {/* Linha 1 — Nome, Categoria, Idioma */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5 col-span-1">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Categoria *</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="h-10 rounded-[10px] px-3 text-[13px] outline-none cursor-pointer"
                style={{ ...inputStyle, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239096a8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utilitário</option>
                <option value="AUTHENTICATION">Autenticação</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 col-span-1">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Idioma *</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="h-10 rounded-[10px] px-3 text-[13px] outline-none cursor-pointer"
                style={{ ...inputStyle, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239096a8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}>
                <option value="pt_BR">Português (BR)</option>
                <option value="en_US">English (US)</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 col-span-1">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Nome (snake_case) *</label>
              <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,''))}
                placeholder="boas_vindas_consulta"
                className="h-10 rounded-[10px] px-3 text-[13px] outline-none font-mono"
                style={inputStyle} />
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Cabeçalho <span style={{ color: 'var(--color-text-muted)' }}>(opcional)</span>
            </label>
            <input value={header} onChange={e => setHeader(e.target.value)}
              placeholder="Ex: Confirmação de Consulta"
              className="h-10 rounded-[10px] px-3 text-[13px] outline-none"
              style={inputStyle} />
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Corpo *</label>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Use {`{{1}}`}, {`{{2}}`}... para variáveis dinâmicas
              </span>
            </div>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
              placeholder={`Olá {{1}}, sua consulta está confirmada para {{2}} às {{3}}.\n\nQualquer dúvida estamos à disposição! 😊`}
              className="rounded-[10px] px-3.5 py-3 text-[13px] outline-none resize-none leading-relaxed"
              style={inputStyle} />
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {body.length}/1024 caracteres
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Rodapé <span style={{ color: 'var(--color-text-muted)' }}>(opcional)</span>
            </label>
            <input value={footer} onChange={e => setFooter(e.target.value)}
              placeholder="Ex: Responda PARAR para cancelar"
              className="h-10 rounded-[10px] px-3 text-[13px] outline-none"
              style={inputStyle} />
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Botões <span style={{ color: 'var(--color-text-muted)' }}>(opcional, máx. 3)</span>
              </label>
              {buttons.length < 3 && (
                <button onClick={addButton} className="text-[12px] cursor-pointer hover:opacity-80 flex items-center gap-1"
                  style={{ color: 'var(--color-accent)' }}>
                  <Plus size={12} /> Adicionar botão
                </button>
              )}
            </div>
            {buttons.map((btn, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select value={btn.type} onChange={e => updateButton(i, 'type', e.target.value)}
                  className="h-9 rounded-[10px] px-2 text-[12px] outline-none cursor-pointer shrink-0"
                  style={{ ...inputStyle, width: 130, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239096a8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: 24 }}>
                  <option value="QUICK_REPLY">Resposta Rápida</option>
                  <option value="PHONE_NUMBER">Telefone</option>
                  <option value="URL">URL</option>
                </select>
                <input value={btn.text} onChange={e => updateButton(i, 'text', e.target.value)}
                  placeholder="Texto do botão"
                  className="flex-1 h-9 rounded-[10px] px-3 text-[13px] outline-none"
                  style={inputStyle} />
                {btn.type === 'URL' && (
                  <input value={btn.url || ''} onChange={e => updateButton(i, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 h-9 rounded-[10px] px-3 text-[13px] outline-none"
                    style={inputStyle} />
                )}
                {btn.type === 'PHONE_NUMBER' && (
                  <input value={btn.phone_number || ''} onChange={e => updateButton(i, 'phone_number', e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="flex-1 h-9 rounded-[10px] px-3 text-[13px] outline-none"
                    style={inputStyle} />
                )}
                <button onClick={() => removeButton(i)} className="p-2 rounded-[8px] cursor-pointer hover:bg-white/5"
                  style={{ color: 'var(--color-danger)' }}>
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            Após envio, o Meta pode levar até 24h para aprovar.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={saving || !body.trim() || !name.trim()}>
              {saving ? 'Enviando...' : 'Criar Template'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Tab Campanhas (métricas existentes) ─────────── */

const SUMMARY = { totalSpent: 12450, totalLeads: 450, leadsGrowth: '+14%' }

const CHANNELS = [
  { key: 'google', name: 'Google Ads', description: 'Search & Display Network', Icon: GoogleIcon,
    metrics: [
      { label: 'Investimento',   value: 'R$ 5.200', accent: false },
      { label: 'Custo por Lead', value: 'R$ 42,50', accent: true  },
      { label: 'Alcance',        value: '145.000',  accent: false },
      { label: 'Cliques',        value: '3.240',    accent: false },
      { label: 'CPC',            value: 'R$ 1,60',  accent: false },
      { label: 'ROAS',           value: '3.4x',     accent: true  },
    ],
  },
  { key: 'meta', name: 'Meta Ads', description: 'Social Media Placements', Icon: MetaIcon,
    metrics: [
      { label: 'Investimento',   value: 'R$ 4.850', accent: false },
      { label: 'Custo por Lead', value: 'R$ 38,20', accent: true  },
      { label: 'Alcance',        value: '320.500',  accent: false },
      { label: 'Cliques',        value: '8.900',    accent: false },
      { label: 'CPC',            value: 'R$ 0,54',  accent: false },
      { label: 'ROAS',           value: '2.8x',     accent: true  },
    ],
  },
  { key: 'email', name: 'E-mail Marketing', description: 'Newsletter & Automações', Icon: EmailMarketingIcon,
    metrics: [
      { label: 'Investimento',   value: 'R$ 2.400', accent: false },
      { label: 'Custo por Lead', value: 'R$ 12,00', accent: true  },
      { label: 'Leads Gerados',  value: '200',      accent: false },
      { label: 'Abertura',       value: '38.2%',    accent: true  },
      { label: 'Clique',         value: '4.2%',     accent: true  },
      { label: 'ROI',            value: '420%',     accent: true  },
    ],
  },
]

function TabCampanhas() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[14px] p-6 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <span className="label-uppercase">Total Investido</span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>Este Mês</span>
          </div>
          <div className="font-heading text-[42px] leading-none" style={{ color: 'var(--color-accent)' }}>
            R$ {SUMMARY.totalSpent.toLocaleString('pt-BR')}
          </div>
        </div>
        <div className="rounded-[14px] p-6 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <span className="label-uppercase">Total de Leads</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(46,204,113,0.12)', color: 'var(--color-success)' }}>
              <ArrowUpRight size={12} strokeWidth={2.5} />{SUMMARY.leadsGrowth}
            </span>
          </div>
          <div className="font-heading text-[42px] leading-none">{SUMMARY.totalLeads}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[18px]">Desempenho por Canal</h2>
        <button className="inline-flex items-center gap-1.5 text-[13px] font-medium cursor-pointer hover:opacity-80"
          style={{ color: 'var(--color-accent)' }}>
          Ver Relatórios <ExternalLink size={13} strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {CHANNELS.map(ch => (
          <div key={ch.key} className="rounded-[14px] p-5 flex flex-col gap-5"
            style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <ch.Icon size={32} />
              <div>
                <p className="text-[14px] font-semibold">{ch.name}</p>
                <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{ch.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              {ch.metrics.map(m => (
                <div key={m.label} className="flex flex-col gap-0.5">
                  <span className="label-uppercase" style={{ fontSize: 10 }}>{m.label}</span>
                  <span className="text-[16px] font-heading"
                    style={{ color: m.accent ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
