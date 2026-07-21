"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import { Loader2, Plus, Trash2, Eye, Download, Images, Sparkles, X, CreditCard, Crown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

type TryOn = {
  id: string
  personImage: string
  clothesImage: string
  resultImage: string
  prompt: string
  aspectRatio: string
  status: string
  createTime: string
}

const PAGE_SIZE = 24

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [tryons, setTryons] = useState<TryOn[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedTryon, setSelectedTryon] = useState<TryOn | null>(null)
  const processingRef = useRef("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    if (!session?.user) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/tryons")
        if (res.ok && !cancelled) {
          setTryons(await res.json())
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [session])

  useEffect(() => {
    const processingIds = tryons.filter((t) => t.status === "processing").map((t) => t.id).sort()
    const idsKey = processingIds.join(",")
    if (idsKey === processingRef.current) return
    processingRef.current = idsKey
    if (!processingIds.length) return

    const interval = setInterval(async () => {
      try {
        const updated = await Promise.all(
          processingIds.map(async (id) => {
            const res = await fetch(`/api/tryons?id=${id}`)
            if (res.ok) return res.json()
            return null
          })
        )
        setTryons((prev) => {
          const map = new Map(prev.map((t) => [t.id, t]))
          for (const item of updated) {
            if (item?.id) map.set(item.id, item)
          }
          return Array.from(map.values())
        })
      } catch { /* ignore */ }
    }, 4000)
    return () => clearInterval(interval)
  }, [tryons])

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены? Это действие нельзя отменить.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/tryons?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setTryons((p) => p.filter((t) => t.id !== id))
        if (selectedTryon?.id === id) setSelectedTryon(null)
        toast.success("Примерка удалена")
      }
    } catch { toast.error("Ошибка при удалении") }
    finally { setDeletingId(null) }
  }

  const handleDownload = async (tryon: TryOn) => {
    if (!tryon.resultImage) return
    try {
      const response = await fetch(tryon.resultImage)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = `tryon-${tryon.id}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch { window.open(tryon.resultImage, "_blank") }
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Отменить подписку? Доступ сохранится до конца оплаченного периода.")) return
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" })
      if (res.ok) {
        toast.success("Подписка отменена")
        window.location.reload()
      } else {
        toast.error("Не удалось отменить подписку")
      }
    } catch { toast.error("Ошибка") }
  }

  const visibleTryons = tryons.slice(0, visibleCount)
  const hasMore = visibleCount < tryons.length

  if (status === "loading" || (loading && tryons.length === 0)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm">Загрузка галереи...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Images className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight mb-2">Моя галерея</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Войдите в аккаунт, просматривайте и скачивайте фотореалистичные результаты.
          </p>
          <Button className="w-full" onClick={() => signIn("google")}>
            <Sparkles className="size-4" />
            Войти через Google
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Мои примерки</h1>
            <p className="mt-1 text-sm text-muted-foreground">Просмотр, скачивание и удаление AI-примерок</p>
          </div>
          <Link href="/#try-on">
            <Button>
              <Plus className="size-4" />
              Создать примерку
            </Button>
          </Link>
        </div>

        {session.user.subscriptionStatus === "active" && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <Crown className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Подписка активна</p>
                <p className="text-xs text-muted-foreground">
                  {session.user.subscriptionPlan && `${session.user.subscriptionPlan} · `}
                  {session.user.credits ?? 0} кредитов
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancelSubscription} className="text-xs text-muted-foreground">
              Отменить
            </Button>
          </div>
        )}

        {session.user.subscriptionStatus !== "active" && (session.user.credits ?? 0) < 25 && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4">
            <AlertCircle className="size-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium">Мало кредитов</p>
              <p className="text-xs text-muted-foreground">Пополните баланс или оформите подписку</p>
            </div>
            <Link href="/#pricing">
              <Button size="sm" variant="outline">Пополнить</Button>
            </Link>
          </div>
        )}

        {tryons.length === 0 ? (
          <div className="mx-auto my-12 max-w-xl rounded-2xl border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-border bg-muted">
              <Images className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Примерок пока нет</h2>
            <p className="mx-auto mb-8 max-w-sm text-sm text-muted-foreground">
              Создайте свою первую AI-примерку — загрузите фото и выберите одежду.
            </p>
            <Link href="/#try-on">
              <Button>
                <Plus className="size-4" />
                Создать примерку
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTryons.map((tryon) => (
                <div key={tryon.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {tryon.status === "processing" ? (
                      <>
                        <img src={tryon.personImage} alt="Обработка" className="h-full w-full object-cover blur-sm opacity-50" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70">
                          <Loader2 className="size-5 animate-spin text-primary" />
                          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Обработка...</span>
                        </div>
                      </>
                    ) : tryon.status === "failed" ? (
                      <>
                        <img src={tryon.personImage} alt="Ошибка" className="h-full w-full object-cover opacity-20 grayscale" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center">
                          <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                            Ошибка
                          </span>
                        </div>
                      </>
                    ) : (
                      <img src={tryon.resultImage} alt="Результат примерки" className="h-full w-full object-cover" />
                    )}
                    <span className="absolute left-3 top-3 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur">
                      {tryon.aspectRatio}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="mb-4 line-clamp-2 text-xs italic text-muted-foreground bg-muted rounded-xl p-2.5 border border-border">
                      &ldquo;{tryon.prompt}&rdquo;
                    </p>
                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedTryon(tryon)}
                        disabled={tryon.status !== "completed"}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <Eye className="size-3.5" /> Просмотр
                      </button>
                      <button
                        onClick={() => handleDownload(tryon)}
                        disabled={tryon.status !== "completed"}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        <Download className="size-3.5" /> Скачать
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
                    <span>{new Date(tryon.createTime).toLocaleDateString("ru", { month: "short", day: "numeric" })}</span>
                    <button
                      onClick={() => handleDelete(tryon.id)}
                      disabled={deletingId === tryon.id}
                      className="flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50 cursor-pointer"
                    >
                      {deletingId === tryon.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  Показать ещё ({tryons.length - visibleCount})
                </Button>
              </div>
            )}
          </>
        )}

        {selectedTryon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Результат примерки</h3>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {selectedTryon.aspectRatio}
                  </span>
                </div>
                <button onClick={() => setSelectedTryon(null)} className="cursor-pointer text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-2xl border border-border bg-muted relative">
                  <img src={selectedTryon.resultImage} alt="Результат примерки" className="h-full w-full object-cover" />
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <div className="size-8 overflow-hidden rounded-lg border border-border">
                      <img src={selectedTryon.personImage} alt="Фото" className="h-full w-full object-cover" />
                    </div>
                    <div className="size-8 overflow-hidden rounded-lg border border-border">
                      <img src={selectedTryon.clothesImage} alt="Одежда" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <Button variant="outline" size="sm" onClick={() => handleDelete(selectedTryon.id)}>
                  <Trash2 className="size-3.5" /> Удалить
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleDownload(selectedTryon)}>
                    <Download className="size-3.5" /> Скачать
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTryon(null)}>
                    Закрыть
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
