import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { certificateId } = body

    if (!certificateId) {
      return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 })
    }

    // Parse the certificate ID to extract course ID and user ID
    // Format: CERT-{courseId}-{userId}
    const parts = certificateId.split("-")

    if (parts.length !== 3 || parts[0] !== "CERT") {
      return NextResponse.json(
        {
          isValid: false,
          error: "Invalid certificate ID format",
        },
        { status: 400 },
      )
    }

    const courseIdPart = parts[1]
    const userIdPart = parts[2]

    const supabase = createRouteHandlerClient({ cookies })

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
      return NextResponse.json(
        {
          isValid: false,
          error: "Certificate not found",
        },
        { status: 404 },
      )
    }

    // Check if the course was completed
    if (enrollment.progress !== 100) {
      return NextResponse.json(
        {
          isValid: false,
          error: "Course not completed",
        },
        { status: 400 },
      )
    }

    // Certificate is valid
    return NextResponse.json({
      isValid: true,
      studentName: enrollment.profiles[0].full_name,
      courseName: enrollment.courses[0].title,
      instructorName: enrollment.courses[0].profiles[0].full_name,
      completionDate: enrollment.created_at,
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      {
        isValid: false,
        error: "An error occurred during verification",
      },
      { status: 500 },
    )
  }
}

