"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface LessonCompletionButtonProps {
  lessonId: string
  courseId: string
  isCompleted: boolean
}

export function LessonCompletionButton({ lessonId, courseId, isCompleted }: LessonCompletionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(isCompleted)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleToggleCompletion = async () => {
    setLoading(true)

    try {
      if (completed) {
        // Remove completion record
        const { error } = await supabase
          .from("completed_lessons")
          .delete()
          .eq("lesson_id", lessonId)
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id)

        if (error) throw error

        toast({
          title: "Lesson marked as incomplete",
          description: "Your progress has been updated.",
        })
      } else {
        // Add completion record
        const { error } = await supabase.from("completed_lessons").insert([
          {
            lesson_id: lessonId,
            course_id: courseId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ])

        if (error) throw error

        toast({
          title: "Lesson completed!",
          description: "Your progress has been saved.",
        })
      }

      setCompleted(!completed)
      router.refresh()
    } catch (error) {
      console.error("Error toggling lesson completion:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update lesson status. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggleCompletion}
      variant={completed ? "outline" : "default"}
      disabled={loading}
      className={
        completed
          ? "border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
          : "btn-hover-effect"
      }
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {completed ? "Marking as incomplete..." : "Marking as complete..."}
        </>
      ) : (
        <>
          <CheckCircle className={`mr-2 h-4 w-4 ${completed ? "text-green-500" : ""}`} />
          {completed ? "Completed" : "Mark as Complete"}
        </>
      )}
    </Button>
  )
}

