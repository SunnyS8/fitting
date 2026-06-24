import { NextResponse } from "next/server";
import { BillingService } from "@/lib/services/billing";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await BillingService.handleWebhook(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[YOOKASSA_WEBHOOK]", error);
    return new NextResponse("Webhook error", { status: 400 });
  }
}