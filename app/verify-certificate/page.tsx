"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Search, CheckCircle, XCircle, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"

export default function VerifyCertificatePage() {
  const [certificateId, setCertificateId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    studentName?: string
    courseName?: string
    instructorName?: string
    completionDate?: string
    error?: string
  } | null>(null)

  const supabase = createClientComponentClient()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!certificateId.trim()) return

    setIsLoading(true)
    setVerificationResult(null)

    try {
      // Parse the certificate ID to extract course ID and user ID
      // Format: CERT-{courseId}-{userId}
      const parts = certificateId.split("-")

      if (parts.length !== 3 || parts[0] !== "CERT") {
        setVerificationResult({
          isValid: false,
          error: "Invalid certificate ID format",
        })
        return
      }

      const courseIdPart = parts[1]
      const userIdPart = parts[2]

      // Query the database to verify the certificate
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select(`
          progress,
          created_at,
          courses (
            title,
            profiles (full_name)
          ),
          profiles (full_name)
        `)
        .filter("course_id", "like", `%${courseIdPart}%`)
        .filter("user_id", "like", `%${userIdPart}%`)
        .single()

      if (enrollmentError || !enrollment) {
        setVerificationResult({
          isValid: false,
          error: "Certificate not found",
        })
        return
      }

      // Check if the course was completed
      if (enrollment.progress !== 100) {
        setVerificationResult({
          isValid: false,
          error: "Course not completed",
        })
        return
      }

      // Certificate is valid
      setVerificationResult({
        isValid: true,
        studentName: enrollment.profiles[0].full_name,
        courseName: enrollment.courses[0].title,
        instructorName: enrollment.courses[0].profiles[0].full_name,
        completionDate: new Date(enrollment.created_at).toLocaleDateString(),
      })
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationResult({
        isValid: false,
        error: "An error occurred during verification",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          <div className="text-center mb-8">
            <Award className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
            <p className="text-muted-foreground">
              Verify the authenticity of an EduLearn certificate by entering the certificate ID
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verify Certificate</CardTitle>
              <CardDescription>Enter the certificate ID found on the certificate</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter certificate ID (e.g., CERT-12345678-87654321)"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </form>

              {verificationResult && (
                <div className="mt-6">
                  {verificationResult.isValid ? (
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle className="text-green-800 dark:text-green-400">Valid Certificate</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-500">
                        This certificate has been verified as authentic.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Invalid Certificate</AlertTitle>
                      <AlertDescription>
                        {verificationResult.error || "This certificate could not be verified."}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>

            {verificationResult?.isValid && (
              <CardFooter className="flex flex-col items-start">
                <div className="w-full p-4 border rounded-md space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Student Name</p>
                      <p className="font-medium">{verificationResult.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Course</p>
                      <p className="font-medium">{verificationResult.courseName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Instructor</p>
                      <p className="font-medium">{verificationResult.instructorName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Date</p>
                      <p className="font-medium">{verificationResult.completionDate}</p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>

          <div className="mt-8 text-center">
            <h2 className="text-xl font-bold mb-2">How to Verify a Certificate</h2>
            <div className="grid gap-6 md:grid-cols-3 mt-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mx-auto mb-2">
                  1
                </div>
                <h3 className="font-medium mb-1">Find the Certificate ID</h3>
                <p className="text-sm text-muted-foreground">
                  Locate the Certificate ID on the bottom of the certificate document.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mx-auto mb-2">
                  2
                </div>
                <h3 className="font-medium mb-1">Enter the ID</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the complete Certificate ID in the verification form above.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mx-auto mb-2">
                  3
                </div>
                <h3 className="font-medium mb-1">View Results</h3>
                <p className="text-sm text-muted-foreground">
                  The system will verify the certificate and display the results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

