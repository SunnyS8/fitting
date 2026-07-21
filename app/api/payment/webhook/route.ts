import { NextResponse } from "next/server"
import { BillingService } from "@/lib/services/billing"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await BillingService.handleWebhook(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[YOOKASSA_WEBHOOK]", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}
