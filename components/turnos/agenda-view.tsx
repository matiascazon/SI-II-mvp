'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, List, Grid3X3, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/lib/data-context'
import { getWeekDays, formatDate, getDayNameCapitalized, isTodayDate, isPastDate, generateTimeSlots, DIAS_SEMANA } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { AgendaSkeleton } from '@/components/ui/loading-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
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
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [preselectedSlot, setPreselectedSlot] = useState<{
    kinesiologo: Kinesiologo
    fecha: string
    hora: string
  } | null>(null)

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])
  
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

  const getTurnosForSlot = (fecha: string, kinesiologo: string, hora: string): Turno[] => {
    return turnos.filter(t => 
      t.fecha === fecha && 
      t.dniKinesiologo === kinesiologo && 
      t.hora === hora &&
      t.estado !== 'cancelado'
    )
  }

  const handleSlotClick = (kinesiologo: Kinesiologo, fecha: string, hora: string) => {
    const existingTurnos = getTurnosForSlot(fecha, kinesiologo.dni, hora)
    if (existingTurnos.length > 0) {
      setSelectedTurno(existingTurnos[0])
    } else {
      setPreselectedSlot({ kinesiologo, fecha, hora })
      setShowNewAppointment(true)
    }
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
              onClick={() => setViewMode('list')}
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

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground mr-2">Filtrar por profesional:</span>
        {activeKinesiologos.map((k, index) => (
          <Badge
            key={k.dni}
            variant={selectedKinesiologos.length === 0 || selectedKinesiologos.includes(k.dni) ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-all',
              selectedKinesiologos.length === 0 || selectedKinesiologos.includes(k.dni) 
                ? KINESIOLOGO_COLORS[index % KINESIOLOGO_COLORS.length]
                : ''
            )}
            onClick={() => toggleKinesiologo(k.dni)}
          >
            {k.nombre} {k.apellido}
          </Badge>
        ))}
        {selectedKinesiologos.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedKinesiologos([])}>
            Mostrar todos
          </Button>
        )}
      </div>

      {/* Calendar Grid */}
      {viewMode === 'week' ? (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="grid" style={{ gridTemplateColumns: `80px repeat(${filteredKinesiologos.length * 7}, 1fr)` }}>
            {/* Header row */}
            <div className="bg-muted p-2 border-b border-r text-center text-sm font-medium text-muted-foreground">
              Hora
            </div>
            {weekDays.map(day => (
              filteredKinesiologos.map((k, kIndex) => (
                <div 
                  key={`${formatDate(day)}-${k.dni}`}
                  className={cn(
                    'p-2 border-b border-r text-center',
                    isTodayDate(day) ? 'bg-primary/5' : 'bg-muted'
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    {getDayNameCapitalized(day)}
                  </div>
                  <div className={cn(
                    'text-lg font-semibold',
                    isTodayDate(day) ? 'text-primary' : 'text-foreground'
                  )}>
                    {formatDate(day, 'd')}
                  </div>
                  <Badge variant="outline" className={cn('text-xs', KINESIOLOGO_COLORS[kIndex % KINESIOLOGO_COLORS.length])}>
                    {k.nombre}
                  </Badge>
                </div>
              ))
            ))}
            
            {/* Time slots */}
            {Array.from({ length: 24 }, (_, hour) => {
              const timeStr = `${hour.toString().padStart(2, '0')}:00`
              if (hour < 7 || hour > 20) return null
              
              return (
                <div key={hour} className="contents">
                  <div className="p-2 border-b border-r text-center text-sm text-muted-foreground bg-muted">
                    {timeStr}
                  </div>
                  {weekDays.map(day => (
                    filteredKinesiologos.map((k, kIndex) => {
                      const dayName = getDayNameCapitalized(day)
                      const workHours = getKinesiologoHours(k.dni, dayName)
                      const fecha = formatDate(day)
                      const isWorking = workHours && 
                        hour >= parseInt(workHours.start.split(':')[0]) && 
                        hour < parseInt(workHours.end.split(':')[0])
                      
                      const turnosInSlot = getTurnosForSlot(fecha, k.dni, timeStr)
                      const turno = turnosInSlot[0]
                      const isPast = isPastDate(day)
                      
                      return (
                        <div
                          key={`${fecha}-${k.dni}-${hour}`}
                          className={cn(
                            'p-1 border-b border-r min-h-[60px] transition-colors',
                            !isWorking && 'bg-muted/50',
                            isWorking && !turno && 'hover:bg-muted cursor-pointer',
                            isPast && 'opacity-50',
                            isTodayDate(day) && 'bg-primary/5'
                          )}
                          onClick={() => isWorking && handleSlotClick(k, fecha, timeStr)}
                        >
                          {turno && (
                            <div 
                              className={cn(
                                'p-2 rounded text-xs h-full',
                                KINESIOLOGO_COLORS[kIndex % KINESIOLOGO_COLORS.length],
                                'border cursor-pointer hover:shadow-md transition-shadow'
                              )}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTurno(turno)
                              }}
                            >
                              <div className="font-medium truncate">
                                {getPacienteByDni(turno.dniPaciente)?.nombre} {getPacienteByDni(turno.dniPaciente)?.apellido}
                              </div>
                              <div className="truncate text-muted-foreground">
                                {turno.tratamiento}
                              </div>
                              <div className="mt-1">
                                {turno.estado === 'pendiente' && (
                                  <span className="inline-flex items-center gap-1 text-yellow-600">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Pendiente
                                  </span>
                                )}
                                {turno.estado === 'confirmado' && (
                                  <span className="inline-flex items-center gap-1 text-green-600">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    Confirmado
                                  </span>
                                )}
                                {turno.estado === 'cancelado' && (
                                  <span className="inline-flex items-center gap-1 text-red-600">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    Cancelado
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ))}
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
        />
      )}

      {/* New Appointment Wizard */}
      {showNewAppointment && (
        <NewAppointmentWizard
          open={showNewAppointment}
          onOpenChange={setShowNewAppointment}
          preselectedSlot={preselectedSlot}
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
