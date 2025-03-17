"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { PageLoading } from "@/components/ui/page-loading"

interface NavigationContextType {
  isNavigating: boolean
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
})

export function useNavigation() {
  return useContext(NavigationContext)
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  // Reset navigation state when route changes
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname, searchParams])

  // Listen for navigation events
  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true)
    }

    const handleComplete = () => {
      setIsNavigating(false)
    }

    window.addEventListener("beforeunload", handleStart)

    document.addEventListener("navigation-start", handleStart)
    document.addEventListener("navigation-complete", handleComplete)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      document.removeEventListener("navigation-start", handleStart)
      document.removeEventListener("navigation-complete", handleComplete)
    }
  }, [])

  return (
    <NavigationContext.Provider value={{ isNavigating }}>
      {children}
      {isNavigating && <PageLoading />}
    </NavigationContext.Provider>
  )
}

