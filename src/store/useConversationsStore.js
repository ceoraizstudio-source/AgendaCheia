import { create } from 'zustand'
import { mockConversations, mockMessages } from '../lib/mockData'

export const useConversationsStore = create((set, get) => ({
  conversations: mockConversations,
  messages: mockMessages,
  activeId: 'c1',

  setActive: (id) => {
    set((s) => ({
      activeId: id,
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, unread: 0 } : c,
      ),
    }))
  },

  toggleModo: (id) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id
          ? { ...c, modo: c.modo === 'bot' ? 'humano' : 'bot' }
          : c,
      ),
    }))
  },

  sendMessage: (conversationId, contenido) => {
    const msg = {
      id: `msg-${Date.now()}`,
      contenido,
      direccion: 'saliente',
      tipo: 'texto',
      enviado_en: new Date().toISOString(),
    }
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] || []), msg],
      },
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, last_message: contenido, last_time: msg.enviado_en }
          : c,
      ),
    }))
  },

  sendFile: (conversationId, file) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1)
    const sizeStr = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${sizeMB} MB`
    const isImage = file.type.startsWith('image/')
    const msg = {
      id: `msg-${Date.now()}`,
      contenido: file.name,
      direccion: 'saliente',
      tipo: isImage ? 'imagem' : 'arquivo',
      file_size: sizeStr,
      file_type: file.type,
      preview: isImage ? URL.createObjectURL(file) : null,
      enviado_en: new Date().toISOString(),
    }
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] || []), msg],
      },
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, last_message: `📎 ${file.name}`, last_time: msg.enviado_en }
          : c,
      ),
    }))
  },

  get activeConversation() {
    return get().conversations.find((c) => c.id === get().activeId) || null
  },
}))
