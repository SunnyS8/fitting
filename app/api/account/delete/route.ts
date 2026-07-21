import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
    }

    const userId = session.user.id

    await prisma.tryOn.deleteMany({ where: { userId } })
    await prisma.session.deleteMany({ where: { userId } })
    await prisma.account.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })

    console.log("[ACCOUNT_DELETE]", userId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[ACCOUNT_DELETE]", err)
    return NextResponse.json({ error: "Ошибка удаления аккаунта" }, { status: 500 })
  }
}
