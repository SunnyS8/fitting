const items = [
  { src: "/images/showcase-1.png", label: "Деловой стиль", alt: "Мужчина в шерстяном пальто" },
  { src: "/images/showcase-2.png", label: "Вечерний образ", alt: "Женщина в красном платье" },
  { src: "/images/showcase-3.png", label: "Кэжуал", alt: "Девушка в джинсовой куртке" },
]

export function Showcase() {
  return (
    <section id="showcase" className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Примеры</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Образы, созданные нашим AI
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure
              key={item.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-muted"
            >
              <img
                src={item.src || "/placeholder.svg"}
                alt={item.alt}
                className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-5">
                <span className="font-heading text-lg font-medium">{item.label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
