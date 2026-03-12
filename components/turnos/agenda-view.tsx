'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, List, Grid3X3, Calendar, Plus, User, Clock, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/lib/data-context'
import { getWeekDays, formatDate, formatDateLong, getDayNameCapitalized, isTodayDate, isPastDate, isPastDateTime, generateTimeSlots, DIAS_SEMANA } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { AgendaSkeleton } from '@/components/ui/loading-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Turno, Kinesiologo, Horario } from '@/lib/types'
import { AppointmentDetail } from './appointment-detail'
import { NewAppointmentWizard } from './new-appointment-wizard'

const KINESIOLOGO_COLORS = [
  'bg-primary/20 border-primary text-primary',
  'bg-accent/20 border-accent text-accent-foreground',
]

interface AgendaViewProps {
  onNewAppointment?: () => void
}

export function AgendaView({ onNewAppointment }: AgendaViewProps) {
  const { activeKinesiologos, horarios, turnos, isLoading, getHorarioByKinesiologo, getPacienteByDni, getTratamientoByNombre, getObraSocialByRnos, getCobroByTurnoId } = useData()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week')
  const [selectedKinesiologos, setSelectedKinesiologos] = useState<string[]>([])

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])

  // Set default selection to all active professionals
  useEffect(() => {
    if (selectedKinesiologos.length === 0 && activeKinesiologos.length > 0) {
      setSelectedKinesiologos(activeKinesiologos.map(k => k.dni))
    }
  }, [activeKinesiologos, selectedKinesiologos.length])
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [reschedulingTurno, setReschedulingTurno] = useState<Turno | null>(null)
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [immediatePaymentTurno, setImmediatePaymentTurno] = useState<Turno | null>(null)
  const [preselectedSlot, setPreselectedSlot] = useState<{
    fecha: string
    hora: string
    kinesiologo?: Kinesiologo | null
  } | null>(null)

  const filteredKinesiologos = useMemo(() => {
    if (selectedKinesiologos.length === 0) return activeKinesiologos
    return activeKinesiologos.filter(k => selectedKinesiologos.includes(k.dni))
  }, [activeKinesiologos, selectedKinesiologos])

  const toggleKinesiologo = (dni: string) => {
    setSelectedKinesiologos(prev =>
      prev.includes(dni)
        ? prev.filter(d => d !== dni)
        : [...prev, dni]
    )
  }

  const goToToday = () => setCurrentDate(new Date())
  const goPrevWeek = () => setCurrentDate(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000))
  const goNextWeek = () => setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000))

  const getKinesiologoHours = (dni: string, dayName: string): { start: string; end: string } | null => {
    const horario = getHorarioByKinesiologo(dni)
    if (!horario) return null

    const daySchedule = horario.disponibilidad.find(d => d.dia === dayName)
    if (!daySchedule) return null

    return { start: daySchedule.horaInicio, end: daySchedule.horaFin }
  }

  const getTurnosForSlotUniversal = (fecha: string, horaStr: string): Turno[] => {
    // Return all non-cancelled turnos for SELECTED professionals that start within this hour
    const slotHour = parseInt(horaStr.split(':')[0])
    return turnos.filter(t => {
      if (t.fecha !== fecha || t.estado === 'cancelado') return false
      if (selectedKinesiologos.length > 0 && !selectedKinesiologos.includes(t.dniKinesiologo)) return false
      const turnoHour = parseInt(t.hora.split(':')[0])
      return turnoHour === slotHour
    })
  }

  const handleSlotClickUniversal = (fecha: string, hora: string) => {
    setPreselectedSlot({ fecha, hora })
    setShowNewAppointment(true)
  }

  const isSlotBooked = (fecha: string, kinesiologoDni: string, hora: string): boolean => {
    return turnos.some(t =>
      t.fecha === fecha &&
      t.dniKinesiologo === kinesiologoDni &&
      t.hora === hora &&
      t.estado !== 'cancelado'
    )
  }

  if (isLoading) {
    return <AgendaSkeleton />
  }

  const weekStart = formatDate(weekDays[0], 'd MMM')
  const weekEnd = formatDate(weekDays[6], 'd MMM yyyy')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
          <span className="text-muted-foreground">
            {weekStart} - {weekEnd}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={goNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-4 flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setViewMode('list')
              }}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowNewAppointment(true)} className="ml-4">
            Nuevo turno
          </Button>
        </div>
      </div>

      {/* Professional Schedules Info */}
      <div className="flex items-center gap-2 mb-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground">
              <Clock className="h-4 w-4" />
              Ver horarios de atención
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4 border-b bg-muted/30">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Horarios de los Profesionales
              </h4>
            </div>
            <div className="p-4 space-y-4">
              {activeKinesiologos.map((k, index) => {
                const horario = getHorarioByKinesiologo(k.dni)
                return (
                  <div key={k.dni} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        KINESIOLOGO_COLORS[index % KINESIOLOGO_COLORS.length].split(' ')[0]
                      )} />
                      <span className="text-sm font-bold">Lic. {k.nombre} {k.apellido}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1 pl-4 border-l ml-1">
                      {horario?.disponibilidad.map(d => (
                        <div key={d.dia} className="flex justify-between text-[11px] text-muted-foreground">
                          <span className="w-16">{d.dia}</span>
                          <span className="font-medium text-foreground">{d.horaInicio} - {d.horaFin}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>


      {/* Calendar Grid */}
      {viewMode === 'week' ? (
        <div className="border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col h-[750px]">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-muted/10 overflow-y-auto flex-1">
            {/* Header row 1: Hora and Days */}
            <div
              className="bg-muted p-2 border-b border-r text-center text-xs font-bold text-muted-foreground sticky left-0 top-0 z-30 flex items-center justify-center h-16"
            >
              Hora
            </div>
            {weekDays.map(day => (
              <div
                key={`day-header-${formatDate(day)}`}
                className={cn(
                  'p-2 border-b border-r text-center sticky top-0 z-20 h-16 flex flex-col justify-center',
                  isTodayDate(day) ? 'bg-primary/5' : 'bg-muted'
                )}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {getDayNameCapitalized(day)}
                </div>
                <div className={cn(
                  'text-lg font-bold leading-none',
                  isTodayDate(day) ? 'text-primary' : 'text-foreground'
                )}>
                  {formatDate(day, 'd')}
                </div>
              </div>
            ))}

            {/* Time slots */}
            {Array.from({ length: 24 }, (_, hour) => {
              const timeStr = `${hour.toString().padStart(2, '0')}:00`
              if (hour < 8 || hour > 20) return null

              return (
                <div key={hour} className="contents">
                  <div className="p-2 border-b border-r text-center text-sm font-medium text-muted-foreground bg-muted sticky left-0 z-20">
                    {timeStr}
                  </div>
                  {weekDays.map(day => {
                    const dayName = getDayNameCapitalized(day)
                    const fecha = formatDate(day)

                    // A slot is "working" if at least one selected professional works then
                    const availableProfs = filteredKinesiologos.filter(k => {
                      const hours = getKinesiologoHours(k.dni, dayName)
                      return hours && hour >= parseInt(hours.start.split(':')[0]) && hour < parseInt(hours.end.split(':')[0])
                    })

                    const isWorking = availableProfs.length > 0
                    const turnosInSlot = getTurnosForSlotUniversal(fecha, timeStr)
                    const isPast = isPastDateTime(day, timeStr)

                    // Get professionals who are working but NOT booked
                    const freeProfs = availableProfs.filter(
                      ap => !turnosInSlot.some(t => t.dniKinesiologo === ap.dni)
                    )

                    return (
                      <div
                        key={`${fecha}-${hour}`}
                        className={cn(
                          'p-1 border-b border-r min-h-[140px] transition-all relative flex flex-col',
                          (!isWorking || (isPast && turnosInSlot.length === 0)) && 'bg-muted/30 bg-diagonal-stripes cursor-not-allowed',
                          isWorking && !isPast && 'bg-card hover:bg-muted/10 cursor-pointer group',
                          isTodayDate(day) && isWorking && !isPast && 'bg-primary/5'
                        )}
                        onClick={() => isWorking && !isPast && handleSlotClickUniversal(fecha, timeStr)}
                      >
                        <div className="flex flex-col gap-1.5 flex-1 pb-2">
                          {turnosInSlot.map((turno) => {
                            const prof = activeKinesiologos.find(k => k.dni === turno.dniKinesiologo)
                            const profIndex = activeKinesiologos.findIndex(k => k.dni === turno.dniKinesiologo)

                            return (
                              <div
                                key={turno.id}
                                className={cn(
                                  'p-1.5 rounded text-[10px] relative z-10 border shadow-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer',
                                  KINESIOLOGO_COLORS[profIndex % KINESIOLOGO_COLORS.length],
                                  isPast ? 'opacity-60' : ''
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedTurno(turno)
                                }}
                              >
                                <div className="font-bold truncate flex justify-between items-center gap-1">
                                  <span className="truncate">
                                    {getPacienteByDni(turno.dniPaciente)?.nombre}
                                  </span>
                                  <span className="text-[8px] font-normal opacity-70 whitespace-nowrap">{turno.hora}</span>
                                </div>
                                <div className="truncate text-[9px] opacity-90 flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                  {prof?.apellido}
                                </div>
                              </div>
                            )
                          })}

                          {/* Available Professionals (smaller if there are already appointments) */}
                          {isWorking && !isPast && (
                            <div className={cn(
                              "flex flex-col gap-1 mt-1",
                              turnosInSlot.length > 0 && "border-t border-dashed pt-1"
                            )}>
                              <div className="flex flex-wrap gap-1">
                                {freeProfs.map((p) => {
                                  const realIdx = activeKinesiologos.findIndex(ak => ak.dni === p.dni)
                                  return (
                                    <span
                                      key={p.dni}
                                      className={cn(
                                        "px-2 py-1 rounded text-[8px] font-bold border bg-background/50 mb-1.5",
                                        KINESIOLOGO_COLORS[realIdx % KINESIOLOGO_COLORS.length]
                                      )}
                                    >
                                      {p.apellido}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Explicit Add Space at the Bottom */}
                        {isWorking && !isPast && (
                          <div className="mt-4 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 rounded border border-dashed border-primary/20 text-[9px] text-primary/60 font-medium">
                            <Plus className="h-3 w-3 mr-1" /> Nuevo turno
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <ListView
          weekDays={weekDays}
          filteredKinesiologos={filteredKinesiologos}
          turnos={turnos}
          onTurnoClick={setSelectedTurno}
          getPacienteByDni={getPacienteByDni}
        />
      )}

      {/* Appointment Detail Dialog */}
      {selectedTurno && (
        <AppointmentDetail
          turno={selectedTurno}
          open={!!selectedTurno}
          onOpenChange={(open) => !open && setSelectedTurno(null)}
          onReschedule={(t) => {
            setSelectedTurno(null)
            setReschedulingTurno(t)
          }}
        />
      )}

      {/* Immediate payment after wizard: open detail for newly created turno */}
      {immediatePaymentTurno && (
        <AppointmentDetail
          turno={immediatePaymentTurno}
          open={true}
          onOpenChange={(open) => { if (!open) setImmediatePaymentTurno(null) }}
          onReschedule={(t) => {
            setImmediatePaymentTurno(null)
            setReschedulingTurno(t)
          }}
        />
      )}

      {/* New Appointment Wizard / Reschedule Wizard */}
      {(showNewAppointment || reschedulingTurno) && (
        <NewAppointmentWizard
          open={showNewAppointment || !!reschedulingTurno}
          onOpenChange={(open) => {
            if (!open) {
              setShowNewAppointment(false)
              setPreselectedSlot(null)
              setReschedulingTurno(null)
            }
          }}
          preselectedSlot={preselectedSlot}
          turnoToReschedule={reschedulingTurno}
          onNeedsImmediatePayment={(turno) => setImmediatePaymentTurno(turno)}
        />
      )}
    </div>
  )
}

interface ListViewProps {
  weekDays: Date[]
  filteredKinesiologos: Kinesiologo[]
  turnos: Turno[]
  onTurnoClick: (turno: Turno) => void
  getPacienteByDni: (dni: string) => any
}

function ListView({ weekDays, filteredKinesiologos, turnos, onTurnoClick, getPacienteByDni }: ListViewProps) {
  const weekTurnos = turnos.filter(t => {
    const fecha = t.fecha
    return weekDays.some(d => formatDate(d) === fecha) &&
      filteredKinesiologos.some(k => k.dni === t.dniKinesiologo) &&
      t.estado !== 'cancelado'
  }).sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha)
    return a.hora.localeCompare(b.hora)
  })

  if (weekTurnos.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No hay turnos esta semana"
        description="Hacé clic en un horario disponible en la vista semanal para agendar un nuevo turno."
      />
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Hora</th>
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Paciente</th>
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Profesional</th>
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tratamiento</th>
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
          </tr>
        </thead>
        <tbody>
          {weekTurnos.map(turno => {
            const paciente = getPacienteByDni(turno.dniPaciente)
            const isPast = isPastDate(turno.fecha)

            return (
              <tr
                key={turno.id}
                className={cn(
                  'border-t border-border hover:bg-muted/50 cursor-pointer transition-colors',
                  isPast && 'opacity-50'
                )}
                onClick={() => onTurnoClick(turno)}
              >
                <td className="p-3 text-sm">{formatDate(turno.fecha, 'EEE d MMM')}</td>
                <td className="p-3 text-sm font-medium">{turno.hora}</td>
                <td className="p-3 text-sm">{paciente?.nombre} {paciente?.apellido}</td>
                <td className="p-3 text-sm">{filteredKinesiologos.find(k => k.dni === turno.dniKinesiologo)?.nombre}</td>
                <td className="p-3 text-sm">{turno.tratamiento}</td>
                <td className="p-3">
                  <Badge variant={
                    turno.estado === 'confirmado' ? 'default' :
                      turno.estado === 'pendiente' ? 'secondary' : 'destructive'
                  }>
                    {turno.estado === 'pendiente' && 'Pendiente'}
                    {turno.estado === 'confirmado' && 'Confirmado'}
                    {turno.estado === 'cancelado' && 'Cancelado'}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
