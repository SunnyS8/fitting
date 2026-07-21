import { bot } from "@/lib/telegram/bot"
import { config } from "@/lib/config"

export async function POST(req: Request) {
  try {
    const secretToken = req.headers.get("x-telegram-bot-api-secret-token")
    if (config.auth.fitbotSecret && secretToken !== config.auth.fitbotSecret) {
      return new Response("Unauthorized", { status: 401 })
    }

    const update = await req.json()
    await bot.handleUpdate(update)
    return new Response("OK")
  } catch (err) {
    console.error("[TELEGRAM_WEBHOOK]", err)
    return new Response("Error", { status: 500 })
  }
}
