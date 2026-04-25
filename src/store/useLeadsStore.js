import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useLeadsStore = create((set, get) => ({
  leads: [],
  loading: false,

  fetchLeads: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) set({ leads: data || [] })
    set({ loading: false })
  },

  addLead: async (form) => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) throw new Error('Usuário não autenticado')
    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        empresa: form.nombre.trim(),
        contato: form.contacto?.trim() || null,
        email: form.email?.trim() || null,
        telefone: form.telefone?.trim() || null,
        canal: form.canal_origen || 'manual',
        valor: form.valor_estimado ? Number(form.valor_estimado) : 0,
        etapa: form.pipeline_stage || 'new_lead',
        notas: form.notas?.trim() || null,
      })
      .select()
      .single()
    if (error) throw error
    // Map Supabase row → shape the Pipeline expects
    const lead = mapRow(data)
    set((s) => ({ leads: [lead, ...s.leads] }))
    return lead
  },

  moveLead: async (leadId, stage) => {
    // Optimistic update
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === leadId ? { ...l, pipeline_stage: stage } : l,
      ),
    }))
    await supabase.from('leads').update({ etapa: stage }).eq('id', leadId)
  },

  deleteLead: async (leadId) => {
    set((s) => ({ leads: s.leads.filter((l) => l.id !== leadId) }))
    await supabase.from('leads').delete().eq('id', leadId)
  },

  setLeads: (leads) => set({ leads }),
}))

// Map Supabase column names → shape used across the app
function mapRow(row) {
  return {
    id: row.id,
    nombre: row.empresa,
    contacto: row.contato,
    email: row.email,
    telefone: row.telefone,
    canal_origen: row.canal,
    valor_estimado: row.valor,
    pipeline_stage: row.etapa,
    notas: row.notas,
    avatar: row.avatar,
    actualizado_en: row.updated_at,
    badge: 'Novo',
  }
}
