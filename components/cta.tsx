import { ArrowRight, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Cta() {
  return (
    <section id="cta" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-12">
        <div
          className="absolute -top-24 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          Примерьте свой первый образ прямо сейчас
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Бесплатно, без установки приложений и регистрации карты. Достаточно одного фото.
        </p>
        <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="Ваш email"
            aria-label="Email"
            className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          <Button type="submit" size="lg" className="group">
            <Upload className="size-4" />
            Начать
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>
      </div>
    </section>
  )
}
