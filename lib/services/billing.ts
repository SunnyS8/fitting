import { yookassa } from "../yookassa"
import { config } from "../config"
import { UserService } from "./user"

export const BillingService = {
  async createCheckoutSession(userId: string, planId: string) {
    type Plans = keyof typeof config.yookassa.plans
    const plan = config.yookassa.plans[planId as Plans]
    if (!plan) throw new Error("Invalid plan selected")

    const result = await yookassa.createPayment({
      amount: plan.price,
      description: `Пакет «${plan.name}» — ${plan.credits} кредитов`,
      metadata: {
        userId,
        credits: plan.credits.toString(),
        type: "credits",
        planId,
      },
    })

    return result.confirmationUrl
  },

  async createSubscriptionCheckoutSession(userId: string, subscriptionId: string) {
    type Subs = keyof typeof config.yookassa.subscriptions
    const plan = config.yookassa.subscriptions[subscriptionId as Subs]
    if (!plan) throw new Error("Invalid subscription plan selected")

    const result = await yookassa.createPayment({
      amount: plan.price,
      description: `Подписка «${plan.name}» — ${plan.creditsPerMonth} кредитов ежемесячно`,
      metadata: {
        userId,
        plan: subscriptionId,
        type: "subscription",
        credits: plan.creditsPerMonth.toString(),
        isRecurring: "true",
      },
    })

    return result.confirmationUrl
  },

  async handleWebhook(body: unknown) {
    const event = typeof body === "string" ? JSON.parse(body) : body
    const { event: eventType, object: payment } = event as { event: string; object: Record<string, unknown> }

    if (eventType === "payment.succeeded") {
      return await this._handlePaymentSucceeded(payment)
    }

    if (eventType === "payment.waiting_for_capture") {
      await yookassa.capturePayment(payment.id as string)
      return { success: true, status: "captured" }
    }

    return { success: false, handled: false }
  },

  async _handlePaymentSucceeded(payment: Record<string, unknown>) {
    const { prisma } = await import("../prisma")
    const meta = (payment.metadata || {}) as Record<string, string>
    const type = meta.type

    if (type === "credits") {
      const userId = meta.userId
      const credits = parseInt(meta.credits || "0", 10)
      if (userId && credits > 0) {
        await UserService.addCredits(userId, credits)
        return { success: true, userId, credits }
      }
    }

    if (type === "subscription") {
      const { userId, plan } = meta
      const credits = parseInt(meta.credits || "0", 10)
      if (userId && plan && credits > 0) {
        await UserService.addCredits(userId, credits)
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionId: payment.id as string,
            subscriptionPlan: plan,
            subscriptionStatus: "active",
            subscriptionPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })
        return { success: true, userId, plan, credits }
      }
    }

    return { success: false }
  },
}
