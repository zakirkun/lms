import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CourseCardProps {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  instructorName: string
  duration: string
  studentsCount: number
  price: number
  className?: string
  style?: React.CSSProperties
}

export function CourseCard({
  id,
  title,
  description,
  thumbnailUrl,
  instructorName,
  duration,
  studentsCount,
  price,
  className = "",
  style,
}: CourseCardProps) {
  return (
    <Card className={`flex h-full flex-col overflow-hidden transition-all card-hover ${className}`} style={style}>
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={thumbnailUrl || "/placeholder.svg?height=225&width=400"}
          alt={title}
          className="h-full w-full object-cover transition-all hover:scale-105"
          width={400}
          height={225}
        />
      </div>
      <CardHeader className="p-4">
        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <h3 className="line-clamp-2 font-semibold leading-tight">{title}</h3>
            {price === 0 ? (
              <Badge
                variant="outline"
                className="ml-2 shrink-0 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
              >
                Free
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{instructorName}</p>
          <div className="flex items-center pt-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 fill-primary text-primary" />
              ))}
            </div>
            <span className="ml-2 text-xs text-muted-foreground">(120)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {duration}
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-3 w-3" />
            {studentsCount} students
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="font-medium">{price > 0 ? `$${price.toFixed(2)}` : "Free"}</div>
        <Button asChild size="sm" className="btn-hover-effect">
          <Link href={`/courses/${id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

