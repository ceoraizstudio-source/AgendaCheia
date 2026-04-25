import { create } from 'zustand'
import { mockAppointments, APPOINTMENT_TYPES } from '../lib/mockData'
import { addMinutes, format } from 'date-fns'

export const useCalendarStore = create((set, get) => ({
  appointments: mockAppointments,
  selectedDate: new Date().toISOString().split('T')[0],

  setSelectedDate: (date) => set({ selectedDate: date }),

  addAppointment: (data) => {
    const tipo = APPOINTMENT_TYPES.find((t) => t.value === data.tipo)
    const startDate = new Date(`${data.date}T${data.time}`)
    const endDate = addMinutes(startDate, Number(data.duracao))
    const appt = {
      id: `a-${Date.now()}`,
      lead_id: data.lead?.id || null,
      lead_name: data.lead?.nombre || data.lead_name_manual || 'Lead',
      lead_avatar: data.lead?.avatar || null,
      canal: data.lead?.canal_origen || 'manual',
      titulo: data.titulo,
      tipo: data.tipo,
      descricao: data.descricao,
      inicio: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
      fim: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
      duracao: Number(data.duracao),
      status: 'programada',
      criado_por: 'humano',
      google_sync: data.google_sync || false,
    }
    set((s) => ({ appointments: [...s.appointments, appt] }))
  },

  updateAppointment: (id, data) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, ...data } : a,
      ),
    }))
  },

  deleteAppointment: (id) => {
    set((s) => ({
      appointments: s.appointments.filter((a) => a.id !== id),
    }))
  },

  completeAppointment: (id) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: 'completada' } : a,
      ),
    }))
  },

  cancelAppointment: (id) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelada' } : a,
      ),
    }))
  },

  getByDate: (dateStr) => {
    return get().appointments.filter(
      (a) => a.inicio.startsWith(dateStr),
    )
  },
}))
