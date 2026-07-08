import { bot } from "@/lib/telegram/bot"

export async function POST(req: Request) {
  try {
    const update = await req.json()
    await bot.handleUpdate(update)
    return new Response("OK")
  } catch (err) {
    console.error("[TELEGRAM_WEBHOOK]", err)
    return new Response("Error", { status: 500 })
  }
}
