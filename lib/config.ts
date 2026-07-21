import { getEnv } from "./env"

const env = getEnv()

export const config = {
  appName: "FitBot",
  telegram: {
    botToken: env.TELEGRAM_BOT_TOKEN || "",
  },
  auth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
    webhook_url: env.WEBHOOK_URL || env.NEXTAUTH_URL,
    fitbotSecret: env.FITBOT_SECRET || "",
  },
  yookassa: {
    plans: {
      starter: { id: "starter", name: "Стартовый", credits: 125, price: 199, label: "199₽" },
      basic: { id: "basic", name: "Базовый", credits: 500, price: 499, label: "499₽" },
      standard: { id: "standard", name: "Стандарт", credits: 1500, price: 999, label: "999₽" },
      pro: { id: "pro", name: "Профи", credits: 3000, price: 2499, label: "2499₽" },
    },
    subscriptions: {
      light: { id: "light", name: "Light", creditsPerMonth: 625, price: 499, label: "499₽/мес" },
      pro: { id: "pro", name: "Pro", creditsPerMonth: 2000, price: 999, label: "999₽/мес" },
      unlimited: { id: "unlimited", name: "Unlimited", creditsPerMonth: 3750, price: 2499, label: "2499₽/мес" },
    },
  },
  ai: {
    apiKey: env.MUAPIAPP_API_KEY,
    generationCost: 25,
    freeTierCredits: 75,
  },
}

export type PlanId = keyof typeof config.yookassa.plans
export type SubscriptionId = keyof typeof config.yookassa.subscriptions
