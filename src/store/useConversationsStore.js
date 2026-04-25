import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useConversationsStore = create((set, get) => ({
  conversations: [],
  messages: {},
  activeId: null,
  realtimeChannel: null,

  fetchConversations: async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_at', { ascending: false })
    if (!error && data.length > 0) {
      set({ conversations: data, activeId: data[0].id })
      get().fetchMessages(data[0].id)
    }
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
    direccion: row.role === 'user' ? 'saliente' : 'entrante',
    enviado_en: row.created_at,
    created_at: row.created_at,
  }
}
