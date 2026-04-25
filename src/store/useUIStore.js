import { create } from 'zustand'

export const useUIStore = create((set) => ({
  newLeadOpen: false,
  openNewLead: () => set({ newLeadOpen: true }),
  closeNewLead: () => set({ newLeadOpen: false }),
}))
