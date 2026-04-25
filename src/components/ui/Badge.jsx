import { channelMeta } from '../../lib/mockData'
import { cn } from '../../lib/cn'

export default function Badge({
  channel,
  color,
  children,
  className = '',
  variant = 'channel',
}) {
  const meta = channel ? channelMeta[channel] : null
  const dotColor = color || meta?.color || 'var(--color-text-secondary)'
  const label = children ?? meta?.label

  if (variant === 'solid') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-wide',
          className,
        )}
        style={{ backgroundColor: dotColor, color: '#fff' }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold',
        className,
      )}
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)',
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      {label}
    </span>
  )
}
