'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/lib/data-context'
import { EmptyState } from '@/components/ui/empty-state'
import { KinesiologoForm } from './kinesiologo-form'
import type { Kinesiologo } from '@/lib/types'
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

export function KinesiologosTab() {
  const { kinesiologos, getObraSocialByRnos, deleteKinesiologo, getHorarioByKinesiologo } = useData()
  
  const [showForm, setShowForm] = useState(false)
  const [editingKinesiologo, setEditingKinesiologo] = useState<Kinesiologo | null>(null)
  const [deletingDni, setDeletingDni] = useState<string | null>(null)

  const handleEdit = (kinesiologo: Kinesiologo) => {
    setEditingKinesiologo(kinesiologo)
    setShowForm(true)
  }

  const handleDelete = () => {
    if (!deletingDni) return
    deleteKinesiologo(deletingDni)
    toast.success('Kinesiólogo eliminado')
    setDeletingDni(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingKinesiologo(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{kinesiologos.length} profesionales registrados</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>

      {kinesiologos.length === 0 ? (
        <EmptyState
          icon={User}
          title="No hay kinesiólogos registrados"
          description="Agrega el primer profesional para comenzar"
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar kinesiólogo
            </Button>
          }
        />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Profesional</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Especialidades</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Obras Sociales</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Horarios</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {kinesiologos.map(k => {
                const horario = getHorarioByKinesiologo(k.dni)
                const diasTrabajo = horario?.disponibilidad.map(d => d.dia.slice(0, 3)).join(', ') || '-'
                
                return (
                  <tr key={k.dni} className="border-t border-border">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {k.nombre[0]}{k.apellido[0]}
                        </div>
                        <div>
                          <p className="font-medium">Lic. {k.nombre} {k.apellido}</p>
                          <p className="text-xs text-muted-foreground">{k.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {k.especialidades.map(esp => (
                          <Badge key={esp} variant="secondary" className="text-xs">{esp}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {k.obrasSociales.map(rnos => {
                          const os = getObraSocialByRnos(rnos)
                          return os ? (
                            <Badge key={rnos} variant="outline" className="text-xs">{os.sigla}</Badge>
                          ) : null
                        })}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{diasTrabajo}</td>
                    <td className="p-3">
                      <Badge variant={k.activo ? 'default' : 'secondary'}>
                        {k.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(k)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingDni(k.dni)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <KinesiologoForm
          open={showForm}
          onOpenChange={handleCloseForm}
          kinesiologo={editingKinesiologo}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDni} onOpenChange={() => setDeletingDni(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar kinesiólogo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al profesional y sus horarios. Los turnos asociados se mantendrán.
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
