import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnrollmentChart } from "@/components/analytics/enrollment-chart"
import { CompletionRateChart } from "@/components/analytics/completion-rate-chart"
import { EngagementMetrics } from "@/components/analytics/engagement-metrics"
import { CoursePerformance } from "@/components/analytics/course-performance"
import { StudentActivity } from "@/components/analytics/student-activity"
import { RetentionAnalysis } from "@/components/analytics/retention-analysis"
import { CohortAnalysis } from "@/components/analytics/cohort-analysis"
import { LearningPathRecommendations } from "@/components/analytics/learning-path-recommendations"

export default async function InstructorAnalyticsPage() {
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

  // Get instructor's courses
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, created_at, students_count, description, price, category, level, tags")
    .eq("instructor_id", session.user.id)
    .order("created_at", { ascending: false })

  // Get enrollment data for the past 12 months
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id, 
      created_at, 
      course_id, 
      progress,
      user_id,
      courses (title, category)
    `)
    .eq("courses.instructor_id", session.user.id)
    .gte("created_at", twelveMonthsAgo.toISOString())
    .order("created_at", { ascending: true })

  // Get payment data
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      created_at,
      status,
      course_id,
      courses (title)
    `)
    .eq("courses.instructor_id", session.user.id)
    .eq("status", "completed")
    .gte("created_at", twelveMonthsAgo.toISOString())
    .order("created_at", { ascending: true })

  // Get lesson completion data
  const { data: completedLessons } = await supabase
    .from("completed_lessons")
    .select(`
      id,
      created_at,
      course_id,
      lesson_id,
      user_id,
      lessons (
        title,
        sections (
          title,
          course_id,
          courses (
            title,
            instructor_id
          )
        )
      )
    `)
    .eq("lessons.sections.courses.instructor_id", session.user.id)
    .gte("created_at", twelveMonthsAgo.toISOString())
    .order("created_at", { ascending: true })

  // Get course ratings
  const { data: ratings } = await supabase
    .from("course_ratings")
    .select(`
      id,
      rating,
      review,
      created_at,
      course_id,
      courses (title)
    `)
    .eq("courses.instructor_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track student engagement and course performance</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="completion">Completion</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {courses?.reduce((acc, course) => acc + (course.students_count || 0), 0) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Across {courses?.length || 0} courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">In the last 12 months</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {enrollments && enrollments.length > 0
                      ? `${Math.round(
                          (enrollments.filter((e) => e.progress === 100).length / enrollments.length) * 100,
                        )}%`
                      : "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground">Average across all courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${payments?.reduce((acc, payment) => acc + payment.amount, 0).toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">In the last 12 months</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Enrollment Trends</CardTitle>
                  <CardDescription>New student enrollments over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <EnrollmentChart data={enrollments || []} />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Course Performance</CardTitle>
                  <CardDescription>Comparison of your courses by enrollment and completion</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <CoursePerformance courses={courses || []} enrollments={enrollments || []} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="pt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Engagement Metrics</CardTitle>
                <CardDescription>Track how students interact with your course content</CardDescription>
              </CardHeader>
              <CardContent>
                <EngagementMetrics completedLessons={completedLessons || []} courses={courses || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Activity Timeline</CardTitle>
                <CardDescription>Recent student activity across your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentActivity
                  completedLessons={completedLessons || []}
                  enrollments={enrollments || []}
                  ratings={ratings || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completion" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Completion Rates</CardTitle>
                <CardDescription>Track how many students complete your courses</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <CompletionRateChart courses={courses || []} enrollments={enrollments || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Retention Analysis</CardTitle>
                <CardDescription>Track how students continue to engage with your courses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <RetentionAnalysis enrollments={enrollments || []} completedLessons={completedLessons || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohorts" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Analysis</CardTitle>
                <CardDescription>Analyze student behavior by enrollment cohorts</CardDescription>
              </CardHeader>
              <CardContent>
                <CohortAnalysis enrollments={enrollments || []} completedLessons={completedLessons || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Path Recommendations</CardTitle>
                <CardDescription>Suggested learning paths based on student behavior and course content</CardDescription>
              </CardHeader>
              <CardContent>
                <LearningPathRecommendations
                  courses={courses || []}
                  enrollments={enrollments || []}
                  completedLessons={completedLessons || []}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

