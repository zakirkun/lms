"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageLoadingProps {
  className?: string
}

export function PageLoading({ className }: PageLoadingProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show loading indicator after a short delay to avoid flashing
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Loading</h3>
          <p className="text-sm text-muted-foreground">Please wait while we load your content...</p>
        </div>
      </div>
    </div>
  )
}

