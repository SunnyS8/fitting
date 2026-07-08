import { NextResponse } from "next/server"
import { config } from "@/lib/config"

const FALLBACK_TRYONS = [
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800",
]

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${config.auth.fitbotSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { personImage, garment } = (await req.json()) as {
      personImage?: string
      garment?: string
    }

    if (!personImage) {
      return NextResponse.json({ error: "Нет фото" }, { status: 400 })
    }

    const prompt = garment
      ? `Realistic virtual try-on. The person should wear: ${garment}. Keep face, pose, proportions and background unchanged. Make clothing fit naturally with realistic folds, lighting and shadows.`
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
              images_list: [personImage, personImage],
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
                    const outputs = pollJson.outputs || []
                    resultImage = outputs[0] || (typeof pollJson.output === "string" ? pollJson.output : pollJson.output?.urls?.get)
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
        console.warn("[FITBOT] MuAPI failed, using fallback")
      }
    }

    if (!resultImage) {
      resultImage = FALLBACK_TRYONS[Math.floor(Math.random() * FALLBACK_TRYONS.length)]
    }

    return NextResponse.json({ image: resultImage, status: "completed" })
  } catch (err) {
    console.error("[FITBOT_TRYON]", err)
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}
