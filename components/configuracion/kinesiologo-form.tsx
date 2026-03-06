'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Plus, X, Check } from 'lucide-react'
import { useData } from '@/lib/data-context'
import type { Kinesiologo, Horario, DisponibilidadDia } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DIAS_SEMANA } from '@/lib/date-utils'

interface KinesiologoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kinesiologo?: Kinesiologo | null
}

const ESPECIALIDADES_DISPONIBLES = [
  'Neurorrehabilitación',
  'Osteopatía',
  'Movimiento Eficiente',
  'Calor-Frío',
  'Gerontokinesiología',
  'Kinesiología Deportiva',
  'Rehabilitación Respiratoria'
]

export function KinesiologoForm({ open, onOpenChange, kinesiologo }: KinesiologoFormProps) {
  const { obrasSociales, saveKinesiologo, saveHorario, getHorarioByKinesiologo, getKinesiologoByDni } = useData()
  
  const isEditing = !!kinesiologo
  
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    especialidades: [] as string[],
    obrasSociales: [] as string[],
    activo: true
  })
  
  const [horarios, setHorarios] = useState<DisponibilidadDia[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (kinesiologo) {
      setFormData({
        dni: kinesiologo.dni,
        nombre: kinesiologo.nombre,
        apellido: kinesiologo.apellido,
        telefono: kinesiologo.telefono,
        email: kinesiologo.email,
        especialidades: kinesiologo.especialidades,
        obrasSociales: kinesiologo.obrasSociales,
        activo: kinesiologo.activo
      })
      
      const existingHorario = getHorarioByKinesiologo(kinesiologo.dni)
      if (existingHorario) {
        setHorarios(existingHorario.disponibilidad)
      }
    }
  }, [kinesiologo, getHorarioByKinesiologo])

  const toggleEspecialidad = (esp: string) => {
    setFormData(d => ({
      ...d,
      especialidades: d.especialidades.includes(esp)
        ? d.especialidades.filter(e => e !== esp)
        : [...d.especialidades, esp]
    }))
  }

  const toggleObraSocial = (rnos: string) => {
    setFormData(d => ({
      ...d,
      obrasSociales: d.obrasSociales.includes(rnos)
        ? d.obrasSociales.filter(r => r !== rnos)
        : [...d.obrasSociales, rnos]
    }))
  }

  const addHorario = (dia: string) => {
    if (horarios.some(h => h.dia === dia)) return
    setHorarios([...horarios, { dia, horaInicio: '09:00', horaFin: '14:00' }])
  }

  const removeHorario = (dia: string) => {
    setHorarios(horarios.filter(h => h.dia !== dia))
  }

  const updateHorario = (dia: string, field: 'horaInicio' | 'horaFin', value: string) => {
    setHorarios(horarios.map(h => 
      h.dia === dia ? { ...h, [field]: value } : h
    ))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.dni || !/^\d{7,8}$/.test(formData.dni)) {
      newErrors.dni = 'DNI inválido (7-8 dígitos)'
    }
    if (!isEditing && getKinesiologoByDni(formData.dni)) {
      newErrors.dni = 'Ya existe un kinesiólogo con este DNI'
    }
    if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio'
    if (!formData.apellido) newErrors.apellido = 'El apellido es obligatorio'
    if (!formData.telefono || formData.telefono.length !== 10) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos'
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (formData.especialidades.length === 0) {
      newErrors.especialidades = 'Selecciona al menos una especialidad'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    
    const kinesiologoData: Kinesiologo = {
      dni: formData.dni,
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      email: formData.email,
      especialidades: formData.especialidades,
      obrasSociales: formData.obrasSociales,
      activo: formData.activo
    }
    
    saveKinesiologo(kinesiologoData)
    
    if (horarios.length > 0) {
      const horarioData: Horario = {
        dniKinesiologo: formData.dni,
        disponibilidad: horarios
      }
      saveHorario(horarioData)
    }
    
    toast.success(isEditing ? 'Kinesiólogo actualizado' : 'Kinesiólogo agregado')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar kinesiólogo' : 'Nuevo kinesiólogo'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>DNI *</Label>
              <Input
                value={formData.dni}
                onChange={(e) => setFormData(d => ({ ...d, dni: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                disabled={isEditing}
                className={errors.dni ? 'border-destructive' : ''}
              />
              {errors.dni && <p className="text-xs text-destructive">{errors.dni}</p>}
            </div>
            <div className="space-y-2">
              <Label>Teléfono *</Label>
              <Input
                value={formData.telefono}
                onChange={(e) => setFormData(d => ({ ...d, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                className={errors.telefono ? 'border-destructive' : ''}
              />
              {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
            </div>
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData(d => ({ ...d, nombre: e.target.value }))}
                className={errors.nombre ? 'border-destructive' : ''}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input
                value={formData.apellido}
                onChange={(e) => setFormData(d => ({ ...d, apellido: e.target.value }))}
                className={errors.apellido ? 'border-destructive' : ''}
              />
              {errors.apellido && <p className="text-xs text-destructive">{errors.apellido}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(d => ({ ...d, email: e.target.value }))}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          {/* Especialidades */}
          <div className="space-y-2">
            <Label>Especialidades *</Label>
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES_DISPONIBLES.map(esp => (
                <Badge
                  key={esp}
                  variant={formData.especialidades.includes(esp) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleEspecialidad(esp)}
                >
                  {formData.especialidades.includes(esp) && <Check className="h-3 w-3 mr-1" />}
                  {esp}
                </Badge>
              ))}
            </div>
            {errors.especialidades && <p className="text-xs text-destructive">{errors.especialidades}</p>}
          </div>

          {/* Obras Sociales */}
          <div className="space-y-2">
            <Label>Obras sociales que atiende</Label>
            <div className="flex flex-wrap gap-2">
              {obrasSociales.map(os => (
                <Badge
                  key={os.rnos}
                  variant={formData.obrasSociales.includes(os.rnos) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleObraSocial(os.rnos)}
                >
                  {formData.obrasSociales.includes(os.rnos) && <Check className="h-3 w-3 mr-1" />}
                  {os.sigla}
                </Badge>
              ))}
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-2">
            <Label>Disponibilidad horaria</Label>
            <div className="space-y-2">
              {DIAS_SEMANA.slice(0, 6).map(dia => {
                const horario = horarios.find(h => h.dia === dia)
                
                return (
                  <div key={dia} className="flex items-center gap-4">
                    <div className="w-24">
                      <Checkbox
                        checked={!!horario}
                        onCheckedChange={(checked) => {
                          if (checked) addHorario(dia)
                          else removeHorario(dia)
                        }}
                      />
                      <span className="ml-2 text-sm">{dia}</span>
                    </div>
                    {horario && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={horario.horaInicio}
                          onChange={(e) => updateHorario(dia, 'horaInicio', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">a</span>
                        <Input
                          type="time"
                          value={horario.horaFin}
                          onChange={(e) => updateHorario(dia, 'horaFin', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label>Estado activo</Label>
              <p className="text-sm text-muted-foreground">Los profesionales inactivos no aparecen en la agenda</p>
            </div>
            <Switch
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData(d => ({ ...d, activo: checked }))}
            />
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} className="w-full">
            <Check className="h-4 w-4 mr-2" />
            {isEditing ? 'Guardar cambios' : 'Agregar kinesiólogo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
