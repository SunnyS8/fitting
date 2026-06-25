import { Camera, Shirt, Wand2 } from "lucide-react"

const steps = [
  {
    icon: Camera,
    title: "Загрузите фото",
    description: "Одно селфи в полный рост — и можно начинать. Мы поддерживаем любые позы и фоны.",
  },
  {
    icon: Shirt,
    title: "Выберите одежду",
    description: "Добавьте товар из каталога или загрузите фото вещи, которую хотите примерить.",
  },
  {
    icon: Wand2,
    title: "Получите результат",
    description: "AI реалистично совмещает образ с вашей фигурой за несколько секунд.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Как это работает</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Три шага до идеального образа
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-8"
            >
              <span className="font-heading text-sm font-semibold text-primary">
                0{i + 1}
              </span>
              <span className="mt-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
