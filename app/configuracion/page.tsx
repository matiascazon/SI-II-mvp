'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useData } from '@/lib/data-context'
import { KinesiologosTab } from '@/components/configuracion/kinesiologos-tab'
import { TratamientosTab } from '@/components/configuracion/tratamientos-tab'
import { ObrasSocialesTab } from '@/components/configuracion/obras-sociales-tab'
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
import { toast } from 'sonner'

export default function ConfiguracionPage() {
  const { resetData } = useData()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleReset = () => {
    resetData()
    toast.success('Datos restaurados', {
      description: 'Se restauraron los datos de prueba originales'
    })
    setShowResetConfirm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra profesionales, tratamientos y obras sociales</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kinesiologos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kinesiologos">Kinesiólogos</TabsTrigger>
          <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
          <TabsTrigger value="obras-sociales">Obras Sociales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kinesiologos">
          <KinesiologosTab />
        </TabsContent>
        
        <TabsContent value="tratamientos">
          <TratamientosTab />
        </TabsContent>
        
        <TabsContent value="obras-sociales">
          <ObrasSocialesTab />
        </TabsContent>
      </Tabs>

      {/* Reset Data Button */}
      <div className="pt-8 border-t">
        <Button 
          variant="destructive" 
          onClick={() => setShowResetConfirm(true)}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Resetear datos de prueba
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Esto restaurará todos los datos a los valores iniciales de demostración.
        </p>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar reseteo de datos
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los datos actuales y restaurará los datos de prueba originales. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
              Resetear datos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
