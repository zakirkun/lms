import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, BookOpen, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MarkdownContent } from "@/components/courses/markdown-content"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface CourseViewPageProps {
  params: {
    courseId: string
  }
}

export default async function CourseViewPage({ params }: CourseViewPageProps) {
  const { courseId } = params
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is enrolled in this course
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)
    .single()

  if (enrollmentError || !enrollment) {
    redirect(`/courses/${courseId}`)
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

  // Get course sections and lessons
  const { data: sections } = await supabase
    .from("sections")
    .select(`
      *,
      lessons (*)
    `)
    .eq("course_id", courseId)
    .order("position")

  // Get completed lessons
  const { data: completedLessons, count: completedCount } = await supabase
    .from("completed_lessons")
    .select("lesson_id", { count: "exact" })
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)

  const completedLessonIds = completedLessons?.map((item) => item.lesson_id) || []

  // Calculate progress
  const totalLessons = sections?.reduce((acc, section) => acc + section.lessons.length, 0) || 0
  const progress = totalLessons > 0 ? Math.round(((completedCount || 0) / totalLessons) * 100) : 0

  // Update enrollment progress if needed
  if (enrollment.progress !== progress) {
    await supabase.from("enrollments").update({ progress }).eq("id", enrollment.id)
  }

  // Get first incomplete lesson for "Continue Learning" button
  let nextLessonId = null
  if (sections && sections.length > 0) {
    for (const section of sections) {
      if (section.lessons && section.lessons.length > 0) {
        for (const lesson of section.lessons) {
          if (!completedLessonIds.includes(lesson.id)) {
            nextLessonId = lesson.id
            break
          }
        }
        if (nextLessonId) break
      }
    }

    // If all lessons are completed, use the first lesson
    if (!nextLessonId && sections[0].lessons && sections[0].lessons.length > 0) {
      nextLessonId = sections[0].lessons[0].id
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link
            href="/dashboard/my-courses"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-md px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Courses
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-2 w-24" />
              <span className="text-sm">{progress}% complete</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-2">Instructor: {course.profiles.full_name}</p>
            </div>

            {progress === 100 ? (
              <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-green-800 dark:text-green-400">Course Completed!</CardTitle>
                  </div>
                  <CardDescription className="text-green-700 dark:text-green-500">
                    Congratulations on completing this course. You've mastered all the lessons.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 dark:text-green-500">
                    You can now download your certificate of completion or continue reviewing the course materials.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                    <Link href={`/dashboard/my-courses/${courseId}/certificate`}>
                      <Award className="mr-2 h-4 w-4" />
                      View Certificate
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                  <CardDescription>
                    You've completed {completedCount || 0} out of {totalLessons} lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Continue your learning journey to earn your certificate of completion.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  {nextLessonId ? (
                    <Button asChild className="btn-hover-effect">
                      <Link href={`/dashboard/my-courses/${courseId}/lessons/${nextLessonId}`}>Continue Learning</Link>
                    </Button>
                  ) : (
                    <Button disabled>No Lessons Available</Button>
                  )}
                </CardFooter>
              </Card>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-bold">About This Course</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <MarkdownContent content={course.description} />
              </div>
            </div>
          </div>

          <div className="space-y-6 animate-slide-in-right">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {totalLessons} lessons • {course.duration || "2 hours"} total length
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {sections && sections.length > 0 ? (
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <div key={section.id} className="space-y-2">
                        <h3 className="font-medium">{section.title}</h3>
                        <ul className="space-y-1 border rounded-md divide-y">
                          {section.lessons &&
                            section.lessons.map((lesson: any) => {
                              const isCompleted = completedLessonIds.includes(lesson.id)

                              return (
                                <li key={lesson.id}>
                                  <Link
                                    href={`/dashboard/my-courses/${courseId}/lessons/${lesson.id}`}
                                    className="flex items-center gap-2 p-3 hover:bg-muted transition-colors"
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border border-muted-foreground shrink-0" />
                                    )}
                                    <div className="flex-1">
                                      <span className={`line-clamp-1 ${isCompleted ? "text-muted-foreground" : ""}`}>
                                        {lesson.title}
                                      </span>
                                      {lesson.duration && (
                                        <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                      )}
                                    </div>
                                  </Link>
                                </li>
                              )
                            })}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No content available for this course yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <BookOpen className="h-4 w-4" />
                      Course slides
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <BookOpen className="h-4 w-4" />
                      Exercise files
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <BookOpen className="h-4 w-4" />
                      Additional reading
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

