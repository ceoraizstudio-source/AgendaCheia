import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Eye, Zap, Clock, Filter } from 'lucide-react'

/* ─── Mock data ───────────────────────────────────── */

const KPIS = [
  {
    label: 'Total de Visualizações',
    value: '2.4M',
    trend: '+14.2%',
    trendDir: 'up',
    sub: '+34.5k este mês',
    icon: Eye,
  },
  {
    label: 'Total de Interações',
    value: '186.4K',
    trend: '+8.7%',
    trendDir: 'up',
    sub: 'Curtidas + comentários + shares',
    icon: Zap,
  },
  {
    label: 'Retenção Média',
    value: '4m 12s',
    trend: '-2.1%',
    trendDir: 'down',
    sub: 'Tempo médio de visualização',
    icon: Clock,
  },
]

const SOURCES = [
  { platform: 'youtube', label: 'YouTube', pct: 60, color: '#ff0000' },
  { platform: 'instagram', label: 'Instagram', pct: 25, color: '#c13584' },
  { platform: 'tiktok', label: 'TikTok', pct: 15, color: '#fe2c55' },
]

const VIDEOS = [
  {
    id: 'v1',
    title: 'Unlocking',
    date: 'Out 19, 2025',
    platform: 'youtube',
    thumbnail: 'https://picsum.photos/seed/v1/80/50',
    views: 142500,
    interactions: 2840,
    retention: '68%',
  },
  {
    id: 'v2',
    title: '5 Tips for Better Sales Automation',
    date: 'Out 14, 2025',
    platform: 'instagram',
    thumbnail: 'https://picsum.photos/seed/v2/80/50',
    views: 89200,
    interactions: 800,
    retention: '54%',
  },
  {
    id: 'v3',
    title: 'CRM Auto-Scheduling Deep Dive',
    date: 'Out 6, 2025',
    platform: 'tiktok',
    thumbnail: 'https://picsum.photos/seed/v3/80/50',
    views: 320800,
    interactions: 5900,
    retention: '72%',
  },
  {
    id: 'v4',
    title: 'Como Qualificar Leads com IA',
    date: 'Set 28, 2025',
    platform: 'youtube',
    thumbnail: 'https://picsum.photos/seed/v4/80/50',
    views: 54300,
    interactions: 1230,
    retention: '61%',
  },
  {
    id: 'v5',
    title: 'Pipeline sem Esforço — Tutorial',
    date: 'Set 20, 2025',
    platform: 'instagram',
    thumbnail: 'https://picsum.photos/seed/v5/80/50',
    views: 41100,
    interactions: 970,
    retention: '49%',
  },
]

const PLATFORMS = ['Todos', 'YouTube', 'Instagram', 'TikTok']
const PERIODS = ['Últimos 7 dias', 'Últimos 30 dias', 'Últimos 90 dias']

/* ─── Helpers ─────────────────────────────────────── */

function fmtViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const platformKey = { YouTube: 'youtube', Instagram: 'instagram', TikTok: 'tiktok' }

/* ─── Analytics page ──────────────────────────────── */

export default function Analytics() {
  const [activePlatform, setActivePlatform] = useState('Todos')
  const [activePeriod, setActivePeriod] = useState('Últimos 30 dias')

  const filteredVideos = activePlatform === 'Todos'
    ? VIDEOS
    : VIDEOS.filter((v) => v.platform === platformKey[activePlatform])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px]">Análises</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Acompanhe o desempenho dos seus vídeos nas plataformas.
        </p>
      </div>

      {/* KPIs + Source */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {KPIS.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* Source bars */}
      <div
        className="rounded-[14px] p-6"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
      >
        <p className="label-uppercase mb-4">Leads por Origem</p>
        <div className="flex flex-col gap-3">
          {SOURCES.map((s) => (
            <div key={s.platform} className="flex items-center gap-3">
              <span className="text-[12px] font-medium w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                {s.label}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                />
              </div>
              <span className="text-[12px] font-semibold w-8 text-right shrink-0" style={{ color: s.color }}>
                {s.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + Table */}
      <div
        className="rounded-[14px] overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Filter bar */}
        <div
          className="flex items-center justify-between px-6 py-4 gap-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <p className="text-[15px] font-heading">Desempenho Recente de Vídeos</p>
          <div className="flex items-center gap-2">
            <Filter size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
            <FilterPills options={PLATFORMS} active={activePlatform} onChange={setActivePlatform} />
            <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />
            <FilterPills options={PERIODS} active={activePeriod} onChange={setActivePeriod} />
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Vídeo', 'Plataforma', 'Visualizações', 'Interações', 'Retenção'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left label-uppercase"
                  style={{ fontSize: 11 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredVideos.map((video, i) => (
              <tr
                key={video.id}
                style={{
                  borderBottom: i < filteredVideos.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
                className="hover:bg-white/[0.015] transition-colors"
              >
                {/* Video */}
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-12 h-8 rounded-[6px] object-cover shrink-0"
                    />
                    <div>
                      <p className="text-[13px] font-medium">{video.title}</p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{video.date}</p>
                    </div>
                  </div>
                </td>
                {/* Platform */}
                <td className="px-6 py-3.5">
                  <PlatformBadge platform={video.platform} />
                </td>
                {/* Views */}
                <td className="px-6 py-3.5">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {fmtViews(video.views)}
                  </span>
                </td>
                {/* Interactions */}
                <td className="px-6 py-3.5">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--color-accent)' }}>
                    {fmtViews(video.interactions)}
                  </span>
                </td>
                {/* Retention */}
                <td className="px-6 py-3.5">
                  <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    {video.retention}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Sub-components ──────────────────────────────── */

function KpiCard({ label, value, trend, trendDir, sub, icon: Icon }) {
  const isUp = trendDir === 'up'
  const trendColor = isUp ? 'var(--color-success)' : 'var(--color-danger)'
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight

  return (
    <div
      className="rounded-[14px] p-6 flex flex-col gap-3"
      style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="label-uppercase">{label}</span>
        <Icon size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <div className="font-heading text-[36px] leading-none" style={{ color: 'var(--color-accent)' }}>
        {value}
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: trendColor }}>
          <TrendIcon size={13} strokeWidth={2} />
          {trend}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{sub}</span>
      </div>
    </div>
  )
}

function FilterPills({ options, active, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="px-2.5 py-1 rounded-[6px] text-[11px] font-semibold cursor-pointer transition-colors"
          style={{
            backgroundColor: active === opt ? 'var(--color-accent-muted)' : 'transparent',
            color: active === opt ? 'var(--color-accent)' : 'var(--color-text-muted)',
            border: `1px solid ${active === opt ? 'rgba(245,166,35,0.3)' : 'transparent'}`,
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function PlatformBadge({ platform }) {
  const MAP = {
    youtube: { label: 'YouTube', bg: 'rgba(255,0,0,0.12)', color: '#ff0000' },
    instagram: { label: 'Instagram', bg: 'rgba(193,53,132,0.12)', color: '#c13584' },
    tiktok: { label: 'TikTok', bg: 'rgba(254,44,85,0.12)', color: '#fe2c55' },
  }
  const m = MAP[platform] || { label: platform, bg: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: m.bg, color: m.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  )
}
