import { Telegraf, Input, session } from "telegraf"
import { config } from "@/lib/config"

export const bot = new Telegraf(config.telegram.botToken)

bot.use(session({ defaultSession: () => ({ photoUrl: null }) }))

bot.start(async (ctx) => {
  const name = ctx.from?.first_name || "друг"
  await ctx.reply(
    `👋 Привет, ${name}!\n\n` +
    "Я FitBot — виртуальная примерочная в Telegram.\n\n" +
    "📸 Просто загрузи своё фото в полный рост, а затем кинь ссылку на вещь с Wildberries или Ozon — я покажу, как она на тебе сидит.\n\n" +
    "У тебя 3 бесплатных примерки.",
    {
      reply_markup: {
        keyboard: [[{ text: "📸 Загрузить фото" }]],
        resize_keyboard: true,
      },
    },
  )
})

bot.hears("📸 Загрузить фото", async (ctx) => {
  await ctx.reply("Загрузи своё фото в полный рост. Лучше всего — в облегающей одежде, чётко видно силуэт.")
})

bot.on("photo", async (ctx) => {
  const photo = ctx.message.photo
  const largest = photo[photo.length - 1]
  const fileLink = await ctx.telegram.getFileLink(largest.file_id)
  ;(ctx as any).session.photoUrl = fileLink.href

  await ctx.reply(
    "✅ Фото загружено! Теперь отправь мне ссылку на товар с Wildberries или Ozon.\n\n" +
    "Например:\n" +
    "https://www.wildberries.ru/catalog/12345678/detail.aspx"
  )
})

bot.on("text", async (ctx) => {
  if (ctx.message.text.startsWith("/")) return

  const text = ctx.message.text

  const s = (ctx as any).session
  if (!s.photoUrl) {
    await ctx.reply("Сначала загрузи своё фото — нажми «Загрузить фото» и отправь изображение.")
    return
  }

  await ctx.reply("⏳ Генерирую примерку... Это займёт несколько секунд.")

  try {
    const res = await fetch(`${config.auth.webhook_url}/api/fitbot/try-on`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.auth.fitbotSecret}`,
      },
      body: JSON.stringify({
        personImage: s.photoUrl,
        garment: text,
        chatId: String(ctx.chat.id),
      }),
    })

    const data = await res.json()

    if (res.status === 402) {
      await ctx.reply(
        "❌ Недостаточно кредитов.\n\n" +
        "Купи подписку в боте: /subscribe"
      )
      s.photoUrl = null
      return
    }

    if (!res.ok) {
      await ctx.reply("❌ Ошибка: " + (data.error || "Не удалось обработать запрос"))
      s.photoUrl = null
      return
    }

    if (data.image) {
      await ctx.replyWithPhoto(Input.fromURL(data.image), {
        caption: "✨ Результат примерки!",
      })
      s.photoUrl = null
    }
  } catch (err) {
    console.error("[FITBOT_ERROR]", err)
    await ctx.reply("❌ Что-то пошло не так. Попробуй ещё раз.")
    s.photoUrl = null
  }
})

bot.command("subscribe", async (ctx) => {
  const { yookassa } = config
  const generationCost = config.ai.generationCost

  const packLines = Object.values(yookassa.plans).map((p) => {
    const gens = Math.floor(p.credits / generationCost)
    return `  /pay_${p.id} — ${gens} примерок за ${p.price}₽`
  })

  const subLines = Object.values(yookassa.subscriptions).map((p) => {
    const gens = Math.floor(p.creditsPerMonth / generationCost)
    return `  /sub_${p.id} — ${gens} примерок/мес за ${p.price}₽`
  })

  await ctx.reply(
    "💎 FitBot Premium\n\n" +
    "📦 Пакеты (одноразово):\n" +
    packLines.join("\n") +
    "\n\n🔄 Подписки (каждый месяц):\n" +
    subLines.join("\n") +
    "\n\nОплата через ЮKassa. После оплаты кредиты зачислятся автоматически.",
  )
})

async function createPayLink(ctx: any, planId: string, isSubscription: boolean) {
  const chatId = ctx.chat.id
  try {
    const res = await fetch(`${config.auth.webhook_url}/api/fitbot/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.auth.fitbotSecret}`,
      },
      body: JSON.stringify({ chatId: String(chatId), planId, isSubscription }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Ошибка")
    await ctx.reply(`💳 Ссылка на оплату:\n${data.url}`)
  } catch {
    await ctx.reply("❌ Не удалось создать ссылку на оплату. Попробуй позже.")
  }
}

bot.command("pay_starter", async (ctx) => createPayLink(ctx, "starter", false))
bot.command("pay_basic", async (ctx) => createPayLink(ctx, "basic", false))
bot.command("pay_standard", async (ctx) => createPayLink(ctx, "standard", false))
bot.command("pay_pro", async (ctx) => createPayLink(ctx, "pro", false))

bot.command("sub_light", async (ctx) => createPayLink(ctx, "light", true))
bot.command("sub_pro", async (ctx) => createPayLink(ctx, "pro", true))
bot.command("sub_unlimited", async (ctx) => createPayLink(ctx, "unlimited", true))
