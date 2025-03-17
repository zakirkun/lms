"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CompletedLesson {
  id: string
  created_at: string
  course_id: string
  lesson_id: string
}

interface Course {
  id: string
  title: string
}

interface EngagementMetricsProps {
  completedLessons: CompletedLesson[]
  courses: Course[]
}

export function EngagementMetrics({ completedLessons, courses }: EngagementMetricsProps) {
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [timeRange, setTimeRange] = useState("30")

  // Filter lessons by selected course
  const filteredLessons =
    selectedCourse === "all"
      ? completedLessons
      : completedLessons.filter((lesson) => lesson.course_id === selectedCourse)

  // Generate days for the selected time range
  const now = new Date()
  const daysAgo = subDays(now, Number.parseInt(timeRange))

  const days = eachDayOfInterval({
    start: daysAgo,
    end: now,
  }).map((date) => ({
    day: format(date, "MMM dd"),
    start: startOfDay(date),
    end: endOfDay(date),
  }))

  // Process data for chart
  const chartData = days.map(({ day, start, end }) => {
    const count = filteredLessons.filter((lesson) => {
      const lessonDate = new Date(lesson.created_at)
      return lessonDate >= start && lessonDate <= end
    }).length

    return {
      day,
      completions: count,
    }
  })

  // Calculate metrics
  const totalCompletions = filteredLessons.length

  // Calculate average completions per day
  const avgCompletionsPerDay = totalCompletions > 0 && days.length > 0 ? (totalCompletions / days.length).toFixed(1) : 0

  // Find the day with most activity
  const mostActiveDay = chartData.reduce((max, day) => (day.completions > max.completions ? day : max), {
    day: "",
    completions: 0,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title.length > 25 ? course.title.substring(0, 25) + "..." : course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Card className="w-[150px]">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Total Completions</div>
              <div className="text-2xl font-bold">{totalCompletions}</div>
            </CardContent>
          </Card>

          <Card className="w-[150px]">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Avg. Per Day</div>
              <div className="text-2xl font-bold">{avgCompletionsPerDay}</div>
            </CardContent>
          </Card>

          <Card className="w-[150px]">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Most Active Day</div>
              <div className="text-lg font-bold">{mostActiveDay.completions > 0 ? mostActiveDay.day : "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelClassName="font-medium"
            />
            <Line
              type="monotone"
              dataKey="completions"
              name="Lesson Completions"
              stroke="hsl(var(--primary))"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

