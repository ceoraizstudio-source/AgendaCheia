import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  signOut: () => set({ user: null }),
}))
