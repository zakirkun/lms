"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  ShoppingCart,
  PlusCircle,
  BarChart,
  UserCog,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DashboardSidebarProps {
  isInstructor?: boolean
  isAdmin?: boolean
}

export function DashboardSidebar({ isInstructor = false, isAdmin = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <ScrollArea className="flex-1 py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/my-courses"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/dashboard/my-courses" || pathname.startsWith("/dashboard/my-courses/")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Library className="h-4 w-4" />
            My Courses
          </Link>
          <Link
            href="/courses"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/courses" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <BookOpen className="h-4 w-4" />
            Browse Courses
          </Link>
          <Link
            href="/dashboard/purchases"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/dashboard/purchases"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            Purchase History
          </Link>

          {isInstructor && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs text-muted-foreground">Instructor</div>
              <Link
                href="/dashboard/instructor/courses"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === "/dashboard/instructor/courses" || pathname.startsWith("/dashboard/instructor/courses/")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <BookOpen className="h-4 w-4" />
                My Courses
              </Link>
              <Link
                href="/dashboard/instructor/create"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === "/dashboard/instructor/create"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <PlusCircle className="h-4 w-4" />
                Create Course
              </Link>
              <Link
                href="/dashboard/instructor/analytics"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === "/dashboard/instructor/analytics"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <BarChart className="h-4 w-4" />
                Analytics
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs text-muted-foreground">Admin</div>
              <Link
                href="/dashboard/admin/courses"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === "/dashboard/admin/courses"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <BookOpen className="h-4 w-4" />
                All Courses
              </Link>
              <Link
                href="/dashboard/admin/users"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === "/dashboard/admin/users"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <UserCog className="h-4 w-4" />
                Users
              </Link>
            </>
          )}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <nav className="grid items-start gap-2 text-sm font-medium">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/dashboard/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </nav>
      </div>
    </div>
  )
}

