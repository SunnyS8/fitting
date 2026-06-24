import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { BillingService } from "@/lib/services/billing";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: "planId обязателен" }, { status: 400 });
    }

    const url = await BillingService.createCheckoutSession(session.user.id, planId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[PAYMENT_CREATE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}