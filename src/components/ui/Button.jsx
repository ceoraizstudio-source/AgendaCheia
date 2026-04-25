import { cn } from '../../lib/cn'

const sizeMap = {
  sm: 'h-8 px-3 text-[12px]',
  md: 'h-10 px-5 text-[14px]',
  lg: 'h-12 px-6 text-[15px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap'

  const variants = {
    primary:
      'bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)]',
    secondary:
      'bg-transparent text-white border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]',
    ghost:
      'bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]',
    danger:
      'bg-[var(--color-danger)] text-white hover:opacity-90',
  }

  return (
    <button
      className={cn(base, sizeMap[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
