import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is an instructor or admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  const isInstructor = profile?.role === "instructor" || profile?.role === "admin"
  const isAdmin = profile?.role === "admin"

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="w-full md:w-64 md:flex-shrink-0">
        <Sidebar isInstructor={isInstructor} isAdmin={isAdmin} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

