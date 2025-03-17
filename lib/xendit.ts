import { createHmac } from "crypto"

// Xendit API configuration
const XENDIT_API_KEY = process.env.XENDIT_API_KEY || ""
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || ""
const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || ""
const XENDIT_API_URL = "https://api.xendit.co"

// Verify Xendit webhook callback
export const verifyXenditCallback = (reqBody: any, xenditCallbackToken: string) => {
  const receivedToken = xenditCallbackToken

  if (receivedToken !== XENDIT_CALLBACK_TOKEN) {
    return false
  }

  return true
}

// Create a Xendit invoice
export const createInvoice = async (params: {
  externalId: string
  amount: number
  payerEmail: string
  description: string
  successRedirectUrl?: string
  failureRedirectUrl?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
    category: string
  }>
}) => {
  try {
    const response = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(XENDIT_API_KEY + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        external_id: params.externalId,
        amount: params.amount,
        payer_email: params.payerEmail,
        description: params.description,
        success_redirect_url: params.successRedirectUrl,
        failure_redirect_url: params.failureRedirectUrl,
        items: params.items,
        currency: "USD",
      }),
    })

    if (!response.ok) {
      console.log(response.status)
      throw new Error(`Xendit API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating Xendit invoice:", error)
    throw error
  }
}

// Get invoice details
export const getInvoice = async (invoiceId: string) => {
  try {
    const response = await fetch(`${XENDIT_API_URL}/v2/invoices/${invoiceId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(XENDIT_API_KEY + ":").toString("base64")}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Xendit API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting Xendit invoice:", error)
    throw error
  }
}

// Generate a signature for webhook validation
export const generateSignature = (requestBody: string) => {
  return createHmac("sha256", XENDIT_SECRET_KEY).update(requestBody).digest("hex")
}

