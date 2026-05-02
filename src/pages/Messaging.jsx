import { useEffect, useRef, useState } from 'react'
import {
  Search,
  Plus,
  MoreHorizontal,
  Paperclip,
  Smile,
  Send,
  Trash2,
  FileText,
} from 'lucide-react'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useConversationsStore } from '../store/useConversationsStore'
import Avatar from '../components/ui/Avatar'
import Switch from '../components/ui/Switch'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

/* ─── Helpers ─────────────────────────────────────── */

function msgTime(iso) {
  try {
    const d = new Date(iso)
    if (isToday(d)) return format(d, 'HH:mm')
    if (isYesterday(d)) return 'Ontem'
    return format(d, 'dd/MM', { locale: ptBR })
  } catch { return '' }
}

function dayLabel(iso) {
  try {
    const d = new Date(iso)
    if (isToday(d)) return 'Hoje'
    if (isYesterday(d)) return 'Ontem'
    return format(d, "d 'de' MMMM", { locale: ptBR })
  } catch { return '' }
}

function timeAgoShort(iso) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR })
  } catch { return '' }
}

/* ─── Messaging page ──────────────────────────────── */

export default function Messaging() {
  const { conversations, activeId, setActive, fetchConversations, subscribeRealtime, unsubscribeRealtime } = useConversationsStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchConversations()
    return () => unsubscribeRealtime()
  }, [])

  useEffect(() => {
    if (activeId) subscribeRealtime(activeId)
  }, [activeId])

  const filtered = search.trim()
    ? conversations.filter((c) =>
        (c.lead_name || '').toLowerCase().includes(search.toLowerCase()),
      )
    : conversations

  return (
    /* Break out of Layout's px-8 py-8 padding and fill full height */
    <div
      className="-mx-8 -my-8 flex overflow-hidden"
      style={{ height: 'calc(100vh - var(--topbar-height))' }}
    >
      {/* ── Left: conversation list ── */}
      <aside
        className="flex flex-col shrink-0 overflow-hidden"
        style={{
          width: 280,
          backgroundColor: 'var(--color-bg-sidebar)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 pt-5 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2 className="text-[18px]">Mensagens</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-[8px] cursor-pointer hover:bg-white/5"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Nova conversa"
          >
            <Plus size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <Input
            icon={Search}
            placeholder="Buscar conversa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center py-12">
              <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                Nenhuma conversa ainda.
              </p>
            </div>
          ) : (
            filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                active={conv.id === activeId}
                onClick={() => setActive(conv.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Center: active chat ── */}
      <ChatWindow />

      {/* ── Right: lead detail ── */}
      <LeadDetail />
    </div>
  )
}

/* ─── Conversation list item ──────────────────────── */

function ConversationItem({ conv, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer"
      style={{
        backgroundColor: active
          ? 'var(--color-accent-muted)'
          : 'transparent',
        borderLeft: active
          ? '3px solid var(--color-accent)'
          : '3px solid transparent',
      }}
    >
      <Avatar
        src={conv.lead_avatar}
        name={conv.lead_name}
        size="md"
        online={conv.online}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className="text-[13px] font-semibold truncate"
            style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
          >
            {conv.lead_name}
          </span>
          <span className="text-[11px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {msgTime(conv.last_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-[12px] truncate"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {conv.last_message}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {conv.unread > 0 && (
              <span
                className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
              >
                {conv.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

/* ─── Emoji picker data ───────────────────────────── */

const EMOJI_CATEGORIES = [
  {
    label: 'Rostos',
    emojis: ['😀','😂','😍','🥰','😎','😊','🤔','😅','😭','😱','🤩','😴','🥳','😤','🙄','😇','🤗','😈','😋','😏'],
  },
  {
    label: 'Gestos',
    emojis: ['👍','👎','👋','🤝','🙏','💪','✌️','🤞','👏','🫶','🤜','🤛','👌','🤙','🫵'],
  },
  {
    label: 'Objetos',
    emojis: ['💼','📊','📈','📋','✅','❌','🔥','⭐','💡','🎯','📱','💻','📞','📧','🗓️'],
  },
  {
    label: 'Símbolos',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💯','‼️','✨','🎉','🚀','⚡','🌟'],
  },
]

/* ─── Emoji Picker component ──────────────────────── */

function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null)
  const [activeCategory, setActiveCategory] = useState(0)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-[calc(100%+8px)] right-0 z-50 rounded-[14px] shadow-2xl overflow-hidden"
      style={{
        width: 320,
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Category tabs */}
      <div
        className="flex gap-0 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(i)}
            className="flex-1 py-2 text-[11px] font-medium cursor-pointer transition-colors"
            style={{
              color: activeCategory === i ? 'var(--color-accent)' : 'var(--color-text-muted)',
              borderBottom: activeCategory === i ? '2px solid var(--color-accent)' : '2px solid transparent',
              backgroundColor: 'transparent',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-3 grid grid-cols-10 gap-0.5">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="flex items-center justify-center w-8 h-8 rounded-[6px] text-[18px] cursor-pointer hover:bg-white/8 transition-colors"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Chat window ─────────────────────────────────── */

function ChatWindow() {
  const { conversations, messages, activeId, toggleModo, sendMessage, sendFile, deleteConversation } =
    useConversationsStore()
  const conv = conversations.find((c) => c.id === activeId)
  const msgs = messages[activeId] || []
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  if (!conv) return null

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    sendMessage(activeId, trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji)
    setShowEmoji(false)
    textareaRef.current?.focus()
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    sendFile(activeId, file)
    e.target.value = ''
  }

  /* Group messages by day */
  const groups = []
  let lastDay = null
  for (const msg of msgs) {
    const day = dayLabel(msg.enviado_en)
    if (day !== lastDay) { groups.push({ type: 'day', label: day }); lastDay = day }
    groups.push({ type: 'msg', msg })
  }

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Chat header */}
      <div
        className="flex items-center justify-between px-6 py-3.5 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}
      >
        <div className="flex items-center gap-3">
          <Avatar src={conv.lead_avatar} name={conv.lead_name} size="sm" online={conv.online} />
          <div>
            <p className="text-[14px] font-semibold leading-none mb-0.5">{conv.lead_name}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                {conv.online ? 'Online agora' : timeAgoShort(conv.last_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={conv.modo === 'bot'}
            onChange={() => toggleModo(conv.id)}
            label={conv.modo === 'bot' ? 'Bot ativo' : 'Humano'}
          />
          <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(s => !s)}
              className="w-8 h-8 flex items-center justify-center rounded-[8px] cursor-pointer hover:bg-white/5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-[calc(100%+6px)] z-50 rounded-[10px] overflow-hidden shadow-xl py-1"
                style={{
                  width: 180,
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <button
                  onClick={() => {
                    if (confirm('Apagar esta conversa? Esta ação não pode ser desfeita.')) {
                      deleteConversation(conv.id)
                    }
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] cursor-pointer hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                  Apagar conversa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-1">
        {groups.map((item, i) =>
          item.type === 'day' ? (
            <DayDivider key={`day-${i}`} label={item.label} />
          ) : (
            <MessageBubble key={item.msg.id} msg={item.msg} />
          ),
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
        />

        <div
          className="flex items-end gap-3 rounded-[14px] px-4 py-3"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Attach file */}
          <button
            onClick={handleFileClick}
            className="cursor-pointer hover:opacity-70 mb-0.5 transition-opacity"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Anexar arquivo"
            title="Anexar arquivo"
          >
            <Paperclip size={18} strokeWidth={1.5} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
            onKeyDown={handleKey}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-transparent text-[14px] resize-none outline-none leading-relaxed"
            style={{ color: 'var(--color-text-primary)', maxHeight: 120, overflowY: 'auto' }}
          />

          {/* Emoji + Send */}
          <div className="flex items-center gap-2 mb-0.5 relative">
            <button
              onClick={() => setShowEmoji((s) => !s)}
              className="cursor-pointer transition-opacity"
              style={{ color: showEmoji ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
              aria-label="Emoji"
              title="Emojis"
            >
              <Smile size={18} strokeWidth={1.5} />
            </button>

            {showEmoji && (
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmoji(false)}
              />
            )}

            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
              aria-label="Enviar"
            >
              <Send size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DayDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
      <span
        className="text-[11px] font-medium px-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
    </div>
  )
}

function MessageBubble({ msg }) {
  const isOut = msg.direccion === 'saliente'

  /* ── Image bubble ── */
  if (msg.tipo === 'imagem') {
    return (
      <div className={`flex flex-col ${isOut ? 'items-end' : 'items-start'} mb-1`}>
        <div
          className="rounded-[14px] overflow-hidden"
          style={{
            maxWidth: 240,
            border: '1px solid var(--color-border)',
          }}
        >
          <img
            src={msg.preview}
            alt={msg.contenido}
            className="w-full block object-cover"
            style={{ maxHeight: 200 }}
          />
          <div
            className="px-3 py-1.5 flex items-center justify-between gap-3"
            style={{ backgroundColor: isOut ? 'var(--color-accent)' : 'var(--color-bg-elevated)' }}
          >
            <span
              className="text-[11px] truncate font-medium"
              style={{ color: isOut ? '#000' : 'var(--color-text-primary)' }}
            >
              {msg.contenido}
            </span>
            {msg.file_size && (
              <span
                className="text-[10px] shrink-0"
                style={{ color: isOut ? 'rgba(0,0,0,0.55)' : 'var(--color-text-muted)' }}
              >
                {msg.file_size}
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] mt-1 px-1" style={{ color: 'var(--color-text-muted)' }}>
          {msgTime(msg.enviado_en)}
        </span>
      </div>
    )
  }

  /* ── File bubble ── */
  if (msg.tipo === 'arquivo') {
    return (
      <div className={`flex ${isOut ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}>
          <div
            className="flex items-center gap-3 rounded-[14px] px-4 py-3"
            style={{
              maxWidth: 280,
              backgroundColor: isOut ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
            }}
          >
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
              style={{
                backgroundColor: isOut ? 'rgba(0,0,0,0.15)' : 'var(--color-bg-surface)',
              }}
            >
              <FileText size={18} strokeWidth={1.5} style={{ color: isOut ? '#000' : 'var(--color-accent)' }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[13px] font-medium truncate"
                style={{ color: isOut ? '#000' : 'var(--color-text-primary)' }}
              >
                {msg.contenido}
              </p>
              {msg.file_size && (
                <p
                  className="text-[11px]"
                  style={{ color: isOut ? 'rgba(0,0,0,0.6)' : 'var(--color-text-muted)' }}
                >
                  {msg.file_size}
                </p>
              )}
            </div>
          </div>
          <span className="text-[10px] mt-1 px-1" style={{ color: 'var(--color-text-muted)' }}>
            {msgTime(msg.enviado_en)}
          </span>
        </div>
      </div>
    )
  }

  /* ── Text bubble ── */
  return (
    <div className={`flex ${isOut ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`flex flex-col ${isOut ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className="rounded-[16px] px-4 py-2.5 text-[13px] leading-relaxed"
          style={{
            backgroundColor: isOut ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
            color: isOut ? '#000' : 'var(--color-text-primary)',
            borderBottomRightRadius: isOut ? 4 : 16,
            borderBottomLeftRadius: isOut ? 16 : 4,
          }}
        >
          {msg.contenido}
        </div>
        <span className="text-[10px] mt-1 px-1" style={{ color: 'var(--color-text-muted)' }}>
          {msgTime(msg.enviado_en)}
        </span>
      </div>
    </div>
  )
}

/* ─── Lead detail (right panel) ───────────────────── */

function LeadDetail() {
  const { conversations, activeId } = useConversationsStore()
  const conv = conversations.find((c) => c.id === activeId)
  const [activeTab, setActiveTab] = useState('perfil')

  if (!conv) return null

  return (
    <aside
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 280,
        backgroundColor: 'var(--color-bg-sidebar)',
        borderLeft: '1px solid var(--color-border)',
      }}
    >
      {/* Avatar + name */}
      <div
        className="flex flex-col items-center gap-3 px-5 pt-6 pb-5"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <Avatar src={conv.lead_avatar} name={conv.lead_name} size="xl" online={conv.online} />
        <div className="text-center">
          <h2 className="text-[16px]">{conv.lead_name}</h2>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {conv.canal}
          </p>
        </div>
        <div className="flex gap-2 w-full">
          {['Perfil', 'Negócio'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t.toLowerCase())}
              className="flex-1 h-8 rounded-[8px] text-[12px] font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  activeTab === t.toLowerCase()
                    ? 'var(--color-bg-elevated)'
                    : 'transparent',
                border: '1px solid var(--color-border)',
                color:
                  activeTab === t.toLowerCase()
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-5 px-5 py-5">
        {/* Information */}
        <Section label="Informações">
          <div className="flex flex-col gap-2">
            <InfoRow label="Canal" value={conv.canal} />
            <InfoRow label="Modo" value={conv.modo === 'bot' ? 'Bot ativo' : 'Humano'} />
            {conv.platform_contact_id && (
              <InfoRow
                label="Telefone"
                value={
                  <a
                    href={`https://wa.me/${conv.platform_contact_id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    +{conv.platform_contact_id}
                  </a>
                }
              />
            )}
            <InfoRow label="Última mensagem" value={conv.last_message} />
          </div>
        </Section>

      </div>
    </aside>
  )
}

function Section({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label-uppercase">{label}</span>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <span className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
        {value}
      </span>
    </div>
  )
}
