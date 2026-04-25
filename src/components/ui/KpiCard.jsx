import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Card from './Card'
import { cn } from '../../lib/cn'

export default function KpiCard({
  label,
  value,
  trend,
  trendDirection = 'up',
  accent = false,
  icon: Icon,
  className = '',
}) {
  const trendColor =
    trendDirection === 'up' ? 'var(--color-success)' : 'var(--color-danger)'
  const TrendIcon = trendDirection === 'up' ? ArrowUpRight : ArrowDownRight

  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="label-uppercase">{label}</span>
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.5}
            style={{ color: 'var(--color-text-secondary)' }}
          />
        )}
      </div>
      <div
        className="font-heading text-[36px] leading-none"
        style={{
          color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)',
        }}
      >
        {value}
      </div>
      {trend && (
        <div
          className="inline-flex items-center gap-1 text-[12px] font-medium"
          style={{ color: trendColor }}
        >
          <TrendIcon size={14} strokeWidth={2} />
          {trend}
          <span style={{ color: 'var(--color-text-muted)' }} className="ml-1 font-normal">
            vs mês anterior
          </span>
        </div>
      )}
    </Card>
  )
}
