import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import { yookassa } from "@/lib/yookassa"

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
      const plan = config.yookassa.subscriptions[planId as keyof typeof config.yookassa.subscriptions]
      if (!plan) return NextResponse.json({ error: "Неверный план" }, { status: 400 })

      const result = await yookassa.createPayment({
        amount: plan.price,
        description: `FitBot: подписка «${plan.name}» — ${plan.creditsPerMonth} кредитов/мес`,
        metadata: {
          userId,
          plan: planId,
          type: "subscription",
          credits: plan.creditsPerMonth.toString(),
        },
      })

      return NextResponse.json({ url: result.confirmationUrl })
    }

    const plan = config.yookassa.plans[planId as keyof typeof config.yookassa.plans]
    if (!plan) return NextResponse.json({ error: "Неверный план" }, { status: 400 })

    const result = await yookassa.createPayment({
      amount: plan.price,
      description: `FitBot: пакет «${plan.name}» — ${plan.credits} кредитов`,
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
