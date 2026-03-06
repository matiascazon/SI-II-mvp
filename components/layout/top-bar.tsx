'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function TopBar() {
  const today = new Date()
  const formattedDate = format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-foreground">Inti Huara</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">Kinesiología</span>
      </div>
      <div className="text-sm text-muted-foreground capitalize">
        {formattedDate}
      </div>
    </header>
  )
}
