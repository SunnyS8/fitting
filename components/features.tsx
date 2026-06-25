import { Gauge, Layers, Lock, Palette, Ruler, Store } from "lucide-react"

const features = [
  {
    icon: Gauge,
    title: "Молниеносно",
    description: "Готовый результат за 3–5 секунд благодаря оптимизированным моделям.",
  },
  {
    icon: Ruler,
    title: "Точная посадка",
    description: "AI учитывает пропорции фигуры, чтобы одежда сидела естественно.",
  },
  {
    icon: Palette,
    title: "Любые образы",
    description: "От повседневных луков до вечерних платьев — без ограничений по стилю.",
  },
  {
    icon: Store,
    title: "Для магазинов",
    description: "Встраивайте примерку в свой каталог через простой API и виджет.",
  },
  {
    icon: Lock,
    title: "Приватность",
    description: "Фотографии шифруются и удаляются по запросу. Мы не передаём данные третьим лицам.",
  },
  {
    icon: Layers,
    title: "Высокое качество",
    description: "Реалистичные ткани, тени и складки в разрешении до 4K.",
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Возможности</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Всё для безупречной примерки
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
          Мощный движок, которому доверяют покупатели и бренды по всему миру.
        </p>
      </div>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="bg-card p-8">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <feature.icon className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
