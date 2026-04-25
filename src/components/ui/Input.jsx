import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

const Input = forwardRef(function Input(
  { className = '', icon: Icon, ...props },
  ref,
) {
  return (
    <div className="relative w-full">
      {Icon && (
        <Icon
          size={16}
          strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-text-muted)' }}
        />
      )}
      <input
        ref={ref}
        className={cn(
          'w-full h-10 rounded-[10px] text-[14px] outline-none transition-colors',
          Icon ? 'pl-9 pr-3' : 'px-3.5',
          className,
        )}
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-border-focus)'
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border)'
          props.onBlur?.(e)
        }}
        {...props}
      />
    </div>
  )
})

export default Input
