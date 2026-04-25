import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { addMinutes, format } from 'date-fns'
import { APPOINTMENT_TYPES } from '../lib/mockData'

export const useCalendarStore = create((set, get) => ({
  appointments: [],
  selectedDate: new Date().toISOString().split('T')[0],

  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchAppointments: async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('inicio', { ascending: true })
    if (!error) set({ appointments: (data || []).map(mapRow) })
  },

  addAppointment: async (data) => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) throw new Error('Usuário não autenticado')

    const startDate = new Date(`${data.date}T${data.time}`)
    const endDate = addMinutes(startDate, Number(data.duracao))

    const { data: row, error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        lead_id: data.lead?.id || null,
        lead_name: data.lead?.nombre || data.lead_name_manual || null,
        titulo: data.titulo,
        tipo: data.tipo,
        descricao: data.descricao || null,
        inicio: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        fim: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
        duracao: Number(data.duracao),
        status: 'programada',
        google_sync: data.google_sync || false,
      })
      .select()
      .single()

    if (error) throw error
    set((s) => ({ appointments: [...s.appointments, mapRow(row)] }))
  },

  updateAppointment: async (id, data) => {
    set((s) => ({
      appointments: s.appointments.map((a) => a.id === id ? { ...a, ...data } : a),
    }))
    await supabase.from('appointments').update(data).eq('id', id)
  },

  deleteAppointment: async (id) => {
    set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) }))
    await supabase.from('appointments').delete().eq('id', id)
  },

  completeAppointment: async (id) => {
    set((s) => ({
      appointments: s.appointments.map((a) => a.id === id ? { ...a, status: 'completada' } : a),
    }))
    await supabase.from('appointments').update({ status: 'completada' }).eq('id', id)
  },

  cancelAppointment: async (id) => {
    set((s) => ({
      appointments: s.appointments.map((a) => a.id === id ? { ...a, status: 'cancelada' } : a),
    }))
    await supabase.from('appointments').update({ status: 'cancelada' }).eq('id', id)
  },

  getByDate: (dateStr) => {
    return get().appointments.filter((a) => a.inicio.startsWith(dateStr))
  },
}))

function mapRow(row) {
  return {
    id: row.id,
    lead_id: row.lead_id,
    lead_name: row.lead_name,
    canal: 'manual',
    titulo: row.titulo,
    tipo: row.tipo,
    descricao: row.descricao,
    inicio: row.inicio,
    fim: row.fim,
    duracao: row.duracao,
    status: row.status,
    criado_por: 'humano',
    google_sync: row.google_sync,
  }
}
