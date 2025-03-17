"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, TrendingUp, Award } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  price: number
  students_count: number
  category?: string
  level?: string
  tags?: string[]
  prerequisites?: string[]
  instructor_id: string
  thumbnailUrl: string
  profiles: {
    full_name: string
  }
}

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  progress: number
}

interface CompletedLesson {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
}

interface LearningPathRecommendationsProps {
  courses: Course[]
  enrollments: Enrollment[]
  completedLessons: CompletedLesson[]
  userId?: string
}

export function LearningPathRecommendations({
  courses,
  enrollments,
  completedLessons,
  userId,
}: LearningPathRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Extract unique categories from courses
  const categories = Array.from(new Set(courses.map((course) => course.category || "Uncategorized")))

  // Get user's enrolled courses
  const userEnrollments = userId ? enrollments.filter((enrollment) => enrollment.user_id === userId) : []

  const enrolledCourseIds = userEnrollments.map((enrollment) => enrollment.course_id)

  // Get user's completed courses
  const completedCourseIds = userEnrollments
    .filter((enrollment) => enrollment.progress === 100)
    .map((enrollment) => enrollment.course_id)

  // Get courses the user hasn't enrolled in yet
  const availableCourses = courses.filter((course) => !enrolledCourseIds.includes(course.id))

  // Filter by selected category if not "all"
  const filteredCourses =
    selectedCategory === "all"
      ? availableCourses
      : availableCourses.filter((course) => course.category === selectedCategory)

  // Generate learning paths based on user's completed courses
  const generateLearningPaths = () => {
    // If user has no completed courses, recommend popular beginner courses
    if (completedCourseIds.length === 0) {
      return {
        title: "Recommended for Beginners",
        description: "Popular courses to start your learning journey",
        courses: filteredCourses
          .filter((course) => course.level === "beginner")
          .sort((a, b) => (b.students_count || 0) - (a.students_count || 0))
          .slice(0, 3),
      }
    }

    // Get the categories of completed courses
    const completedCourses = courses.filter((course) => completedCourseIds.includes(course.id))
    const completedCategories = completedCourses.map((course) => course.category)

    // Recommend courses in the same categories but at a higher level
    const nextLevelCourses = filteredCourses.filter(
      (course) =>
        completedCategories.includes(course.category) &&
        (course.level === "intermediate" || course.level === "advanced"),
    )

    // If we have next level courses, recommend those
    if (nextLevelCourses.length > 0) {
      return {
        title: "Next Level Courses",
        description: "Take your skills to the next level with these advanced courses",
        courses: nextLevelCourses.slice(0, 3),
      }
    }

    // Otherwise, recommend popular courses in related categories
    return {
      title: "Expand Your Knowledge",
      description: "Explore related topics to broaden your expertise",
      courses: filteredCourses.sort((a, b) => (b.students_count || 0) - (a.students_count || 0)).slice(0, 3),
    }
  }

  // Generate career path recommendations
  const generateCareerPaths = () => {
    const careerPaths = [
      {
        title: "Web Development Path",
        description: "Become a full-stack web developer",
        courses: filteredCourses
          .filter(
            (course) =>
              course.category === "Web Development" ||
              course.tags?.includes("javascript") ||
              course.tags?.includes("react"),
          )
          .slice(0, 3),
      },
      {
        title: "Data Science Path",
        description: "Master data analysis and machine learning",
        courses: filteredCourses
          .filter(
            (course) =>
              course.category === "Data Science" ||
              course.tags?.includes("python") ||
              course.tags?.includes("machine learning"),
          )
          .slice(0, 3),
      },
      {
        title: "Mobile Development Path",
        description: "Build mobile apps for iOS and Android",
        courses: filteredCourses
          .filter(
            (course) =>
              course.category === "Mobile Development" ||
              course.tags?.includes("react native") ||
              course.tags?.includes("flutter"),
          )
          .slice(0, 3),
      },
    ]

    // Return only career paths that have courses
    return careerPaths.filter((path) => path.courses.length > 0)
  }

  const learningPath = generateLearningPaths()
  const careerPaths = generateCareerPaths()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Learning Path Recommendations</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Personalized Learning Path */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>{learningPath.title}</CardTitle>
          </div>
          <CardDescription>{learningPath.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {learningPath.courses.length > 0 ? (
              learningPath.courses.map((course, index) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={course.thumbnailUrl || `/placeholder.svg?height=225&width=400&text=Course+${index + 1}`}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-medium line-clamp-1">{course.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{course.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline">{course.level || "Beginner"}</Badge>
                      <span className="text-sm font-medium">
                        {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/courses/${course.id}`}>View Course</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                No course recommendations available for the selected category.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Career Paths */}
      {careerPaths.map((path, pathIndex) => (
        <Card key={pathIndex}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>{path.title}</CardTitle>
            </div>
            <CardDescription>{path.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2"></div>
              <div className="grid gap-4 md:grid-cols-3 relative">
                {path.courses.map((course, index) => (
                  <div key={course.id} className="relative">
                    {index < path.courses.length - 1 && (
                      <ArrowRight className="absolute -right-2 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2 z-10 hidden md:block" />
                    )}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {index + 1}
                          </div>
                          <h4 className="font-medium line-clamp-1">{course.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{course.level || "Beginner"}</Badge>
                          <span className="text-sm font-medium">
                            {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button asChild size="sm" variant="outline" className="w-full">
                          <Link href={`/courses/${course.id}`}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Course
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

