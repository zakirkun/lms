"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, GraduationCap, LayoutDashboard, Library, LogOut, Settings, ShoppingCart, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

interface SidebarProps {
  isInstructor?: boolean
  isAdmin?: boolean
}

export function Sidebar({ isInstructor = false, isAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex h-full w-full flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          <span className="font-bold">EduLearn</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/dashboard" ? "bg-muted text-primary" : "text-muted-foreground",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/my-courses"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/dashboard/my-courses" ? "bg-muted text-primary" : "text-muted-foreground",
            )}
          >
            <Library className="h-4 w-4" />
            My Courses
          </Link>
          <Link
            href="/courses"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/courses" ? "bg-muted text-primary" : "text-muted-foreground",
            )}
          >
            <BookOpen className="h-4 w-4" />
            Browse Courses
          </Link>
          <Link
            href="/dashboard/purchases"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/dashboard/purchases" ? "bg-muted text-primary" : "text-muted-foreground",
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            Purchase History
          </Link>

          {isInstructor && (
            <>
              <div className="my-2 px-3 text-xs text-muted-foreground">Instructor</div>
              <Link
                href="/dashboard/instructor/courses"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === "/dashboard/instructor/courses" ? "bg-muted text-primary" : "text-muted-foreground",
                )}
              >
                <BookOpen className="h-4 w-4" />
                My Courses
              </Link>
              <Link
                href="/dashboard/instructor/create"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === "/dashboard/instructor/create" ? "bg-muted text-primary" : "text-muted-foreground",
                )}
              >
                <BookOpen className="h-4 w-4" />
                Create Course
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <div className="my-2 px-3 text-xs text-muted-foreground">Admin</div>
              <Link
                href="/dashboard/admin/courses"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === "/dashboard/admin/courses" ? "bg-muted text-primary" : "text-muted-foreground",
                )}
              >
                <BookOpen className="h-4 w-4" />
                All Courses
              </Link>
              <Link
                href="/dashboard/admin/users"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === "/dashboard/admin/users" ? "bg-muted text-primary" : "text-muted-foreground",
                )}
              >
                <Users className="h-4 w-4" />
                Users
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="mt-auto border-t p-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === "/dashboard/settings" ? "bg-muted text-primary" : "text-muted-foreground",
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
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

