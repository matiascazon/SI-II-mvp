'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, User, DollarSign, Check } from 'lucide-react'
import { useData } from '@/lib/data-context'
import { formatDate, formatDateLong } from '@/lib/date-utils'
import { generateId } from '@/lib/storage'
import type { Turno, Cobro } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RegisterPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegisterPaymentDialog({ open, onOpenChange }: RegisterPaymentDialogProps) {
  const {
    turnos,
    getPacienteByDni,
    getKinesiologoByDni,
    getTratamientoByNombre,
    getObraSocialByRnos,
    getCobroByTurnoId,
    saveCobro,
    saveTurno
  } = useData()

  const [searchDni, setSearchDni] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [monto, setMonto] = useState('')
  const [coseguro, setCoseguro] = useState('0')

  // Search for pending turnos (no cobro OR partial cobro)
  const pendingTurnos = useMemo(() => {
    return turnos.filter(t => {
      const matchesDni = !searchDni || t.dniPaciente.startsWith(searchDni)
      const matchesDate = !searchDate || t.fecha === searchDate
      const notCancelled = t.estado !== 'cancelado'
      const cobro = getCobroByTurnoId(t.id)
      const tratamiento = getTratamientoByNombre(t.tratamiento)
      // Include if no cobro, or if cobro exists but is less than full price
      const hasPendingPayment = !cobro || (tratamiento && cobro.monto < tratamiento.precioPorSesion)
      return matchesDni && matchesDate && notCancelled && hasPendingPayment
    }).sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [turnos, searchDni, searchDate, getCobroByTurnoId, getTratamientoByNombre])

  const handleSelectTurno = (turno: Turno) => {
    setSelectedTurno(turno)
    const tratamiento = getTratamientoByNombre(turno.tratamiento)
    const cobro = getCobroByTurnoId(turno.id)
    if (tratamiento) {
      // Pre-fill with remaining balance if partial cobro exists
      const remaining = cobro ? Math.max(0, tratamiento.precioPorSesion - cobro.monto) : tratamiento.precioPorSesion
      setMonto(remaining.toString())
    }
  }

  const handleSave = () => {
    if (!selectedTurno) return

    const existingCobro = getCobroByTurnoId(selectedTurno.id)
    const tratamiento = getTratamientoByNombre(selectedTurno.tratamiento)
    const montoNum = parseInt(monto) || 0
    const coseguroNum = parseInt(coseguro) || 0

    // Calculate total paid (existing + new)
    const totalPaid = (existingCobro?.monto || 0) + montoNum
    const isPaid = !tratamiento || totalPaid >= tratamiento.precioPorSesion

    const cobro: Cobro = {
      id: generateId(),
      turnoId: selectedTurno.id,
      monto: montoNum,
      coseguro: coseguroNum,
      fecha: formatDate(new Date()),
      reembolso: null,
      estado: 'cobrado'
    }

    saveCobro(cobro)

    // Update turno status only if fully paid
    if (isPaid) {
      const updatedTurno: Turno = { ...selectedTurno, estado: 'confirmado' }
      saveTurno(updatedTurno)
    }

    const paciente = getPacienteByDni(selectedTurno.dniPaciente)
    if (isPaid) {
      toast.success('Pago registrado', {
        description: `Cobro de $${montoNum.toLocaleString('es-AR')} a ${paciente?.nombre} ${paciente?.apellido}`
      })
    } else {
      const saldo = (tratamiento?.precioPorSesion || 0) - totalPaid
      toast.warning('Pago parcial registrado', {
        description: `Queda un saldo pendiente de $${saldo.toLocaleString('es-AR')}`
      })
    }

    // Reset and close
    setSearchDni('')
    setSearchDate('')
    setSelectedTurno(null)
    setMonto('')
    setCoseguro('0')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar cobro</DialogTitle>
          <DialogDescription>Busca un turno pendiente de pago para registrar el cobro</DialogDescription>
        </DialogHeader>

        {!selectedTurno ? (
          <div className="space-y-4">
            {/* Search filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buscar por DNI</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchDni}
                    onChange={(e) => setSearchDni(e.target.value.replace(/\D/g, ''))}
                    placeholder="DNI del paciente"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Filtrar por fecha</Label>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-2">
              <Label>Turnos pendientes de pago ({pendingTurnos.length})</Label>

              {pendingTurnos.length === 0 ? (
                <div className="p-8 text-center border rounded-lg">
                  <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay turnos pendientes de pago</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto border rounded-lg divide-y">
                  {pendingTurnos.map(turno => {
                    const paciente = getPacienteByDni(turno.dniPaciente)
                    const kinesiologo = getKinesiologoByDni(turno.dniKinesiologo)
                    const tratamiento = getTratamientoByNombre(turno.tratamiento)

                    return (
                      <div
                        key={turno.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleSelectTurno(turno)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {paciente?.nombre} {paciente?.apellido}
                          </span>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const cobro = getCobroByTurnoId(turno.id)
                              if (cobro && tratamiento && cobro.monto < tratamiento.precioPorSesion) {
                                const saldo = tratamiento.precioPorSesion - cobro.monto
                                return (
                                  <Badge variant="outline" className="text-warning border-warning text-xs">
                                    Saldo: ${saldo.toLocaleString('es-AR')}
                                  </Badge>
                                )
                              }
                              return (
                                <Badge variant="secondary">
                                  ${tratamiento?.precioPorSesion.toLocaleString('es-AR')}
                                </Badge>
                              )
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(turno.fecha, 'd MMM')} - {turno.hora}
                          </span>
                          <span>{turno.tratamiento}</span>
                          <span>Lic. {kinesiologo?.apellido}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected turno info */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {getPacienteByDni(selectedTurno.dniPaciente)?.nombre[0]}
                  {getPacienteByDni(selectedTurno.dniPaciente)?.apellido[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {getPacienteByDni(selectedTurno.dniPaciente)?.nombre}{' '}
                    {getPacienteByDni(selectedTurno.dniPaciente)?.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    DNI: {selectedTurno.dniPaciente}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {formatDateLong(selectedTurno.fecha)} - {selectedTurno.hora}
                    </Badge>
                    <Badge variant="secondary">{selectedTurno.tratamiento}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto a cobrar *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    value={monto}
                    onChange={(e) => setMonto(e.target.value.replace(/\D/g, ''))}
                    className="pl-7"
                  />
                </div>
                {(() => {
                  const cobro = getCobroByTurnoId(selectedTurno.id)
                  const trat = getTratamientoByNombre(selectedTurno.tratamiento)
                  if (cobro && trat && cobro.monto < trat.precioPorSesion) {
                    return (
                      <p className="text-xs text-muted-foreground">
                        Ya pagado: ${cobro.monto.toLocaleString('es-AR')} — Saldo: ${(trat.precioPorSesion - cobro.monto).toLocaleString('es-AR')}
                      </p>
                    )
                  }
                  return null
                })()}
              </div>

              {!selectedTurno.esParticular && (
                <div className="space-y-2">
                  <Label>Coseguro</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      value={coseguro}
                      onChange={(e) => setCoseguro(e.target.value.replace(/\D/g, ''))}
                      className="pl-7"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedTurno(null)}
              >
                Volver
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!monto || parseInt(monto) <= 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Registrar cobro
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
