import { NextResponse } from "next/server"
import { createInvoice } from "@/lib/xendit"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentId, amount, email, name, courseTitle, courseId, userId } = body

    // Validate the request
    if (!paymentId || !amount || !email || !courseTitle || !courseId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a unique external ID
    const externalId = `course-${courseId}-${userId}-${Date.now()}`

    // Create the invoice
    const invoice = await createInvoice({
      externalId,
      amount,
      payerEmail: email,
      description: `Payment for course: ${courseTitle}`,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?courseId=${courseId}`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?courseId=${courseId}`,
      items: [
        {
          name: courseTitle,
          quantity: 1,
          price: amount,
          category: "EDUCATION",
        },
      ],
    })

    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}

