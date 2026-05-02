import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  MessageSquare,
  BarChart3,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Plus,
  Stethoscope,
  FileText,
} from 'lucide-react'
import Button from '../ui/Button'
import { useUIStore } from '../../store/useUIStore'
import { useConversationsStore } from '../../store/useConversationsStore'

const navItems = [
  { to: '/pipeline',   label: 'Funil',         icon: LayoutGrid   },
  { to: '/messaging',  label: 'Mensagens',      icon: MessageSquare, badge: true },
  { to: '/campaigns',  label: 'Templates',      icon: FileText     },
  { to: '/calendar',   label: 'Agenda',         icon: CalendarIcon },
  { to: '/services',   label: 'Serviços',       icon: Stethoscope  },
  { to: '/analytics',  label: 'Análises',       icon: BarChart3    },
  { to: '/settings',   label: 'Configurações',  icon: SettingsIcon },
]

export default function Sidebar() {
  const { openNewLead } = useUIStore()
  const conversations = useConversationsStore(s => s.conversations)

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0)

  return (
    <aside
      className="flex flex-col shrink-0 h-screen sticky top-0"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-bg-sidebar)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <div className="px-6 pt-6 pb-4">
        <img src="/logotipo.svg" alt="Agenda Cheia" className="h-9 w-auto" />
      </div>

      <div className="px-4 pb-4">
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={openNewLead}
        >
          <Plus size={16} strokeWidth={2} />
          Novo Lead
        </Button>
      </div>

      <nav className="flex-1 px-2 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-[14px] font-medium transition-colors ${
                isActive
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-elevated)]'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    backgroundColor: 'var(--color-accent-muted)',
                    boxShadow: 'inset 3px 0 0 var(--color-accent)',
                  }
                : undefined
            }
          >
            <Icon size={18} strokeWidth={1.5} />
            <span className="flex-1">{label}</span>
            {badge && totalUnread > 0 && (
              <span
                className="flex items-center justify-center rounded-full text-[11px] font-bold min-w-[18px] h-[18px] px-1"
                style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className="px-4 py-4 text-[11px]"
        style={{
          borderTop: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        Agenda Cheia · v1.0
      </div>
    </aside>
  )
}
