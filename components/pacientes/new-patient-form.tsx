'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, AlertCircle, CheckCircle } from 'lucide-react'
import { useData } from '@/lib/data-context'
import type { Paciente } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface NewPatientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  dni: string
  nombre: string
  apellido: string
  telefono: string
  fechaNacimiento: string
  obraSocialRnos: string
  numeroAfiliado: string
}

interface FieldState {
  value: string
  touched: boolean
  valid: boolean
  error: string
}

export function NewPatientForm({ open, onOpenChange }: NewPatientFormProps) {
  const { obrasSociales, getPacienteByDni, savePaciente } = useData()

  const [formData, setFormData] = useState<FormData>({
    dni: '',
    nombre: '',
    apellido: '',
    telefono: '',
    fechaNacimiento: '',
    obraSocialRnos: '',
    numeroAfiliado: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [dniExists, setDniExists] = useState(false)

  // Check for duplicate DNI
  useEffect(() => {
    if (formData.dni.length >= 7) {
      const existing = getPacienteByDni(formData.dni)
      setDniExists(!!existing)
    } else {
      setDniExists(false)
    }
  }, [formData.dni, getPacienteByDni])

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'dni':
        if (!value) return 'Este campo es obligatorio'
        if (!/^\d{7,8}$/.test(value)) return 'El DNI debe tener 7-8 dígitos'
        if (dniExists) return 'Ya existe un paciente con este DNI'
        return ''
      case 'nombre':
      case 'apellido':
        if (!value) return 'Este campo es obligatorio'
        if (value.length < 2) return 'Mínimo 2 caracteres'
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras'
        return ''
      case 'telefono':
        if (!value) return 'Este campo es obligatorio'
        if (!/^\d{10}$/.test(value)) return 'El teléfono debe tener 10 dígitos'
        return ''
      case 'fechaNacimiento':
        if (!value) return 'Este campo es obligatorio'
        const date = new Date(value)
        const now = new Date()
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        if (date >= now) return 'La fecha debe ser en el pasado'
        if (date > oneYearAgo) return 'El paciente debe tener al menos 1 año'
        return ''
      case 'numeroAfiliado':
        if (formData.obraSocialRnos && !value) return 'Obligatorio si tiene obra social'
        if (value && value.length > 20) return 'Máximo 20 caracteres'
        return ''
      default:
        return ''
    }
  }

  const handleBlur = (field: string) => {
    setTouched(t => ({ ...t, [field]: true }))
    const error = validateField(field, formData[field as keyof FormData])
    setErrors(e => ({ ...e, [field]: error }))
  }

  const handleChange = (field: string, value: string) => {
    let processedValue = value

    if (field === 'dni' || field === 'telefono') {
      processedValue = value.replace(/\D/g, '')
    }
    if (field === 'nombre' || field === 'apellido') {
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    }
    if (field === 'dni') {
      processedValue = processedValue.slice(0, 8)
    }
    if (field === 'telefono') {
      processedValue = processedValue.slice(0, 10)
    }

    setFormData(d => ({ ...d, [field]: processedValue }))

    // Real-time validation for format errors
    if (touched[field]) {
      const error = validateField(field, processedValue)
      setErrors(e => ({ ...e, [field]: error }))
    }
  }

  const handleObraSocialChange = (value: string) => {
    const obraSocialRnos = value === 'particular' ? '' : value
    setFormData(d => ({
      ...d,
      obraSocialRnos: obraSocialRnos,
      numeroAfiliado: obraSocialRnos ? d.numeroAfiliado : ''
    }))
  }

  const isFormValid = (): boolean => {
    const requiredFields = ['dni', 'nombre', 'apellido', 'telefono', 'fechaNacimiento']
    if (formData.obraSocialRnos) {
      requiredFields.push('numeroAfiliado')
    }

    for (const field of requiredFields) {
      const error = validateField(field, formData[field as keyof FormData])
      if (error) return false
    }

    return !dniExists
  }

  const handleSubmit = () => {
    // Touch all fields
    const allTouched: Record<string, boolean> = {}
    const allErrors: Record<string, string> = {}

    Object.keys(formData).forEach(field => {
      allTouched[field] = true
      allErrors[field] = validateField(field, formData[field as keyof FormData])
    })

    setTouched(allTouched)
    setErrors(allErrors)

    if (!isFormValid()) return

    const paciente: Paciente = {
      dni: formData.dni,
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      fechaNacimiento: formData.fechaNacimiento,
      obraSocialRnos: formData.obraSocialRnos || null,
      numeroAfiliado: formData.numeroAfiliado || null
    }

    savePaciente(paciente)
    toast.success('Paciente registrado', {
      description: `${paciente.nombre} ${paciente.apellido} ha sido agregado`
    })

    // Reset and close
    setFormData({
      dni: '',
      nombre: '',
      apellido: '',
      telefono: '',
      fechaNacimiento: '',
      obraSocialRnos: '',
      numeroAfiliado: ''
    })
    setErrors({})
    setTouched({})
    onOpenChange(false)
  }

  const getFieldState = (field: string) => {
    const isTouched = touched[field]
    const error = errors[field]
    const value = formData[field as keyof FormData]

    return {
      showError: isTouched && !!error,
      showSuccess: isTouched && !error && !!value,
      error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Nuevo paciente</DialogTitle>
          <DialogDescription>Completá los datos para registrar un nuevo paciente</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* DNI */}
          <div className="space-y-2">
            <Label>DNI *</Label>
            <div className="relative">
              <Input
                value={formData.dni}
                onChange={(e) => handleChange('dni', e.target.value)}
                onBlur={() => handleBlur('dni')}
                placeholder="Ej: 30000001"
                className={cn(
                  getFieldState('dni').showError && 'border-destructive focus-visible:ring-destructive',
                  getFieldState('dni').showSuccess && 'border-success focus-visible:ring-success'
                )}
              />
              {getFieldState('dni').showSuccess && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
              )}
              {getFieldState('dni').showError && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            {getFieldState('dni').showError && (
              <p className="text-xs text-destructive">{getFieldState('dni').error}</p>
            )}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <div className="relative">
                <Input
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  onBlur={() => handleBlur('nombre')}
                  className={cn(
                    getFieldState('nombre').showError && 'border-destructive',
                    getFieldState('nombre').showSuccess && 'border-success'
                  )}
                />
                {getFieldState('nombre').showSuccess && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                )}
              </div>
              {getFieldState('nombre').showError && (
                <p className="text-xs text-destructive">{getFieldState('nombre').error}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <div className="relative">
                <Input
                  value={formData.apellido}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  onBlur={() => handleBlur('apellido')}
                  className={cn(
                    getFieldState('apellido').showError && 'border-destructive',
                    getFieldState('apellido').showSuccess && 'border-success'
                  )}
                />
                {getFieldState('apellido').showSuccess && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                )}
              </div>
              {getFieldState('apellido').showError && (
                <p className="text-xs text-destructive">{getFieldState('apellido').error}</p>
              )}
            </div>
          </div>

          {/* Teléfono y Fecha de nacimiento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Teléfono *</Label>
              <div className="relative">
                <Input
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  onBlur={() => handleBlur('telefono')}
                  placeholder="3884000000"
                  className={cn(
                    getFieldState('telefono').showError && 'border-destructive',
                    getFieldState('telefono').showSuccess && 'border-success'
                  )}
                />
                {getFieldState('telefono').showSuccess && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                )}
              </div>
              {getFieldState('telefono').showError && (
                <p className="text-xs text-destructive">{getFieldState('telefono').error}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Fecha de nacimiento *</Label>
              <Input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                onBlur={() => handleBlur('fechaNacimiento')}
                className={cn(
                  getFieldState('fechaNacimiento').showError && 'border-destructive',
                  getFieldState('fechaNacimiento').showSuccess && 'border-success'
                )}
              />
              {getFieldState('fechaNacimiento').showError && (
                <p className="text-xs text-destructive">{getFieldState('fechaNacimiento').error}</p>
              )}
            </div>
          </div>

          {/* Obra Social */}
          <div className="space-y-2">
            <Label>Obra social</Label>
            <Select value={formData.obraSocialRnos || 'particular'} onValueChange={handleObraSocialChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sin obra social (particular)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="particular">Sin obra social</SelectItem>
                {obrasSociales.map(os => (
                  <SelectItem key={os.rnos} value={os.rnos}>{os.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Número de afiliado */}
          {formData.obraSocialRnos && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label>Número de afiliado *</Label>
              <div className="relative">
                <Input
                  value={formData.numeroAfiliado}
                  onChange={(e) => handleChange('numeroAfiliado', e.target.value)}
                  onBlur={() => handleBlur('numeroAfiliado')}
                  placeholder="Ej: A-123456"
                  className={cn(
                    getFieldState('numeroAfiliado').showError && 'border-destructive',
                    getFieldState('numeroAfiliado').showSuccess && 'border-success'
                  )}
                />
                {getFieldState('numeroAfiliado').showSuccess && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                )}
              </div>
              {getFieldState('numeroAfiliado').showError && (
                <p className="text-xs text-destructive">{getFieldState('numeroAfiliado').error}</p>
              )}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!isFormValid()}
          >
            <Check className="h-4 w-4 mr-2" />
            Registrar paciente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
