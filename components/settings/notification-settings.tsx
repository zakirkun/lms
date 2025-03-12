"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface NotificationSettingsProps {
  userId: string
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [emailCourseUpdates, setEmailCourseUpdates] = useState(true)
  const [emailNewCourses, setEmailNewCourses] = useState(true)
  const [emailPromotions, setEmailPromotions] = useState(false)
  const [emailAccountNotifications, setEmailAccountNotifications] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, you would save these preferences to a notifications table
      // For this demo, we'll just show a success message

      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been saved successfully.",
      })

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
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Email Notifications</h3>

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="email-course-updates">Course updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about updates to courses you're enrolled in
                </p>
              </div>
              <Switch id="email-course-updates" checked={emailCourseUpdates} onCheckedChange={setEmailCourseUpdates} />
            </div>

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="email-new-courses">New courses</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about new courses from instructors you follow
                </p>
              </div>
              <Switch id="email-new-courses" checked={emailNewCourses} onCheckedChange={setEmailNewCourses} />
            </div>

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="email-promotions">Promotions</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about promotions, discounts, and special offers
                </p>
              </div>
              <Switch id="email-promotions" checked={emailPromotions} onCheckedChange={setEmailPromotions} />
            </div>

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="email-account">Account notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important notifications about your account, purchases, and security
                </p>
              </div>
              <Switch
                id="email-account"
                checked={emailAccountNotifications}
                onCheckedChange={setEmailAccountNotifications}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

