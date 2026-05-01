import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useServicesStore = create((set, get) => ({
  services: [],
  loading: false,

  fetchServices: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) set({ services: data || [] })
    set({ loading: false })
  },

  addService: async (form) => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) throw new Error('Não autenticado')

    const { data, error } = await supabase
      .from('services')
      .insert({
        user_id: user.id,
        nome: form.nome.trim(),
        descricao: form.descricao?.trim() || null,
        preco: Number(form.preco) || 0,
        ativo: true,
      })
      .select()
      .single()
    if (error) throw error
    set((s) => ({ services: [...s.services, data] }))
    return data
  },

  updateService: async (id, form) => {
    const { data, error } = await supabase
      .from('services')
      .update({
        nome: form.nome.trim(),
        descricao: form.descricao?.trim() || null,
        preco: Number(form.preco) || 0,
        ativo: form.ativo ?? true,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    set((s) => ({
      services: s.services.map((sv) => (sv.id === id ? data : sv)),
    }))
  },

  deleteService: async (id) => {
    set((s) => ({ services: s.services.filter((sv) => sv.id !== id) }))
    await supabase.from('services').delete().eq('id', id)
  },

  toggleAtivo: async (id) => {
    const sv = get().services.find((s) => s.id === id)
    if (!sv) return
    await get().updateService(id, { ...sv, ativo: !sv.ativo })
  },
}))
