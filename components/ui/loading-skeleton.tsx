import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  rows?: number
}

export function LoadingSkeleton({ className, rows = 5 }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function AgendaSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-20 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-8 bg-muted rounded animate-pulse" />
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted h-12 animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 border-t border-border animate-pulse bg-card" />
      ))}
    </div>
  )
}
