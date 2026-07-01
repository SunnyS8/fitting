export const config = {
  appName: "Atelier AI",
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    webhook_url: process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  yookassa: {
    shopId: process.env.YOOKASSA_SHOP_ID,
    secretKey: process.env.YOOKASSA_SECRET_KEY,
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
    apiKey: process.env.MUAPIAPP_API_KEY || process.env.NEXT_PUBLIC_MUAPI_KEY,
    generationCost: 25,
    freeTierCredits: 75,
  },
  db: {
    url: process.env.DATABASE_URL,
  },
}

export type PlanId = keyof typeof config.yookassa.plans
export type SubscriptionId = keyof typeof config.yookassa.subscriptions
