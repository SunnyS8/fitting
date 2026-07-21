import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, subscriptionId: true },
    })

    if (!user || user.subscriptionStatus !== "active") {
      return NextResponse.json({ error: "Нет активной подписки" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionStatus: "canceled" },
    })

    console.log("[SUBSCRIPTION_CANCEL]", session.user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[SUBSCRIPTION_CANCEL]", err)
    return NextResponse.json({ error: "Ошибка отмены подписки" }, { status: 500 })
  }
}
