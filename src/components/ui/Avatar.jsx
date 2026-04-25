import { cn } from '../../lib/cn'

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-9 h-9 text-[12px]',
  lg: 'w-12 h-12 text-[14px]',
  xl: 'w-20 h-20 text-[18px]',
}

export default function Avatar({
  src,
  name = '',
  size = 'md',
  online = false,
  className = '',
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-full overflow-hidden font-semibold uppercase',
          sizeMap[size],
        )}
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials || '?'
        )}
      </span>
      {online && (
        <span
          className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'var(--color-success)',
            boxShadow: '0 0 0 2px var(--color-bg-surface)',
          }}
        />
      )}
    </span>
  )
}
