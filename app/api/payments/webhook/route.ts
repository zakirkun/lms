import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { verifyXenditCallback } from "@/lib/xendit"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const xenditCallbackToken = request.headers.get("x-callback-token") || ""

    // Verify the callback
    if (!verifyXenditCallback(body, xenditCallbackToken)) {
      return NextResponse.json({ error: "Invalid callback token" }, { status: 401 })
    }

    // Get the invoice ID and status
    const { id: invoiceId, status, external_id } = body

    // Connect to Supabase
    const supabase = createServerComponentClient({ cookies })

    // Update the payment status
    const { error: paymentError } = await supabase
      .from("payments")
      .update({ status: status.toLowerCase() })
      .eq("reference", invoiceId)

    if (paymentError) {
      console.error("Error updating payment:", paymentError)
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
    }

    // If payment is successful, create an enrollment
    if (status === "PAID") {
      // Get the payment details to find the course and user
      const { data: payment, error: fetchError } = await supabase
        .from("payments")
        .select("user_id, course_id")
        .eq("reference", invoiceId)
        .single()

      if (fetchError || !payment) {
        console.error("Error fetching payment:", fetchError)
        return NextResponse.json({ error: "Failed to fetch payment details" }, { status: 500 })
      }

      // Create an enrollment record
      const { error: enrollmentError } = await supabase.from("enrollments").insert([
        {
          user_id: payment.user_id,
          course_id: payment.course_id,
          progress: 0,
          status: "active",
        },
      ])

      if (enrollmentError) {
        console.error("Error creating enrollment:", enrollmentError)
        return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
      }

      // Update course students count
      await supabase.rpc("increment_students_count", {
        course_id: payment.course_id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

