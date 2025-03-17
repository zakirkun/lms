"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, BookOpen, CheckCircle } from "lucide-react"

interface CompletedLesson {
  id: string
  created_at: string
  course_id: string
  lesson_id: string
  lessons?: {
    title: string
    sections: {
      title: string
      courses: {
        title: string
      }
    }
  }
}

interface Enrollment {
  id: string
  created_at: string
  course_id: string
  courses: {
    title: string
  }
}

interface Rating {
  id: string
  created_at: string
  course_id: string
  rating: number
  courses: {
    title: string
  }
}

type Activity = {
  id: string
  type: "enrollment" | "completion" | "rating"
  created_at: string
  course_title: string
  details: string
}

interface StudentActivityProps {
  completedLessons: CompletedLesson[]
  enrollments: Enrollment[]
  ratings: Rating[]
}

export function StudentActivity({ completedLessons, enrollments, ratings }: StudentActivityProps) {
  const [filter, setFilter] = useState("all")

  // Combine all activities
  const allActivities: Activity[] = [
    ...enrollments.map((enrollment) => ({
      id: enrollment.id,
      type: "enrollment" as const,
      created_at: enrollment.created_at,
      course_title: enrollment.courses.title,
      details: "Enrolled in course",
    })),
    ...completedLessons.map((lesson) => ({
      id: lesson.id,
      type: "completion" as const,
      created_at: lesson.created_at,
      course_title: lesson.lessons?.sections.courses.title || "Unknown Course",
      details: `Completed lesson: ${lesson.lessons?.title || "Unknown Lesson"}`,
    })),
    ...ratings.map((rating) => ({
      id: rating.id,
      type: "rating" as const,
      created_at: rating.created_at,
      course_title: rating.courses.title,
      details: `Rated ${rating.rating}/5 stars`,
    })),
  ]

  // Filter activities
  const filteredActivities =
    filter === "all" ? allActivities : allActivities.filter((activity) => activity.type === filter)

  // Sort by date (newest first)
  const sortedActivities = filteredActivities.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "enrollment":
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case "completion":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rating":
        return <Star className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Activity</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="enrollment">Enrollments</SelectItem>
            <SelectItem value="completion">Completions</SelectItem>
            <SelectItem value="rating">Ratings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {sortedActivities.length > 0 ? (
          sortedActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getActivityIcon(activity.type)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <p className="font-medium">{activity.details}</p>
                  <time className="text-xs text-muted-foreground">
                    {format(parseISO(activity.created_at), "MMM d, yyyy")}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">{activity.course_title}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">No activity found for the selected filter.</div>
        )}
      </div>
    </div>
  )
}

