import { Bell, Settings as SettingsIcon } from 'lucide-react'
import Avatar from '../ui/Avatar'

export default function Topbar() {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-end gap-3 px-8"
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--color-bg-base)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <button
        className="relative p-2 rounded-md hover:bg-white/5 cursor-pointer"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Notificações"
      >
        <Bell size={18} strokeWidth={1.5} />
        <span
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
      </button>
      <button
        className="p-2 rounded-md hover:bg-white/5 cursor-pointer"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Configurações"
      >
        <SettingsIcon size={18} strokeWidth={1.5} />
      </button>
      <Avatar
        src="https://i.pravatar.cc/64?img=8"
        name="Agente"
        size="sm"
        online
      />
    </header>
  )
}
