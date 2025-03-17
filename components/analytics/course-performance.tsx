"use client"

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts"

interface Course {
  id: string
  title: string
  students_count: number
}

interface Enrollment {
  id: string
  course_id: string
  progress: number
}

interface CoursePerformanceProps {
  courses: Course[]
  enrollments: Enrollment[]
}

export function CoursePerformance({ courses, enrollments }: CoursePerformanceProps) {
  // Process data for chart
  const chartData = courses.map((course) => {
    const courseEnrollments = enrollments.filter((e) => e.course_id === course.id)
    const avgProgress =
      courseEnrollments.length > 0
        ? Math.round(courseEnrollments.reduce((acc, e) => acc + e.progress, 0) / courseEnrollments.length)
        : 0

    return {
      name: course.title,
      students: course.students_count || 0,
      avgProgress,
      // Size represents the number of enrollments in the last 6 months
      size: courseEnrollments.length,
    }
  })

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            dataKey="students"
            name="Total Students"
            unit=" students"
            domain={[0, "dataMax + 10"]}
            className="text-xs"
          />
          <YAxis
            type="number"
            dataKey="avgProgress"
            name="Average Progress"
            unit="%"
            domain={[0, 100]}
            className="text-xs"
          />
          <ZAxis type="number" dataKey="size" range={[50, 400]} name="Recent Enrollments" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number, name: string) => {
              if (name === "Total Students") return [value, "Total Students"]
              if (name === "Average Progress") return [`${value}%`, "Average Progress"]
              if (name === "Recent Enrollments") return [value, "Recent Enrollments"]
              return [value, name]
            }}
            labelFormatter={(value) => chartData.find((item) => item.students === value)?.name || ""}
          />
          <Scatter name="Courses" data={chartData} fill="hsl(var(--primary))" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

