import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import { yookassa } from "@/lib/yookassa"

const plans: Record<string, { name: string; credits: number; price: number }> = {
  starter: { name: "Стартовый", credits: 125, price: 199 },
  basic: { name: "Базовый", credits: 500, price: 499 },
  standard: { name: "Стандарт", credits: 1500, price: 999 },
  pro: { name: "Профи", credits: 3000, price: 2499 },
}

const subs: Record<string, { name: string; credits: number; price: number }> = {
  light: { name: "Light", credits: 625, price: 499 },
  pro: { name: "Pro", credits: 2000, price: 999 },
  unlimited: { name: "Unlimited", credits: 3750, price: 2499 },
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${config.auth.fitbotSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { chatId, planId, isSubscription } = (await req.json()) as {
      chatId?: string
      planId?: string
      isSubscription?: boolean
    }

    if (!chatId || !planId) {
      return NextResponse.json({ error: "chatId и planId обязательны" }, { status: 400 })
    }

    const userId = `tg_${chatId}`

    if (isSubscription) {
      const plan = subs[planId]
      if (!plan) return NextResponse.json({ error: "Неверный план" }, { status: 400 })

      const result = await yookassa.createPayment({
        amount: plan.price,
        description: `FitBot: подписка «${plan.name}» — ${plan.credits} примерок/мес`,
        metadata: {
          userId,
          plan: planId,
          type: "subscription",
          credits: plan.credits.toString(),
        },
      })

      return NextResponse.json({ url: result.confirmationUrl })
    }

    const plan = plans[planId]
    if (!plan) return NextResponse.json({ error: "Неверный план" }, { status: 400 })

    const result = await yookassa.createPayment({
      amount: plan.price,
      description: `FitBot: пакет «${plan.name}» — ${plan.credits} примерок`,
      metadata: {
        userId,
        credits: plan.credits.toString(),
        type: "credits",
        planId,
      },
    })

    return NextResponse.json({ url: result.confirmationUrl })
  } catch (err) {
    console.error("[FITBOT_PAY]", err)
    return NextResponse.json({ error: "Ошибка оплаты" }, { status: 500 })
  }
}
