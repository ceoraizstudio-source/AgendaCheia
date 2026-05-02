import { useState, useEffect } from 'react'
import {
  CheckCircle, Link, Copy, Camera,
  Eye, EyeOff, Bot, Clock, User, ChevronDown, ChevronUp,
  Loader2,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Switch from '../components/ui/Switch'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import { WhatsAppIcon } from '../components/ui/BrandIcons'
import { useIntegrationsStore } from '../store/useIntegrationsStore'
import { supabase } from '../lib/supabase'

const TABS = [
  { id: 'integracoes', label: 'Integrações', icon: Link },
  { id: 'agente',      label: 'Agente IA',   icon: Bot  },
  { id: 'perfil',      label: 'Perfil',       icon: User },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('integracoes')

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-6 w-full max-w-3xl">
        <div>
          <h1 className="text-[28px]">Configurações</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Gerencie integrações, agente de IA e preferências da conta.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-[12px]"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[9px] text-[13px] font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: activeTab === id ? 'var(--color-bg-elevated)' : 'transparent',
                color: activeTab === id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                border: activeTab === id ? '1px solid var(--color-border)' : '1px solid transparent',
              }}
            >
              <Icon size={15} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'integracoes' && <TabIntegracoes />}
        {activeTab === 'agente'      && <TabAgente />}
        {activeTab === 'perfil'      && <TabPerfil />}
      </div>
    </div>
  )
}

/* ─── Tab Integrações ─────────────────────────────── */

const AGENT_BASE = 'https://agent.metodoagendacheia.com.br'

