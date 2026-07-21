"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Sparkles, CreditCard, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </span>
            <span className="font-heading text-base font-semibold tracking-tight">Atelier AI</span>
          </Link>

          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : session?.user ? (
              <>
                <div className="hidden items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs sm:flex">
                  <CreditCard className="size-3 text-primary" />
                  <span className="font-medium">{session.user.credits ?? 0}</span>
                  <span className="text-muted-foreground">кредитов</span>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:inline">{session.user.name || session.user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="gap-1.5">
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline">Выйти</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Войти</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
