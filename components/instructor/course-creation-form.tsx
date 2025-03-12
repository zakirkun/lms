"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Plus, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface CourseCreationFormProps {
  userId: string
}

export function CourseCreationForm({ userId }: CourseCreationFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [sections, setSections] = useState([{ title: "", lessons: [{ title: "", content: "", videoUrl: "" }] }])
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("Thumbnail image must be less than 2MB")
      return
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(file.type)) {
      setError("Thumbnail must be a JPG, PNG, or GIF image")
      return
    }

    setThumbnailFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAddSection = () => {
    setSections([...sections, { title: "", lessons: [{ title: "", content: "", videoUrl: "" }] }])
  }

  const handleRemoveSection = (sectionIndex: number) => {
    setSections(sections.filter((_, index) => index !== sectionIndex))
  }

  const handleSectionChange = (sectionIndex: number, title: string) => {
    const newSections = [...sections]
    newSections[sectionIndex].title = title
    setSections(newSections)
  }

  const handleAddLesson = (sectionIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].lessons.push({ title: "", content: "", videoUrl: "" })
    setSections(newSections)
  }

  const handleRemoveLesson = (sectionIndex: number, lessonIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].lessons = newSections[sectionIndex].lessons.filter((_, index) => index !== lessonIndex)
    setSections(newSections)
  }

  const handleLessonChange = (
    sectionIndex: number,
    lessonIndex: number,
    field: "title" | "content" | "videoUrl",
    value: string,
  ) => {
    const newSections = [...sections]
    newSections[sectionIndex].lessons[lessonIndex][field] = value
    setSections(newSections)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate form
      if (!title || !description) {
        throw new Error("Please fill in all required fields")
      }

      // Upload thumbnail if provided
      let thumbnailUrl = null
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

        // First, check if the bucket exists and create it if it doesn't
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some((bucket) => bucket.name === "course-thumbnails")

        if (!bucketExists) {
          await supabase.storage.createBucket("course-thumbnails", {
            public: true,
            fileSizeLimit: 2097152, // 2MB
            allowedMimeTypes: ["image/png", "image/jpeg", "image/gif"],
          })
        }

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("course-thumbnails")
          .upload(fileName, thumbnailFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Error uploading thumbnail: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage.from("course-thumbnails").getPublicUrl(fileName)

        thumbnailUrl = urlData.publicUrl
      }

      // Create course
      const { error: courseError, data: courseData } = await supabase
        .from("courses")
        .insert([
          {
            title,
            description,
            price: price ? Number.parseFloat(price) : 0,
            duration,
            thumbnail_url: thumbnailUrl,
            instructor_id: userId,
            is_published: false,
            students_count: 0,
          },
        ])
        .select()

      if (courseError) {
        throw new Error(`Error creating course: ${courseError.message}`)
      }

      const courseId = courseData[0].id

      // Create sections and lessons
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]

        if (!section.title) continue

        const { error: sectionError, data: sectionData } = await supabase
          .from("sections")
          .insert([
            {
              course_id: courseId,
              title: section.title,
              position: i,
            },
          ])
          .select()

        if (sectionError) {
          throw new Error(`Error creating section: ${sectionError.message}`)
        }

        const sectionId = sectionData[0].id

        // Create lessons for this section
        for (let j = 0; j < section.lessons.length; j++) {
          const lesson = section.lessons[j]

          if (!lesson.title) continue

          const { error: lessonError } = await supabase.from("lessons").insert([
            {
              section_id: sectionId,
              title: lesson.title,
              content: lesson.content,
              video_url: lesson.videoUrl,
              position: j,
            },
          ])

          if (lessonError) {
            throw new Error(`Error creating lesson: ${lessonError.message}`)
          }
        }
      }

      // Redirect to course management page
      router.push("/dashboard/instructor/courses")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the basic details about your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Complete Web Development Bootcamp"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what students will learn in this course"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., 49.99"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 10 hours"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Course Thumbnail</Label>
                <div className="flex items-center gap-4">
                  {thumbnailPreview ? (
                    <div className="relative h-32 w-56 overflow-hidden rounded-md border">
                      <img
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6"
                        onClick={() => {
                          setThumbnailFile(null)
                          setThumbnailPreview(null)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative flex h-32 w-56 items-center justify-center rounded-md border border-dashed">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload thumbnail</span>
                      </div>
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={handleThumbnailChange}
                      />
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <p>Recommended size: 1280x720 pixels</p>
                    <p>Max file size: 2MB</p>
                    <p>Supported formats: JPG, PNG</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" disabled>
                Back
              </Button>
              <Button type="button" onClick={() => setActiveTab("content")}>
                Next: Course Content
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>Organize your course into sections and lessons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4 rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`section-${sectionIndex}`}>Section Title</Label>
                      <Input
                        id={`section-${sectionIndex}`}
                        value={section.title}
                        onChange={(e) => handleSectionChange(sectionIndex, e.target.value)}
                        placeholder="e.g., Introduction to the Course"
                        required
                      />
                    </div>
                    {sections.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveSection(sectionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Lessons</h4>

                    {section.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="space-y-4 rounded-md border p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor={`lesson-${sectionIndex}-${lessonIndex}`}>Lesson Title</Label>
                            <Input
                              id={`lesson-${sectionIndex}-${lessonIndex}`}
                              value={lesson.title}
                              onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, "title", e.target.value)}
                              placeholder="e.g., Getting Started"
                              required
                            />
                          </div>
                          {section.lessons.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveLesson(sectionIndex, lessonIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`video-${sectionIndex}-${lessonIndex}`}>YouTube Video URL</Label>
                          <Input
                            id={`video-${sectionIndex}-${lessonIndex}`}
                            value={lesson.videoUrl}
                            onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, "videoUrl", e.target.value)}
                            placeholder="e.g., https://www.youtube.com/watch?v=..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`content-${sectionIndex}-${lessonIndex}`}>Lesson Content (Markdown)</Label>
                          <Textarea
                            id={`content-${sectionIndex}-${lessonIndex}`}
                            value={lesson.content}
                            onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, "content", e.target.value)}
                            placeholder="Write your lesson content in Markdown format"
                            rows={5}
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleAddLesson(sectionIndex)}
                    >
                      <Plus className="h-4 w-4" /> Add Lesson
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" className="flex items-center gap-1" onClick={handleAddSection}>
                <Plus className="h-4 w-4" /> Add Section
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                Back
              </Button>
              <Button type="button" onClick={() => setActiveTab("publish")}>
                Next: Publish
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="publish" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Review and Publish</CardTitle>
              <CardDescription>Review your course details before saving</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border p-4">
                <h3 className="font-medium">Course Details</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p>{title || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p>{price ? `$${price}` : "Free"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p>{duration || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sections</p>
                    <p>{sections.filter((s) => s.title).length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium">Description</h3>
                <p className="mt-2 text-sm">{description || "Not provided"}</p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium">Thumbnail</h3>
                <div className="mt-2">
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview || "/placeholder.svg"}
                      alt="Course thumbnail"
                      className="h-32 w-56 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-56 items-center justify-center rounded-md border border-dashed">
                      <span className="text-sm text-muted-foreground">No thumbnail</span>
                    </div>
                  )}
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Your course will be saved as a draft. You can publish it later from your instructor dashboard.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("content")}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                  </>
                ) : (
                  "Save Course"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}

