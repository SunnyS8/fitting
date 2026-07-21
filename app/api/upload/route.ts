import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { config } from "@/lib/config"
import { put } from "@vercel/blob"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.formData()
    const file = data.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const apiKey = config.ai.apiKey
    if (apiKey && !apiKey.includes("your_") && apiKey.trim() !== "") {
      try {
        const fd = new FormData()
        fd.append("file", file)
        const uploadRes = await fetch("https://api.muapi.ai/api/v1/upload_file", {
          method: "POST",
          headers: { "x-api-key": apiKey },
          body: fd,
        })
        if (uploadRes.ok) {
          const result = await uploadRes.json()
          const url = result.url || result.file_url
          if (url) return NextResponse.json({ url })
        }
      } catch { /* fallback to blob */ }
    }

    const blobKey = `uploads/${session.user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const blob = await put(blobKey, file, { access: "public" })
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[UPLOAD]", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
