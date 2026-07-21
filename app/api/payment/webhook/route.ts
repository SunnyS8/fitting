import { NextResponse } from "next/server"
import { BillingService } from "@/lib/services/billing"

function verifyYooKassaSignature(authHeader: string | null): boolean {
  if (!authHeader) return false
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY
  if (!shopId || !secretKey) return false
  const expected = "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64")
  return authHeader === expected
}

export async function POST(req: Request) {
  try {
    if (!verifyYooKassaSignature(req.headers.get("authorization"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const result = await BillingService.handleWebhook(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[YOOKASSA_WEBHOOK]", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}
