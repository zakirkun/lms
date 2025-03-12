"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Check, CreditCard, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface CheckoutFormProps {
  course: any
  userId: string
}

export function CheckoutForm({ course, userId }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Create a payment record in the database
      const { error: paymentError, data: paymentData } = await supabase
        .from("payments")
        .insert([
          {
            user_id: userId,
            course_id: course.id,
            amount: course.price * 1.1, // Including tax
            payment_method: paymentMethod,
            status: "pending",
            reference: `PAY-${Date.now()}`,
          },
        ])
        .select()

      if (paymentError) {
        throw new Error(paymentError.message)
      }

      // Create a Xendit invoice
      const response = await fetch("/api/payments/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: paymentData[0].id,
          amount: course.price * 1.1,
          email: email,
          name: name,
          courseTitle: course.title,
          courseId: course.id,
          userId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment invoice")
      }

      const data = await response.json()

      // Store the invoice ID in the payment record
      await supabase
        .from("payments")
        .update({
          reference: data.invoice.id,
        })
        .eq("id", paymentData[0].id)

      // Redirect to Xendit checkout page
      setInvoiceUrl(data.invoice.invoice_url)
      setSuccess(true)
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

  if (success && invoiceUrl) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/30">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-center text-green-800 dark:text-green-400">Payment Initiated</CardTitle>
          <CardDescription className="text-center text-green-600 dark:text-green-500">
            You will be redirected to the payment page to complete your purchase.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="mb-4 text-center text-green-600 dark:text-green-500">
            If you're not redirected automatically, please click the button below.
          </p>
          <Button
            onClick={() => (window.location.href = invoiceUrl)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Proceed to Payment
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-green-600 dark:text-green-500">
          You'll receive an email confirmation once your payment is complete.
        </CardFooter>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Personal Information</h2>
          <p className="text-sm text-muted-foreground">Enter your details for payment processing</p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Payment Method</h2>
          <p className="text-sm text-muted-foreground">Select your preferred payment method</p>
        </div>

        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <div>
            <RadioGroupItem value="credit-card" id="credit-card" className="peer sr-only" />
            <Label
              htmlFor="credit-card"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <CreditCard className="mb-3 h-6 w-6" />
              Credit Card
            </Label>
          </div>
          <div>
            <RadioGroupItem value="bank-transfer" id="bank-transfer" className="peer sr-only" />
            <Label
              htmlFor="bank-transfer"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <CreditCard className="mb-3 h-6 w-6" />
              Bank Transfer
            </Label>
          </div>
          <div>
            <RadioGroupItem value="e-wallet" id="e-wallet" className="peer sr-only" />
            <Label
              htmlFor="e-wallet"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <CreditCard className="mb-3 h-6 w-6" />
              E-Wallet
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full btn-hover-effect" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
          </>
        ) : (
          `Pay $${(course.price * 1.1).toFixed(2)}`
        )}
      </Button>
    </form>
  )
}

