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
    if (!error) set({ leads: (data || []).map(mapRow) })
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
        nome: form.nombre.trim(),
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
    // Remove do estado imediatamente
    set((s) => ({ leads: s.leads.filter((l) => l.id !== leadId) }))

    // Busca conversas do lead para apagar mensagens primeiro
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .eq('lead_id', leadId)

    if (convs?.length) {
      const convIds = convs.map((c) => c.id)
      // Apaga mensagens das conversas
      await supabase.from('messages').delete().in('conversation_id', convIds)
      // Apaga conversas
      await supabase.from('conversations').delete().in('id', convIds)
    }

    // Apaga agendamentos do lead
    await supabase.from('appointments').delete().eq('lead_id', leadId)

    // Apaga o lead
    await supabase.from('leads').delete().eq('id', leadId)
  },

  setLeads: (leads) => set({ leads }),
}))

// Map Supabase column names → shape used across the app
function mapRow(row) {
  return {
    id: row.id,
    nombre: row.nome,
    contacto: row.contato,
    email: row.email,
    telefone: row.telefone,
    canal_origen: row.canal,
    valor_estimado: row.valor,
    pipeline_stage: row.etapa,
    servico: row.servico || null,
    notas: row.notas,
    avatar: row.avatar,
    actualizado_en: row.updated_at,
    badge: 'Novo',
  }
}
