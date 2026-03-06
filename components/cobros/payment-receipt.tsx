'use client'

import { useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useData } from '@/lib/data-context'
import { formatDate, formatDateLong } from '@/lib/date-utils'
import type { Cobro } from '@/lib/types'

interface PaymentReceiptProps {
  cobro: Cobro
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentReceipt({ cobro, open, onOpenChange }: PaymentReceiptProps) {
  const { turnos, getPacienteByDni, getKinesiologoByDni, getTratamientoByNombre, getObraSocialByRnos } = useData()
  const receiptRef = useRef<HTMLDivElement>(null)
  
  const turno = turnos.find(t => t.id === cobro.turnoId)
  const paciente = turno ? getPacienteByDni(turno.dniPaciente) : null
  const kinesiologo = turno ? getKinesiologoByDni(turno.dniKinesiologo) : null
  const tratamiento = turno ? getTratamientoByNombre(turno.tratamiento) : null
  const obraSocial = paciente?.obraSocialRnos ? getObraSocialByRnos(paciente.obraSocialRnos) : null

  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML
    if (!printContent) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Comprobante de Pago - Inti Huara</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 40px;
              max-width: 400px;
              margin: 0 auto;
            }
            .receipt {
              border: 2px solid #0D6B6E;
              padding: 24px;
              border-radius: 8px;
            }
            .header {
              text-align: center;
              margin-bottom: 24px;
              padding-bottom: 16px;
              border-bottom: 1px dashed #ccc;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0D6B6E;
            }
            .subtitle {
              color: #666;
              font-size: 14px;
            }
            .badge {
              display: inline-block;
              background: #0D6B6E;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              margin-top: 8px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .label {
              color: #666;
            }
            .value {
              font-weight: 500;
            }
            .total {
              margin-top: 16px;
              padding-top: 16px;
              border-top: 1px dashed #ccc;
            }
            .total-amount {
              font-size: 24px;
              font-weight: bold;
              color: #0D6B6E;
            }
            .footer {
              margin-top: 24px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    
    printWindow.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Comprobante de pago
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div ref={receiptRef} className="receipt">
          {/* Header */}
          <div className="header text-center mb-6 pb-4 border-b border-dashed border-muted-foreground/30">
            <div className="logo text-2xl font-bold text-primary">Inti Huara</div>
            <div className="subtitle text-muted-foreground text-sm">Consultorio de Kinesiología</div>
            <div className="text-xs text-muted-foreground mt-1">San Salvador de Jujuy</div>
            <div className="badge inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-xs mt-2">
              Comprobante de Pago
            </div>
          </div>
          
          {/* Details */}
          <div className="space-y-3 text-sm">
            <div className="row flex justify-between">
              <span className="label text-muted-foreground">Fecha:</span>
              <span className="value font-medium">{formatDateLong(cobro.fecha)}</span>
            </div>
            <div className="row flex justify-between">
              <span className="label text-muted-foreground">Paciente:</span>
              <span className="value font-medium">{paciente?.nombre} {paciente?.apellido}</span>
            </div>
            <div className="row flex justify-between">
              <span className="label text-muted-foreground">DNI:</span>
              <span className="value font-medium">{paciente?.dni}</span>
            </div>
            <div className="row flex justify-between">
              <span className="label text-muted-foreground">Profesional:</span>
              <span className="value font-medium">Lic. {kinesiologo?.nombre} {kinesiologo?.apellido}</span>
            </div>
            <div className="row flex justify-between">
              <span className="label text-muted-foreground">Tratamiento:</span>
              <span className="value font-medium">{turno?.tratamiento}</span>
            </div>
            {obraSocial && (
              <div className="row flex justify-between">
                <span className="label text-muted-foreground">Obra Social:</span>
                <span className="value font-medium">{obraSocial.sigla}</span>
              </div>
            )}
            {turno && (
              <div className="row flex justify-between">
                <span className="label text-muted-foreground">Turno:</span>
                <span className="value font-medium">
                  {formatDate(turno.fecha, 'd/MM/yyyy')} - {turno.hora}
                </span>
              </div>
            )}
          </div>
          
          {/* Total */}
          <div className="total mt-6 pt-4 border-t border-dashed border-muted-foreground/30">
            {cobro.coseguro > 0 && (
              <div className="row flex justify-between mb-2 text-sm">
                <span className="label text-muted-foreground">Coseguro:</span>
                <span className="value font-medium">${cobro.coseguro.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="row flex justify-between items-center">
              <span className="label text-muted-foreground">Total abonado:</span>
              <span className="total-amount text-2xl font-bold text-primary">
                ${cobro.monto.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
          
          {/* Footer */}
          <div className="footer mt-6 text-center text-xs text-muted-foreground">
            <p>Gracias por su confianza</p>
            <p>Tel: 388-400-1122</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
