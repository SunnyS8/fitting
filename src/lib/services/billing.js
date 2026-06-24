import { stripe } from "../stripe";
import config from "../config";
import { UserService } from "./user";

export const BillingService = {
  // Одноразовая покупка кредитов
  async createCheckoutSession(userId, planId) {
    const plan = config.stripe.plans[planId];
    if (!plan) throw new Error("Invalid plan selected");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Пакет «${plan.name}»`,
              description: `${plan.credits} кредитов для AI-примерок`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${config.auth.url}/pricing?success=true`,
      cancel_url: `${config.auth.url}/pricing?canceled=true`,
      metadata: { userId, credits: plan.credits.toString(), type: "credits" },
    });

    return session.url;
  },

  // Подписка (рекуррент)
  async createSubscriptionCheckoutSession(userId, subscriptionId) {
    const plan = config.stripe.subscriptions[subscriptionId];
    if (!plan) throw new Error("Invalid subscription plan selected");
    if (!plan.priceId || plan.priceId.startsWith("price_your_")) {
      throw new Error(
        "Subscription not configured yet. Create a Price ID in Stripe Dashboard and set STRIPE_PRICE_<PLAN> env variable."
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${config.auth.url}/pricing?subscription=success`,
      cancel_url: `${config.auth.url}/pricing?canceled=true`,
      metadata: { userId, plan: subscriptionId, type: "subscription" },
    });

    return session.url;
  },

  // Вебхук — обработка платежей Stripe
  async handleWebhook(body, signature) {
    const event = stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
    const session = event.data.object;

    switch (event.type) {
      case "checkout.session.completed":
        return await this._handleCheckoutCompleted(session);

      case "invoice.paid":
        return await this._handleInvoicePaid(session);

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        return await this._handleSubscriptionChanged(session);

      default:
        return { success: false, handled: false };
    }
  },

  async _handleCheckoutCompleted(session) {
    const type = session.metadata?.type;

    if (type === "credits") {
      // Одноразовая покупка кредитов
      const userId = session.metadata.userId;
      const credits = parseInt(session.metadata.credits || "0", 10);
      if (userId && credits > 0) {
        await UserService.addCredits(userId, credits);
        return { success: true, userId, credits };
      }
    }

    if (type === "subscription") {
      // Новая подписка — кредиты начислятся через invoice.paid
      const { userId, plan } = session.metadata;
      if (userId && plan) {
        // Сохраняем subscription ID
        const subscriptionId = session.subscription;
        const { prisma } = await import("../prisma");
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionId,
            subscriptionPlan: plan,
            subscriptionStatus: "active",
          },
        });
        return { success: true, userId, plan, subscriptionId };
      }
    }

    return { success: false };
  },

  async _handleInvoicePaid(invoice) {
    if (invoice.billing_reason === "subscription_create") {
      // Первый платёж по подписке — кредиты начислены не будут,
      // т.к. checkout.session.completed уже обработал создание
      return { success: true, note: "initial subscription payment" };
    }

    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return { success: false };

    const { prisma } = await import("../prisma");
    const user = await prisma.user.findFirst({
      where: { subscriptionId },
    });

    if (!user) return { success: false };

    // Начисляем ежемесячные кредиты
    const plan = config.stripe.subscriptions[user.subscriptionPlan];
    if (plan) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: { increment: plan.creditsPerMonth },
          subscriptionPeriodEnd: new Date(invoice.lines?.data?.[0]?.period?.end * 1000 || Date.now()),
        },
      });
      return { success: true, userId: user.id, credits: plan.creditsPerMonth };
    }

    return { success: false };
  },

  async _handleSubscriptionChanged(subscription) {
    const subscriptionId = subscription.id;
    const status = subscription.status; // active, past_due, canceled, incomplete_expired

    const { prisma } = await import("../prisma");
    const user = await prisma.user.findFirst({
      where: { subscriptionId },
    });

    if (!user) return { success: false };

    const mappedStatus = status === "active" ? "active"
      : status === "past_due" ? "past_due"
      : status === "canceled" || status === "incomplete_expired" ? "canceled"
      : "none";

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: mappedStatus,
        subscriptionPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined,
      },
    });

    return { success: true, userId: user.id, status: mappedStatus };
  },
};