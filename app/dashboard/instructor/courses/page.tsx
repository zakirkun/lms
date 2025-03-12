import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BookOpen, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InstructorCourseCard } from "@/components/instructor/instructor-course-card"

export default async function InstructorCoursesPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is an instructor or admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) {
    redirect("/dashboard")
  }

  // Get instructor's courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("instructor_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Courses</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search courses..." className="w-full pl-8 md:w-[300px]" />
            </div>
            <Button asChild>
              <Link href="/dashboard/instructor/create">
                <Plus className="mr-2 h-4 w-4" /> Create Course
              </Link>
            </Button>
          </div>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <InstructorCourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium">No courses yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven't created any courses yet. Get started by creating your first course.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/instructor/create">
                <Plus className="mr-2 h-4 w-4" /> Create Course
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

