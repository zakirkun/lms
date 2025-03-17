"use client"

import { forwardRef } from "react"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: string
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, className, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <Button ref={ref} className={cn(className)} disabled={isLoading || disabled} {...props}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || "Loading..."}
          </>
        ) : (
          children
        )}
      </Button>
    )
  },
)

LoadingButton.displayName = "LoadingButton"

export { LoadingButton }

