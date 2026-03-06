'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, DollarSign, Calendar, Receipt, Plus, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/lib/data-context'
import { TableSkeleton } from '@/components/ui/loading-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate, formatDateLong } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { RegisterPaymentDialog } from '@/components/cobros/register-payment-dialog'
import { PaymentReceipt } from '@/components/cobros/payment-receipt'
import type { Cobro } from '@/lib/types'
import { format, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

export default function CobrosPage() {
  const { cobros, turnos, isLoading, getPacienteByDni, getKinesiologoByDni, getTratamientoByNombre } = useData()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showRegisterPayment, setShowRegisterPayment] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Cobro | null>(null)

  const dateStr = formatDate(selectedDate)

  // Get cobros and turnos for selected date
  const dayCobros = useMemo(() => {
    return cobros.filter(c => c.fecha === dateStr)
  }, [cobros, dateStr])

  const dayTurnos = useMemo(() => {
    return turnos.filter(t => t.fecha === dateStr && t.estado !== 'cancelado')
  }, [turnos, dateStr])

  // Calculate summary
  const summary = useMemo(() => {
    const total = dayCobros.reduce((sum, c) => sum + c.monto, 0)
    const totalCoseguros = dayCobros.reduce((sum, c) => sum + c.coseguro, 0)
    const reembolsos = dayCobros.filter(c => c.estado === 'reembolsado').reduce((sum, c) => sum + (c.reembolso || 0), 0)
    
    return {
      total,
      totalCoseguros,
      reembolsos,
      turnosAtendidos: dayTurnos.filter(t => t.estado === 'confirmado').length
    }
  }, [dayCobros, dayTurnos])

  const goToday = () => setSelectedDate(new Date())
  const goPrev = () => setSelectedDate(d => subDays(d, 1))
  const goNext = () => setSelectedDate(d => addDays(d, 1))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <TableSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cobros</h1>
          <p className="text-muted-foreground">Resumen diario de pagos</p>
        </div>
        <Button onClick={() => setShowRegisterPayment(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar cobro
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={goPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-medium capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </span>
        </div>
        <Button variant="outline" size="icon" onClick={goNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToday}>
          Hoy
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total cobrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              ${summary.total.toLocaleString('es-AR')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total coseguros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              ${summary.totalCoseguros.toLocaleString('es-AR')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Turnos atendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{summary.turnosAtendidos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reembolsos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              ${summary.reembolsos.toLocaleString('es-AR')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cobros Table */}
      {dayCobros.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No hay cobros para este día"
          description="Los cobros registrados aparecerán aquí"
          action={
            <Button onClick={() => setShowRegisterPayment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar cobro
            </Button>
          }
        />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Hora</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Paciente</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Profesional</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tratamiento</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Monto</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Coseguro</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dayCobros.map(cobro => {
                const turno = turnos.find(t => t.id === cobro.turnoId)
                const paciente = turno ? getPacienteByDni(turno.dniPaciente) : null
                const kinesiologo = turno ? getKinesiologoByDni(turno.dniKinesiologo) : null
                
                return (
                  <tr key={cobro.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-sm font-medium">{turno?.hora || '-'}</td>
                    <td className="p-3 text-sm">{paciente?.nombre} {paciente?.apellido}</td>
                    <td className="p-3 text-sm">{kinesiologo?.nombre} {kinesiologo?.apellido}</td>
                    <td className="p-3 text-sm">{turno?.tratamiento}</td>
                    <td className="p-3 text-sm text-right font-medium">
                      ${cobro.monto.toLocaleString('es-AR')}
                    </td>
                    <td className="p-3 text-sm text-right">
                      {cobro.coseguro > 0 ? `$${cobro.coseguro.toLocaleString('es-AR')}` : '-'}
                    </td>
                    <td className="p-3">
                      <Badge variant={cobro.estado === 'cobrado' ? 'default' : 'secondary'}>
                        {cobro.estado === 'cobrado' ? 'Cobrado' : 'Reembolsado'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedReceipt(cobro)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Payment Dialog */}
      {showRegisterPayment && (
        <RegisterPaymentDialog
          open={showRegisterPayment}
          onOpenChange={setShowRegisterPayment}
        />
      )}

      {/* Receipt Dialog */}
      {selectedReceipt && (
        <PaymentReceipt
          cobro={selectedReceipt}
          open={!!selectedReceipt}
          onOpenChange={(open) => !open && setSelectedReceipt(null)}
        />
      )}
    </div>
  )
}
