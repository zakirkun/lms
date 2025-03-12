import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Clock, Users, ArrowLeft, Star, CheckCircle, ShoppingCart, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownContent } from "@/components/courses/markdown-content"
import { YouTubePlayer } from "@/components/courses/youtube-player"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CoursePageProps {
  params: {
    courseId: string
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = params
  const supabase = createServerComponentClient({ cookies })

  // Get course details
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq("id", courseId)
    .eq("is_published", true)
    .single()

  if (error || !course) {
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

  // Calculate total lessons and duration
  const totalLessons = sections?.reduce((acc, section) => acc + section.lessons.length, 0) || 0

  let totalDurationMinutes = 0
  sections?.forEach((section) => {
    section.lessons.forEach((lesson) => {
      if (lesson.duration) {
        const match = lesson.duration.match(/(\d+)\s*min/)
        if (match && match[1]) {
          totalDurationMinutes += Number.parseInt(match[1], 10)
        }
      }
    })
  })

  const formattedDuration =
    totalDurationMinutes > 0
      ? totalDurationMinutes >= 60
        ? `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`
        : `${totalDurationMinutes}m`
      : course.duration || "2 hours"

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if user is enrolled in this course
  let isEnrolled = false
  if (session) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("course_id", courseId)
      .single()

    isEnrolled = !!enrollment
  }

  // Get course ratings
  const { data: ratings, error: ratingsError } = await supabase
    .from("course_ratings")
    .select("rating")
    .eq("course_id", courseId)

  const averageRating =
    ratings && ratings.length > 0
      ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
      : "4.8" // Default if no ratings

  // Get preview lesson
  const previewLesson = sections?.length > 0 && sections[0].lessons.length > 0 ? sections[0].lessons[0] : null

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader session={session} />

      <main className="flex-1">
        <div className="container py-8">
          <Link
            href="/courses"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 focus-ring rounded-md px-2 py-1 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {course.price === 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    >
                      Free
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {averageRating}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold sm:text-3xl">{course.title}</h1>
                <p className="text-muted-foreground">{course.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formattedDuration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students_count || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span className="font-medium">{course.profiles.full_name}</span>
                  </div>
                </div>
              </div>

              {/* Preview video */}
              <div className="rounded-lg overflow-hidden border shadow-sm">
                <YouTubePlayer
                  videoId={previewLesson?.video_url || "dQw4w9WgXcQ"}
                  title={`${course.title} - Preview`}
                />
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-6 animate-fade-in">
                  <Card>
                    <CardContent className="pt-6">
                      <MarkdownContent content={course.description} />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="curriculum" className="pt-6 animate-fade-in">
                  <Card>
                    <CardContent className="pt-6">
                      {sections && sections.length > 0 ? (
                        <div className="space-y-6">
                          {sections.map((section) => (
                            <div key={section.id} className="space-y-3">
                              <h3 className="font-medium">{section.title}</h3>
                              <div className="rounded-md border divide-y">
                                {section.lessons &&
                                  section.lessons.map((lesson, index) => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                          {index + 1}
                                        </div>
                                        <span className="line-clamp-1 font-medium">{lesson.title}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{lesson.duration || "10 min"}</Badge>
                                        {index === 0 && <Badge>Preview</Badge>}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <p className="text-muted-foreground">No curriculum available for this course yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="instructor" className="pt-6 animate-fade-in">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src={course.profiles.avatar_url || "/placeholder.svg?height=96&width=96"}
                            alt={course.profiles.full_name}
                          />
                          <AvatarFallback className="text-2xl">{course.profiles.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-bold">{course.profiles.full_name}</h3>
                            <p className="text-muted-foreground">Course Instructor</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{averageRating} Instructor Rating</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{course.students_count || 0} Students</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{totalLessons} Lessons</span>
                            </div>
                          </div>
                          <p className="text-sm">
                            {course.profiles.bio ||
                              "An experienced instructor with expertise in this field. They have helped thousands of students master these concepts through clear explanations and practical examples."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="animate-slide-in-right">
              <Card className="sticky top-24 overflow-hidden">
                <div className="aspect-video w-full">
                  <img
                    src={course.thumbnail_url || "/placeholder.svg?height=225&width=400"}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl gradient-text">${course.price?.toFixed(2) || "Free"}</CardTitle>
                  <CardDescription>
                    {isEnrolled
                      ? "You are enrolled in this course"
                      : "Enroll in this course to get access to all content"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formattedDuration} of content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{course.students_count || 0} students enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{averageRating} average rating</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                        <span>Access on mobile and desktop</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  {isEnrolled ? (
                    <Button className="w-full btn-hover-effect" asChild>
                      <Link href={`/dashboard/my-courses/${courseId}`}>Continue Learning</Link>
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full btn-hover-effect" asChild>
                        <Link href={`/checkout/${courseId}`}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Enroll Now
                        </Link>
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        30-Day Money-Back Guarantee
                        <br />
                        Full Lifetime Access
                      </p>
                    </>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

