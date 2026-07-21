import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"
import { UserService } from "@/lib/services/user"

export const maxDuration = 120

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${config.auth.fitbotSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const active = await prisma.user.findMany({
      where: {
        subscriptionStatus: "active",
        subscriptionPeriodEnd: { not: null },
      },
    })

    let renewed = 0
    let expired = 0

    for (const user of active) {
      if (!user.subscriptionPeriodEnd || !user.subscriptionPlan) continue

      if (user.subscriptionPeriodEnd < now) {
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: "expired" },
        })
        expired++
        continue
      }

      const plan = config.yookassa.subscriptions[user.subscriptionPlan as keyof typeof config.yookassa.subscriptions]
      if (!plan) continue

      const lastRenewal = user.subscriptionPeriodEnd
      if (lastRenewal <= now) continue

      const daysSinceLast = Math.floor((now.getTime() - lastRenewal.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLast <= 0) continue

      const monthsSince = Math.floor(daysSinceLast / 30)
      if (monthsSince < 1) continue

      await UserService.addCredits(user.id, plan.creditsPerMonth * monthsSince)
      renewed++
    }

    return NextResponse.json({ renewed, expired, total: active.length })
  } catch (err) {
    console.error("[CRON_RENEW]", err)
    return NextResponse.json({ error: "Cron error" }, { status: 500 })
  }
}
