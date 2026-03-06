'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, DollarSign, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Turnos', icon: Calendar },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/cobros', label: 'Cobros', icon: DollarSign },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">Inti Huara</h1>
        <p className="text-sm text-muted-foreground">Kinesiología</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          San Salvador de Jujuy
        </p>
      </div>
    </aside>
  )
}
