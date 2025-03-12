import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { BookOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function MyCoursesPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return <div>Loading...</div>
  }

  // Get user's enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      courses (
        id,
        title,
        description,
        thumbnail_url,
        duration,
        profiles (
          full_name
        )
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Get completed courses (progress = 100)
  const completedCourses = enrollments?.filter((enrollment) => enrollment.progress === 100) || []

  // Get in-progress courses (progress < 100)
  const inProgressCourses = enrollments?.filter((enrollment) => enrollment.progress < 100) || []

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Learning</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search courses..." className="w-full pl-8 md:w-[300px]" />
            </div>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Courses ({enrollments?.length || 0})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="pt-6">
            {renderCourseGrid(enrollments || [])}
          </TabsContent>

          <TabsContent value="in-progress" className="pt-6">
            {renderCourseGrid(inProgressCourses)}
          </TabsContent>

          <TabsContent value="completed" className="pt-6">
            {renderCourseGrid(completedCourses)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function renderCourseGrid(enrollments: any[]) {
  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-medium">No courses found</h2>
        <p className="mt-2 text-sm text-muted-foreground">You don't have any courses in this category.</p>
        <Button asChild className="mt-6">
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((enrollment) => (
        <Card key={enrollment.id} className="overflow-hidden">
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={enrollment.courses.thumbnail_url || "/placeholder.svg?height=225&width=400"}
              alt={enrollment.courses.title}
              className="h-full w-full object-cover"
              width={400}
              height={225}
            />
          </div>
          <CardHeader className="p-4">
            <div className="space-y-1">
              <h3 className="font-semibold leading-none">{enrollment.courses.title}</h3>
              <p className="text-sm text-muted-foreground">{enrollment.courses.profiles.full_name}</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{enrollment.progress || 0}%</span>
              </div>
              <Progress value={enrollment.progress || 0} className="h-2" />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button asChild className="w-full">
              <Link href={`/dashboard/my-courses/${enrollment.course_id}`}>
                {enrollment.progress > 0 ? "Continue Learning" : "Start Course"}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

