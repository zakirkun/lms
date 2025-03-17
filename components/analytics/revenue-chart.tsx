"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Payment {
  id: string
  amount: number
  created_at: string
  course_id: string
  courses: {
    title: string
  }
}

interface RevenueChartProps {
  payments: Payment[]
}

export function RevenueChart({ payments }: RevenueChartProps) {
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

  // Process data for area chart
  const areaChartData = months.map(({ month, start, end }) => {
    const monthPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.created_at)
      return paymentDate >= start && paymentDate <= end
    })

    const revenue = monthPayments.reduce((acc, payment) => acc + payment.amount, 0)

    return {
      month,
      revenue,
    }
  })

  // Process data for pie chart
  const courseRevenue = payments.reduce(
    (acc, payment) => {
      const courseId = payment.course_id
      const courseTitle = payment.courses.title

      if (!acc[courseId]) {
        acc[courseId] = {
          name: courseTitle,
          value: 0,
        }
      }

      acc[courseId].value += payment.amount

      return acc
    },
    {} as Record<string, { name: string; value: number }>,
  )

  const pieChartData = Object.values(courseRevenue)
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      ...item,
      name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
    }))

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"]

  const totalRevenue = payments.reduce((acc, payment) => acc + payment.amount, 0)

  return (
    <div className="h-full w-full">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg font-medium">Total Revenue: ${totalRevenue.toFixed(2)}</div>
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

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Revenue Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Revenue Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={areaChartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
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
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                labelClassName="font-medium"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="distribution" className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                labelClassName="font-medium"
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}

