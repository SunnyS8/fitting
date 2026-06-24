import { yookassa } from "../yookassa";
import config from "../config";
import { UserService } from "./user";

export const BillingService = {
  // Одноразовая покупка кредитов через ЮKassa
  async createCheckoutSession(userId, planId) {
    const plan = config.yookassa.plans[planId];
    if (!plan) throw new Error("Invalid plan selected");

    const result = await yookassa.createPayment({
      amount: plan.price,
      description: `Пакет «${plan.name}» — ${plan.credits} кредитов`,
      metadata: {
        userId,
        credits: plan.credits.toString(),
        type: "credits",
        planId,
      },
    });

    return result.confirmationUrl;
  },

  // Подписка через ЮKassa
  async createSubscriptionCheckoutSession(userId, subscriptionId) {
    const plan = config.yookassa.subscriptions[subscriptionId];
    if (!plan) throw new Error("Invalid subscription plan selected");

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
    });

    return result.confirmationUrl;
  },

  // Обработка вебхука от ЮKassa
  async handleWebhook(body) {
    const event = typeof body === "string" ? JSON.parse(body) : body;

    if (event.event === "payment.succeeded") {
      const payment = event.object;
      return await this._handlePaymentSucceeded(payment);
    }

    if (event.event === "payment.waiting_for_capture") {
      const payment = event.object;
      // Автоматически подтверждаем
      await yookassa.capturePayment(payment.id);
      return { success: true, status: "captured" };
    }

    return { success: false, handled: false };
  },

  async _handlePaymentSucceeded(payment) {
    const { prisma } = await import("../prisma");
    const meta = payment.metadata || {};
    const type = meta.type;

    if (type === "credits") {
      const userId = meta.userId;
      const credits = parseInt(meta.credits || "0", 10);
      if (userId && credits > 0) {
        await UserService.addCredits(userId, credits);
        return { success: true, userId, credits };
      }
    }

    if (type === "subscription") {
      const { userId, plan } = meta;
      const credits = parseInt(meta.credits || "0", 10);
      if (userId && plan && credits > 0) {
        // Начисляем кредиты за первый месяц
        await UserService.addCredits(userId, credits);
        // Записываем статус подписки
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionId: payment.id,
            subscriptionPlan: plan,
            subscriptionStatus: "active",
            subscriptionPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
          },
        });
        return { success: true, userId, plan, credits };
      }
    }

    return { success: false };
  },
};