import { useState } from 'react'
import {
  CheckCircle,
  Link,
  AlertTriangle,
  Copy,
  Camera,
  Eye,
  EyeOff,
  Bot,
  Clock,
  User,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Switch from '../components/ui/Switch'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import {
  MetaIcon,
  GoogleIcon,
  TikTokIcon,
  ManyChatIcon,
  EmailMarketingIcon,
} from '../components/ui/BrandIcons'

const TABS = [
  { id: 'integracoes', label: 'Integrações', icon: Link },
  { id: 'agente', label: 'Agente IA', icon: Bot },
  { id: 'perfil', label: 'Perfil', icon: User },
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
      {activeTab === 'agente' && <TabAgente />}
      {activeTab === 'perfil' && <TabPerfil />}
    </div>
    </div>
  )
}

/* ─── Tab Integrações ─────────────────────────────── */

function TabIntegracoes() {
  const [emailPlatform, setEmailPlatform] = useState('')
  const [emailKey, setEmailKey] = useState('')
  const [manychatKey, setManychatKey] = useState('')

  const webhookUrl = 'https://crm.agendacheia.com/webhook/tiktok'

  return (
    <div className="flex flex-col gap-4">
      {/* Meta */}
      <IntegrationCard
        name="Meta"
        description="WhatsApp + Instagram DMs"
        brandIcon={<MetaIcon size={32} />}
        connected
        onDisconnect={() => {}}
      />

      {/* Google */}
      <IntegrationCard
        name="Google"
        description="Ads + YouTube + Google Calendar"
        brandIcon={<GoogleIcon size={32} />}
        connected={false}
        connectLabel="Conectar com Google →"
        onConnect={() => {}}
      />

      {/* Email Marketing */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0"><EmailMarketingIcon size={32} /></span>
          <div>
            <p className="text-[14px] font-medium">E-mail Marketing</p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
              Mailchimp / ActiveCampaign / Brevo
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Plataforma
            </label>
            <select
              value={emailPlatform}
              onChange={(e) => setEmailPlatform(e.target.value)}
              className="h-10 rounded-[10px] px-3 text-[13px] outline-none cursor-pointer appearance-none"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                color: emailPlatform ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239096a8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: 36,
              }}
            >
              <option value="">Selecionar plataforma</option>
              <option value="mailchimp">Mailchimp</option>
              <option value="activecampaign">ActiveCampaign</option>
              <option value="brevo">Brevo</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              API Key
            </label>
            <Input type="password" placeholder="••••••••••••" value={emailKey} onChange={(e) => setEmailKey(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="sm">Salvar</Button>
        </div>
      </Card>

      {/* TikTok */}
      <IntegrationCard
        name="TikTok"
        description="Métricas e análises"
        brandIcon={<TikTokIcon size={32} />}
        connected
        onDisconnect={() => {}}
      />

      {/* ManyChat */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0"><ManyChatIcon size={32} /></span>
          <div>
            <p className="text-[14px] font-medium">ManyChat</p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
              Mensagens do TikTok via ManyChat
            </p>
          </div>
        </div>
        <div
          className="flex items-start gap-2 rounded-[10px] p-3 text-[12px]"
          style={{ backgroundColor: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: 'var(--color-text-secondary)' }}
        >
          <AlertTriangle size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
          O TikTok não permite leitura direta de DMs. Para gerenciar mensagens do TikTok é necessário conectar o ManyChat.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>API Key ManyChat</label>
            <Input type="password" placeholder="••••••••••••" value={manychatKey} onChange={(e) => setManychatKey(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Webhook URL</label>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="text-[11px] opacity-70" />
              <button
                onClick={() => navigator.clipboard.writeText(webhookUrl)}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-[10px] cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                title="Copiar"
              >
                <Copy size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="sm">Salvar</Button>
        </div>
      </Card>
    </div>
  )
}

function IntegrationCard({ name, description, brandIcon, connected, onConnect, onDisconnect, connectLabel }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0">{brandIcon}</span>
          <div>
            <p className="text-[14px] font-medium">{name}</p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {connected ? (
            <>
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-success)' }}>
                <CheckCircle size={14} strokeWidth={1.5} />
                Conectado
              </div>
              <Button variant="secondary" size="sm" onClick={onDisconnect}>Desconectar</Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={onConnect}>
              {connectLabel || 'Conectar'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ─── Tab Agente IA ───────────────────────────────── */

function TabAgente() {
  const [botName, setBotName] = useState('Assistente Agenda Cheia')
  const [prompt, setPrompt] = useState(
    'Você é um assistente de vendas profissional da Agenda Cheia. Seu objetivo é qualificar leads, responder dúvidas sobre nossos serviços e agendar reuniões com o time de vendas. Seja sempre cordial, objetivo e profissional.',
  )
  const [fueraHorario, setFueraHorario] = useState(true)
  const [escalar, setEscalar] = useState(true)
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFim, setHoraFim] = useState('18:00')

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-5">
        <h2 className="text-[16px]">Configurações do Bot</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Nome do Bot
          </label>
          <Input
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            placeholder="Ex: Assistente Agenda Cheia"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Prompt / Instruções do Bot
          </label>
          <textarea
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva como o bot deve se comportar..."
            className="w-full rounded-[10px] px-3.5 py-3 text-[14px] resize-none outline-none transition-colors leading-relaxed"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-focus)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)' }}
          />
          <span className="text-[11px] text-right" style={{ color: 'var(--color-text-muted)' }}>
            {prompt.length} caracteres
          </span>
        </div>

        <div
          className="flex flex-col gap-4 pt-2"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium">Responder fora do horário</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Bot responde automaticamente fora do horário de atendimento
              </p>
            </div>
            <Switch checked={fueraHorario} onChange={setFueraHorario} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium">Escalar para humano</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Se o bot não entender 2 vezes seguidas, transfere para um agente
              </p>
            </div>
            <Switch checked={escalar} onChange={setEscalar} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
            <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Horário de Atendimento
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Início</label>
              <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Fim</label>
              <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="md">Salvar Configurações</Button>
        </div>
      </Card>
    </div>
  )
}

/* ─── Tab Perfil ──────────────────────────────────── */

function TabPerfil() {
  const [name, setName] = useState('Luis Carmona')
  const [email, setEmail] = useState('luis@agendacheia.com')
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pwdError, setPwdError] = useState('')

  const handleSaveProfile = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSavePwd = () => {
    if (!currentPwd) { setPwdError('Informe a senha atual.'); return }
    if (newPwd.length < 6) { setPwdError('A nova senha deve ter pelo menos 6 caracteres.'); return }
    if (newPwd !== confirmPwd) { setPwdError('As senhas não coincidem.'); return }
    setPwdError('')
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Dados do agente */}
      <Card className="flex flex-col gap-5">
        <h2 className="text-[16px]">Dados do Agente</h2>

        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar src="https://i.pravatar.cc/128?img=8" name={name} size="xl" />
            <button
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
              aria-label="Alterar foto"
            >
              <Camera size={13} strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">{name || 'Agente'}</p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{email}</p>
            <button
              className="text-[12px] text-left mt-1 cursor-pointer"
              style={{ color: 'var(--color-accent)' }}
            >
              Alterar foto de perfil
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Nome completo
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              E-mail
            </label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--color-success)' }}>
              <CheckCircle size={13} strokeWidth={2} /> Salvo com sucesso
            </span>
          )}
          <div className="ml-auto">
            <Button variant="primary" size="md" onClick={handleSaveProfile}>
              Salvar Perfil
            </Button>
          </div>
        </div>
      </Card>

      {/* Alterar senha */}
      <Card className="flex flex-col gap-5">
        <h2 className="text-[16px]">Alterar Senha</h2>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Senha atual
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPwd}
                onChange={(e) => { setCurrentPwd(e.target.value); setPwdError('') }}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showCurrent ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Nova senha
              </label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Mín. 6 caracteres"
                  value={newPwd}
                  onChange={(e) => { setNewPwd(e.target.value); setPwdError('') }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {showNew ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Confirmar nova senha
              </label>
              <Input
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPwd}
                onChange={(e) => { setConfirmPwd(e.target.value); setPwdError('') }}
              />
            </div>
          </div>
        </div>

        {pwdError && (
          <span className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{pwdError}</span>
        )}

        <div className="flex justify-end">
          <Button variant="primary" size="md" onClick={handleSavePwd}>
            Atualizar Senha
          </Button>
        </div>
      </Card>
    </div>
  )
}
