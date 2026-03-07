'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Calendar, Clock, User, Stethoscope, CreditCard, X, RefreshCw, DollarSign } from 'lucide-react'
import { useData } from '@/lib/data-context'
import { formatDateLong, getHoursUntil } from '@/lib/date-utils'
import type { Turno } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AppointmentDetailProps {
  turno: Turno
  open: boolean
  onOpenChange: (open: boolean) => void
  onReschedule: (turno: Turno) => void
}

export function AppointmentDetail({ turno, open, onOpenChange, onReschedule }: AppointmentDetailProps) {
  const { getPacienteByDni, getKinesiologoByDni, getTratamientoByNombre, getObraSocialByRnos, saveTurno, getCobroByTurnoId, saveCobro } = useData()

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelInput, setCancelInput] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [monto, setMonto] = useState('')
  const [coseguro, setCoseguro] = useState('0')

  const paciente = getPacienteByDni(turno.dniPaciente)
  const kinesiologo = getKinesiologoByDni(turno.dniKinesiologo)
  const tratamiento = getTratamientoByNombre(turno.tratamiento)
  const obraSocial = paciente?.obraSocialRnos ? getObraSocialByRnos(paciente.obraSocialRnos) : null
  const cobro = getCobroByTurnoId(turno.id)

  const hoursRemaining = getHoursUntil(turno.fecha, turno.hora)
  const reimbursementPercent = hoursRemaining > 48 ? 100 : 50
  const reimbursementAmount = tratamiento ? (tratamiento.precioPorSesion * reimbursementPercent / 100) : 0

  const handleCancel = () => {
    if (cancelInput !== 'CANCELAR') return

    const updatedTurno: Turno = { ...turno, estado: 'cancelado' }
    saveTurno(updatedTurno)

    // Update cobro if exists
    if (cobro) {
      saveCobro({
        ...cobro,
        reembolso: reimbursementAmount,
        estado: 'reembolsado'
      })
    }

    toast.success('Turno cancelado', {
      description: reimbursementPercent === 100
        ? 'Se reembolsará el 100% del monto'
        : 'Se reembolsará el 50% del monto'
    })

    setShowCancelConfirm(false)
    setCancelInput('')
    onOpenChange(false)
  }

  const handleRegisterPayment = () => {
    const cobroData = {
      id: Math.random().toString(36).substr(2, 9),
      turnoId: turno.id,
      monto: parseInt(monto) || 0,
      coseguro: parseInt(coseguro) || 0,
      fecha: new Date().toISOString().split('T')[0],
      reembolso: null,
      estado: 'cobrado' as const
    }

    saveCobro(cobroData)

    // Update appointment status to confirmed if it was pending
    if (turno.estado === 'pendiente') {
      saveTurno({ ...turno, estado: 'confirmado' })
    }

    toast.success('Pago registrado con éxito')
    setShowPaymentForm(false)
  }

  const handleOpenPayment = () => {
    if (tratamiento) {
      setMonto(tratamiento.precioPorSesion.toString())
    }
    setShowPaymentForm(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalle del turno
            <Badge variant={
              turno.estado === 'confirmado' ? 'default' :
                turno.estado === 'pendiente' ? 'secondary' : 'destructive'
            }>
              {turno.estado === 'pendiente' && 'Pendiente de pago'}
              {turno.estado === 'confirmado' && 'Confirmado'}
              {turno.estado === 'cancelado' && 'Cancelado'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {formatDateLong(turno.fecha)} a las {turno.hora}
          </DialogDescription>
        </DialogHeader>

        {!showCancelConfirm ? (
          <div className="space-y-4">
            {/* Patient Info */}
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{paciente?.nombre} {paciente?.apellido}</p>
                <p className="text-sm text-muted-foreground">DNI: {paciente?.dni}</p>
                {obraSocial ? (
                  <Badge variant="outline" className="mt-1">{obraSocial.sigla}</Badge>
                ) : (
                  <Badge variant="secondary" className="mt-1">Particular</Badge>
                )}
              </div>
            </div>

            {/* Professional Info */}
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Lic. {kinesiologo?.nombre} {kinesiologo?.apellido}</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {kinesiologo?.especialidades.map(esp => (
                    <Badge key={esp} variant="outline" className="text-xs">{esp}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDateLong(turno.fecha)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p className="font-medium">{turno.hora} ({tratamiento?.duracionMinutos} min)</p>
                </div>
              </div>
            </div>

            {/* Treatment & Price */}
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{turno.tratamiento}</p>
                <p className="text-sm text-muted-foreground">{tratamiento?.descripcion}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-primary">
                    ${tratamiento?.precioPorSesion.toLocaleString('es-AR')}
                  </span>
                  {cobro && (
                    <Badge variant="default" className="bg-success">Pagado</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Motivo */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Motivo de consulta</p>
              <p className="mt-1">{turno.motivoConsulta}</p>
            </div>

            {/* Orden médica */}
            {turno.ordenMedica && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Orden médica</p>
                <p className="mt-1">{turno.ordenMedica}</p>
              </div>
            )}

            {/* Actions */}
            {turno.estado !== 'cancelado' && !cobro && !showPaymentForm && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1 bg-success hover:bg-success/90"
                  onClick={handleOpenPayment}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Registrar cobro
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onReschedule(turno)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reprogramar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}

            {showPaymentForm && (
              <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <DollarSign className="h-5 w-5" />
                  Registrar Cobro
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monto cobrado *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        value={monto}
                        onChange={(e) => setMonto(e.target.value.replace(/\D/g, ''))}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  {!paciente?.obraSocialRnos ? null : (
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPaymentForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={handleRegisterPayment}
                    disabled={!monto || parseInt(monto) <= 0}
                  >
                    Confirmar Pago
                  </Button>
                </div>
              </div>
            )}

            {turno.estado !== 'cancelado' && (cobro || showPaymentForm) && !showPaymentForm && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onReschedule(turno)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reprogramar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Confirmar cancelación</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {hoursRemaining > 48 ? (
                      <>Faltan más de 48hs para el turno. Se reembolsará el 100% (${reimbursementAmount.toLocaleString('es-AR')})</>
                    ) : (
                      <>Faltan menos de 48hs para el turno. Se reembolsará el 50% (${reimbursementAmount.toLocaleString('es-AR')})</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Escribí CANCELAR para confirmar</Label>
              <Input
                value={cancelInput}
                onChange={(e) => setCancelInput(e.target.value.toUpperCase())}
                placeholder="CANCELAR"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCancelConfirm(false)
                  setCancelInput('')
                }}
              >
                Volver
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={cancelInput !== 'CANCELAR'}
              >
                Confirmar cancelación
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
