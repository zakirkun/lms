import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CourseManagement } from "@/components/admin/course-management"

export default async function AdminCoursesPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is an admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all courses
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      profiles (full_name, email)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Course Management</h1>
        </div>

        <CourseManagement initialCourses={courses || []} />
      </div>
    </div>
  )
}

