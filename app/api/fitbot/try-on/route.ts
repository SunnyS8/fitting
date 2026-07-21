import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import { prisma } from "@/lib/prisma"
import { UserService } from "@/lib/services/user"

function extractImageUrl(pollJson: Record<string, unknown>): string {
  const outputs = (pollJson.outputs || []) as string[]
  if (outputs.length > 0) return outputs[0]
  if (typeof pollJson.output === "string") return pollJson.output
  const out = pollJson.output as Record<string, unknown> | undefined
  if (out?.urls && Array.isArray(out.urls) && (out.urls as string[]).length > 0) return (out.urls as string[])[0]
  if (out?.url && typeof out.url === "string") return out.url
  return ""
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${config.auth.fitbotSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { personImage, garment, chatId } = (await req.json()) as {
      personImage?: string
      garment?: string
      chatId?: string
    }

    if (!personImage) {
      return NextResponse.json({ error: "Нет фото" }, { status: 400 })
    }

    if (!chatId) {
      return NextResponse.json({ error: "Нет chatId" }, { status: 400 })
    }

    const userId = `tg_${chatId}`
    const cost = config.ai.generationCost

    try {
      await UserService.deductCredits(userId, cost)
    } catch {
      return NextResponse.json({ error: "Недостаточно кредитов" }, { status: 402 })
    }

    const sanitized = (garment || "").replace(/[^\w\sа-яА-Я\-.,!?"']/g, "").slice(0, 200)
    const prompt = sanitized
      ? `Realistic virtual try-on. The person should wear: """${sanitized}""". Keep face, pose, proportions and background unchanged. Make clothing fit naturally with realistic folds, lighting and shadows.`
      : "Realistic virtual try-on. Dress the person in the provided clothing image. Keep face, pose, proportions and background unchanged."

    const apiKey = config.ai.apiKey
    let resultImage = ""

    if (apiKey && !apiKey.includes("your_") && apiKey.trim() !== "") {
      try {
        const submitRes = await fetch(
          `https://api.muapi.ai/api/v1/gpt-image-2-image-to-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
            body: JSON.stringify({
              prompt,
              images_list: [personImage],
              aspect_ratio: "auto",
            }),
          },
        )

        if (submitRes.ok) {
          const resJson = await submitRes.json()
          if (resJson.request_id) {
            const requestId = resJson.request_id
            for (let i = 0; i < 20; i++) {
              await new Promise((r) => setTimeout(r, 3000))
              try {
                const pollRes = await fetch(
                  `https://api.muapi.ai/api/v1/predictions/${requestId}/result`,
                  {
                    headers: { "x-api-key": apiKey },
                  },
                )
                if (pollRes.ok) {
                  const pollJson = await pollRes.json()
                  const state = pollJson.status || pollJson.state
                  if (state === "completed" || state === "succeeded") {
                    resultImage = extractImageUrl(pollJson as Record<string, unknown>)
                    break
                  }
                  if (state === "failed") break
                }
              } catch { /* retry */ }
            }
          } else if (resJson.output) {
            resultImage = resJson.output
          }
        }
      } catch {
        console.warn("[FITBOT] MuAPI failed")
      }
    }

    if (!resultImage) {
      return NextResponse.json({ error: "AI не смог обработать изображение" }, { status: 502 })
    }

    return NextResponse.json({ image: resultImage, status: "completed" })
  } catch (err) {
    console.error("[FITBOT_TRYON]", err)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}
