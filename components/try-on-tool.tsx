"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Upload, Sparkles, Loader2, RotateCcw, Download, ImageIcon, Shirt, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import toast from "react-hot-toast"

const presets = [
  "Элегантное чёрное вечернее платье",
  "Бежевый тренч и кремовый свитер",
  "Классический деловой костюм",
  "Джинсовая куртка и белая футболка",
  "Красное атласное платье",
  "Уютный вязаный oversize-свитер",
]

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

type GarmentMode = "preset" | "upload"

export function TryOnTool() {
  const { data: session } = useSession()
  const inputRef = useRef<HTMLInputElement>(null)
  const garmentInputRef = useRef<HTMLInputElement>(null)
  const [personImage, setPersonImage] = useState<string | null>(null)
  const [garmentMode, setGarmentMode] = useState<GarmentMode>("preset")
  const [garment, setGarment] = useState<string>(presets[1])
  const [garmentImage, setGarmentImage] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [garmentDragging, setGarmentDragging] = useState(false)

  async function readImageFile(files: FileList | null): Promise<string | null> {
    const file = files?.[0]
    if (!file) return null
    if (!file.type.startsWith("image/")) {
      setError("Пожалуйста, загрузите изображение.")
      return null
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Файл слишком большой. Максимум 8 МБ.")
      return null
    }
    return fileToDataUrl(file)
  }

  async function handleFiles(files: FileList | null) {
    setError(null)
    const dataUrl = await readImageFile(files)
    if (!dataUrl) return
    setPersonImage(dataUrl)
    setResult(null)
  }

  async function handleGarmentFiles(files: FileList | null) {
    setError(null)
    const dataUrl = await readImageFile(files)
    if (!dataUrl) return
    setGarmentImage(dataUrl)
    setResult(null)
  }

  async function runTryOn() {
    if (!personImage) return
    if (!session?.user) {
      signIn("google", { callbackUrl: "/#try-on" })
      return
    }
    if (garmentMode === "upload" && !garmentImage) {
      setError("Загрузите фото одежды или выберите готовый образ.")
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const body =
        garmentMode === "upload"
          ? { personImage, garmentImage }
          : { personImage, garment }
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.status === 402) {
        toast.error("Недостаточно кредитов. Пополните баланс в разделе тарифов.")
        setError("Недостаточно кредитов. Пополните баланс.")
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(data.error || "Ошибка обработки")

      if (data.status === "processing" && data.tryonId) {
        const id = data.tryonId
        while (true) {
          await new Promise((r) => setTimeout(r, 3000))
          const pollRes = await fetch(`/api/tryons?id=${id}`)
          if (!pollRes.ok) break
          const pollData = await pollRes.json()
          if (pollData.status === "completed") {
            setResult(pollData.resultImage)
            setLoading(false)
            return
          }
          if (pollData.status === "failed") break
        }
        throw new Error("Обработка не завершилась вовремя")
      }

      setResult(data.image)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выполнить примерку.")
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setPersonImage(null)
    setResult(null)
    setError(null)
  }

  return (
    <section id="try-on" className="scroll-mt-20 border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Демо в реальном времени
          </span>
          <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Примерьте прямо сейчас
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
            Загрузите своё фото в полный рост, выберите готовый образ или загрузите фото своей одежды — и AI
            наденет его на вас за пару секунд.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-2">
          {/* Input column */}
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div>
              <p className="mb-3 text-sm font-medium">1. Ваше фото</p>
              <div
                onClick={() => !personImage && inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  handleFiles(e.dataTransfer.files)
                }}
                className={cn(
                  "relative flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-background/50 transition-colors",
                  dragging && "border-primary bg-primary/5",
                  personImage && "cursor-default border-solid",
                )}
              >
                {personImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={personImage || "/placeholder.svg"} alt="Загруженное фото" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 px-6 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Upload className="size-5" />
                    </span>
                    <p className="text-sm font-medium">Перетащите фото сюда</p>
                    <p className="text-xs text-muted-foreground">или нажмите, чтобы выбрать. PNG/JPG до 8 МБ</p>
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {personImage && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
                  <RotateCcw className="size-3.5" />
                  Выбрать другое фото
                </Button>
              )}
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">2. Выберите образ</p>
              <div className="mb-3 inline-flex rounded-lg border border-border bg-background p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setGarmentMode("preset")}
                  className={cn(
                    "rounded-md px-3 py-1.5 font-medium transition-colors",
                    garmentMode === "preset"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Готовый образ
                </button>
                <button
                  type="button"
                  onClick={() => setGarmentMode("upload")}
                  className={cn(
                    "rounded-md px-3 py-1.5 font-medium transition-colors",
                    garmentMode === "upload"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Своё фото одежды
                </button>
              </div>

              {garmentMode === "preset" ? (
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setGarment(p)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors",
                        garment === p
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => garmentInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setGarmentDragging(true)
                    }}
                    onDragLeave={() => setGarmentDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setGarmentDragging(false)
                      handleGarmentFiles(e.dataTransfer.files)
                    }}
                    className={cn(
                      "relative flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-background/50 transition-colors",
                      garmentDragging && "border-primary bg-primary/5",
                      garmentImage && "border-solid",
                    )}
                  >
                    {garmentImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={garmentImage || "/placeholder.svg"}
                        alt="Фото одежды"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Shirt className="size-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Загрузите фото вещи</p>
                    <p className="mt-1">Лучше всего подойдёт фото одежды на однотонном фоне. PNG/JPG до 8 МБ.</p>
                    {garmentImage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1.5 h-7 px-2"
                        onClick={() => setGarmentImage(null)}
                      >
                        <RotateCcw className="size-3.5" />
                        Заменить
                      </Button>
                    )}
                  </div>
                  <input
                    ref={garmentInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleGarmentFiles(e.target.files)}
                  />
                </div>
              )}
            </div>

            <Button
              size="lg"
              onClick={runTryOn}
              disabled={!personImage || loading || (garmentMode === "upload" && !garmentImage)}
              className="mt-1"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Генерируем образ…" : "Примерить"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Result column */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
            <p className="mb-3 text-sm font-medium">Результат</p>
            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl border border-border bg-background/50">
              {loading && (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="text-sm">AI создаёт ваш образ…</p>
                </div>
              )}
              {!loading && result && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result || "/placeholder.svg"} alt="Результат AI-примерки" className="h-full w-full object-cover" />
              )}
              {!loading && !result && (
                <div className="flex flex-col items-center gap-2 px-6 text-center text-muted-foreground">
                  <ImageIcon className="size-8" />
                  <p className="text-sm">Здесь появится готовый образ</p>
                </div>
              )}
            </div>
            {result && (
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <a href={result} download="atelier-ai-tryon.png">
                  <Download className="size-3.5" />
                  Скачать
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
