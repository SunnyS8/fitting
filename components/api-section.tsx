import { Code2, Plug, Zap, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"

const points = [
  { icon: Plug, title: "Простая интеграция", text: "Один REST-эндпоинт. Подключение к магазину за день." },
  { icon: Zap, title: "Быстрый отклик", text: "Готовая примерка возвращается в среднем за 2–4 секунды." },
  { icon: ShieldCheck, title: "Безопасность", text: "Фото обрабатываются и удаляются. Полное соответствие GDPR." },
]

const codeSample = `POST https://api.atelier-ai.ru/v1/try-on
Authorization: Bearer sk_live_•••••

{
  "person_image": "https://cdn.shop.ru/user/42.jpg",
  "garment_id": "sku_8841",
  "size": "M"
}

→ 200 OK
{
  "result_url": "https://cdn.atelier-ai.ru/r/9f3a.png",
  "processing_ms": 2380
}`

export function ApiSection() {
  return (
    <section id="api" className="scroll-mt-20 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Code2 className="size-3.5 text-primary" />
              Для разработчиков и магазинов
            </span>
            <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Встройте AI-примерку в свой магазин
            </h2>
            <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Добавьте кнопку «Примерить» на карточку товара через наш API или готовый виджет.
              Работает с Shopify, WordPress и любой кастомной платформой.
            </p>

            <ul className="mt-8 flex flex-col gap-5">
              {points.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <p.icon className="size-4.5" />
                  </span>
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#cta">Получить API-ключ</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#cta">Документация</a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <span className="size-3 rounded-full bg-destructive/70" />
                <span className="size-3 rounded-full bg-primary/70" />
                <span className="size-3 rounded-full bg-muted-foreground/40" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">try-on.sh</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-muted-foreground">
                <code>{codeSample}</code>
              </pre>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
