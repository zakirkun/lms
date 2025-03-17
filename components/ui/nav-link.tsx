"use client"

import type React from "react"

import { forwardRef } from "react"
import Link, { type LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { useLoading } from "@/components/providers/loading-provider"
import { cn } from "@/lib/utils"

interface NavLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
  showLoading?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ children, className, showLoading = true, onClick, ...props }, ref) => {
    const router = useRouter()
    const { startLoading } = useLoading()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e)
      }

      if (!e.defaultPrevented && showLoading) {
        // Trigger loading state
        startLoading()

        // Dispatch custom event to trigger loading state
        document.dispatchEvent(new Event("navigation-start"))
      }
    }

    return (
      <Link ref={ref} className={cn(className)} onClick={handleClick} {...props}>
        {children}
      </Link>
    )
  },
)

NavLink.displayName = "NavLink"

export { NavLink }

