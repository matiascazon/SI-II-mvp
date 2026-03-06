'use client'

import { type ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { DataProvider } from '@/lib/data-context'
import { Toaster } from '@/components/ui/sonner'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <DataProvider>
      <div className="h-screen flex bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </DataProvider>
  )
}
