import { Sparkles } from "lucide-react"

const groups = [
  {
    title: "Продукт",
    links: [
      { label: "Возможности", href: "#features" },
      { label: "Тарифы", href: "#pricing" },
      { label: "Примеры", href: "#showcase" },
      { label: "Примерка", href: "#try-on" },
    ],
  },
  {
    title: "Компания",
    links: [
      { label: "Блог", href: "https://habr.com" },
      { label: "Контакты", href: "#cta" },
    ],
  },
  {
    title: "Поддержка",
    links: [
      { label: "Документация", href: "/docs" },
      { label: "Примерка", href: "#try-on" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <a href="#" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <span className="font-heading text-lg font-semibold tracking-tight">Atelier AI</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Виртуальная примерка одежды на основе искусственного интеллекта.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">© 2026 Atelier AI. Все права защищены.</p>
          <p className="text-sm text-muted-foreground">Сделано с заботой о вашем гардеробе</p>
        </div>
      </div>
    </footer>
  )
}
