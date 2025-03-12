import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { YouTubePlayer } from "@/components/courses/youtube-player"
import { MarkdownContent } from "@/components/courses/markdown-content"
import { LessonCompletionButton } from "@/components/courses/lesson-completion-button"

interface LessonViewPageProps {
  params: {
    courseId: string
    lessonId: string
  }
}

export default async function LessonViewPage({ params }: LessonViewPageProps) {
  const { courseId, lessonId } = params
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

  // Get current lesson details
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select(`
      *,
      sections (
        id,
        title,
        course_id
      )
    `)
    .eq("id", lessonId)
    .single()

  if (lessonError || !lesson) {
    notFound()
  }

  // Get all lessons for this course to determine next and previous
  const { data: allLessons } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      position,
      section_id,
      sections (
        id,
        position,
        course_id
      )
    `)
    .eq("sections.course_id", courseId)
    .order("sections.position", { ascending: true })
    .order("position", { ascending: true })

  // Check if lesson is completed
  const { data: completedLesson } = await supabase
    .from("completed_lessons")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("lesson_id", lessonId)
    .single()

  const isCompleted = !!completedLesson

  // Find next and previous lessons
  let nextLesson = null
  let prevLesson = null

  if (allLessons) {
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
    if (currentIndex > 0) {
      prevLesson = allLessons[currentIndex - 1]
    }
    if (currentIndex < allLessons.length - 1) {
      nextLesson = allLessons[currentIndex + 1]
    }
  }

  // Get completed lessons count for progress calculation
  const { data: completedLessons, count: completedCount } = await supabase
    .from("completed_lessons")
    .select("lesson_id", { count: "exact" })
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)

  const totalLessons = allLessons?.length || 0
  const progress = totalLessons > 0 ? Math.round(((completedCount || 0) / totalLessons) * 100) : 0

  // Update enrollment progress
  if (enrollment.progress !== progress) {
    await supabase.from("enrollments").update({ progress }).eq("id", enrollment.id)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 z-10 bg-background glass-effect">
        <div className="container flex h-16 items-center px-4">
          <Link
            href={`/dashboard/my-courses/${courseId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-md px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-2 w-24" />
              <span className="text-sm">{progress}% complete</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container grid flex-1 gap-12 md:grid-cols-[1fr_300px] px-4 py-6">
        <main className="flex flex-col gap-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground mt-2">
              <span className="inline-flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {lesson.duration || "10 min"}
              </span>
            </p>
          </div>

          <div className="space-y-8">
            {lesson.video_url && (
              <div className="rounded-lg overflow-hidden border shadow-sm">
                <YouTubePlayer videoId={lesson.video_url} title={lesson.title} />
              </div>
            )}

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <MarkdownContent content={lesson.content || "No content available for this lesson."} />
            </div>

            <div className="flex justify-between pt-6 border-t">
              {prevLesson ? (
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/my-courses/${courseId}/lessons/${prevLesson.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous Lesson
                  </Link>
                </Button>
              ) : (
                <div></div>
              )}

              {nextLesson ? (
                <Button asChild className="btn-hover-effect">
                  <Link href={`/dashboard/my-courses/${courseId}/lessons/${nextLesson.id}`}>
                    Next Lesson <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="btn-hover-effect">
                  <Link href={`/dashboard/my-courses/${courseId}/certificate`}>
                    Complete Course <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <LessonCompletionButton lessonId={lessonId} courseId={courseId} isCompleted={isCompleted} />
            </div>
          </div>
        </main>

        <aside className="space-y-6 animate-slide-in-right">
          <div>
            <h2 className="text-lg font-medium mb-4">Course Content</h2>
            <div className="space-y-4">
              {allLessons && allLessons.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  {allLessons
                    .reduce((acc: any[], lesson) => {
                      const lastSection = acc[acc.length - 1]

                      if (!lastSection || lastSection.id !== lesson.sections.id) {
                        acc.push({
                          id: lesson.sections.id,
                          title: lesson.sections.title,
                          lessons: [lesson],
                        })
                      } else {
                        lastSection.lessons.push(lesson)
                      }

                      return acc
                    }, [])
                    .map((section) => (
                      <div key={section.id} className="border-b last:border-b-0">
                        <div className="bg-muted/50 px-3 py-2 font-medium text-sm">{section.title}</div>
                        <ul className="divide-y">
                          {section.lessons.map((lesson: any) => {
                            const isCurrentLesson = lesson.id === lessonId
                            const isLessonCompleted = completedLessons?.some((cl) => cl.lesson_id === lesson.id)

                            return (
                              <li key={lesson.id}>
                                <Link
                                  href={`/dashboard/my-courses/${courseId}/lessons/${lesson.id}`}
                                  className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                                    isCurrentLesson ? "bg-muted font-medium" : ""
                                  }`}
                                >
                                  {isLessonCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border border-muted-foreground shrink-0" />
                                  )}
                                  <span className={`line-clamp-1 ${isLessonCompleted ? "text-muted-foreground" : ""}`}>
                                    {lesson.title}
                                  </span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">No lessons available</div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-medium mb-4">Resources</h2>
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
          </div>
        </aside>
      </div>
    </div>
  )
}

