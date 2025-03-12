"use client"

import { useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { CheckCircle, Edit, MoreHorizontal, Trash, Users, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  price: number | null
  is_published: boolean
  students_count: number
}

interface InstructorCourseCardProps {
  course: Course
}

export function InstructorCourseCard({ course }: InstructorCourseCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("courses").delete().eq("id", course.id)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Course deleted",
        description: `"${course.title}" has been deleted.`,
      })

      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete course",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePublish = async () => {
    setIsLoading(true)

    try {
      const newPublishState = !course.is_published

      const { error } = await supabase.from("courses").update({ is_published: newPublishState }).eq("id", course.id)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: newPublishState ? "Course published" : "Course unpublished",
        description: `"${course.title}" has been ${newPublishState ? "published" : "unpublished"}.`,
      })

      setIsPublishDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={course.thumbnail_url || "/placeholder.svg?height=225&width=400"}
            alt={course.title}
            className="h-full w-full object-cover"
            width={400}
            height={225}
          />
        </div>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold leading-none">{course.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/instructor/courses/${course.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Course
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPublishDialogOpen(true)}>
                  {course.is_published ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Publish
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between">
            <Badge variant={course.is_published ? "default" : "secondary"} className="flex items-center gap-1">
              {course.is_published ? (
                <>
                  <CheckCircle className="h-3 w-3" /> Published
                </>
              ) : (
                <>
                  <X className="h-3 w-3" /> Draft
                </>
              )}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-3 w-3" />
              {course.students_count} students
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0">
          <div className="font-medium">{course.price ? `$${course.price.toFixed(2)}` : "Free"}</div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/courses/${course.id}`}>Preview</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish/Unpublish Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{course.is_published ? "Unpublish Course" : "Publish Course"}</DialogTitle>
            <DialogDescription>
              {course.is_published
                ? "This course will no longer be visible to students."
                : "This course will be visible to all students."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTogglePublish} disabled={isLoading}>
              {isLoading ? "Saving..." : course.is_published ? "Unpublish" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

