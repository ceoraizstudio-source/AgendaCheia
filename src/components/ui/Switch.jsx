import { cn } from '../../lib/cn'

export default function Switch({ checked = false, onChange, label, className = '' }) {
  const handleClick = () => {
    onChange?.(!checked)
  }

  const handleKey = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {label && (
        <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
      )}
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKey}
        className="relative cursor-pointer"
        style={{
          width: 52,
          height: 28,
          borderRadius: 14,
          backgroundColor: checked
            ? 'var(--color-switch-active)'
            : 'var(--color-switch-inactive)',
          transition: 'background-color 0.25s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: checked ? 28 : 4,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'var(--color-switch-thumb)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            transition: 'left 0.25s ease',
          }}
        />
      </div>
    </div>
  )
}
