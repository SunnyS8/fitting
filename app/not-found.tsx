import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-heading text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-heading font-semibold tracking-tight">Страница не найдена</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Возможно, страница была перемещена или вы ввели неверный адрес.
        </p>
        <Link href="/" className="mt-8 inline-block">
          <Button>На главную</Button>
        </Link>
      </div>
    </div>
  )
}
