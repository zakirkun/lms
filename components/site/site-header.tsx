import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/site/mobile-nav"

interface SiteHeaderProps {
  session?: any
}

export function SiteHeader({ session }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b glass-effect transition-all duration-300">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-colors hover:opacity-80">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EduLearn</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary focus-ring rounded-md px-2 py-1"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium transition-colors hover:text-primary focus-ring rounded-md px-2 py-1"
            >
              Courses
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary focus-ring rounded-md px-2 py-1"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-primary focus-ring rounded-md px-2 py-1"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <Button asChild variant="default" className="hidden sm:flex btn-hover-effect">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="hidden sm:flex btn-hover-effect">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
          <MobileNav session={session} />
        </div>
      </div>
    </header>
  )
}

