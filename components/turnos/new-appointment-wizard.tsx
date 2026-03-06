'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, User, Calendar, Stethoscope, X } from 'lucide-react'
import { useData } from '@/lib/data-context'
import { formatDate, formatDateLong, getDayNameCapitalized, generateTimeSlots, DIAS_SEMANA } from '@/lib/date-utils'
import { generateId } from '@/lib/storage'
import type { Kinesiologo, Paciente, Turno } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { addDays, startOfWeek, format } from 'date-fns'

interface NewAppointmentWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedSlot?: {
    kinesiologo: Kinesiologo
    fecha: string
    hora: string
  } | null
}

const STEPS = [
  { id: 1, label: 'Profesional', icon: Stethoscope },
  { id: 2, label: 'Paciente', icon: User },
  { id: 3, label: 'Turno', icon: Calendar },
  { id: 4, label: 'Confirmación', icon: Check },
]

export function NewAppointmentWizard({ open, onOpenChange, preselectedSlot }: NewAppointmentWizardProps) {
  const { 
    activeKinesiologos, 
    getHorarioByKinesiologo, 
    pacientes, 
    getPacienteByDni, 
    savePaciente,
    obrasSociales,
    getObraSocialByRnos,
    tratamientos,
    getTratamientoByNombre,
    turnos,
    saveTurno,
    saveCobro
  } = useData()
  
  const [currentStep, setCurrentStep] = useState(1)
  
  // Step 1: Professional
  const [selectedKinesiologo, setSelectedKinesiologo] = useState<Kinesiologo | null>(null)
  const [selectedTratamiento, setSelectedTratamiento] = useState<string>('')
  
  // Step 2: Patient
  const [dniSearch, setDniSearch] = useState('')
  const [foundPaciente, setFoundPaciente] = useState<Paciente | null>(null)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [newPatient, setNewPatient] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    fechaNacimiento: '',
    obraSocialRnos: '',
    numeroAfiliado: ''
  })
  const [patientErrors, setPatientErrors] = useState<Record<string, string>>({})
  
  // Step 3: Date/Time
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [ordenMedica, setOrdenMedica] = useState('')
  const [dateViewStart, setDateViewStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  // Compatibility check
  const [obraSocialCompatible, setObraSocialCompatible] = useState<boolean | null>(null)
  
  // Initialize with preselected slot
  useEffect(() => {
    if (preselectedSlot && open) {
      setSelectedKinesiologo(preselectedSlot.kinesiologo)
      setSelectedDate(preselectedSlot.fecha)
      setSelectedTime(preselectedSlot.hora)
      setCurrentStep(1)
    }
  }, [preselectedSlot, open])

  // Check obra social compatibility
  useEffect(() => {
    if (selectedKinesiologo && foundPaciente?.obraSocialRnos) {
      const isCompatible = selectedKinesiologo.obrasSociales.includes(foundPaciente.obraSocialRnos)
      setObraSocialCompatible(isCompatible)
    } else {
      setObraSocialCompatible(null)
    }
  }, [selectedKinesiologo, foundPaciente])

  const handleDniSearch = (dni: string) => {
    setDniSearch(dni.replace(/\D/g, '').slice(0, 8))
    if (dni.length >= 7) {
      const found = getPacienteByDni(dni)
      setFoundPaciente(found || null)
      setShowNewPatientForm(!found)
    } else {
      setFoundPaciente(null)
      setShowNewPatientForm(false)
    }
  }

  const validateNewPatient = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!newPatient.nombre || newPatient.nombre.length < 2) {
      errors.nombre = 'El nombre es obligatorio (mínimo 2 caracteres)'
    }
    if (!newPatient.apellido || newPatient.apellido.length < 2) {
      errors.apellido = 'El apellido es obligatorio (mínimo 2 caracteres)'
    }
    if (!newPatient.telefono || newPatient.telefono.length !== 10) {
      errors.telefono = 'El teléfono debe tener 10 dígitos'
    }
    if (!newPatient.fechaNacimiento) {
      errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
    }
    if (newPatient.obraSocialRnos && !newPatient.numeroAfiliado) {
      errors.numeroAfiliado = 'El número de afiliado es obligatorio si tiene obra social'
    }
    
    setPatientErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveNewPatient = () => {
    if (!validateNewPatient()) return
    
    const paciente: Paciente = {
      dni: dniSearch,
      nombre: newPatient.nombre,
      apellido: newPatient.apellido,
      telefono: newPatient.telefono,
      fechaNacimiento: newPatient.fechaNacimiento,
      obraSocialRnos: newPatient.obraSocialRnos || null,
      numeroAfiliado: newPatient.numeroAfiliado || null
    }
    
    savePaciente(paciente)
    setFoundPaciente(paciente)
    setShowNewPatientForm(false)
    toast.success('Paciente registrado')
  }

  // Get available dates for selected kinesiologo
  const availableDays = useMemo(() => {
    if (!selectedKinesiologo) return []
    const horario = getHorarioByKinesiologo(selectedKinesiologo.dni)
    if (!horario) return []
    return horario.disponibilidad.map(d => d.dia)
  }, [selectedKinesiologo, getHorarioByKinesiologo])

  // Generate calendar dates (4 weeks)
  const calendarDates = useMemo(() => {
    const dates: Date[] = []
    for (let i = 0; i < 28; i++) {
      dates.push(addDays(dateViewStart, i))
    }
    return dates
  }, [dateViewStart])

  // Get available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedKinesiologo || !selectedDate || !selectedTratamiento) return []
    
    const horario = getHorarioByKinesiologo(selectedKinesiologo.dni)
    if (!horario) return []
    
    const dateObj = new Date(selectedDate + 'T00:00:00')
    const dayName = getDayNameCapitalized(dateObj)
    const daySchedule = horario.disponibilidad.find(d => d.dia === dayName)
    if (!daySchedule) return []
    
    const tratamiento = getTratamientoByNombre(selectedTratamiento)
    if (!tratamiento) return []
    
    const allSlots = generateTimeSlots(daySchedule.horaInicio, daySchedule.horaFin, tratamiento.duracionMinutos)
    
    // Filter out booked slots
    const bookedTimes = turnos
      .filter(t => t.fecha === selectedDate && t.dniKinesiologo === selectedKinesiologo.dni && t.estado !== 'cancelado')
      .map(t => t.hora)
    
    return allSlots.map(slot => ({
      time: slot,
      isBooked: bookedTimes.includes(slot)
    }))
  }, [selectedKinesiologo, selectedDate, selectedTratamiento, turnos, getHorarioByKinesiologo, getTratamientoByNombre])

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedKinesiologo && !!selectedTratamiento
      case 2:
        return !!foundPaciente
      case 3:
        const needsOrdenMedica = foundPaciente?.obraSocialRnos && obraSocialCompatible
        return !!selectedDate && !!selectedTime && !!motivoConsulta && (!needsOrdenMedica || !!ordenMedica)
      default:
        return true
    }
  }

  const handleConfirm = () => {
    if (!selectedKinesiologo || !foundPaciente || !selectedDate || !selectedTime) return
    
    const tratamiento = getTratamientoByNombre(selectedTratamiento)
    const isParticular = !foundPaciente.obraSocialRnos || !obraSocialCompatible
    
    const turno: Turno = {
      id: generateId(),
      dniPaciente: foundPaciente.dni,
      dniKinesiologo: selectedKinesiologo.dni,
      tratamiento: selectedTratamiento,
      fecha: selectedDate,
      hora: selectedTime,
      motivoConsulta,
      ordenMedica: ordenMedica || null,
      estado: isParticular ? 'pendiente' : 'confirmado',
      esParticular: isParticular,
      createdAt: new Date().toISOString()
    }
    
    saveTurno(turno)
    
    toast.success('Turno agendado', {
      description: `${foundPaciente.nombre} ${foundPaciente.apellido} - ${formatDateLong(selectedDate)} a las ${selectedTime}`
    })
    
    // Reset and close
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setCurrentStep(1)
    setSelectedKinesiologo(null)
    setSelectedTratamiento('')
    setDniSearch('')
    setFoundPaciente(null)
    setShowNewPatientForm(false)
    setNewPatient({
      nombre: '',
      apellido: '',
      telefono: '',
      fechaNacimiento: '',
      obraSocialRnos: '',
      numeroAfiliado: ''
    })
    setPatientErrors({})
    setSelectedDate('')
    setSelectedTime('')
    setMotivoConsulta('')
    setOrdenMedica('')
    setObraSocialCompatible(null)
  }

  const tratamiento = getTratamientoByNombre(selectedTratamiento)
  const obraSocial = foundPaciente?.obraSocialRnos ? getObraSocialByRnos(foundPaciente.obraSocialRnos) : null
  const isParticular = !foundPaciente?.obraSocialRnos || !obraSocialCompatible

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o) }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo turno</DialogTitle>
          <DialogDescription>Completá los pasos para agendar un turno</DialogDescription>
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isComplete = currentStep > step.id
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  isActive && 'border-primary bg-primary text-primary-foreground',
                  isComplete && 'border-primary bg-primary/10 text-primary',
                  !isActive && !isComplete && 'border-muted-foreground/30 text-muted-foreground'
                )}>
                  {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={cn(
                  'ml-2 text-sm font-medium hidden sm:inline',
                  isActive && 'text-foreground',
                  !isActive && 'text-muted-foreground'
                )}>
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    'w-8 h-0.5 mx-2',
                    isComplete ? 'bg-primary' : 'bg-muted-foreground/30'
                  )} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Step 1: Select Professional */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Seleccionar profesional</Label>
                <p className="text-sm text-muted-foreground">Elegí el kinesiólogo que atenderá al paciente</p>
              </div>
              
              <div className="grid gap-3">
                {activeKinesiologos.map(k => (
                  <div
                    key={k.dni}
                    className={cn(
                      'p-4 rounded-lg border-2 cursor-pointer transition-all',
                      selectedKinesiologo?.dni === k.dni 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => setSelectedKinesiologo(k)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        {k.nombre[0]}{k.apellido[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Lic. {k.nombre} {k.apellido}</p>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {k.especialidades.map(esp => (
                            <Badge key={esp} variant="secondary" className="text-xs">{esp}</Badge>
                          ))}
                        </div>
                      </div>
                      {selectedKinesiologo?.dni === k.dni && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedKinesiologo && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Tratamiento</Label>
                  <Select value={selectedTratamiento} onValueChange={setSelectedTratamiento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tratamiento" />
                    </SelectTrigger>
                    <SelectContent>
                      {tratamientos.filter(t => 
                        selectedKinesiologo.especialidades.includes(t.nombre) || t.nombre === 'Entrevista inicial'
                      ).map(t => (
                        <SelectItem key={t.nombre} value={t.nombre}>
                          {t.nombre} - ${t.precioPorSesion.toLocaleString('es-AR')} ({t.duracionMinutos} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Patient */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Buscar paciente por DNI</Label>
                <p className="text-sm text-muted-foreground">Ingresá el DNI del paciente para buscarlo</p>
              </div>
              
              <div className="space-y-2">
                <Label>DNI *</Label>
                <Input
                  value={dniSearch}
                  onChange={(e) => handleDniSearch(e.target.value)}
                  placeholder="Ej: 30000001"
                  maxLength={8}
                />
              </div>
              
              {foundPaciente && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Paciente encontrado</span>
                  </div>
                  <p className="font-medium">{foundPaciente.nombre} {foundPaciente.apellido}</p>
                  <p className="text-sm text-muted-foreground">DNI: {foundPaciente.dni}</p>
                  {obraSocial && (
                    <Badge variant="outline" className="mt-2">{obraSocial.nombre}</Badge>
                  )}
                  
                  {obraSocialCompatible === true && (
                    <div className="mt-3 p-2 bg-success/10 rounded flex items-center gap-2 text-success text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Cobertura compatible con el profesional
                    </div>
                  )}
                  
                  {obraSocialCompatible === false && (
                    <div className="mt-3 p-2 bg-warning/10 rounded flex items-center gap-2 text-warning text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Lic. {selectedKinesiologo?.apellido} no atiende {obraSocial?.sigla}. El turno se registrará como particular.
                    </div>
                  )}
                </div>
              )}
              
              {showNewPatientForm && dniSearch.length >= 7 && (
                <div className="p-4 rounded-lg border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Paciente no encontrado</p>
                      <p className="text-sm text-muted-foreground">Completá los datos para registrarlo</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewPatientForm(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre *</Label>
                      <Input
                        value={newPatient.nombre}
                        onChange={(e) => setNewPatient(p => ({ ...p, nombre: e.target.value }))}
                        className={patientErrors.nombre ? 'border-destructive' : ''}
                      />
                      {patientErrors.nombre && (
                        <p className="text-xs text-destructive">{patientErrors.nombre}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Apellido *</Label>
                      <Input
                        value={newPatient.apellido}
                        onChange={(e) => setNewPatient(p => ({ ...p, apellido: e.target.value }))}
                        className={patientErrors.apellido ? 'border-destructive' : ''}
                      />
                      {patientErrors.apellido && (
                        <p className="text-xs text-destructive">{patientErrors.apellido}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono *</Label>
                      <Input
                        value={newPatient.telefono}
                        onChange={(e) => setNewPatient(p => ({ ...p, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        placeholder="3884000000"
                        className={patientErrors.telefono ? 'border-destructive' : ''}
                      />
                      {patientErrors.telefono && (
                        <p className="text-xs text-destructive">{patientErrors.telefono}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de nacimiento *</Label>
                      <Input
                        type="date"
                        value={newPatient.fechaNacimiento}
                        onChange={(e) => setNewPatient(p => ({ ...p, fechaNacimiento: e.target.value }))}
                        className={patientErrors.fechaNacimiento ? 'border-destructive' : ''}
                      />
                      {patientErrors.fechaNacimiento && (
                        <p className="text-xs text-destructive">{patientErrors.fechaNacimiento}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Obra social</Label>
                      <Select 
                        value={newPatient.obraSocialRnos} 
                        onValueChange={(v) => setNewPatient(p => ({ ...p, obraSocialRnos: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sin obra social" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin obra social</SelectItem>
                          {obrasSociales.map(os => (
                            <SelectItem key={os.rnos} value={os.rnos}>{os.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newPatient.obraSocialRnos && (
                      <div className="space-y-2">
                        <Label>Número de afiliado *</Label>
                        <Input
                          value={newPatient.numeroAfiliado}
                          onChange={(e) => setNewPatient(p => ({ ...p, numeroAfiliado: e.target.value }))}
                          className={patientErrors.numeroAfiliado ? 'border-destructive' : ''}
                        />
                        {patientErrors.numeroAfiliado && (
                          <p className="text-xs text-destructive">{patientErrors.numeroAfiliado}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={handleSaveNewPatient} className="w-full">
                    Guardar paciente y continuar
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date/Time */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Elegir fecha y hora</Label>
                <p className="text-sm text-muted-foreground">Seleccioná un día y horario disponible</p>
              </div>
              
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateViewStart(d => addDays(d, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(dateViewStart, 'MMMM yyyy')}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateViewStart(d => addDays(d, 7))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
                {calendarDates.slice(0, 28).map(date => {
                  const dateStr = formatDate(date)
                  const dayName = getDayNameCapitalized(date)
                  const isAvailable = availableDays.includes(dayName) && date >= new Date()
                  const isSelected = selectedDate === dateStr
                  
                  return (
                    <button
                      key={dateStr}
                      disabled={!isAvailable}
                      onClick={() => { setSelectedDate(dateStr); setSelectedTime('') }}
                      className={cn(
                        'p-2 text-sm rounded-md transition-all',
                        isAvailable && !isSelected && 'hover:bg-primary/10 cursor-pointer',
                        isSelected && 'bg-primary text-primary-foreground',
                        !isAvailable && 'text-muted-foreground/30 cursor-not-allowed'
                      )}
                    >
                      {format(date, 'd')}
                    </button>
                  )
                })}
              </div>
              
              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Horarios disponibles - {formatDateLong(selectedDate)}</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTimeSlots.map(slot => (
                      <button
                        key={slot.time}
                        disabled={slot.isBooked}
                        onClick={() => setSelectedTime(slot.time)}
                        className={cn(
                          'px-3 py-2 text-sm rounded-full border transition-all',
                          selectedTime === slot.time && 'bg-primary text-primary-foreground border-primary',
                          !slot.isBooked && selectedTime !== slot.time && 'hover:border-primary cursor-pointer',
                          slot.isBooked && 'line-through text-muted-foreground/50 cursor-not-allowed'
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  {availableTimeSlots.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay horarios disponibles para este día</p>
                  )}
                </div>
              )}
              
              {/* Motivo y Orden médica */}
              {selectedTime && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Motivo de consulta *</Label>
                    <Textarea
                      value={motivoConsulta}
                      onChange={(e) => setMotivoConsulta(e.target.value)}
                      placeholder="Describí el motivo de la consulta"
                      rows={2}
                    />
                  </div>
                  
                  {foundPaciente?.obraSocialRnos && obraSocialCompatible && (
                    <div className="space-y-2">
                      <Label>Orden médica *</Label>
                      <Input
                        value={ordenMedica}
                        onChange={(e) => setOrdenMedica(e.target.value)}
                        placeholder="Número / referencia de orden médica"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Confirmar turno</Label>
                <p className="text-sm text-muted-foreground">Revisá los datos antes de confirmar</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Profesional</span>
                  <span className="font-medium">Lic. {selectedKinesiologo?.nombre} {selectedKinesiologo?.apellido}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paciente</span>
                  <span className="font-medium">{foundPaciente?.nombre} {foundPaciente?.apellido}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">DNI</span>
                  <span>{foundPaciente?.dni}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cobertura</span>
                  <Badge variant={isParticular ? 'secondary' : 'outline'}>
                    {isParticular ? 'Particular' : obraSocial?.sigla}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="font-medium">{formatDateLong(selectedDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hora</span>
                  <span className="font-medium">{selectedTime} ({tratamiento?.duracionMinutos} min)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tratamiento</span>
                  <span className="font-medium">{selectedTratamiento}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Precio</span>
                    <span className="text-xl font-bold text-primary">
                      ${tratamiento?.precioPorSesion.toLocaleString('es-AR')}
                    </span>
                  </div>
                  {isParticular && (
                    <p className="text-sm text-warning mt-2">
                      Debe abonarse 48hs antes para confirmar el turno
                    </p>
                  )}
                  {!isParticular && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Coseguro estimado según obra social
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Corregir
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(s => s + 1)}
              disabled={!canProceed(currentStep)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleConfirm}>
              Confirmar turno
              <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
