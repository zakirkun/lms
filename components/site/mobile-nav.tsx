"use client"

import { useState } from "react"
import Link from "next/link"
import { GraduationCap, Menu, Home, BookOpen, Info, Mail, LogIn, UserPlus, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

interface MobileNavProps {
  session?: any
}

export function MobileNav({ session }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden focus-ring">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <div className="flex items-center justify-between border-b pb-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EduLearn</span>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex flex-col gap-4 mt-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link
            href="/courses"
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <BookOpen className="h-5 w-5" />
            Courses
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <Info className="h-5 w-5" />
            About
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <Mail className="h-5 w-5" />
            Contact
          </Link>
        </nav>
        <div className="mt-auto pt-4 border-t space-y-4">
          {session ? (
            <Button asChild className="w-full btn-hover-effect" onClick={() => setOpen(false)}>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild className="w-full btn-hover-effect" onClick={() => setOpen(false)}>
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

