"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"

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

interface CompletionRateChartProps {
  courses: Course[]
  enrollments: Enrollment[]
}

export function CompletionRateChart({ courses, enrollments }: CompletionRateChartProps) {
  // Process data for chart
  const chartData = courses
    .map((course) => {
      const courseEnrollments = enrollments.filter((e) => e.course_id === course.id)
      const completedCount = courseEnrollments.filter((e) => e.progress === 100).length
      const completionRate =
        courseEnrollments.length > 0 ? Math.round((completedCount / courseEnrollments.length) * 100) : 0

      return {
        name: course.title.length > 20 ? course.title.substring(0, 20) + "..." : course.title,
        completionRate,
        enrollments: courseEnrollments.length,
      }
    })
    .sort((a, b) => b.completionRate - a.completionRate)

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 20,
            right: 50,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} unit="%" className="text-xs" />
          <YAxis type="category" dataKey="name" width={150} className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number) => [`${value}%`, "Completion Rate"]}
            labelClassName="font-medium"
          />
          <Bar dataKey="completionRate" name="Completion Rate" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.completionRate > 75
                    ? "hsl(var(--success))"
                    : entry.completionRate > 50
                      ? "hsl(var(--primary))"
                      : entry.completionRate > 25
                        ? "hsl(var(--warning))"
                        : "hsl(var(--destructive))"
                }
              />
            ))}
            <LabelList dataKey="completionRate" position="right" formatter={(value: number) => `${value}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

