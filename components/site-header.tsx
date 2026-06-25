import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Примерка", href: "#try-on" },
  { label: "Как это работает", href: "#how" },
  { label: "Возможности", href: "#features" },
  { label: "API", href: "#api" },
  { label: "Тарифы", href: "#pricing" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">Atelier AI</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex" asChild>
            <a href="#">Войти</a>
          </Button>
          <Button asChild>
            <a href="#cta">Попробовать</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
