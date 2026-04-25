import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { GoogleIcon, MetaIcon, EmailMarketingIcon } from '../components/ui/BrandIcons'

/* ─── Mock data ───────────────────────────────────── */

const SUMMARY = {
  totalSpent: 12450,
  totalLeads: 450,
  leadsGrowth: '+14%',
}

const CHANNELS = [
  {
    key: 'google',
    name: 'Google Ads',
    description: 'Search & Display Network',
    Icon: GoogleIcon,
    metrics: [
      { label: 'Investimento', value: 'R$ 5.200', accent: false },
      { label: 'Custo por Lead', value: 'R$ 42,50', accent: true },
      { label: 'Alcance', value: '145.000', accent: false },
      { label: 'Cliques no Link', value: '3.240', accent: false },
      { label: 'CPC', value: 'R$ 1,60', accent: false },
      { label: 'CPM', value: 'R$ 35,80', accent: false },
      { label: 'ROAS', value: '3.4x', accent: true },
      { label: 'ROI', value: '240%', accent: true },
    ],
  },
  {
    key: 'meta',
    name: 'Meta Ads',
    description: 'Social Media Placements',
    Icon: MetaIcon,
    metrics: [
      { label: 'Investimento', value: 'R$ 4.850', accent: false },
      { label: 'Custo por Lead', value: 'R$ 38,20', accent: true },
      { label: 'Alcance', value: '320.500', accent: false },
      { label: 'Cliques no Link', value: '8.900', accent: false },
      { label: 'CPC', value: 'R$ 0,54', accent: false },
      { label: 'CPM', value: 'R$ 15,20', accent: false },
      { label: 'ROAS', value: '2.8x', accent: true },
      { label: 'ROI', value: '160%', accent: true },
    ],
  },
  {
    key: 'email',
    name: 'E-mail Marketing',
    description: 'Newsletter & Automações',
    Icon: EmailMarketingIcon,
    metrics: [
      { label: 'Investimento', value: 'R$ 2.400', accent: false },
      { label: 'Custo por Lead', value: 'R$ 12,00', accent: true },
      { label: 'Leads Gerados', value: '200', accent: false },
      { label: 'E-mails Enviados', value: '12.400', accent: false },
      { label: 'Taxa de Abertura', value: '38.2%', accent: true },
      { label: 'Taxa de Clique', value: '4.2%', accent: true },
      { label: 'ROAS', value: '5.2x', accent: true },
      { label: 'ROI', value: '420%', accent: true },
    ],
  },
]

/* ─── Campaigns page ──────────────────────────────── */

export default function Campaigns() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px]">Visão Geral das Campanhas</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Acompanhe o desempenho multicanal e a velocidade de geração de leads.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total spent */}
        <div
          className="rounded-[14px] p-6 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="label-uppercase">Total Investido</span>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}
            >
              Este Mês
            </span>
          </div>
          <div className="font-heading text-[42px] leading-none" style={{ color: 'var(--color-accent)' }}>
            R$ {SUMMARY.totalSpent.toLocaleString('pt-BR')}
          </div>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Google Ads + Meta Ads + E-mail Marketing
          </p>
        </div>

        {/* Total leads */}
        <div
          className="rounded-[14px] p-6 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="label-uppercase">Total de Leads Gerados</span>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(46,204,113,0.12)', color: 'var(--color-success)' }}
            >
              <ArrowUpRight size={12} strokeWidth={2.5} />
              {SUMMARY.leadsGrowth}
            </span>
          </div>
          <div className="font-heading text-[42px] leading-none">
            {SUMMARY.totalLeads}
            <span className="text-[16px] ml-2 font-body" style={{ color: 'var(--color-text-secondary)' }}>
              qualificados
            </span>
          </div>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            vs. {Math.round(SUMMARY.totalLeads / 1.14)} no mês anterior
          </p>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px]">Desempenho por Canal</h2>
        <button
          className="inline-flex items-center gap-1.5 text-[13px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-accent)' }}
        >
          Ver Relatórios Detalhados
          <ExternalLink size={13} strokeWidth={1.5} />
        </button>
      </div>

      {/* Channel cards */}
      <div className="grid grid-cols-3 gap-4">
        {CHANNELS.map((ch) => (
          <ChannelCard key={ch.key} channel={ch} />
        ))}
      </div>
    </div>
  )
}

/* ─── Channel card ────────────────────────────────── */

function ChannelCard({ channel }) {
  const { name, description, Icon, metrics } = channel

  return (
    <div
      className="rounded-[14px] p-5 flex flex-col gap-5"
      style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Card header */}
      <div className="flex items-center gap-3">
        <Icon size={32} />
        <div>
          <p className="text-[14px] font-semibold">{name}</p>
          <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            {description}
          </p>
        </div>
      </div>

      {/* Metrics grid */}
      <div
        className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-0.5">
            <span className="label-uppercase" style={{ fontSize: 10 }}>{m.label}</span>
            <span
              className="text-[16px] font-heading"
              style={{ color: m.accent ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
