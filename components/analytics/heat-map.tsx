"use client"

import { useMemo } from "react"

interface HeatMapProps {
  data: Array<{
    day: number
    hour: number
    value: number
  }>
}

export function HeatMap({ data }: HeatMapProps) {
  // Find the maximum value for scaling
  const maxValue = useMemo(() => {
    return Math.max(...data.map((item) => item.value), 1)
  }, [data])

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Generate color based on value
  const getColor = (value: number) => {
    // Calculate intensity (0-1)
    const intensity = value / maxValue

    // Use a color scale from light to dark
    if (intensity === 0) return "bg-muted/30"
    if (intensity < 0.2) return "bg-primary/10"
    if (intensity < 0.4) return "bg-primary/30"
    if (intensity < 0.6) return "bg-primary/50"
    if (intensity < 0.8) return "bg-primary/70"
    return "bg-primary"
  }

  // Group data by day and hour
  const heatMapMatrix = useMemo(() => {
    const matrix: number[][] = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0))

    data.forEach((item) => {
      matrix[item.day][item.hour] = item.value
    })

    return matrix
  }, [data])

  return (
    <div className="w-full h-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex">
          <div className="w-12"></div>
          <div className="flex-1 flex">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                {hour === 0 ? "12am" : hour === 12 ? "12pm" : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
              </div>
            ))}
          </div>
        </div>

        {dayNames.map((day, dayIndex) => (
          <div key={day} className="flex h-10">
            <div className="w-12 flex items-center justify-end pr-2 text-xs text-muted-foreground">{day}</div>
            <div className="flex-1 flex">
              {Array.from({ length: 24 }).map((_, hour) => {
                const value = heatMapMatrix[dayIndex][hour]
                return (
                  <div
                    key={hour}
                    className={`flex-1 m-0.5 rounded-sm ${getColor(value)} flex items-center justify-center`}
                    title={`${day} ${hour}:00 - ${value} completions`}
                  >
                    {value > 0 && value > maxValue * 0.5 && (
                      <span className="text-xs font-medium text-white">{value}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="flex mt-4 items-center">
          <div className="w-12 text-xs text-muted-foreground">Activity:</div>
          <div className="flex-1 flex items-center gap-1">
            <div className="h-4 w-4 rounded-sm bg-muted/30"></div>
            <span className="text-xs text-muted-foreground mr-2">None</span>

            <div className="h-4 w-4 rounded-sm bg-primary/10"></div>
            <span className="text-xs text-muted-foreground mr-2">Low</span>

            <div className="h-4 w-4 rounded-sm bg-primary/30"></div>
            <span className="text-xs text-muted-foreground mr-2">Medium</span>

            <div className="h-4 w-4 rounded-sm bg-primary/70"></div>
            <span className="text-xs text-muted-foreground mr-2">High</span>

            <div className="h-4 w-4 rounded-sm bg-primary"></div>
            <span className="text-xs text-muted-foreground">Very High</span>
          </div>
        </div>
      </div>
    </div>
  )
}

