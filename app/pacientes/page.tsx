'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Users, Calendar, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/lib/data-context'
import { TableSkeleton } from '@/components/ui/loading-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { PatientDetail } from '@/components/pacientes/patient-detail'
import { NewPatientForm } from '@/components/pacientes/new-patient-form'
import type { Paciente } from '@/lib/types'

export default function PacientesPage() {
  const { pacientes, isLoading, getObraSocialByRnos, turnos } = useData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [showNewPatient, setShowNewPatient] = useState(false)

  const filteredPacientes = useMemo(() => {
    if (!searchQuery) return pacientes
    const query = searchQuery.toLowerCase()
    return pacientes.filter(p => 
      p.nombre.toLowerCase().includes(query) ||
      p.apellido.toLowerCase().includes(query) ||
      p.dni.includes(query)
    )
  }, [pacientes, searchQuery])

  const getProximoTurno = (dni: string) => {
    const now = new Date()
    const proximosTurnos = turnos
      .filter(t => t.dniPaciente === dni && t.estado !== 'cancelado' && new Date(t.fecha) >= now)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    return proximosTurnos[0]
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
        </div>
        <TableSkeleton rows={8} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">{pacientes.length} pacientes registrados</p>
        </div>
        <Button onClick={() => setShowNewPatient(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo paciente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre o DNI..."
          className="pl-10"
        />
      </div>

      {/* Table */}
      {filteredPacientes.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
          description={searchQuery 
            ? 'Intentá con otro término de búsqueda' 
            : 'Hacé clic en "Nuevo paciente" para agregar el primero'
          }
          action={!searchQuery && (
            <Button onClick={() => setShowNewPatient(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo paciente
            </Button>
          )}
        />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">DNI</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Teléfono</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Obra Social</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Próximo turno</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.map(paciente => {
                const obraSocial = paciente.obraSocialRnos 
                  ? getObraSocialByRnos(paciente.obraSocialRnos) 
                  : null
                const proximoTurno = getProximoTurno(paciente.dni)
                
                return (
                  <tr 
                    key={paciente.dni} 
                    className="border-t border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedPaciente(paciente)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {paciente.nombre[0]}{paciente.apellido[0]}
                        </div>
                        <span className="font-medium">{paciente.nombre} {paciente.apellido}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm font-mono">{paciente.dni}</td>
                    <td className="p-3 text-sm">{paciente.telefono}</td>
                    <td className="p-3">
                      {obraSocial ? (
                        <Badge variant="outline">{obraSocial.sigla}</Badge>
                      ) : (
                        <Badge variant="secondary">Particular</Badge>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {proximoTurno ? (
                        <div className="flex items-center gap-2 text-primary">
                          <Calendar className="h-4 w-4" />
                          {formatDate(proximoTurno.fecha, 'EEE d MMM')} {proximoTurno.hora}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin turnos</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient Detail Drawer */}
      {selectedPaciente && (
        <PatientDetail
          paciente={selectedPaciente}
          open={!!selectedPaciente}
          onOpenChange={(open) => !open && setSelectedPaciente(null)}
        />
      )}

      {/* New Patient Form */}
      {showNewPatient && (
        <NewPatientForm
          open={showNewPatient}
          onOpenChange={setShowNewPatient}
        />
      )}
    </div>
  )
}
