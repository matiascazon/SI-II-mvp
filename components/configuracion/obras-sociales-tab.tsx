'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useData } from '@/lib/data-context'
import { EmptyState } from '@/components/ui/empty-state'
import type { ObraSocial } from '@/lib/types'
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

export function ObrasSocialesTab() {
  const { obrasSociales, saveObraSocial, deleteObraSocial } = useData()
  
  const [showForm, setShowForm] = useState(false)
  const [editingObraSocial, setEditingObraSocial] = useState<ObraSocial | null>(null)
  const [deletingRnos, setDeletingRnos] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    rnos: '',
    nombre: '',
    sigla: '',
    telefono: '',
    email: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleEdit = (obraSocial: ObraSocial) => {
    setEditingObraSocial(obraSocial)
    setFormData({
      rnos: obraSocial.rnos,
      nombre: obraSocial.nombre,
      sigla: obraSocial.sigla,
      telefono: obraSocial.telefono,
      email: obraSocial.email
    })
    setShowForm(true)
  }

  const handleDelete = () => {
    if (!deletingRnos) return
    deleteObraSocial(deletingRnos)
    toast.success('Obra social eliminada')
    setDeletingRnos(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingObraSocial(null)
    setFormData({ rnos: '', nombre: '', sigla: '', telefono: '', email: '' })
    setErrors({})
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.rnos) newErrors.rnos = 'El RNOS es obligatorio'
    if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio'
    if (!formData.sigla) newErrors.sigla = 'La sigla es obligatoria'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    
    const obraSocial: ObraSocial = {
      rnos: formData.rnos,
      nombre: formData.nombre,
      sigla: formData.sigla,
      telefono: formData.telefono,
      email: formData.email
    }
    
    saveObraSocial(obraSocial)
    toast.success(editingObraSocial ? 'Obra social actualizada' : 'Obra social agregada')
    handleCloseForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{obrasSociales.length} obras sociales registradas</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>

      {obrasSociales.length === 0 ? (
        <EmptyState
          icon={Building}
          title="No hay obras sociales registradas"
          description="Agrega la primera obra social para comenzar"
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar obra social
            </Button>
          }
        />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">RNOS</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Sigla</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Teléfono</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {obrasSociales.map(os => (
                <tr key={os.rnos} className="border-t border-border">
                  <td className="p-3 font-mono text-sm">{os.rnos}</td>
                  <td className="p-3 font-medium">{os.nombre}</td>
                  <td className="p-3">{os.sigla}</td>
                  <td className="p-3 text-sm text-muted-foreground">{os.telefono}</td>
                  <td className="p-3 text-sm text-muted-foreground">{os.email}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(os)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingRnos(os.rnos)}
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
            <DialogTitle>{editingObraSocial ? 'Editar obra social' : 'Nueva obra social'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RNOS *</Label>
                <Input
                  value={formData.rnos}
                  onChange={(e) => setFormData(d => ({ ...d, rnos: e.target.value }))}
                  disabled={!!editingObraSocial}
                  className={errors.rnos ? 'border-destructive' : ''}
                />
                {errors.rnos && <p className="text-xs text-destructive">{errors.rnos}</p>}
              </div>
              <div className="space-y-2">
                <Label>Sigla *</Label>
                <Input
                  value={formData.sigla}
                  onChange={(e) => setFormData(d => ({ ...d, sigla: e.target.value.toUpperCase() }))}
                  className={errors.sigla ? 'border-destructive' : ''}
                />
                {errors.sigla && <p className="text-xs text-destructive">{errors.sigla}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nombre completo *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData(d => ({ ...d, nombre: e.target.value }))}
                className={errors.nombre ? 'border-destructive' : ''}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData(d => ({ ...d, telefono: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(d => ({ ...d, email: e.target.value }))}
                />
              </div>
            </div>
            
            <Button onClick={handleSubmit} className="w-full">
              {editingObraSocial ? 'Guardar cambios' : 'Agregar obra social'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRnos} onOpenChange={() => setDeletingRnos(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar obra social</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los pacientes con esta obra social pasarán a ser particulares.
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
