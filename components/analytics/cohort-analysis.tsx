"use client"

import { useState, useMemo } from "react"
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { HeatMap } from "@/components/analytics/heat-map"

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  created_at: string
  progress: number
  courses: {
    title: string
    category?: string
  }
}

interface CompletedLesson {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  created_at: string
}

interface CohortAnalysisProps {
  enrollments: Enrollment[]
  completedLessons: CompletedLesson[]
}

export function CohortAnalysis({ enrollments, completedLessons }: CohortAnalysisProps) {
  const [timeRange, setTimeRange] = useState("6")
  const [groupBy, setGroupBy] = useState("course")

  // Get unique courses and categories
  const courses = useMemo(() => {
    const uniqueCourses = new Map()
    enrollments.forEach((enrollment) => {
      if (!uniqueCourses.has(enrollment.course_id)) {
        uniqueCourses.set(enrollment.course_id, enrollment.courses)
      }
    })
    return Array.from(uniqueCourses.entries()).map(([id, course]) => ({
      id,
      title: course.title,
      category: course.category,
    }))
  }, [enrollments])

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.category || "Uncategorized")))
  }, [courses])

  // Generate months for the selected time range
  const months = useMemo(() => {
    const now = new Date()
    const monthsAgo = subMonths(now, Number.parseInt(timeRange))

    return eachMonthOfInterval({
      start: monthsAgo,
      end: now,
    }).map((date) => ({
      month: format(date, "MMM yyyy"),
      start: startOfMonth(date),
      end: endOfMonth(date),
    }))
  }, [timeRange])

  // Process data for cohort analysis
  const cohortData = useMemo(() => {
    if (groupBy === "course") {
      // Group by course
      return courses
        .map((course) => {
          const courseEnrollments = enrollments.filter((e) => e.course_id === course.id)

          // Calculate enrollments per month
          const monthlyData = months.map(({ month, start, end }) => {
            const count = courseEnrollments.filter((enrollment) => {
              const enrollmentDate = parseISO(enrollment.created_at)
              return enrollmentDate >= start && enrollmentDate <= end
            }).length

            return { month, count }
          })

          // Calculate completion rate
          const completedCount = courseEnrollments.filter((e) => e.progress === 100).length
          const completionRate =
            courseEnrollments.length > 0 ? Math.round((completedCount / courseEnrollments.length) * 100) : 0

          // Calculate average progress
          const avgProgress =
            courseEnrollments.length > 0
              ? Math.round(courseEnrollments.reduce((acc, e) => acc + e.progress, 0) / courseEnrollments.length)
              : 0

          return {
            id: course.id,
            name: course.title,
            category: course.category || "Uncategorized",
            totalEnrollments: courseEnrollments.length,
            completionRate,
            avgProgress,
            monthlyData,
          }
        })
        .filter((course) => course.totalEnrollments > 0)
        .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
    } else {
      // Group by category
      return categories
        .map((category) => {
          const categoryEnrollments = enrollments.filter((e) => e.courses.category === category)

          // Calculate enrollments per month
          const monthlyData = months.map(({ month, start, end }) => {
            const count = categoryEnrollments.filter((enrollment) => {
              const enrollmentDate = parseISO(enrollment.created_at)
              return enrollmentDate >= start && enrollmentDate <= end
            }).length

            return { month, count }
          })

          // Calculate completion rate
          const completedCount = categoryEnrollments.filter((e) => e.progress === 100).length
          const completionRate =
            categoryEnrollments.length > 0 ? Math.round((completedCount / categoryEnrollments.length) * 100) : 0

          // Calculate average progress
          const avgProgress =
            categoryEnrollments.length > 0
              ? Math.round(categoryEnrollments.reduce((acc, e) => acc + e.progress, 0) / categoryEnrollments.length)
              : 0

          return {
            id: category,
            name: category,
            totalEnrollments: categoryEnrollments.length,
            completionRate,
            avgProgress,
            monthlyData,
          }
        })
        .filter((category) => category.totalEnrollments > 0)
        .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
    }
  }, [enrollments, courses, categories, months, groupBy])

  // Process data for heat map
  const heatMapData = useMemo(() => {
    // Create a matrix of completion activity
    // X-axis: Days of week (0-6, Sunday-Saturday)
    // Y-axis: Hours of day (0-23)
    // Value: Number of lesson completions

    const matrix = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0))

    // Fill the matrix with lesson completion data
    completedLessons.forEach((lesson) => {
      const date = parseISO(lesson.created_at)
      const dayOfWeek = date.getDay() // 0-6
      const hourOfDay = date.getHours() // 0-23

      matrix[dayOfWeek][hourOfDay]++
    })

    // Convert to format needed for heat map
    const heatMapData = []

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatMapData.push({
          day,
          hour,
          value: matrix[day][hour],
        })
      }
    }

    return heatMapData
  }, [completedLessons])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-4">
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="course">Group by Course</SelectItem>
              <SelectItem value="category">Group by Category</SelectItem>
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
      </div>

      <Tabs defaultValue="enrollment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enrollment">Enrollment Trends</TabsTrigger>
          <TabsTrigger value="completion">Completion Rates</TabsTrigger>
          <TabsTrigger value="activity">Activity Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="pt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Distribution by {groupBy === "course" ? "Course" : "Category"}</CardTitle>
              <CardDescription>
                Compare enrollment numbers across {groupBy === "course" ? "courses" : "categories"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cohortData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 150,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                    <XAxis type="number" className="text-xs" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      className="text-xs"
                      tickFormatter={(value) => (value.length > 20 ? `${value.substring(0, 20)}...` : value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => [value, "Enrollments"]}
                      labelClassName="font-medium"
                    />
                    <Bar
                      dataKey="totalEnrollments"
                      name="Total Enrollments"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Enrollment Trends</CardTitle>
              <CardDescription>Track how enrollments have changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {cohortData.length > 0 && (
                  <Tabs defaultValue={cohortData[0].id} className="w-full">
                    <TabsList className="mb-4 flex flex-wrap">
                      {cohortData.map((item) => (
                        <TabsTrigger key={item.id} value={item.id} className="text-xs">
                          {item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {cohortData.map((item) => (
                      <TabsContent key={item.id} value={item.id} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={item.monthlyData}
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
                              formatter={(value: number) => [value, "Enrollments"]}
                              labelClassName="font-medium"
                            />
                            <Bar dataKey="count" name="Enrollments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completion Rates by {groupBy === "course" ? "Course" : "Category"}</CardTitle>
              <CardDescription>
                Compare how students progress through different {groupBy === "course" ? "courses" : "categories"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cohortData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 150,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} unit="%" className="text-xs" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      className="text-xs"
                      tickFormatter={(value) => (value.length > 20 ? `${value.substring(0, 20)}...` : value)}
                    />
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
                      {cohortData.map((entry, index) => (
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
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Activity Heatmap</CardTitle>
              <CardDescription>Visualize when students are most active throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <HeatMap data={heatMapData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

