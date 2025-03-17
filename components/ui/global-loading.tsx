"use client"

import { useEffect, useState } from "react"
import { useLoading } from "@/components/providers/loading-provider"

export function GlobalLoading() {
  const { isLoading } = useLoading()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    let timeout: NodeJS.Timeout

    if (isLoading) {
      setVisible(true)
      setProgress(0)

      // Simulate progress
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + (90 - prev) * 0.1
        })
      }, 100)
    } else {
      // Complete the progress bar
      setProgress(100)

      // Hide after animation completes
      timeout = setTimeout(() => {
        setVisible(false)
      }, 500)
    }

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
    </div>
  )
}

