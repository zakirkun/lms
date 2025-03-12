import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { courseId: string }
}) {
  const courseId = searchParams.courseId
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get course details
  const { data: course, error } = await supabase.from("courses").select("title").eq("id", courseId).single()

  if (error) {
    console.error("Error fetching course:", error)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader session={session} />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="max-w-md w-full animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Thank you for your purchase. Your enrollment has been confirmed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="font-medium">Course:</p>
              <p>{course?.title || "Your course"}</p>
            </div>
            <p className="text-center text-muted-foreground">
              You can now access all course materials and start learning right away.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button asChild className="w-full btn-hover-effect">
              <Link href={`/dashboard/my-courses/${courseId}`}>Start Learning</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/my-courses">View All My Courses</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}

