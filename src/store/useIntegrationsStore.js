import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useIntegrationsStore = create((set, get) => ({
  integrations: null,
  loading: false,
  saving: false,

  fetchIntegrations: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return set({ loading: false })

    const { data } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    set({ integrations: data || null, loading: false })
  },

  saveIntegrations: async (values) => {
    set({ saving: true })
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { set({ saving: false }); return false }

    const { data, error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, ...values, updated_at: new Date().toISOString() })
      .select()
      .single()

    if (!error && data) set({ integrations: data })
    set({ saving: false })
    return !error
  },
}))
