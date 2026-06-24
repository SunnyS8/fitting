const config = {
  appName: "AI Примерка",
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    webhook_url: process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    // Одноразовые пакеты кредитов
    plans: {
      basic: {
        id: "basic",
        name: "Базовый",
        credits: 75,
        price: 500, // $5.00
      },
      standard: {
        id: "standard",
        name: "Стандарт",
        credits: 300,
        price: 1500, // $15.00
      },
      pro: {
        id: "pro",
        name: "Профессиональный",
        credits: 875,
        price: 3500, // $35.00
      },
      business: {
        id: "business",
        name: "Бизнес",
        credits: 3000,
        price: 9000, // $90.00
      }
    },
    // Подписки (рекуррент) — создай Price IDs в Stripe Dashboard
    subscriptions: {
      light: {
        id: "light",
        name: "Light",
        creditsPerMonth: 150,
        price: 1200, // $12/мес
        priceId: process.env.STRIPE_PRICE_LIGHT || "price_your_light_id",
      },
      pro: {
        id: "pro",
        name: "Pro",
        creditsPerMonth: 600,
        price: 2900, // $29/мес
        priceId: process.env.STRIPE_PRICE_PRO || "price_your_pro_id",
      },
      unlimited: {
        id: "unlimited",
        name: "Unlimited",
        creditsPerMonth: 3000,
        price: 7900, // $79/мес
        priceId: process.env.STRIPE_PRICE_UNLIMITED || "price_your_unlimited_id",
      },
    },
  },
  ai: {
    apiKey: process.env.MUAPIAPP_API_KEY || process.env.NEXT_PUBLIC_MUAPI_KEY,
        generationCost: 25, // 25 кредитов за генерацию
        freeTierCredits: 75, // 3 бесплатных примерки
  },
  db: {
    url: process.env.DATABASE_URL,
  }
};

export default config;