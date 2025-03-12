"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { CheckCircle, Eye, Loader2, MoreHorizontal, Search, Trash, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface Course {
  id: string
  title: string
  description: string
  price: number | null
  is_published: boolean
  students_count: number
  created_at: string
  profiles: {
    full_name: string | null
    email: string
  }
}

interface CourseManagementProps {
  initialCourses: Course[]
}

export function CourseManagement({ initialCourses }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.profiles.full_name && course.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      course.profiles.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  const handleTogglePublish = (course: Course) => {
    setSelectedCourse(course)
    setIsPublishDialogOpen(true)
  }

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course)
    setIsDeleteDialogOpen(true)
  }

  const handlePublishToggle = async () => {
    if (!selectedCourse) return

    setIsLoading(true)

    try {
      const newPublishState = !selectedCourse.is_published

      const { error } = await supabase
        .from("courses")
        .update({ is_published: newPublishState })
        .eq("id", selectedCourse.id)

      if (error) {
        throw new Error(error.message)
      }

      // Update local state
      setCourses(
        courses.map((course) =>
          course.id === selectedCourse.id ? { ...course, is_published: newPublishState } : course,
        ),
      )

      toast({
        title: newPublishState ? "Course published" : "Course unpublished",
        description: `"${selectedCourse.title}" has been ${newPublishState ? "published" : "unpublished"}.`,
      })

      setIsPublishDialogOpen(false)
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

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from("courses").delete().eq("id", selectedCourse.id)

      if (error) {
        throw new Error(error.message)
      }

      // Update local state
      setCourses(courses.filter((course) => course.id !== selectedCourse.id))

      toast({
        title: "Course deleted",
        description: `"${selectedCourse.title}" has been deleted.`,
      })

      setIsDeleteDialogOpen(false)
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

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.profiles.full_name || course.profiles.email}</TableCell>
                  <TableCell>{course.price ? `$${course.price.toFixed(2)}` : "Free"}</TableCell>
                  <TableCell>{course.students_count}</TableCell>
                  <TableCell>
                    <Badge
                      variant={course.is_published ? "default" : "secondary"}
                      className="flex w-fit items-center gap-1"
                    >
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
                  </TableCell>
                  <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCourse(course.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Course
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublish(course)}>
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
                        <DropdownMenuItem onClick={() => handleDeleteCourse(course)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Publish/Unpublish Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCourse?.is_published ? "Unpublish Course" : "Publish Course"}</DialogTitle>
            <DialogDescription>
              {selectedCourse?.is_published
                ? "This course will no longer be visible to students."
                : "This course will be visible to all students."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Switch
              id="publish-switch"
              checked={selectedCourse?.is_published ? false : true}
              onCheckedChange={() => {}}
            />
            <Label htmlFor="publish-switch">
              {selectedCourse?.is_published ? "Unpublish" : "Publish"} "{selectedCourse?.title}"
            </Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublishToggle} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

