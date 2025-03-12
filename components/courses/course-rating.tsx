"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

interface CourseRatingProps {
  courseId: string
  userId: string
  existingRating?: {
    id: string
    rating: number
    review: string
  }
}

export function CourseRating({ courseId, userId, existingRating }: CourseRatingProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [review, setReview] = useState(existingRating?.review || "")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating required",
        description: "Please select a rating before submitting.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from("course_ratings")
          .update({
            rating,
            review,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRating.id)

        if (error) throw error

        toast({
          title: "Rating updated",
          description: "Your course rating has been updated successfully.",
        })
      } else {
        // Create new rating
        const { error } = await supabase.from("course_ratings").insert([
          {
            course_id: courseId,
            user_id: userId,
            rating,
            review,
          },
        ])

        if (error) throw error

        toast({
          title: "Rating submitted",
          description: "Thank you for rating this course!",
        })
      }

      router.refresh()
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your rating. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate This Course</CardTitle>
        <CardDescription>
          {existingRating ? "Update your rating and review" : "Share your experience with other students"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
              {rating === 0 && "Select a rating"}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium">
              Your Review (Optional)
            </label>
            <Textarea
              id="review"
              placeholder="Share your experience with this course..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full btn-hover-effect">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {existingRating ? "Updating..." : "Submitting..."}
              </>
            ) : existingRating ? (
              "Update Rating"
            ) : (
              "Submit Rating"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

