import { NextResponse } from "next/server"
import { rateLimitFromRequest } from "@/lib/rate-limit"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  try {
    const rl = rateLimitFromRequest(req, { windowMs: 60_000, max: 5 })
    if (!rl.allowed) {
      return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 })
    }

    const { email } = (await req.json()) as { email?: string }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    if (resend) {
      await resend.emails.send({
        from: "Atelier AI <onboarding@resend.dev>",
        to: "support@atelier-ai.ru",
        subject: `Новый контакт: ${email}`,
        text: `Пользователь ${email} оставил заявку через форму обратной связи.`,
      })
    } else {
      console.log("[CONTACT]", email)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
