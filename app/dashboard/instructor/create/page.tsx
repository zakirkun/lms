import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CourseCreationForm } from "@/components/instructor/course-creation-form"

export default async function CreateCoursePage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is an instructor
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) {
    redirect("/dashboard")
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Create New Course</h1>
        <CourseCreationForm userId={session.user.id} />
      </div>
    </div>
  )
}

