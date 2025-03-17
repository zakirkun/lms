"use client"

import { useState, useMemo } from "react"
import { format, subMonths, parseISO, differenceInDays } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  created_at: string
  progress: number
  last_activity_at?: string
  courses: {
    title: string
  }
}

interface CompletedLesson {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  created_at: string
}

interface RetentionAnalysisProps {
  enrollments: Enrollment[]
  completedLessons: CompletedLesson[]
}

export function RetentionAnalysis({ enrollments, completedLessons }: RetentionAnalysisProps) {
  const [timeRange, setTimeRange] = useState("6")
  const [cohortType, setCohortType] = useState("monthly")

  // Group users by enrollment cohort (month or week)
  const cohorts = useMemo(() => {
    const now = new Date()
    const monthsAgo = subMonths(now, Number.parseInt(timeRange))

    // Group enrollments by cohort period
    const cohortGroups: Record<string, string[]> = {}

    enrollments.forEach((enrollment) => {
      const enrollmentDate = parseISO(enrollment.created_at)
      if (enrollmentDate < monthsAgo) return

      let cohortKey
      if (cohortType === "monthly") {
        cohortKey = format(enrollmentDate, "MMM yyyy")
      } else {
        cohortKey = format(enrollmentDate, "'Week of' MMM d, yyyy")
      }

      if (!cohortGroups[cohortKey]) {
        cohortGroups[cohortKey] = []
      }

      cohortGroups[cohortKey].push(enrollment.user_id)
    })

    return cohortGroups
  }, [enrollments, timeRange, cohortType])

  // Calculate retention rates for each cohort
  const retentionData = useMemo(() => {
    const result: any[] = []

    // For each cohort, calculate retention at different time periods
    Object.entries(cohorts).forEach(([cohortName, userIds]) => {
      const cohortSize = userIds.length
      if (cohortSize === 0) return

      const retentionPoints: Record<string, number> = {
        "1 Day": 0,
        "7 Days": 0,
        "14 Days": 0,
        "30 Days": 0,
        "60 Days": 0,
        "90 Days": 0,
      }

      // For each user in cohort, check if they had activity after enrollment
      userIds.forEach((userId) => {
        // Find user's enrollment
        const enrollment = enrollments.find((e) => e.user_id === userId)
        if (!enrollment) return

        const enrollmentDate = parseISO(enrollment.created_at)

        // Get all user's lesson completions after enrollment
        const userLessons = completedLessons.filter(
          (cl) => cl.user_id === userId && parseISO(cl.created_at) > enrollmentDate,
        )

        // Sort by date
        userLessons.sort((a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime())

        // Check retention at each time point
        if (userLessons.length > 0) {
          Object.keys(retentionPoints).forEach((period) => {
            let days = 1
            if (period === "7 Days") days = 7
            else if (period === "14 Days") days = 14
            else if (period === "30 Days") days = 30
            else if (period === "60 Days") days = 60
            else if (period === "90 Days") days = 90

            // Check if user had activity after the specified period
            const hasActivityAfterPeriod = userLessons.some((lesson) => {
              const lessonDate = parseISO(lesson.created_at)
              const daysSinceEnrollment = differenceInDays(lessonDate, enrollmentDate)
              return daysSinceEnrollment >= days
            })

            if (hasActivityAfterPeriod) {
              retentionPoints[period]++
            }
          })
        }
      })

      // Convert to percentages
      Object.keys(retentionPoints).forEach((period) => {
        retentionPoints[period] = Math.round((retentionPoints[period] / cohortSize) * 100)
      })

      result.push({
        name: cohortName,
        ...retentionPoints,
        size: cohortSize,
      })
    })

    // Sort by date (oldest first)
    result.sort((a, b) => {
      const dateA = new Date(a.name.includes("Week of") ? a.name.replace("Week of ", "") : a.name)
      const dateB = new Date(b.name.includes("Week of") ? b.name.replace("Week of ", "") : b.name)
      return dateA.getTime() - dateB.getTime()
    })

    return result
  }, [cohorts, enrollments, completedLessons])

  // Calculate average completion time
  const avgCompletionTime = useMemo(() => {
    let totalDays = 0
    let completedCount = 0

    enrollments.forEach((enrollment) => {
      if (enrollment.progress === 100) {
        // Find the last lesson completion for this enrollment
        const lastCompletion = completedLessons
          .filter((cl) => cl.user_id === enrollment.user_id && cl.course_id === enrollment.course_id)
          .sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime())[0]

        if (lastCompletion) {
          const enrollmentDate = parseISO(enrollment.created_at)
          const completionDate = parseISO(lastCompletion.created_at)
          const days = differenceInDays(completionDate, enrollmentDate)

          if (days >= 0) {
            totalDays += days
            completedCount++
          }
        }
      }
    })

    return completedCount > 0 ? Math.round(totalDays / completedCount) : 0
  }, [enrollments, completedLessons])

  // Calculate dropout rates
  const dropoutRate = useMemo(() => {
    const totalEnrollments = enrollments.length
    if (totalEnrollments === 0) return 0

    const activeEnrollments = enrollments.filter((e) => e.progress > 0).length
    const dropouts = totalEnrollments - activeEnrollments

    return Math.round((dropouts / totalEnrollments) * 100)
  }, [enrollments])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-4">
          <Select value={cohortType} onValueChange={setCohortType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Cohort type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly Cohorts</SelectItem>
              <SelectItem value="weekly">Weekly Cohorts</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Card className="w-[180px]">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Avg. Completion Time</div>
              <div className="text-2xl font-bold">{avgCompletionTime} days</div>
            </CardContent>
          </Card>

          <Card className="w-[180px]">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Dropout Rate</div>
              <div className="text-2xl font-bold">{dropoutRate}%</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Retention Chart</TabsTrigger>
          <TabsTrigger value="table">Cohort Table</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={retentionData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis domain={[0, 100]} unit="%" className="text-xs" />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Retention Rate"]}
                  labelFormatter={(value) => `Cohort: ${value}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="1 Day" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="7 Days" stroke="#82ca9d" />
                <Line type="monotone" dataKey="30 Days" stroke="#ffc658" />
                <Line type="monotone" dataKey="90 Days" stroke="#ff8042" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="table" className="pt-4">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">Cohort</th>
                  <th className="p-2 text-left font-medium">Size</th>
                  <th className="p-2 text-left font-medium">1 Day</th>
                  <th className="p-2 text-left font-medium">7 Days</th>
                  <th className="p-2 text-left font-medium">14 Days</th>
                  <th className="p-2 text-left font-medium">30 Days</th>
                  <th className="p-2 text-left font-medium">60 Days</th>
                  <th className="p-2 text-left font-medium">90 Days</th>
                </tr>
              </thead>
              <tbody>
                {retentionData.map((cohort, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{cohort.name}</td>
                    <td className="p-2">{cohort.size}</td>
                    <td className="p-2">{cohort["1 Day"]}%</td>
                    <td className="p-2">{cohort["7 Days"]}%</td>
                    <td className="p-2">{cohort["14 Days"]}%</td>
                    <td className="p-2">{cohort["30 Days"]}%</td>
                    <td className="p-2">{cohort["60 Days"]}%</td>
                    <td className="p-2">{cohort["90 Days"]}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

