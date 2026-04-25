import { useRef, useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  Bot,
  User,
  CalendarDays,
} from 'lucide-react'
import { useCalendarStore } from '../store/useCalendarStore'
import { useLeadsStore } from '../store/useLeadsStore'
import { APPOINTMENT_TYPES, DURATIONS } from '../lib/mockData'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

/* ─── Color helpers ───────────────────────────────── */

const typeColor = (tipo) =>
  APPOINTMENT_TYPES.find((t) => t.value === tipo)?.color || '#9096a8'

const typeLabel = (tipo) =>
  APPOINTMENT_TYPES.find((t) => t.value === tipo)?.label || tipo

const VIEW_OPTIONS = [
  { key: 'dayGridMonth', label: 'Mês' },
  { key: 'timeGridWeek', label: 'Semana' },
  { key: 'timeGridDay', label: 'Dia' },
  { key: 'listMonth', label: 'Agenda' },
]

/* ─── Empty form state ────────────────────────────── */

const EMPTY_FORM = {
  titulo: '',
  tipo: 'ligacao',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '09:00',
  duracao: '30',
  descricao: '',
  google_sync: false,
  lead: null,
  leadSearch: '',
}

/* ─── Calendar page ───────────────────────────────── */

export default function Calendar() {
  const calendarRef = useRef(null)
  const { appointments, selectedDate, setSelectedDate, addAppointment,
    completeAppointment, cancelAppointment, deleteAppointment,
    fetchAppointments } = useCalendarStore()

  useEffect(() => { fetchAppointments() }, [])
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  /* Convert appointments → FullCalendar events */
  const events = appointments.map((a) => ({
    id: a.id,
    title: a.titulo,
    start: a.inicio,
    end: a.fim,
    backgroundColor: a.status === 'cancelada'
      ? 'var(--color-text-muted)'
      : typeColor(a.tipo),
    borderColor: 'transparent',
    extendedProps: { appointment: a },
    classNames: a.status === 'completada' ? ['fc-event-completed'] : [],
  }))

  /* Day appointments for right panel */
  const dayAppts = appointments
    .filter((a) => a.inicio.startsWith(selectedDate))
    .sort((a, b) => a.inicio.localeCompare(b.inicio))

  const switchView = (key) => {
    setCurrentView(key)
    calendarRef.current?.getApi().changeView(key)
  }

  const openNew = () => {
    setEditTarget(null)
    setForm({ ...EMPTY_FORM, date: selectedDate })
    setModalOpen(true)
  }

  const openEdit = (appt) => {
    setEditTarget(appt)
    setForm({
      titulo: appt.titulo,
      tipo: appt.tipo,
      date: appt.inicio.slice(0, 10),
      time: appt.inicio.slice(11, 16),
      duracao: String(appt.duracao),
      descricao: appt.descricao || '',
      google_sync: appt.google_sync || false,
      lead: null,
      leadSearch: appt.lead_name || '',
    })
    setModalOpen(true)
  }

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.titulo.trim()) return
    setSaving(true)
    try {
      await addAppointment(form)
      setModalOpen(false)
      setForm(EMPTY_FORM)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px]">Agenda</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Gerencie seus compromissos e chamadas agendadas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div
            className="flex gap-0 rounded-[10px] overflow-hidden"
            style={{ border: '1px solid var(--color-border)' }}
          >
            {VIEW_OPTIONS.map((v) => (
              <button
                key={v.key}
                onClick={() => switchView(v.key)}
                className="px-3.5 py-2 text-[12px] font-semibold cursor-pointer transition-colors"
                style={{
                  backgroundColor: currentView === v.key
                    ? 'var(--color-accent-muted)' : 'transparent',
                  color: currentView === v.key
                    ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  borderRight: '1px solid var(--color-border)',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
          <Button variant="primary" size="md" onClick={openNew}>
            <Plus size={15} strokeWidth={2} />
            Novo Compromisso
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Calendar */}
        <div
          className="flex-1 rounded-[14px] p-4 min-w-0 overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            locale={ptBrLocale}
            height="100%"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            events={events}
            selectable
            dateClick={(info) => setSelectedDate(info.dateStr)}
            eventClick={(info) => {
              const appt = info.event.extendedProps.appointment
              setSelectedDate(appt.inicio.slice(0, 10))
            }}
            eventMouseEnter={(info) => {
              info.el.style.opacity = '0.85'
              info.el.style.transform = 'scale(1.02)'
            }}
            eventMouseLeave={(info) => {
              info.el.style.opacity = ''
              info.el.style.transform = ''
            }}
            nowIndicator
            dayCellClassNames={(arg) =>
              arg.dateStr === selectedDate ? ['fc-day-selected'] : []
            }
          />
        </div>

        {/* Right panel */}
        <div
          className="flex flex-col rounded-[14px] shrink-0 overflow-hidden"
          style={{
            width: 300,
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Panel header */}
          <div
            className="px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <p className="label-uppercase mb-1">Data selecionada</p>
            <p className="text-[16px] font-heading">
              {format(parseISO(selectedDate), "d 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {dayAppts.length === 0
                ? 'Nenhum compromisso'
                : `${dayAppts.length} compromisso${dayAppts.length > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Appointment list */}
          <div className="flex-1 overflow-y-auto">
            {dayAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 h-full py-12 px-5 text-center">
                <CalendarDays size={32} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum compromisso para este dia.<br />
                  <span
                    className="cursor-pointer underline"
                    style={{ color: 'var(--color-accent)' }}
                    onClick={openNew}
                  >
                    Criar novo
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {dayAppts.map((appt) => (
                  <AppointmentItem
                    key={appt.id}
                    appt={appt}
                    onEdit={() => openEdit(appt)}
                    onComplete={() => completeAppointment(appt.id)}
                    onCancel={() => cancelAppointment(appt.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick add */}
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <Button variant="secondary" size="sm" className="w-full" onClick={openNew}>
              <Plus size={14} strokeWidth={2} />
              Adicionar compromisso
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        editMode={!!editTarget}
        saving={saving}
      />
    </div>
  )
}

/* ─── Appointment item in panel ───────────────────── */

function AppointmentItem({ appt, onEdit, onComplete, onCancel }) {
  const color = typeColor(appt.tipo)
  const isCanceled = appt.status === 'cancelada'
  const isDone = appt.status === 'completada'

  return (
    <div
      className="flex gap-3 px-4 py-3.5"
      style={{
        opacity: isCanceled ? 0.5 : 1,
        borderLeft: `3px solid ${isDone ? 'var(--color-success)' : isCanceled ? 'var(--color-danger)' : color}`,
      }}
    >
      {/* Time */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5" style={{ minWidth: 40 }}>
        <span className="text-[11px] font-semibold" style={{ color }}>
          {appt.inicio.slice(11, 16)}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          {appt.fim.slice(11, 16)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p
            className="text-[13px] font-medium truncate"
            style={{
              textDecoration: isCanceled ? 'line-through' : 'none',
              color: 'var(--color-text-primary)',
            }}
          >
            {appt.titulo}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className="text-[11px] font-semibold"
            style={{ color }}
          >
            {typeLabel(appt.tipo)}
          </span>
          {appt.lead_name && (
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              · {appt.lead_name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <Badge channel={appt.canal} className="!px-1.5 !py-0 !text-[10px]" />
          {appt.criado_por === 'bot' && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium"
              style={{ color: 'var(--color-info)' }}
            >
              <Bot size={10} strokeWidth={2} />
              Bot
            </span>
          )}
          {isDone && (
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-success)' }}>
              Concluído
            </span>
          )}
          {isCanceled && (
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-danger)' }}>
              Cancelado
            </span>
          )}
        </div>

        {/* Action buttons */}
        {!isDone && !isCanceled && (
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
            >
              <Pencil size={10} strokeWidth={2} />
              Editar
            </button>
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'rgba(46,204,113,0.12)', color: 'var(--color-success)' }}
            >
              <CheckCircle2 size={10} strokeWidth={2} />
              Concluir
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'rgba(231,76,60,0.1)', color: 'var(--color-danger)' }}
            >
              <XCircle size={10} strokeWidth={2} />
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Appointment modal ───────────────────────────── */

function AppointmentModal({ open, onClose, form, setForm, onSave, editMode, saving }) {
  const { leads } = useLeadsStore()
  const [showLeadDropdown, setShowLeadDropdown] = useState(false)

  const set = (field, val) => setForm((prev) => ({ ...prev, [field]: val }))

  const filteredLeads = form.leadSearch.trim()
    ? leads.filter((l) =>
        l.nombre.toLowerCase().includes(form.leadSearch.toLowerCase()) ||
        (l.contacto || '').toLowerCase().includes(form.leadSearch.toLowerCase()),
      )
    : leads.slice(0, 6)

  const selectLead = (lead) => {
    set('lead', lead)
    set('leadSearch', lead.nombre)
    setShowLeadDropdown(false)
  }

  const errors = {
    titulo: !form.titulo.trim(),
  }
  const hasErrors = Object.values(errors).some(Boolean)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editMode ? 'Editar Compromisso' : 'Novo Compromisso'}
      width={500}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="md" onClick={onSave} disabled={hasErrors || saving}>
            {saving ? 'Salvando...' : editMode ? 'Salvar alterações' : 'Criar compromisso'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Title */}
        <Field label="Título *" error={errors.titulo && form.titulo !== undefined ? 'Obrigatório' : null}>
          <Input
            placeholder="Ex: Demo da plataforma"
            value={form.titulo}
            onChange={(e) => set('titulo', e.target.value)}
          />
        </Field>

        {/* Lead search */}
        <Field label="Lead (busca)">
          <div className="relative">
            <Input
              placeholder="Buscar lead pelo nome..."
              value={form.leadSearch}
              onChange={(e) => { set('leadSearch', e.target.value); set('lead', null); setShowLeadDropdown(true) }}
              onFocus={() => setShowLeadDropdown(true)}
            />
            {showLeadDropdown && filteredLeads.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 z-50 rounded-[10px] overflow-hidden shadow-xl"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onMouseDown={() => selectLead(lead)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/5 text-left"
                  >
                    <Avatar src={lead.avatar} name={lead.nombre} size="xs" />
                    <div>
                      <p className="text-[13px] font-medium">{lead.nombre}</p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        {lead.contacto}
                      </p>
                    </div>
                    <Badge channel={lead.canal_origen} className="ml-auto !px-1.5 !py-0 !text-[10px]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        {/* Type */}
        <Field label="Tipo de compromisso">
          <div className="grid grid-cols-4 gap-2">
            {APPOINTMENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => set('tipo', t.value)}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer transition-all"
                style={{
                  backgroundColor: form.tipo === t.value
                    ? `${t.color}20` : 'var(--color-bg-elevated)',
                  border: `1px solid ${form.tipo === t.value ? t.color : 'var(--color-border)'}`,
                  color: form.tipo === t.value ? t.color : 'var(--color-text-secondary)',
                }}
              >
                <span className="text-base">{
                  { ligacao: '📞', demo: '💻', followup: '🔄', reuniao: '👥' }[t.value]
                }</span>
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </Field>
          <Field label="Hora de início">
            <Input
              type="time"
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
            />
          </Field>
        </div>

        {/* Duration */}
        <Field label="Duração">
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => set('duracao', String(d.value))}
                className="flex-1 py-2 rounded-[8px] text-[12px] font-semibold cursor-pointer transition-colors"
                style={{
                  backgroundColor: form.duracao === String(d.value)
                    ? 'var(--color-accent-muted)' : 'var(--color-bg-elevated)',
                  border: `1px solid ${form.duracao === String(d.value) ? 'rgba(245,166,35,0.35)' : 'var(--color-border)'}`,
                  color: form.duracao === String(d.value)
                    ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Notes */}
        <Field label="Descrição / Notas">
          <textarea
            rows={2}
            placeholder="Observações sobre o compromisso..."
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            className="w-full rounded-[10px] px-3.5 py-2.5 text-[14px] resize-none outline-none transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-focus)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)' }}
          />
        </Field>

        {/* Google Calendar sync */}
        <label
          className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-[10px] transition-colors hover:bg-white/3"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <div
            className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0"
            style={{
              backgroundColor: form.google_sync ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
              border: `1px solid ${form.google_sync ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}
            onClick={() => set('google_sync', !form.google_sync)}
          >
            {form.google_sync && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
            Sincronizar com Google Calendar
          </span>
        </label>
      </div>
    </Modal>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      {children}
      {error && (
        <span className="text-[11px]" style={{ color: 'var(--color-danger)' }}>{error}</span>
      )}
    </div>
  )
}