function TabIntegracoes() {
  const { integrations, loading, saving, fetchIntegrations, saveIntegrations } = useIntegrationsStore()

  // Meta / WhatsApp fields
  const [metaToken,   setMetaToken]   = useState('')
  const [phoneId,     setPhoneId]     = useState('')
  const [businessId,  setBusinessId]  = useState('')
  const [verifyToken, setVerifyToken] = useState('agenda-cheia-2026')
  const [metaOpen,    setMetaOpen]    = useState(false)
  const [metaSaved,   setMetaSaved]   = useState(false)

  useEffect(() => { fetchIntegrations() }, [])

  useEffect(() => {
    if (!integrations) return
    setMetaToken(integrations.meta_access_token       || '')
    setPhoneId(integrations.whatsapp_phone_number_id  || '')
    setBusinessId(integrations.whatsapp_business_id   || '')
    setVerifyToken(integrations.meta_verify_token     || 'agenda-cheia-2026')
  }, [integrations])

  const handleSaveMeta = async () => {
    const ok = await saveIntegrations({
      meta_access_token: metaToken,
      whatsapp_phone_number_id: phoneId,
      whatsapp_business_id: businessId,
      meta_verify_token: verifyToken,
      meta_connected: !!metaToken && !!phoneId,
    })
    if (ok) { setMetaSaved(true); setTimeout(() => setMetaSaved(false), 2000) }
  }

  const metaConnected = integrations?.meta_connected

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Meta (WhatsApp + Instagram) ── */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="shrink-0"><WhatsAppIcon size={32} /></span>
            <div>
              <p className="text-[14px] font-medium">Meta / WhatsApp</p>
              <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                WhatsApp Business API
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {metaConnected && (
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-success)' }}>
                <CheckCircle size={14} strokeWidth={1.5} /> Conectado
              </div>
            )}
            <button
              onClick={() => setMetaOpen(o => !o)}
              className="flex items-center gap-1.5 text-[13px] cursor-pointer"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {metaOpen ? <ChevronUp size={16} strokeWidth={1.5} /> : <ChevronDown size={16} strokeWidth={1.5} />}
              {metaOpen ? 'Fechar' : 'Configurar'}
            </button>
          </div>
        </div>

        {metaOpen && (
          <div className="flex flex-col gap-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>

            {/* Webhook URLs para copiar */}
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                URL de Webhook — cole no Meta App Dashboard
              </p>
              <WebhookRow label="WhatsApp" url={`${AGENT_BASE}/webhook`} />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Verify Token:</span>
                <code className="text-[12px] px-2 py-0.5 rounded-[6px]"
                  style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-accent)' }}>
                  {verifyToken}
                </code>
                <button onClick={() => navigator.clipboard.writeText(verifyToken)}
                  className="cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                  <Copy size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Credenciais */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  WhatsApp Token (System User)
                </label>
                <Input type="password" placeholder="EAAxxxxxxxxxxxxxxxx"
                  value={metaToken} onChange={e => setMetaToken(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  WhatsApp Phone Number ID
                </label>
                <Input placeholder="1234567890" value={phoneId} onChange={e => setPhoneId(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  WhatsApp Business ID
                </label>
                <Input placeholder="1234567890" value={businessId} onChange={e => setBusinessId(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Verify Token
                </label>
                <Input placeholder="agenda-cheia-2026" value={verifyToken} onChange={e => setVerifyToken(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {metaSaved && (
                <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--color-success)' }}>
                  <CheckCircle size={13} strokeWidth={2} /> Salvo com sucesso
                </span>
              )}
              <div className="ml-auto">
                <Button variant="primary" size="sm" onClick={handleSaveMeta} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

    </div>
  )
}

/* ─── Webhook Row helper ──────────────────────────── */
function WebhookRow({ label, url }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] w-20 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div
        className="flex-1 flex items-center justify-between gap-2 px-3 h-9 rounded-[8px]"
        style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
      >
        <code className="text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>{url}</code>
        <button onClick={copy} className="shrink-0 cursor-pointer hover:opacity-80"
          style={{ color: copied ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
          {copied ? <CheckCircle size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  )
}

/* ─── Tab Agente IA ───────────────────────────────── */
function TabAgente() {
  const { integrations, loading, saving, fetchIntegrations, saveIntegrations } = useIntegrationsStore()

  const [botName,          setBotName]          = useState('Assistente Agenda Cheia')
  const [prompt,           setPrompt]           = useState('Você é um assistente de vendas profissional da Agenda Cheia. Seu objetivo é qualificar leads, responder dúvidas sobre nossos serviços e agendar reuniões com o time de vendas. Seja sempre cordial, objetivo e profissional.')
  const [fueraHorario,     setFueraHorario]     = useState(true)
  const [escalar,          setEscalar]          = useState(true)
  const [horaInicio,       setHoraInicio]       = useState('08:00')
  const [horaFim,          setHoraFim]          = useState('18:00')
  const [geminiKey,        setGeminiKey]        = useState('')
  const [showGeminiKey,    setShowGeminiKey]    = useState(false)
  const [saved,            setSaved]            = useState(false)

  useEffect(() => { fetchIntegrations() }, [])

  useEffect(() => {
    if (!integrations) return
    setBotName(integrations.bot_name              || 'Assistente Agenda Cheia')
    setPrompt(integrations.bot_prompt             || '')
    setFueraHorario(integrations.bot_respond_after_hours ?? true)
    setEscalar(integrations.bot_escalate_human    ?? true)
    setHoraInicio(integrations.bot_schedule_start || '08:00')
    setHoraFim(integrations.bot_schedule_end      || '18:00')
    setGeminiKey(integrations.gemini_api_key      || '')
  }, [integrations])

  const handleSave = async () => {
    const ok = await saveIntegrations({
      bot_name: botName,
      bot_prompt: prompt,
      bot_respond_after_hours: fueraHorario,
      bot_escalate_human: escalar,
      bot_schedule_start: horaInicio,
      bot_schedule_end: horaFim,
      ...(geminiKey ? { gemini_api_key: geminiKey } : {}),
    })
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-5">
        <h2 className="text-[16px]">Configurações do Bot</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Nome do Bot</label>
          <Input value={botName} onChange={e => setBotName(e.target.value)} placeholder="Ex: Ana, Assistente Virtual..." />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              System Prompt — Personalidade do Agente
            </label>
          </div>
          <textarea
            rows={22} value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder={`Você é um assistente cordial da [sua clínica/empresa].

Seu objetivo é:
- Responder dúvidas sobre nossos serviços
- Apresentar os serviços disponíveis quando o cliente perguntar
- Agendar consultas quando o cliente quiser

Tom: profissional e acolhedor. Responda de forma breve e natural, como no WhatsApp.`}
            className="w-full rounded-[10px] px-3.5 py-3 text-[13px] outline-none transition-colors leading-relaxed font-mono"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
              minHeight: '260px',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-border-focus)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
          />
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              💡 O agente adiciona automaticamente: data/hora atual, lista de serviços cadastrados e formato de resposta.
              Você só precisa definir a personalidade e objetivos aqui.
            </p>
            <span className="text-[11px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>{prompt.length} chars</span>
          </div>
        </div>

        {/* Gemini API Key */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Gemini API Key
          </label>
          <div className="relative">
            <Input
              type={showGeminiKey ? 'text' : 'password'}
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowGeminiKey(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {showGeminiKey ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
            </button>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            Obtenha sua chave grátis em <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>aistudio.google.com</a>
          </span>
        </div>

        <div className="flex flex-col gap-4 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium">Responder fora do horário</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Bot responde automaticamente fora do horário</p>
            </div>
            <Switch checked={fueraHorario} onChange={setFueraHorario} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium">Escalar para humano</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Se o bot não entender 2 vezes seguidas, transfere para um agente</p>
            </div>
            <Switch checked={escalar} onChange={setEscalar} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
            <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Horário de Atendimento</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Início</label>
              <Input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Fim</label>
              <Input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--color-success)' }}>
              <CheckCircle size={13} strokeWidth={2} /> Salvo com sucesso
            </span>
          )}
          <div className="ml-auto">
            <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ─── Tab Perfil ──────────────────────────────────── */
function TabPerfil() {
  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd,     setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,    setShowNew]    = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [pwdError,   setPwdError]   = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmail(session.user.email || '')
        setName(session.user.user_metadata?.full_name || '')
      }
    })
  }, [])

  const handleSaveProfile = async () => {
    await supabase.auth.updateUser({ data: { full_name: name } })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSavePwd = async () => {
    if (!newPwd || newPwd.length < 6) { setPwdError('A nova senha deve ter pelo menos 6 caracteres.'); return }
    if (newPwd !== confirmPwd) { setPwdError('As senhas não coincidem.'); return }
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) { setPwdError(error.message); return }
    setPwdError('')
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-5">
        <h2 className="text-[16px]">Dados do Agente</h2>

        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={name || email} size="xl" />
            <button
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
            >
              <Camera size={13} strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">{name || 'Agente'}</p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Nome completo</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>E-mail</label>
            <Input type="email" value={email} readOnly style={{ opacity: 0.6 }} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--color-success)' }}>
              <CheckCircle size={13} strokeWidth={2} /> Salvo com sucesso
            </span>
          )}
          <div className="ml-auto">
            <Button variant="primary" size="md" onClick={handleSaveProfile}>Salvar Perfil</Button>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="text-[16px]">Alterar Senha</h2>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Nova senha</label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'} placeholder="Mín. 6 caracteres"
                  value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdError('') }} className="pr-10"
                />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {showNew ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Confirmar nova senha</label>
              <Input
                type="password" placeholder="Repita a nova senha"
                value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setPwdError('') }}
              />
            </div>
          </div>
        </div>

        {pwdError && <span className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{pwdError}</span>}

        <div className="flex justify-end">
          <Button variant="primary" size="md" onClick={handleSavePwd}>Atualizar Senha</Button>
        </div>
      </Card>
    </div>
  )
}
