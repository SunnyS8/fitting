import { prisma } from "../prisma"
import { config } from "../config"

export const UserService = {
  async getCredits(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })
    return user ? user.credits : 0
  },

  async addCredits(userId: string, amount: number) {
    if (amount <= 0) return
    return await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    })
  },

  async deductCredits(userId: string, amount: number) {
    if (amount <= 0) return
    const currentCredits = await this.getCredits(userId)
    if (currentCredits < amount) {
      throw new Error("Insufficient credits available")
    }
    return await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } },
    })
  },

  async giveFreeCreditsIfNeeded(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeCreditsGiven: true, credits: true },
    })

    if (!user || user.freeCreditsGiven) return false

    const freeAmount = config.ai.freeTierCredits || 75
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: freeAmount }, freeCreditsGiven: true },
    })

    return true
  },

  async hasActiveSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, subscriptionPeriodEnd: true },
    })

    if (!user) return false
    if (user.subscriptionStatus !== "active") return false
    if (user.subscriptionPeriodEnd && new Date(user.subscriptionPeriodEnd) < new Date()) {
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: "expired" },
      })
      return false
    }
    return true
  },

  async addSubscriptionCredits(userId: string, planId: string) {
    type Subs = keyof typeof config.yookassa.subscriptions
    const plan = config.yookassa.subscriptions[planId as Subs]
    if (!plan) throw new Error("Invalid subscription plan")

    return await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: plan.creditsPerMonth } },
    })
  },
}
