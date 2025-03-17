"use client"

import type React from "react"

import { useState, type ReactNode } from "react"
import { useLoading } from "@/components/providers/loading-provider"

interface FormWithLoadingProps {
  children: ReactNode | ((isSubmitting: boolean) => ReactNode)
  onSubmit: (e: React.FormEvent) => Promise<void> | void
  className?: string
}

export function FormWithLoading({ children, onSubmit, className }: FormWithLoadingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { startLoading, stopLoading } = useLoading()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    startLoading()

    try {
      await onSubmit(e)
    } finally {
      setIsSubmitting(false)
      stopLoading()
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {typeof children === "function" ? children(isSubmitting) : children}
    </form>
  )
}

