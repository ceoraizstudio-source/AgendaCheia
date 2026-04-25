import { useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SlidersHorizontal, MoreHorizontal } from 'lucide-react'
import { useLeadsStore } from '../store/useLeadsStore'
import { PIPELINE_STAGES } from '../lib/mockData'
import { formatCurrency, cn } from '../lib/cn'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const filters = [
  { id: 'all', label: 'Todos Ativos' },
  { id: 'high', label: 'Alto Valor' },
]

export default function Pipeline() {
  const { leads, moveLead } = useLeadsStore()
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeStage, setActiveStage] = useState('in_progress')
  const [draggingId, setDraggingId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const visibleLeads = useMemo(
    () =>
      activeFilter === 'high'
        ? leads.filter((l) => (l.valor_estimado || 0) >= 50000)
        : leads,
    [leads, activeFilter],
  )

  const grouped = useMemo(() => {
    const map = Object.fromEntries(PIPELINE_STAGES.map((s) => [s.id, []]))
    for (const lead of visibleLeads) {
      const stage = lead.pipeline_stage in map ? lead.pipeline_stage : 'new_lead'
      map[stage].push(lead)
    }
    return map
  }, [visibleLeads])

  const handleDragEnd = (event) => {
    setDraggingId(null)
    const { active, over } = event
    if (!over) return
    const newStage = over.id
    moveLead(active.id, newStage)
    setActiveStage(newStage)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px]">Visão Geral do Funil</h1>
          <p
            className="text-[13px] mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Gerencie seus negócios ativos e identifique gargalos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                'h-9 px-4 rounded-[10px] text-[12px] font-semibold cursor-pointer transition-colors',
                activeFilter === f.id
                  ? 'text-black'
                  : 'text-white hover:bg-white/5',
              )}
              style={
                activeFilter === f.id
                  ? { backgroundColor: 'var(--color-accent)' }
                  : {
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border)',
                    }
              }
            >
              {f.label}
            </button>
          ))}
          <button
            className="h-9 w-9 rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-white/5"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
            aria-label="Filtros"
          >
            <SlidersHorizontal size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => setDraggingId(e.active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggingId(null)}
      >
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={grouped[stage.id]}
              isActive={activeStage === stage.id}
              draggingId={draggingId}
              onActivate={() => setActiveStage(stage.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function KanbanColumn({ stage, leads, isActive, draggingId, onActivate }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div
      ref={setNodeRef}
      onClick={onActivate}
      className="flex flex-col gap-3 min-h-[400px]"
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{
              color: isActive
                ? 'var(--color-accent)'
                : 'var(--color-text-secondary)',
            }}
          >
            {stage.label}
          </span>
          <span
            className="text-[11px] font-semibold rounded-full px-1.5 min-w-[18px] h-[18px] inline-flex items-center justify-center"
            style={{
              backgroundColor: isActive
                ? 'var(--color-accent-muted)'
                : 'var(--color-bg-elevated)',
              color: isActive
                ? 'var(--color-accent)'
                : 'var(--color-text-secondary)',
            }}
          >
            {leads.length}
          </span>
        </div>
        {isActive && (
          <div
            className="h-[2px] flex-1 ml-3 rounded-full"
            style={{
              background:
                'linear-gradient(to right, var(--color-accent), transparent)',
            }}
          />
        )}
      </div>

      <div
        className="flex flex-col gap-3 min-h-[200px] rounded-[14px] transition-colors"
        style={{
          backgroundColor: isOver ? 'rgba(245,166,35,0.04)' : 'transparent',
          padding: isOver ? '4px' : '0',
        }}
      >
        {leads.map((lead) => (
          <DealCard key={lead.id} lead={lead} hidden={draggingId === lead.id} />
        ))}
      </div>
    </div>
  )
}

function DealCard({ lead, hidden }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: hidden ? 0.3 : 1,
    zIndex: isDragging ? 50 : 'auto',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        'rounded-[14px] p-4 flex flex-col gap-3 cursor-grab active:cursor-grabbing select-none transition-shadow',
        isDragging && 'shadow-2xl',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-heading text-[15px] leading-tight">
          {lead.nombre}
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          className="p-0.5 -mr-1 rounded cursor-pointer hover:bg-white/5"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Opções"
        >
          <MoreHorizontal size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div
        className="font-heading text-[20px]"
        style={{ color: 'var(--color-accent)' }}
      >
        {formatCurrency(lead.valor_estimado)}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Avatar src={lead.avatar} name={lead.contacto} size="xs" />
          <span
            className="text-[11px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {timeAgo(lead.actualizado_en)}
          </span>
        </div>
        <Badge channel={lead.canal_origen} />
      </div>
    </div>
  )
}

function timeAgo(date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
  } catch {
    return ''
  }
}
