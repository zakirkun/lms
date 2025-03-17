import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CertificateTemplate } from "@/components/courses/certificate-template"

interface CertificatePageProps {
  params: {
    courseId: string
  }
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { courseId } = params
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get course details
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(`
      *,
      profiles (full_name)
    `)
    .eq("id", courseId)
    .single()

  if (courseError || !course) {
    notFound()
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Get enrollment details
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)
    .single()

  if (enrollmentError || !enrollment) {
    redirect(`/courses/${courseId}`)
  }

  // Check if all lessons are completed
  const { data: lessons } = await supabase
    .from("lessons")
    .select(`
      id,
      sections!inner (
        course_id
      )
    `)
    .eq("sections.course_id", courseId)

  const { data: completedLessons, count: completedCount } = await supabase
    .from("completed_lessons")
    .select("lesson_id", { count: "exact" })
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)

  const totalLessons = lessons?.length || 0
  const progress = totalLessons > 0 ? Math.round(((completedCount || 0) / totalLessons) * 100) : 0

  // If not all lessons are completed, redirect to course page
  if (progress < 100) {
    redirect(`/dashboard/my-courses/${courseId}`)
  }

  // Generate certificate ID
  const certificateId = `CERT-${courseId.substring(0, 8)}-${session.user.id.substring(0, 8)}`
  const completionDate = new Date()

  // Get organization settings (in a real app, this would come from your database)
  const orgSettings = {
    logoUrl: "/placeholder.svg?height=60&width=200&text=EduLearn",
    signatureUrl: "/placeholder.svg?height=40&width=150&text=Signature",
    certificateTheme: "default" as "default" | "modern" | "classic" | "minimal",
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link
            href={`/dashboard/my-courses/${courseId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-md px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
        </div>
      </header>

      <div className="container py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <Award className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Course Completion Certificate</h1>
            <p className="text-muted-foreground">Congratulations on completing the course!</p>
          </div>

          <Card className="p-6 border-2 border-primary/20 bg-card/50 animate-scale-up">
            <CertificateTemplate
              studentName={profile.full_name || session.user.email || "Student"}
              courseName={course.title}
              instructorName={course.profiles.full_name}
              completionDate={completionDate}
              certificateId={certificateId}
              logoUrl={orgSettings.logoUrl}
              signatureUrl={orgSettings.signatureUrl}
              theme={orgSettings.certificateTheme}
            />
          </Card>

          <div className="text-center mt-8 animate-fade-in animate-delay-300">
            <p className="text-muted-foreground mb-4">
              This certificate verifies your successful completion of the course. You can download it or share it on
              your social media profiles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-hover-effect">
                <Link href="/dashboard/my-courses">Explore More Courses</Link>
              </Button>
              <Button variant="outline">View Your Achievements</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

