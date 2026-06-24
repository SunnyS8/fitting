import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { BillingService } from "../../../../lib/services/billing";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return new NextResponse("Subscription plan ID is required", { status: 400 });
    }

    const checkoutUrl = await BillingService.createSubscriptionCheckoutSession(
      session.user.id,
      subscriptionId
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[SUBSCRIPTION_CHECKOUT]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}