"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Enrollment {
    id: any;
    created_at: any;
    course_id: any;
    progress: any;
    courses: {
        title: any;
        category: any;
    }
}

interface EnrollmentChartProps {
  data: Enrollment[]
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  const [timeRange, setTimeRange] = useState("6")

  // Generate months for the selected time range
  const now = new Date()
  const monthsAgo = subMonths(now, Number.parseInt(timeRange))

  const months = eachMonthOfInterval({
    start: monthsAgo,
    end: now,
  }).map((date) => ({
    month: format(date, "MMM yyyy"),
    start: startOfMonth(date),
    end: endOfMonth(date),
  }))

  // Process data for chart
  const chartData = months.map(({ month, start, end }) => {
    const count = data.filter((enrollment) => {
      const enrollmentDate = new Date(enrollment.created_at)
      return enrollmentDate >= start && enrollmentDate <= end
    }).length

    return {
      month,
      enrollments: count,
    }
  })

  return (
    <div className="h-full w-full">
      <div className="mb-4 flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelClassName="font-medium"
          />
          <Legend />
          <Bar dataKey="enrollments" name="New Enrollments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

