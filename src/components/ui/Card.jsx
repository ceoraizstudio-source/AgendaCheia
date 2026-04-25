import { cn } from '../../lib/cn'

export default function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag
      className={cn(
        'bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[14px] p-6',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
