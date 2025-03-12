import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { CheckoutForm } from "@/components/checkout/checkout-form"

interface CheckoutPageProps {
  params: {
    courseId: string
  }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { courseId } = params
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/login?redirect=/checkout/${courseId}`)
  }

  // Get course details
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      profiles (full_name)
    `)
    .eq("id", courseId)
    .eq("is_published", true)
    .single()

  if (error || !course) {
    notFound()
  }

  // Check if user is already enrolled in this course
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)
    .single()

  if (enrollment) {
    redirect(`/dashboard/my-courses/${courseId}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          <span className="text-xl font-bold">EduLearn</span>
        </Link>
      </header>
      <main className="flex-1 py-8">
        <div className="container max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h1 className="text-2xl font-bold">Checkout</h1>
              <p className="mt-2 text-muted-foreground">Complete your purchase to access the course</p>

              <div className="mt-8">
                <CheckoutForm course={course} userId={session.user.id} />
              </div>
            </div>

            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-24 overflow-hidden rounded-md bg-muted">
                    <img
                      src={course.thumbnail_url || "/placeholder.svg?height=64&width=96"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      width={96}
                      height={64}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">By {course.profiles.full_name}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span>${course.price?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Tax</span>
                    <span>${(course.price * 0.1).toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                    <span>Total</span>
                    <span>${(course.price * 1.1).toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

