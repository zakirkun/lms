import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { format } from "date-fns"
import { CheckCircle, Download, Receipt, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function PurchasesPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return <div>Loading...</div>
  }

  // Get user's payment history
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      courses (
        id,
        title,
        thumbnail_url,
        price,
        profiles (
          full_name
        )
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Get completed payments
  const completedPayments = payments?.filter((payment) => payment.status === "completed") || []

  // Get pending payments
  const pendingPayments = payments?.filter((payment) => payment.status !== "completed") || []

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase History</h1>
            <p className="text-muted-foreground">View your course purchases and payment history</p>
          </div>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Transactions ({payments?.length || 0})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedPayments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="pt-6">
            {renderPaymentList(payments || [])}
          </TabsContent>

          <TabsContent value="completed" className="pt-6">
            {renderPaymentList(completedPayments)}
          </TabsContent>

          <TabsContent value="pending" className="pt-6">
            {renderPaymentList(pendingPayments)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function renderPaymentList(payments: any[]) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-medium">No transactions found</h2>
        <p className="mt-2 text-sm text-muted-foreground">You don't have any transactions in this category.</p>
        <Button asChild className="mt-6">
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{payment.courses.title}</CardTitle>
                <CardDescription>{format(new Date(payment.created_at), "PPP")}</CardDescription>
              </div>
              <Badge
                variant={payment.status === "completed" ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {payment.status === "completed" ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" /> Completed
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" />{" "}
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-24 overflow-hidden rounded-md bg-muted">
                  <img
                    src={payment.courses.thumbnail_url || "/placeholder.svg?height=64&width=96"}
                    alt={payment.courses.title}
                    className="h-full w-full object-cover"
                    width={96}
                    height={64}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  <p className="font-medium">{payment.courses.profiles.full_name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Payment Method:{" "}
                    {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1).replace("-", " ")}
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:text-right">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-bold">${payment.amount.toFixed(2)}</p>
                {payment.reference && <p className="text-xs text-muted-foreground">Ref: {payment.reference}</p>}
              </div>
            </div>
            {payment.status === "completed" && (
              <div className="mt-4 flex justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="#" className="flex items-center gap-1">
                    <Download className="h-4 w-4" /> Receipt
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/dashboard/my-courses/${payment.course_id}`}>View Course</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

