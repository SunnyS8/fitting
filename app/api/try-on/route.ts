import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserService } from "@/lib/services/user"
import { config } from "@/lib/config"

export const maxDuration = 60

type Body = {
  personImage?: string
  garment?: string
  garmentImage?: string
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
    }

    const { personImage, garment, garmentImage } = (await req.json()) as Body

    if (!personImage) {
      return NextResponse.json({ error: "Не передано фото человека." }, { status: 400 })
    }

    const cost = config.ai.generationCost || 25
    try {
      await UserService.deductCredits(session.user.id, cost)
    } catch {
      return NextResponse.json({ error: "Недостаточно кредитов. Пополните баланс." }, { status: 402 })
    }

    const sanitized = (garment || "").replace(/[^\w\sа-яА-Я\-.,!?"']/g, "").slice(0, 200)
    const prompt = sanitized
      ? `Realistic virtual try-on. The person should wear: """${sanitized}""". Keep face, pose, proportions and background unchanged. Make clothing fit naturally with realistic folds, lighting and shadows.`
      : "Realistic virtual try-on. Dress the person in the provided clothing image. Keep face, pose, proportions and background unchanged."

    const clothesImage = garmentImage || personImage
    const apiKey = config.ai.apiKey
    let resultImage = ""
    let requestId = `mock_${Date.now()}`
    let status = "processing"

    if (apiKey && !apiKey.includes("your_") && apiKey.trim() !== "") {
      try {
        const webhookUrl = `${config.auth.webhook_url}/api/webhook/muapi`
        const submitRes = await fetch(
          `https://api.muapi.ai/api/v1/gpt-image-2-image-to-image?webhook=${encodeURIComponent(webhookUrl)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
            body: JSON.stringify({
              prompt,
              images_list: [personImage, clothesImage],
              aspect_ratio: "auto",
              webhook: webhookUrl,
            }),
          },
        )

        if (submitRes.ok) {
          const resJson = await submitRes.json()
          if (resJson.request_id) {
            requestId = resJson.request_id
          } else if (resJson.output) {
            resultImage = resJson.output
            status = "completed"
          }
        }
      } catch {
        console.warn("MuAPI failed, falling back to mock")
      }
    }

    if (!resultImage && status !== "completed") {
      status = "failed"
    }

    const tryon = await prisma.tryOn.create({
      data: {
        userId: session.user.id,
        personImage,
        clothesImage,
        resultImage,
        prompt,
        aspectRatio: "auto",
        requestId,
        status,
        creditCost: cost,
      },
    })

    return NextResponse.json({
      tryonId: tryon.id,
      image: resultImage || null,
      status: tryon.status,
    })
  } catch (err) {
    console.error("[TRYON_POST]", err)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
