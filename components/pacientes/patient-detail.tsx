'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, CreditCard, User, Pencil, Check, X, Phone, Mail, Building } from 'lucide-react'
import { useData } from '@/lib/data-context'
import { formatDate, formatDateLong, isPastDate } from '@/lib/date-utils'
import type { Paciente } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PatientDetailProps {
  paciente: Paciente
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientDetail({ paciente, open, onOpenChange }: PatientDetailProps) {
  const { 
    getObraSocialByRnos, 
    obrasSociales, 
    getTurnosByPaciente, 
    getKinesiologoByDni,
    getTratamientoByNombre,
    getCobroByTurnoId,
    cobros,
    savePaciente 
  } = useData()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    telefono: paciente.telefono,
    obraSocialRnos: paciente.obraSocialRnos || '',
    numeroAfiliado: paciente.numeroAfiliado || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const obraSocial = paciente.obraSocialRnos 
    ? getObraSocialByRnos(paciente.obraSocialRnos) 
    : null
  
  const turnos = getTurnosByPaciente(paciente.dni).sort((a, b) => {
    if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha)
    return b.hora.localeCompare(a.hora)
  })

  const pacienteCobros = cobros.filter(c => {
    const turno = turnos.find(t => t.id === c.turnoId)
    return !!turno
  })

  const handleSave = () => {
    const newErrors: Record<string, string> = {}
    
    if (editData.telefono.length !== 10) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos'
    }
    if (editData.obraSocialRnos && !editData.numeroAfiliado) {
      newErrors.numeroAfiliado = 'El número de afiliado es obligatorio'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    const updatedPaciente: Paciente = {
      ...paciente,
      telefono: editData.telefono,
      obraSocialRnos: editData.obraSocialRnos || null,
      numeroAfiliado: editData.numeroAfiliado || null
    }
    
    savePaciente(updatedPaciente)
    setIsEditing(false)
    setErrors({})
    toast.success('Paciente actualizado')
  }

  const handleCancel = () => {
    setEditData({
      telefono: paciente.telefono,
      obraSocialRnos: paciente.obraSocialRnos || '',
      numeroAfiliado: paciente.numeroAfiliado || ''
    })
    setIsEditing(false)
    setErrors({})
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-semibold">
              {paciente.nombre[0]}{paciente.apellido[0]}
            </div>
            <div>
              <span className="block">{paciente.nombre} {paciente.apellido}</span>
              <span className="text-sm font-normal text-muted-foreground">DNI: {paciente.dni}</span>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="datos" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="datos" className="flex-1">Datos</TabsTrigger>
            <TabsTrigger value="turnos" className="flex-1">Turnos</TabsTrigger>
            <TabsTrigger value="cobros" className="flex-1">Cobros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="datos" className="mt-4 space-y-4">
            {!isEditing ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{paciente.telefono}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
                      <p className="font-medium">{formatDate(paciente.fechaNacimiento, 'd MMMM yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Obra social</p>
                      {obraSocial ? (
                        <div>
                          <p className="font-medium">{obraSocial.nombre}</p>
                          <p className="text-sm text-muted-foreground">N° Afiliado: {paciente.numeroAfiliado}</p>
                        </div>
                      ) : (
                        <p className="font-medium">Particular</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar datos
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={editData.telefono}
                    onChange={(e) => setEditData(d => ({ ...d, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    className={errors.telefono ? 'border-destructive' : ''}
                  />
                  {errors.telefono && (
                    <p className="text-xs text-destructive">{errors.telefono}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Obra social</Label>
                  <Select 
                    value={editData.obraSocialRnos} 
                    onValueChange={(v) => setEditData(d => ({ ...d, obraSocialRnos: v }))}
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
                
                {editData.obraSocialRnos && (
                  <div className="space-y-2">
                    <Label>Número de afiliado</Label>
                    <Input
                      value={editData.numeroAfiliado}
                      onChange={(e) => setEditData(d => ({ ...d, numeroAfiliado: e.target.value }))}
                      className={errors.numeroAfiliado ? 'border-destructive' : ''}
                    />
                    {errors.numeroAfiliado && (
                      <p className="text-xs text-destructive">{errors.numeroAfiliado}</p>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleSave}>
                    <Check className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="turnos" className="mt-4">
            {turnos.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No hay turnos registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {turnos.map(turno => {
                  const kinesiologo = getKinesiologoByDni(turno.dniKinesiologo)
                  const isPast = isPastDate(turno.fecha)
                  
                  return (
                    <div 
                      key={turno.id} 
                      className={cn(
                        'p-3 rounded-lg border',
                        isPast && 'opacity-60'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {formatDate(turno.fecha, 'EEE d MMM')} - {turno.hora}
                        </span>
                        <Badge variant={
                          turno.estado === 'confirmado' ? 'default' : 
                          turno.estado === 'pendiente' ? 'secondary' : 'destructive'
                        }>
                          {turno.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{turno.tratamiento}</p>
                      <p className="text-xs text-muted-foreground">
                        Lic. {kinesiologo?.nombre} {kinesiologo?.apellido}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cobros" className="mt-4">
            {pacienteCobros.length === 0 ? (
              <div className="py-8 text-center">
                <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No hay cobros registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pacienteCobros.map(cobro => {
                  const turno = turnos.find(t => t.id === cobro.turnoId)
                  
                  return (
                    <div key={cobro.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          ${cobro.monto.toLocaleString('es-AR')}
                        </span>
                        <Badge variant={cobro.estado === 'cobrado' ? 'default' : 'secondary'}>
                          {cobro.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(cobro.fecha, 'd MMM yyyy')}
                      </p>
                      {turno && (
                        <p className="text-xs text-muted-foreground">{turno.tratamiento}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
