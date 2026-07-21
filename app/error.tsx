"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[APP_ERROR]", error)
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-heading text-7xl font-bold text-destructive">!</p>
        <h1 className="mt-4 text-2xl font-heading font-semibold tracking-tight">Что-то пошло не так</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
        <Button onClick={reset} className="mt-8">
          Попробовать снова
        </Button>
      </div>
    </div>
  )
}
