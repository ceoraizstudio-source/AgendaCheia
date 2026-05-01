import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useConversationsStore = create((set, get) => ({
  conversations: [],
  messages: {},
  activeId: null,
  realtimeChannel: null,
  globalChannel: null,

  fetchConversations: async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_at', { ascending: false })
    if (!error && data.length > 0) {
      set({ conversations: data, activeId: data[0].id })
      get().fetchMessages(data[0].id)
    }
    // Inicia escuta global de todas as conversas
    get().subscribeGlobal()
  },

  fetchMessages: async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (!error) {
      set((s) => ({
        messages: { ...s.messages, [conversationId]: (data || []).map(mapMsg) },
      }))
    }
  },

  setActive: async (id) => {
    set((s) => ({
      activeId: id,
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, unread: 0 } : c,
      ),
    }))
    await supabase.from('conversations').update({ unread: 0 }).eq('id', id)
    if (!get().messages[id]) {
      get().fetchMessages(id)
    }
  },

  toggleModo: async (id) => {
    const conv = get().conversations.find((c) => c.id === id)
    const newModo = conv?.modo === 'bot' ? 'humano' : 'bot'
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, modo: newModo } : c,
      ),
    }))
    await supabase.from('conversations').update({ modo: newModo }).eq('id', id)
  },

  sendMessage: async (conversationId, contenido) => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return

    const now = new Date().toISOString()
    const optimisticId = `optimistic-${Date.now()}`

    // Optimistic update
    const optimistic = {
      id: optimisticId,
      conteudo: contenido,
      role: 'user',
      tipo: 'texto',
      created_at: now,
    }
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] || []), optimistic],
      },
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, last_message: contenido, last_at: now } : c,
      ),
    }))

    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      tipo: 'texto',
      conteudo: contenido,
    }).select().single()

    if (!error) {
      // Replace optimistic with real
      set((s) => ({
        messages: {
          ...s.messages,
          [conversationId]: s.messages[conversationId].map((m) =>
            m.id === optimisticId ? mapMsg(data) : m,
          ),
        },
      }))
      await supabase.from('conversations')
        .update({ last_message: contenido, last_at: now })
        .eq('id', conversationId)

      // Envia via WhatsApp se a conversa tiver um contato de plataforma
      const conv = get().conversations.find((c) => c.id === conversationId)
      if (conv?.platform_contact_id) {
        fetch('https://agent.metodoagendacheia.com.br/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, message: contenido }),
        })
          .then(r => r.json())
          .then(r => { if (!r.ok) console.error('Agent /api/send:', r) })
          .catch((err) => console.error('Falha ao chamar agent:', err))
      }
    }
  },

  sendFile: async (conversationId, file) => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return

    const isImage = file.type.startsWith('image/')
    const preview = isImage ? URL.createObjectURL(file) : null
    const sizeStr = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / 1024 / 1024).toFixed(1)} MB`
    const now = new Date().toISOString()

    const optimistic = {
      id: `optimistic-${Date.now()}`,
      conteudo: file.name,
      role: 'user',
      tipo: isImage ? 'imagem' : 'arquivo',
      arquivo_nome: file.name,
      arquivo_url: preview,
      file_size: sizeStr,
      created_at: now,
    }
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] || []), optimistic],
      },
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, last_message: `📎 ${file.name}`, last_at: now } : c,
      ),
    }))

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      tipo: isImage ? 'imagem' : 'arquivo',
      conteudo: file.name,
      arquivo_nome: file.name,
    })
    await supabase.from('conversations')
      .update({ last_message: `📎 ${file.name}`, last_at: now })
      .eq('id', conversationId)
  },

  subscribeRealtime: (conversationId) => {
    const existing = get().realtimeChannel
    if (existing) supabase.removeChannel(existing)

    const channel = supabase
      .channel(`inbox:${conversationId}`)
      // Novas mensagens (n8n insere com role='contact' ou role='bot')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = mapMsg(payload.new)
        set((s) => {
          const current = s.messages[conversationId] || []
          if (current.some((m) => m.id === msg.id)) return {}
          return {
            messages: {
              ...s.messages,
              [conversationId]: [...current, msg],
            },
          }
        })
      })
      // Atualiza last_message na lista quando n8n atualiza a conversa
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `id=eq.${conversationId}`,
      }, (payload) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, ...payload.new } : c,
          ),
        }))
      })
      .subscribe()

    set({ realtimeChannel: channel })
  },

  unsubscribeRealtime: () => {
    const channel = get().realtimeChannel
    if (channel) {
      supabase.removeChannel(channel)
      set({ realtimeChannel: null })
    }
  },

  // Escuta TODAS as conversas para atualizar badges e lista em tempo real
  subscribeGlobal: () => {
    const existing = get().globalChannel
    if (existing) supabase.removeChannel(existing)

    const channel = supabase
      .channel('global:conversations')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      }, (payload) => {
        set((s) => ({
          conversations: s.conversations
            .map((c) => c.id === payload.new.id ? { ...c, ...payload.new } : c)
            .sort((a, b) => new Date(b.last_at) - new Date(a.last_at)),
        }))
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
      }, (payload) => {
        set((s) => {
          if (s.conversations.some((c) => c.id === payload.new.id)) return {}
          return {
            conversations: [payload.new, ...s.conversations],
          }
        })
      })
      .subscribe()

    set({ globalChannel: channel })
  },

  deleteConversation: async (id) => {
    // Busca lead_id antes de apagar para deletar também o lead
    const conv = get().conversations.find((c) => c.id === id)
    const leadId = conv?.lead_id || null

    const remaining = get().conversations.filter((c) => c.id !== id)
    const newActive = remaining.length > 0 ? remaining[0].id : null
    set((s) => {
      const msgs = { ...s.messages }
      delete msgs[id]
      return { conversations: remaining, activeId: newActive, messages: msgs }
    })
    if (newActive) get().fetchMessages(newActive)

    // Apaga mensagens, conversa, agendamentos e lead em cascata
    await supabase.from('messages').delete().eq('conversation_id', id)
    await supabase.from('conversations').delete().eq('id', id)
    if (leadId) {
      await supabase.from('appointments').delete().eq('lead_id', leadId)
      await supabase.from('leads').delete().eq('id', leadId)
    }
  },

  get activeConversation() {
    return get().conversations.find((c) => c.id === get().activeId) || null
  },
}))

function mapMsg(row) {
  // role='user'    → operador CRM respondendo  → bolha direita (sainte)
  // role='contact' → mensagem do paciente/lead → bolha esquerda (entrante)
  // role='bot'     → resposta automática       → bolha esquerda (entrante)
  return {
    id: row.id,
    conteudo: row.conteudo,
    contenido: row.conteudo,
    role: row.role,
    tipo: row.tipo || 'texto',
    arquivo_url: row.arquivo_url,
    arquivo_nome: row.arquivo_nome,
    preview: row.arquivo_url,
    sender_name: row.sender_name || null,
    sender_avatar: row.sender_avatar || null,
    platform_message_id: row.platform_message_id || null,
    direccion: (row.role === 'user' || row.role === 'bot') ? 'saliente' : 'entrante',
    enviado_en: row.created_at,
    created_at: row.created_at,
  }
}
