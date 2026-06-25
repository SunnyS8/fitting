import { generateText } from "ai"

export const maxDuration = 60

type Body = {
  personImage?: string // data URL
  garment?: string // label
  garmentImage?: string // optional data URL
}

export async function POST(req: Request) {
  try {
    const { personImage, garment, garmentImage } = (await req.json()) as Body

    if (!personImage) {
      return Response.json({ error: "Не передано фото человека." }, { status: 400 })
    }

    const instruction =
      garment && garment.trim().length > 0
        ? `Naturally and realistically dress the person from the first image in the following outfit: ${garment}. ` +
          `Keep the person's face, body, pose, proportions and the background unchanged. ` +
          `Make the clothing fit the body with realistic folds, lighting and shadows.`
        : `Naturally and realistically dress the person from the first image in the clothing shown in the second image. ` +
          `Keep the person's face, body, pose, proportions and the background unchanged. ` +
          `Make the clothing fit the body with realistic folds, lighting and shadows.`

    const content: Array<
      { type: "text"; text: string } | { type: "image"; image: string }
    > = [{ type: "text", text: instruction }, { type: "image", image: personImage }]

    if (garmentImage) {
      content.push({ type: "image", image: garmentImage })
    }

    const result = await generateText({
      model: "google/gemini-3.1-flash-image",
      messages: [{ role: "user", content }],
    })

    const file = result.files.find((f) => f.mediaType?.startsWith("image/"))

    if (!file) {
      return Response.json(
        { error: "Модель не вернула изображение. Попробуйте другое фото." },
        { status: 502 },
      )
    }

    const dataUrl = `data:${file.mediaType};base64,${file.base64}`
    return Response.json({ image: dataUrl })
  } catch (err) {
    console.log("[v0] try-on error:", err instanceof Error ? err.message : String(err))
    return Response.json({ error: "Не удалось обработать примерку. Попробуйте ещё раз." }, { status: 500 })
  }
}
