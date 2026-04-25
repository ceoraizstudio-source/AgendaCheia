import { create } from 'zustand'
import { mockLeads } from '../lib/mockData'

export const useLeadsStore = create((set) => ({
  leads: mockLeads,
  setLeads: (leads) => set({ leads }),
  moveLead: (leadId, stage) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, pipeline_stage: stage } : l,
      ),
    })),
  addLead: (lead) =>
    set((state) => ({ leads: [lead, ...state.leads] })),
}))
