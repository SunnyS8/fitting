import { prisma } from "../prisma";
import config from "../config";

export const UserService = {
  async getCredits(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    return user ? user.credits : 0;
  },

  async addCredits(userId, amount) {
    if (amount <= 0) return;
    return await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });
  },

  async deductCredits(userId, amount) {
    if (amount <= 0) return;
    
    // Check if the user has enough credits
    const currentCredits = await this.getCredits(userId);
    if (currentCredits < amount) {
      throw new Error("Insufficient credits available");
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount,
        },
      },
    });
  },

  // Бесплатные кредиты при первой регистрации
  async giveFreeCreditsIfNeeded(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeCreditsGiven: true, credits: true },
    });

    if (!user || user.freeCreditsGiven) return false;

    const freeAmount = config.ai.freeTierCredits || 75;
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: freeAmount },
        freeCreditsGiven: true,
      },
    });

    return true;
  },

  // Проверка активной подписки
  async hasActiveSubscription(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, subscriptionPeriodEnd: true },
    });

    if (!user) return false;
    if (user.subscriptionStatus !== "active") return false;
    if (user.subscriptionPeriodEnd && new Date(user.subscriptionPeriodEnd) < new Date()) {
      // Подписка истекла
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: "expired" },
      });
      return false;
    }
    return true;
  },

  // Начисление ежемесячных кредитов по подписке
  async addSubscriptionCredits(userId, planId) {
    const plan = config.stripe.subscriptions[planId];
    if (!plan) throw new Error("Invalid subscription plan");

    return await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: plan.creditsPerMonth },
      },
    });
  },
};