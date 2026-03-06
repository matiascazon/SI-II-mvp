'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useData } from '@/lib/data-context'
import { EmptyState } from '@/components/ui/empty-state'
import type { Tratamiento } from '@/lib/types'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function TratamientosTab() {
  const { tratamientos, saveTratamiento, deleteTratamiento } = useData()
  
  const [showForm, setShowForm] = useState(false)
  const [editingTratamiento, setEditingTratamiento] = useState<Tratamiento | null>(null)
  const [deletingNombre, setDeletingNombre] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precioPorSesion: '',
    duracionMinutos: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleEdit = (tratamiento: Tratamiento) => {
    setEditingTratamiento(tratamiento)
    setFormData({
      nombre: tratamiento.nombre,
      descripcion: tratamiento.descripcion,
      precioPorSesion: tratamiento.precioPorSesion.toString(),
      duracionMinutos: tratamiento.duracionMinutos.toString()
    })
    setShowForm(true)
  }

  const handleDelete = () => {
    if (!deletingNombre) return
    deleteTratamiento(deletingNombre)
    toast.success('Tratamiento eliminado')
    setDeletingNombre(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTratamiento(null)
    setFormData({ nombre: '', descripcion: '', precioPorSesion: '', duracionMinutos: '' })
    setErrors({})
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio'
    if (!formData.precioPorSesion || parseInt(formData.precioPorSesion) <= 0) {
      newErrors.precioPorSesion = 'El precio debe ser mayor a 0'
    }
    if (!formData.duracionMinutos || parseInt(formData.duracionMinutos) <= 0) {
      newErrors.duracionMinutos = 'La duración debe ser mayor a 0'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    
    const tratamiento: Tratamiento = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precioPorSesion: parseInt(formData.precioPorSesion),
      duracionMinutos: parseInt(formData.duracionMinutos)
    }
    
    saveTratamiento(tratamiento)
    toast.success(editingTratamiento ? 'Tratamiento actualizado' : 'Tratamiento agregado')
    handleCloseForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{tratamientos.length} tratamientos registrados</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>

      {tratamientos.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No hay tratamientos registrados"
          description="Agrega el primer tratamiento para comenzar"
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar tratamiento
            </Button>
          }
        />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tratamiento</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Descripción</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Precio</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Duración</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tratamientos.map(t => (
                <tr key={t.nombre} className="border-t border-border">
                  <td className="p-3 font-medium">{t.nombre}</td>
                  <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">{t.descripcion}</td>
                  <td className="p-3 text-right font-medium">${t.precioPorSesion.toLocaleString('es-AR')}</td>
                  <td className="p-3 text-right text-muted-foreground">{t.duracionMinutos} min</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingNombre(t.nombre)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTratamiento ? 'Editar tratamiento' : 'Nuevo tratamiento'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData(d => ({ ...d, nombre: e.target.value }))}
                disabled={!!editingTratamiento}
                className={errors.nombre ? 'border-destructive' : ''}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(d => ({ ...d, descripcion: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio por sesión *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    value={formData.precioPorSesion}
                    onChange={(e) => setFormData(d => ({ ...d, precioPorSesion: e.target.value.replace(/\D/g, '') }))}
                    className={`pl-7 ${errors.precioPorSesion ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.precioPorSesion && <p className="text-xs text-destructive">{errors.precioPorSesion}</p>}
              </div>
              <div className="space-y-2">
                <Label>Duración (minutos) *</Label>
                <Input
                  value={formData.duracionMinutos}
                  onChange={(e) => setFormData(d => ({ ...d, duracionMinutos: e.target.value.replace(/\D/g, '') }))}
                  className={errors.duracionMinutos ? 'border-destructive' : ''}
                />
                {errors.duracionMinutos && <p className="text-xs text-destructive">{errors.duracionMinutos}</p>}
              </div>
            </div>
            
            <Button onClick={handleSubmit} className="w-full">
              {editingTratamiento ? 'Guardar cambios' : 'Agregar tratamiento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingNombre} onOpenChange={() => setDeletingNombre(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tratamiento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los turnos existentes con este tratamiento no se verán afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
